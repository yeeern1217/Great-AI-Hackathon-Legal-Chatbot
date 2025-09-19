from pydantic import BaseModel
from typing import Optional, Literal

class ChatSession(BaseModel):
    id: str
    title: str
    createdAt: str

class ChatMessage(BaseModel):
    id: int
    sessionId: str
    role: Literal["user", "assistant"]
    content: str
    createdAt: str
    documentContext: Optional[str] = None

class InsertChatSession(BaseModel):
    id: str
    title: str

class InsertChatMessage(BaseModel):
    sessionId: str
    role: Literal["user", "assistant"]
    content: str
    documentContext: Optional[str] = None
