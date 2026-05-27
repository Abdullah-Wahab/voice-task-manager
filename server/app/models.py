from pydantic import BaseModel
from typing import Optional


# ── Task Models ──────────────────────────────────────────

class TaskCreate(BaseModel):
    title: str
    description: str = ""
    date: str          # ISO date: "2026-05-28"
    time: Optional[str] = None  # "10:00", "17:30"
    status: str = "pending"


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    status: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    date: str
    time: Optional[str]
    status: str
    created_at: str
    updated_at: str


# ── Chat Models ──────────────────────────────────────────

class ConversationTurn(BaseModel):
    role: str      # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    transcript: str
    conversation_history: list[ConversationTurn] = []


class ChatResponse(BaseModel):
    message: str
    tasks: list[TaskResponse]
