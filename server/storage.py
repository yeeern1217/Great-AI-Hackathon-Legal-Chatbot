from sqlalchemy import create_engine, Column, Integer, String, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import uuid
from datetime import datetime

DATABASE_URL = "sqlite:///./chat.db"

Base = declarative_base()

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    createdAt = Column(String, default=lambda: datetime.utcnow().isoformat())
    messages = relationship("ChatMessage", back_populates="session")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sessionId = Column(String, ForeignKey("chat_sessions.id"))
    role = Column(String)
    content = Column(Text)
    createdAt = Column(String, default=lambda: datetime.utcnow().isoformat())
    documentContext = Column(Text, nullable=True)
    session = relationship("ChatSession", back_populates="messages")

class UploadedFile(Base):
    __tablename__ = "uploaded_files"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String)
    originalName = Column(String)
    mimeType = Column(String)
    size = Column(Integer)
    createdAt = Column(String, default=lambda: datetime.utcnow().isoformat())


engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Functions to interact with the database

def create_chat_session(db, session_data):
    db_session = ChatSession(id=session_data.id, title=session_data.title)
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

def get_chat_session(db, session_id: str):
    return db.query(ChatSession).filter(ChatSession.id == session_id).first()

def get_chat_messages(db, session_id: str):
    return db.query(ChatMessage).filter(ChatMessage.sessionId == session_id).all()

def add_chat_message(db, message_data):
    db_message = ChatMessage(**message_data.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def save_uploaded_file(db, file_data):
    db_file = UploadedFile(**file_data)
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file
