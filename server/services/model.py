import boto3
import os
import json
import re
import logging
from dotenv import load_dotenv
from botocore.exceptions import BotoCoreError, ClientError
import PyPDF2
from deep_translator import GoogleTranslator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

# AWS config
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
MODEL_ID = os.getenv("MODEL_ID")
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")
MODEL_ARN = os.getenv("MODEL_ARN")

# Initialize AWS clients
try:
    bedrock_client = boto3.client("bedrock-runtime", region_name=AWS_REGION)
    bedrock_agent_client = boto3.client("bedrock-agent-runtime", region_name=AWS_REGION)
    comprehend_client = boto3.client("comprehend", region_name=AWS_REGION)
except (BotoCoreError, ClientError) as e:
    logger.error(f"Failed to initialize AWS clients: {e}")
    raise

def categorize_prompt(prompt: str):
    if not MODEL_ID:
        raise ValueError("MODEL_ID is not configured.")

    specializations = [
        "Employment & Labor Law",
        "Industrial Relations & Unions",
        "Employee Provident Fund (EPF)",
        "Social Security & Insurance (SOCSO)",
        "Workplace Safety & Health"
    ]

    try:
        system_prompt = f"""You are an expert classifier for legal queries related to Malaysian labor law. Your task is to categorize the user's query into one or more of the following specializations. Respond with a JSON array of the matching specialization strings. If no specialization matches, respond with an empty array.

Available Specializations:
{json.dumps(specializations, indent=2)}

User's Query:
{prompt}

Matching Specializations (JSON Array):"""

        request_payload = {
            "prompt": system_prompt,
            "max_gen_len": 512,
            "temperature": 0.0
        }

        response = bedrock_client.invoke_model(
            modelId=MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(request_payload)
        )

        response_body = json.loads(response['body'].read().decode('utf-8'))
        generated_text = response_body.get("generation", "[]").strip()
        logger.debug(f"\n[DEBUG] Raw generated text from model:\n---\n{generated_text}\n---")

        try:
            match = re.search(r'\[.*?\]', generated_text, re.DOTALL)
            if match:
                json_string = match.group(0)
                logger.debug(f"[DEBUG] Extracted JSON string: {json_string}")
                matched_specializations = json.loads(json_string)
                logger.debug(f"[DEBUG] Parsed specializations: {matched_specializations}")
                return matched_specializations
            else:
                logger.debug("[DEBUG] No JSON array found in the model output.")
                return []
        except json.JSONDecodeError:
            logger.error(f"Failed to parse JSON from model output: {generated_text}", exc_info=True)
            return []

    except ClientError as e:
        logger.error(f"AWS ClientError: {e}", exc_info=True)
        # Depending on desired error handling, you might return [] or raise
        return []
    except Exception as e:
        logger.error(f"Unexpected error in categorization: {e}", exc_info=True)
        return []

def generate_legal_advice(prompt: str, document_context: str = None):
    """
    Generates legal advice using the Bedrock model, optionally using a knowledge base,
    and includes language detection and translation.
    """
    # 1. Detect language using Comprehend
    try:
        detected = comprehend_client.detect_dominant_language(Text=prompt)
        detected_lang = detected["Languages"][0]["LanguageCode"]
        logger.info(f"Detected language: {detected_lang}")
    except (ClientError, BotoCoreError) as e:
        logger.error(f"Comprehend error: {e}. Defaulting to English.")
        detected_lang = "en"

    # Treat Indonesian ('id') as Malay ('ms') for this context
    if detected_lang == "id":
        detected_lang = "ms"

    # 2. Translate to English if necessary for the model/KB query
    query_text = prompt
    if detected_lang == "ms":
        try:
            query_text = GoogleTranslator(source="ms", target="en").translate(prompt)
            logger.info(f"Translated Malay input to English for KB query: '{query_text}'")
        except Exception as e:
            logger.error(f"Translation error: {e}. Using original prompt.")
            query_text = prompt

    system_prompt = (
        "You are a Malaysian AI legal assistant specializing in employment and labor law. "
        "Your role is to answer questions from Malaysian citizens about their rights and obligations under employment regulations. "
        "Use clear and simple sentences. "
        "If the question is outside this domain, politely decline stating that it is not within your area of knowledge. "
        "Provide only legal information and explanations, not personal opinions, provide legal references where applicable."
    )

    full_prompt = f"{system_prompt}\n\nUser Query: {query_text}"
    if document_context:
        full_prompt = f"{system_prompt}\n\nDocument Context:\n{document_context}\n\nUser Query:\n{query_text}" 
        
    # Use Knowledge Base if configured
    if KNOWLEDGE_BASE_ID and MODEL_ARN:
        logger.info("Attempting to retrieve from knowledge base...")
        try:
            response = bedrock_agent_client.retrieve_and_generate(
                input={"text": full_prompt},
                retrieveAndGenerateConfiguration={
                    "knowledgeBaseConfiguration": {
                        "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                        "modelArn": MODEL_ARN
                    },
                    "type": "KNOWLEDGE_BASE"
                }
            )
            answer = response["output"]["text"]
            citations = response.get("citations", [])
            references = []
            if citations:
                for citation in citations:
                    for reference in citation.get("retrievedReferences", []):
                        references.append({
                            "text": reference["content"]["text"],
                            "uri": reference["location"]["s3Location"]["uri"]
                        })

            # 4. Translate back to Malay if the original query was in Malay
            if detected_lang == "ms":
                answer = GoogleTranslator(source="en", target="ms").translate(answer)
                logger.info("Translated English response back to Malay.")
            
            return {"answer": answer, "references": references}
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Error with knowledge base retrieval: {e}")
            pass

    if detected_lang == "ms":
        answer = GoogleTranslator(source="en", target="ms").translate(answer)
        logger.info("Translated English response back to Malay.")

    return answer


def analyze_document(file_path: str, mime_type: str):
    """
    Analyzes a document by extracting text and sending it to the model.
    """
    if mime_type == "application/pdf":
        text = ""
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text()
        
        return analyze_labour_contract(text)
    else:
        return {"error": "Unsupported file type for analysis."}


def analyze_labour_contract(document_text: str):
    """
    Analyzes a labor contract using a detailed prompt and returns structured JSON.
    """
    if not MODEL_ID:
        raise ValueError("MODEL_ID is not configured.")

    retrieved_text = ""
    if KNOWLEDGE_BASE_ID:
        logger.info("Attempting to retrieve from knowledge base for document analysis...")
        try:
            retrieval_response = bedrock_agent_client.retrieve(
                knowledgeBaseId=KNOWLEDGE_BASE_ID,
                retrievalQuery={'text': document_text},
                retrievalConfiguration={'vectorSearchConfiguration': {'numberOfResults': 20}} # Increased to 20
            )
            retrieved_chunks = [result['content']['text'] for result in retrieval_response.get('retrievalResults', [])]
            if retrieved_chunks:
                retrieved_text = "\n\n".join(retrieved_chunks)
                logger.info(f"Retrieved {len(retrieved_chunks)} chunks from knowledge base.")
        except (ClientError, BotoCoreError) as e:
            logger.error(f"Error retrieving from knowledge base: {e}")

    prompt = f'''You are a specialized AI legal assistant for Malaysian labour contracts. Your task is to conduct a detailed analysis of the provided contract text and return a structured JSON output.

<contract_text>
{document_text}
</contract_text>

<knowledge_base_context>
{retrieved_text if retrieved_text else "No specific context was retrieved from the knowledge base for this document."}
</knowledge_base_context>

Your response MUST be a single, valid JSON object and nothing else, following the structure below.

{{
  "summary": {{
    "criticalIssues": <count_of_red_clauses>,
    "areasForCaution": <count_of_yellow_clauses>
  }},
  "clauses": [
    {{
      "title": "<A concise, descriptive title for the clause>",
      "originalText": "<The exact, verbatim text of the clause from the document>",
      "color": "'Red' or 'Yellow' or 'Green'",
      "explanation": "<A simple, clear explanation of what the clause means>",
      "whyItMatters": "<Explain the potential impact or risk for the user>",
      "suggestion": "<Provide an actionable suggestion, e.g., 'Request clarification on...', 'Negotiate to change...', 'This is a standard clause.'>"
    }}
  ]
}}
'''
    request_payload = {
        "prompt": prompt,
        "max_gen_len": 8192,
        "temperature": 0.1
    }

    response = bedrock_client.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(request_payload)
    )

    response_body = json.loads(response['body'].read().decode('utf-8'))
    generated_text = response_body.get("generation", "")

    try:
        start_index = generated_text.find('{')
        end_index = generated_text.rfind('}') + 1
        if start_index == -1 or end_index == 0:
            raise json.JSONDecodeError("No JSON object found", generated_text, 0)

        json_string = generated_text[start_index:end_index]
        obj = json.loads(json_string)

        # Recalculate summary to ensure data integrity
        if 'clauses' in obj and isinstance(obj['clauses'], list):
            red_count = sum(1 for clause in obj['clauses'] if clause.get('color') == 'Red')
            yellow_count = sum(1 for clause in obj['clauses'] if clause.get('color') == 'Yellow')
            obj['summary'] = {
                'criticalIssues': red_count,
                'areasForCaution': yellow_count
            }

        obj['documentText'] = document_text  # Add document text to the response
        return obj  # Return as a dictionary
    except json.JSONDecodeError:
        logger.error(f"Failed to parse JSON from model output: {generated_text}")
        return {"error": "Failed to parse model output."}

def analyze_labour_contract_file(file_path: str, mime_type: str):
    """
    Analyzes a labor contract from a file.
    """
    text = ""
    if mime_type == "application/pdf":
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text()
    elif mime_type in ["text/plain", "text/markdown"]:
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    else:
        return {"error": f"Unsupported file type: {mime_type}. Please upload a PDF, TXT, or MD file."}
    
    return analyze_labour_contract(text)