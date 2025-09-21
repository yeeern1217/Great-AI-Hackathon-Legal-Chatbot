from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil
import json
import boto3

from server.storage import get_db, create_chat_session, get_chat_session, get_chat_messages, add_chat_message, save_uploaded_file
from shared.schema import InsertChatSession, InsertChatMessage, Expert
from server.services.model import generate_legal_advice, analyze_document, analyze_labour_contract, analyze_labour_contract_file
from server.services.transcribe import transcribe_audio
from server.services.experts import get_expert_recommendations
from server.user_statistics import get_all_statistics

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
    language_map = {
        "en": "en-US",
        "ms": "ms-MY",
        "id": "id-ID"
    }
    aws_language_code = language_map.get(language, "en-US")

    file_path = os.path.join(UPLOAD_DIR, audio.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
        
    transcript_text = transcribe_audio(file_path, aws_language_code)
    os.remove(file_path) # Clean up the file
    return {"transcript": transcript_text}

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

@router.post("/api/experts")
async def experts_endpoint(data: dict):
    prompt = data.get("prompt")
    if not prompt:
        raise HTTPException(status_code=400, detail="No prompt provided")
    experts = get_expert_recommendations(prompt)
    return {"experts": experts}

@router.get("/api/legal-topics")
def get_legal_topics():
    topics = [
      { "id": 'employment-act', "name": 'Employment Act 1955', "query": 'Explain the basics of the Employment Act 1955' },
      { "id": 'industrial-relations', "name": 'Industrial Relations Act 1967', "query": 'What are the key provisions of the Industrial Relations Act 1967?' },
      { "id": 'epf-act', "name": 'Employees Provident Fund Act 1991', "query": 'Tell me about the Employees Provident Fund Act 1991' },
      { "id": 'socso-act', "name": 'Employees Social Security Act 1969', "query": 'What is the Employees Social Security Act 1969?' },
      { "id": 'osha', "name": 'Occupational Safety and Health Act 1994', "query": 'Explain the Occupational Safety and Health Act 1994' }
    ]
    return topics

dynamodb = boto3.resource(
    "dynamodb",
    region_name="us-east-1",  # change if different
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)

table = dynamodb.Table("experts")

@router.get("/api/experts")
def get_experts():
    response = table.scan()
    items = response.get("Items", [])

    experts = []
    for item in items:
        experts.append({
            "id": item.get("id"),
            "name": item.get("name"),
            "bio": item.get("bio"),
            "specialization": item.get("specialization"),  # string
            "title": item.get("title"),
            "languages": item.get("languages", []),  # list
            "experience": f"{item.get('experience', 0)} years",
            "hourlyRate": item.get("hourlyRate"),
            "gender": item.get("gender"),
            "location": item.get("location"),
            "imageUrl": item.get("imageUrl")
        })

    return {"experts": experts}

from server.user_statistics import get_all_statistics

@router.get("/api/dashboard-data")
def get_dashboard_data():
    """
    Fetches and returns a list of employment data from DynamoDB for the dashboard.
    """
    data = get_all_statistics()
    
    if data is None:
        raise HTTPException(status_code=500, detail="Error fetching data from DynamoDB")

    # Convert Decimal to float for JSON serialization
    for item in data:
        if 'analysisResult' in item and 'keyMetrics' in item['analysisResult']:
            key_metrics = item['analysisResult']['keyMetrics']
            if 'salary' in key_metrics:
                key_metrics['salary'] = float(key_metrics['salary'])
            if 'workingHours' in key_metrics:
                key_metrics['workingHours'] = float(key_metrics['workingHours'])
            if 'annualLeave' in key_metrics:
                key_metrics['annualLeave'] = float(key_metrics['annualLeave'])
                
    return data