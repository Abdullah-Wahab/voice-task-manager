import json
import asyncio
import logging
from datetime import datetime, timedelta
from google import genai
from google.genai import types
from app.config import get_settings
from app.models import TaskResponse, ConversationTurn

logger = logging.getLogger(__name__)

client = genai.Client(api_key=get_settings().gemini_api_key)

# Model fallback chain: Flash (best quality) → Flash-Lite (higher free quota)
MODELS = [
    "gemini-2.5-flash-lite",     # 1000+ RPD free — primary for free tier
    "gemini-2.0-flash-lite",     # backup
]


def _build_system_prompt(tasks: list[TaskResponse]) -> str:
    now = datetime.now()
    today = now.strftime("%Y-%m-%d")
    tomorrow = (now + timedelta(days=1)).strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M")
    day_of_week = now.strftime("%A")

    task_list = "No tasks yet." if not tasks else json.dumps(
        [
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "date": t.date,
                "time": t.time,
                "status": t.status,
            }
            for t in tasks
        ],
        indent=2,
    )

    return f"""You are a friendly, concise voice task assistant. You help users create, read, update, and delete tasks through natural conversation.

CURRENT CONTEXT:
- Today's date: {today} ({day_of_week})
- Tomorrow's date: {tomorrow}
- Current time: {current_time}

USER'S TASKS:
{task_list}

CRITICAL — TASK MATCHING RULES:
When the user refers to a task, you MUST find the best match from the task list above using these strategies:
1. NEVER say "I couldn't find a task" if there IS a task that reasonably matches. Be flexible.
2. FUZZY TIME MATCHING: If user says "6 PM task" and there's a task at 5:00 PM or 7:00 PM, match the CLOSEST one. Users often misremember exact times.
3. SEMANTIC MATCHING: "evening workout" matches "Gym at 6 PM". "LinkedIn task" matches "Post on LinkedIn". Match by meaning, not exact title.
4. DATE MATCHING: If user says "tomorrow's task" and there's only one task tomorrow, match it even if the time doesn't match exactly.
5. If there are MULTIPLE possible matches, use "clarify" to ask which one. List the options.
6. Only say "I couldn't find a task" if there are truly ZERO tasks that could match.

YOUR RULES:
1. Respond naturally as if speaking aloud — keep responses SHORT (1-2 sentences max).
2. When creating tasks, extract: title, date (ISO format YYYY-MM-DD), and time (HH:MM 24h format) if mentioned.
3. For "today", use {today}. For "tomorrow", use {tomorrow}.
4. Time of day references: "morning" = before 12:00, "afternoon" = 12:00-17:00, "evening"/"night" = after 17:00.
5. For DELETE: always use "confirm_delete" first to ask for confirmation. Only use "delete" after user confirms.
6. Handle ordinal references: "the first one", "the second task", "the previous one" — based on conversation context or task list order.
7. For multiple tasks in one request, return multiple actions in the actions array.
8. If user just wants to chat or says hi, use action type "none".
9. When user confirms (says "yes", "yeah", "yep", "sure", "do it", "go ahead", "correct"), execute the pending action from the previous turn.

RESPOND WITH ONLY VALID JSON (no markdown, no backticks):
{{
  "message": "Your spoken response to the user",
  "actions": [
    {{
      "type": "create | update | delete | confirm_delete | read | clarify | none",
      "task": {{ "title": "...", "date": "YYYY-MM-DD", "time": "HH:MM" }},
      "task_id": null,
      "updates": {{ "title": "...", "date": "...", "time": "..." }}
    }}
  ]
}}

ACTION FIELD USAGE:
- "create": include "task" with title, date, and optionally time
- "update": include "task_id" and "updates" (only changed fields)
- "delete": include "task_id"
- "confirm_delete": include "task_id" — you must ASK before deleting
- "read": no extra fields needed — just summarize tasks in "message"
- "clarify": no extra fields — ask a question in "message"
- "none": no extra fields — just respond in "message"

Only include fields relevant to the action type. The actions array can have multiple items for batch operations."""


def _build_messages(
    conversation_history: list[ConversationTurn], transcript: str
) -> list[types.Content]:
    messages = []

    for turn in conversation_history[-10:]:
        role = "user" if turn.role == "user" else "model"
        messages.append(types.Content(role=role, parts=[types.Part(text=turn.content)]))

    messages.append(
        types.Content(role="user", parts=[types.Part(text=transcript)])
    )
    return messages


def _parse_response(text: str) -> dict:
    """Parse Gemini response, handling markdown fences if present."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse Gemini response: {text[:200]}")
        return {
            "message": "Sorry, I had trouble understanding. Could you say that again?",
            "actions": [{"type": "none"}],
        }


async def _call_gemini(model: str, messages: list, system_prompt: str) -> str:
    """Call Gemini API with a specific model. Raises on failure."""
    response = client.models.generate_content(
        model=model,
        contents=messages,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.7,
            max_output_tokens=1024,
            response_mime_type="application/json",
        ),
    )
    return response.text


async def process_chat(
    transcript: str,
    conversation_history: list[ConversationTurn],
    tasks: list[TaskResponse],
) -> dict:
    """Send user transcript to Gemini with model fallback and retry."""
    system_prompt = _build_system_prompt(tasks)
    messages = _build_messages(conversation_history, transcript)

    last_error = None

    for model in MODELS:
        # Retry up to 2 times per model (for transient 429s)
        for attempt in range(2):
            try:
                logger.info(f"Trying model: {model} (attempt {attempt + 1})")
                text = await _call_gemini(model, messages, system_prompt)
                return _parse_response(text)

            except Exception as e:
                last_error = e
                error_str = str(e)

                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    if attempt == 0:
                        # Wait and retry once for transient rate limits
                        logger.warning(f"{model} rate limited, retrying in 5s...")
                        await asyncio.sleep(5)
                        continue
                    else:
                        # Exhausted retries for this model, try next model
                        logger.warning(f"{model} quota exhausted, trying next model...")
                        break
                else:
                    # Non-rate-limit error, try next model immediately
                    logger.error(f"{model} error: {e}")
                    break

    logger.error(f"All models failed. Last error: {last_error}")
    return {
        "message": "I'm having trouble connecting right now. Please try again in a moment.",
        "actions": [{"type": "none"}],
    }
