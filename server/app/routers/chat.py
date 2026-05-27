import logging
from fastapi import APIRouter
from app.models import ChatRequest, ChatResponse, TaskCreate, TaskUpdate
from app.services import task_service, ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["chat"])


async def _execute_actions(actions: list[dict]) -> None:
    """Execute AI-decided actions on the database with validation."""
    created_titles = set()  # Prevent duplicate creation in same request

    for action in actions:
        action_type = action.get("type", "none")

        try:
            if action_type == "create":
                task_data = action.get("task", {})
                title = task_data.get("title", "Untitled Task")
                date = task_data.get("date", "")

                # Skip if no date or duplicate in this batch
                if not date:
                    logger.warning("Skipping task create: no date provided")
                    continue
                dedup_key = f"{title}|{date}|{task_data.get('time', '')}"
                if dedup_key in created_titles:
                    logger.info(f"Skipping duplicate task: {dedup_key}")
                    continue
                created_titles.add(dedup_key)

                await task_service.create_task(TaskCreate(
                    title=title,
                    description=task_data.get("description", ""),
                    date=date,
                    time=task_data.get("time"),
                ))

            elif action_type == "create_multiple":
                for t in action.get("tasks", []):
                    title = t.get("title", "Untitled Task")
                    date = t.get("date", "")
                    if not date:
                        continue
                    dedup_key = f"{title}|{date}|{t.get('time', '')}"
                    if dedup_key in created_titles:
                        continue
                    created_titles.add(dedup_key)

                    await task_service.create_task(TaskCreate(
                        title=title,
                        description=t.get("description", ""),
                        date=date,
                        time=t.get("time"),
                    ))

            elif action_type == "update":
                task_id = action.get("task_id")
                updates = action.get("updates", {})
                if task_id and updates:
                    # Validate task exists before updating
                    existing = await task_service.get_task_by_id(task_id)
                    if existing:
                        await task_service.update_task(task_id, TaskUpdate(**updates))
                    else:
                        logger.warning(f"Task {task_id} not found for update")

            elif action_type == "delete":
                task_id = action.get("task_id")
                if task_id:
                    existing = await task_service.get_task_by_id(task_id)
                    if existing:
                        await task_service.delete_task(task_id)
                    else:
                        logger.warning(f"Task {task_id} not found for delete")

            # confirm_delete, read, clarify, none → no DB action

        except Exception as e:
            logger.error(f"Failed to execute action {action_type}: {e}")


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # 1. Get current tasks for AI context
    current_tasks = await task_service.get_all_tasks()

    # 2. Send to Gemini
    ai_response = await ai_service.process_chat(
        transcript=request.transcript,
        conversation_history=request.conversation_history,
        tasks=current_tasks,
    )

    # 3. Execute actions
    actions = ai_response.get("actions", [])
    await _execute_actions(actions)

    # 4. Return updated state
    updated_tasks = await task_service.get_all_tasks()

    return ChatResponse(
        message=ai_response.get("message", "Something went wrong."),
        tasks=updated_tasks,
    )
