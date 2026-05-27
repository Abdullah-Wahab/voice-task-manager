# 🎙️ Voice Task Manager

A web application where users manage tasks entirely through voice interaction. No typing, no buttons — just natural conversation with an AI assistant.

Built as a take-home assessment for **Urban Ground GmbH**.

![Python](https://img.shields.io/badge/Python-FastAPI-009688?style=flat&logo=fastapi)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)
![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=flat&logo=google)

---

## ✨ Features

- **Voice-Only CRUD** — Create, read, update, and delete tasks entirely through speech
- **AI-Powered NLU** — Google Gemini 2.5 Flash understands natural language intents, extracts dates/times, and generates conversational responses
- **Context Awareness** — Maintains conversation history so you can say "the previous one", "the second task", or "move it to tomorrow"
- **Semantic Matching** — "My evening workout" finds "Gym at 6 PM" without exact name matching
- **Interruption Handling** — Click the mic while the assistant is speaking to interrupt and give a new command
- **Multiple Tasks** — "Create three tasks: gym at 7, sync at 9, and LinkedIn at 11" works in one command
- **Delete Confirmation** — The assistant always confirms before deleting a task
- **Real-Time UI** — Task list updates instantly after each voice command

---

## 🏗️ Architecture

```
┌───────────────────────────────────┐
│     React Frontend (Vite)         │
│  Web Speech API (STT + TTS)       │
└──────────────┬────────────────────┘
               │ REST API
┌──────────────▼────────────────────┐
│     FastAPI Backend (Python)      │
│  ┌──────────┐  ┌───────────────┐  │
│  │ Gemini   │  │ SQLite DB     │  │
│  │ 2.5 Flash│  │ (aiosqlite)   │  │
│  └──────────┘  └───────────────┘  │
└───────────────────────────────────┘
```

| Component | Technology | Role |
|-----------|-----------|------|
| Frontend | React 18 + Vite + Tailwind | Voice UI, task display, conversation |
| STT | Web Speech API | Browser-native speech-to-text |
| TTS | Web Speech API | Browser-native text-to-speech |
| Backend | FastAPI (Python) | REST API, AI orchestration |
| AI/NLU | Google Gemini 2.5 Flash | Intent parsing, response generation |
| Database | SQLite (async) | Task storage |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Chrome or Microsoft Edge (for Web Speech API)

### 1. Clone the repository
```bash
git clone https://github.com/Abdullah-Wahab/voice-task-manager.git
cd voice-task-manager
```

### 2. Set up the backend
```bash
cd server
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

uvicorn app.main:app --reload --port 8000
```

### 3. Set up the frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open the app
Navigate to `http://localhost:5173` in **Google Chrome** or **Microsoft Edge**.

---

## 🗣️ Example Voice Commands

| Action | Say This |
|--------|----------|
| Create | "Create a task for team standup at 9 AM" |
| Create multiple | "Add gym at 7, sync at 9, and LinkedIn at 11 for tomorrow" |
| Read | "What's on my schedule today?" |
| Read filtered | "What are my evening tasks?" |
| Update | "Change the LinkedIn task to 6 PM" |
| Update (context) | "Move the previous one to tomorrow" |
| Delete | "Delete the 9 AM task" |
| Agenda | "Give me a brief about today's agenda" |

---

## 📂 Project Structure

```
voice-task-manager/
├── server/                      # FastAPI backend
│   ├── app/
│   │   ├── main.py              # App entry, CORS, lifespan
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # SQLite async setup
│   │   ├── models.py            # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── chat.py          # POST /api/chat (AI brain)
│   │   │   └── tasks.py         # CRUD /api/tasks
│   │   └── services/
│   │       ├── ai_service.py    # Gemini integration
│   │       └── task_service.py  # Database operations
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── client/                      # React frontend
│   ├── src/
│   │   ├── App.jsx              # Main layout
│   │   ├── components/
│   │   │   ├── VoiceOrb.jsx     # Animated mic button
│   │   │   ├── TaskSidebar.jsx  # Task list display
│   │   │   └── ChatHistory.jsx  # Conversation bubbles
│   │   ├── hooks/
│   │   │   ├── useVoiceAgent.js       # Orchestration
│   │   │   ├── useSpeechRecognition.js # STT wrapper
│   │   │   └── useSpeechSynthesis.js   # TTS wrapper
│   │   └── services/
│   │       └── api.js           # Backend API calls
│   └── package.json
│
├── README.md
└── .gitignore
```

---

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| POST | `/api/chat` | Send voice transcript → get AI response + execute actions |

### POST /api/chat — Request
```json
{
  "transcript": "Create a task for gym at 7 AM tomorrow",
  "conversation_history": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

### POST /api/chat — Response
```json
{
  "message": "Done! I've added gym for tomorrow at 7 AM.",
  "tasks": [ ... ]
}
```

---

## 🧠 How the AI Works

Each user message goes through this pipeline:

1. **Browser STT** converts speech to text
2. **Frontend** sends transcript + last 10 conversation turns to `/api/chat`
3. **Backend** fetches all current tasks from SQLite
4. **System prompt** is built with: current date/time, full task list, conversation history
5. **Gemini 2.5 Flash** processes everything and returns structured JSON: `{ message, actions }`
6. **Backend** executes the actions (create/update/delete) on the database
7. **Response** with natural language message + updated task list is sent to frontend
8. **Browser TTS** speaks the response aloud

The AI handles:
- **Temporal awareness**: "today", "tomorrow", "evening", "morning"
- **Semantic matching**: "evening workout" → finds "Gym at 6 PM"
- **Context references**: "the previous one", "the second task"
- **Disambiguation**: asks clarifying questions when unsure
- **Delete safety**: always confirms before deleting

---

## 🐳 Docker

```bash
cd server
docker build -t voice-task-manager-api .
docker run -p 8000:8000 -e GEMINI_API_KEY=your-key voice-task-manager-api
```