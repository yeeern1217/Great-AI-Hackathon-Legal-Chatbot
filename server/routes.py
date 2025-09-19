from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil
import json

from server.storage import get_db, create_chat_session, get_chat_session, get_chat_messages, add_chat_message, save_uploaded_file
from shared.schema import InsertChatSession, InsertChatMessage
from server.services.model import generate_legal_advice, analyze_document, analyze_labour_contract, analyze_labour_contract_file
from server.services.transcribe import transcribe_audio

router = APIRouter()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/api/chat/session")
def post_chat_session(session_data: InsertChatSession, db: Session = Depends(get_db)):
    return create_chat_session(db, session_data)

@router.get("/api/chat/session/{session_id}")
def get_session(session_id: str, db: Session = Depends(get_db)):
    session = get_chat_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.get("/api/chat/session/{session_id}/messages")
def get_messages(session_id: str, db: Session = Depends(get_db)):
    return get_chat_messages(db, session_id)

@router.post("/api/chat/message")
def post_chat_message(message_data: InsertChatMessage, db: Session = Depends(get_db)):
    user_message = add_chat_message(db, message_data)
    
    ai_response = generate_legal_advice(message_data.content, message_data.documentContext)
    ai_response_content = ai_response.get("answer", "Sorry, I could not generate a response.")
    references = ai_response.get("references", [])
    
    assistant_message_data = InsertChatMessage(
        sessionId=message_data.sessionId,
        role='assistant',
        content=ai_response_content,
        documentContext=json.dumps(references) if references else None
    )
    assistant_message = add_chat_message(db, assistant_message_data)

    return {"userMessage": user_message, "assistantMessage": assistant_message}

@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_data = {
        "filename": file.filename,
        "originalName": file.filename,
        "mimeType": file.content_type,
        "size": os.path.getsize(file_path)
    }
    uploaded_file = save_uploaded_file(db, file_data)
    
    analysis = analyze_document(file_path, file.content_type)
    
    return {"file": uploaded_file, "analysis": analysis}

@router.post("/api/transcribe")
async def transcribe_endpoint(language: str = Form(...), audio: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, audio.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
        
    transcript = transcribe_audio(file_path, language)
    os.remove(file_path) # Clean up the file
    return {"transcript": transcript}

@router.post("/api/analyze-labour-contract")
async def analyze_labour_contract_endpoint(data: dict):
    document_text = data.get("documentText")
    if not document_text:
        raise HTTPException(status_code=400, detail="No document text provided")
    analysis_result = analyze_labour_contract(document_text)
    return analysis_result

@router.post("/api/analyze-labour-contract-file")
async def analyze_labour_contract_file_endpoint(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    analysis_result = analyze_labour_contract_file(file_path, file.content_type)
    os.remove(file_path) # Clean up the file
    return analysis_result

@router.get("/api/legal-topics")
def get_legal_topics():
    topics = [
      { "id": 'ipc', "name": 'Indian Penal Code', "query": 'Explain the Indian Penal Code basics' },
      { "id": 'fundamental-rights', "name": 'Fundamental Rights', "query": 'What are fundamental rights in Indian Constitution?' },
      { "id": 'consumer-protection', "name": 'Consumer Protection', "query": 'Tell me about Consumer Protection Act 2019' },
      { "id": 'cyber-laws', "name": 'Cyber Laws', "query": 'What are the cyber laws in India?' },
      { "id": 'labor-laws', "name": 'Labor Laws', "query": 'Explain labor laws in India' },
      { "id": 'property-law', "name": 'Property Law', "query": 'What are property laws in India?' }
    ]
    return topics
