import boto3
import os
import json
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


    # Use Knowledge Base if configured
    if KNOWLEDGE_BASE_ID and MODEL_ARN:
        logger.info("Attempting to retrieve from knowledge base...")
        try:
            response = bedrock_agent_client.retrieve_and_generate(
                input={"text": query_text},
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

    # Fallback or default behavior: direct model invocation
    if not MODEL_ID:
        raise ValueError("MODEL_ID is not configured.")

    system_prompt = (
        "You are a Malaysian AI legal assistant specializing in employment and labor law. "
        "Your role is to help users understand their rights and obligations under the Employment Act 1955 and other relevant Malaysian regulations.\n\n"
        "Guidelines:\n"
        "- Answer in clear, simple sentences so that non-lawyers can understand.\n"
        "- If the user asks in Malay, reply in Malay. If in English, reply in English.\n"
        "- Provide short, structured answers. Use bullet points or numbered steps when possible.\n"
        "- Always focus on employment and labor law (e.g., wages, working hours, termination, leave, contracts, discrimination, unions).\n"
        "- If the question is outside this domain, politely decline and say it is not within employment law.\n"
        "- If the law does not specify or you are uncertain, say so clearly instead of guessing.\n"
        "- When possible, mention the relevant section of the Employment Act or other law.\n"
        "- Do not provide personal opinions, only legal information and explanations."
    )
    
    full_prompt = f"{system_prompt}\n\nUser Query: {query_text}"
    if document_context:
        full_prompt = f"{system_prompt}\n\nDocument Context:\n{document_context}\n\nUser Query:\n{query_text}"

    formatted_prompt = f"""
    <|begin_of_text|>
    <|start_header_id|>system<|end_header_id|>
    {system_prompt}
    <|eot_id|>
    <|start_header_id|>user<|end_header_id|>
    {query_text}
    <|eot_id|>
    <|start_header_id|>assistant<|end_header_id|>
    """

    request_payload = {
        "prompt": formatted_prompt,
        "max_gen_len": 2048,
        "temperature": 0.2
    }

    response = bedrock_client.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(request_payload)
    )

    response_body = json.loads(response['body'].read().decode('utf-8'))
    answer = response_body.get("generation", "Sorry, I could not generate a response.")

    # Translate back if needed
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