from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
import boto3
import os
import json
import logging
from dotenv import load_dotenv
from botocore.exceptions import BotoCoreError, ClientError
from deep_translator import GoogleTranslator  # External translation
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

# --- AWS Configuration ---
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
MODEL_ID = os.getenv("MODEL_ID")
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")
MODEL_ARN = os.getenv("MODEL_ARN")

if not AWS_REGION:
    raise ValueError("AWS_REGION environment variable is missing.")

app = FastAPI()

# --- Pydantic Model for POST Request ---
class ContractText(BaseModel):
    contract_text: str

# --- Initialize AWS Clients ---
try:
    bedrock_client = boto3.client("bedrock-runtime", region_name=AWS_REGION)
    bedrock_agent_client = boto3.client("bedrock-agent-runtime", region_name=AWS_REGION)
    comprehend_client = boto3.client("comprehend", region_name=AWS_REGION)
except (BotoCoreError, ClientError) as e:
    logger.error(f"Failed to initialize AWS clients: {e}")
    raise

# --- API Endpoints ---

@app.get("/")
async def root():
    return {"message": "FastAPI is running with Bedrock + External Translate!"}

@app.get("/bedrock/invoke")
async def invoke_model(
    text: str = Query(..., description="Input text for the model"),
    user: str = Query("user", description="User identifier (optional)")
):
    """General model invocation with an enhanced, detailed system prompt."""
    if not MODEL_ID:
        raise HTTPException(status_code=500, detail="MODEL_ID is not configured.")
    try:
        # UPGRADED: Detailed system prompt for better response control.
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

        formatted_prompt = f"""
        <|begin_of_text|>
        <|start_header_id|>system<|end_header_id|>
        {system_prompt}
        <|eot_id|>
        <|start_header_id|>{user}<|end_header_id|>
        {text.strip()}
        <|eot_id|>
        <|start_header_id|>assistant<|end_header_id|>
        Please provide your response now:
        """

        request_payload = {
            "prompt": formatted_prompt,
            "max_gen_len": 512,
            "temperature": 0.2  # Adjusted temperature
        }

        response = bedrock_client.invoke_model(
            modelId=MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(request_payload)
        )

        response_body = json.loads(response['body'].read().decode('utf-8'))
        generated_text = response_body.get("generation", "")

        if not generated_text:
            raise HTTPException(status_code=500, detail="Model did not return any content.")

        return {
            "system": system_prompt,
            "user": text,
            "assistant": generated_text
        }
    except (ClientError, BotoCoreError) as e:
        logger.error(f"AWS error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="AWS Bedrock error occurred.")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Unexpected error occurred.")

@app.get("/bedrock/query")
async def query_with_knowledge_base(
    text: str = Query(..., description="Input text for the model"),
    target_lang: str = Query("auto", description="Preferred output language (auto, en, ms)")
):
    """Knowledge base retrieval + generation with EXTERNAL translation support."""
    if not KNOWLEDGE_BASE_ID or not MODEL_ARN:
        raise HTTPException(status_code=500, detail="Knowledge base configuration is missing.")

    try:
        # 1. Detect language using Comprehend
        detected = comprehend_client.detect_dominant_language(Text=text)
        detected_lang = detected["Languages"][0]["LanguageCode"]
        logger.info(f"Detected language: {detected_lang}")

        # Treat Indonesian ('id') as Malay ('ms') for this context
        if detected_lang == "id":
            detected_lang = "ms"

        # 2. Translate to English if necessary for the KB query
        query_text = text
        if detected_lang == "ms":
            query_text = GoogleTranslator(source="ms", target="en").translate(text)
            logger.info(f"Translated Malay input to English for KB query: '{query_text}'")

        # 3. Query Bedrock KB
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

        # 4. Translate back to Malay if the original query was in Malay
        if detected_lang == "ms" or target_lang == "ms":
            answer = GoogleTranslator(source="en", target="ms").translate(answer)
            logger.info("Translated English response back to Malay.")

        return {
            "detected_lang": detected_lang,
            "user_input": text,
            "processed_query": query_text,
            "assistant_response": answer
        }
    except (ClientError, BotoCoreError) as e:
        logger.error(f"AWS error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="AWS Bedrock error occurred.")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@app.post("/bedrock/analyze-contract")
async def analyze_contract(item: ContractText):
    """Analyzes a contract, with language detection and translation support."""
    if not MODEL_ID:
        raise HTTPException(status_code=500, detail="MODEL_ID is not configured.")

    try:
        # NEW: Language detection and translation for contract text
        contract_to_process = item.contract_text
        detected = comprehend_client.detect_dominant_language(Text=contract_to_process)
        detected_lang = detected["Languages"][0]["LanguageCode"]
        if detected_lang in ["ms", "id"]:
            logger.info("Malay contract detected. Translating to English for analysis.")
            contract_to_process = GoogleTranslator(source="ms", target="en").translate(contract_to_process)

        # 1. Retrieve context from Knowledge Base
        retrieved_text = ""
        if KNOWLEDGE_BASE_ID:
            try:
                retrieval_response = bedrock_agent_client.retrieve(
                    knowledgeBaseId=KNOWLEDGE_BASE_ID,
                    retrievalQuery={'text': contract_to_process},
                    retrievalConfiguration={'vectorSearchConfiguration': {'numberOfResults': 5}}
                )
                retrieved_chunks = [result['content']['text'] for result in retrieval_response.get('retrievalResults', [])]
                if retrieved_chunks:
                    retrieved_text = "\n\n".join(retrieved_chunks)
                    logger.info(f"Retrieved {len(retrieved_chunks)} chunks from knowledge base.")
            except (ClientError, BotoCoreError) as e:
                logger.warning(f"Could not retrieve from knowledge base: {e}. Proceeding without context.")
                pass

        # 2. Define the detailed prompt for contract analysis
        prompt = f'''You are a specialized AI legal assistant for Malaysian labour contracts. Your task is to conduct a detailed analysis of the provided contract text and return a structured JSON output.

<contract_text>
{contract_to_process}
</contract_text>

<knowledge_base_context>
{retrieved_text if retrieved_text else "No specific context was retrieved from the knowledge base for this document."}
</knowledge_base_context>

Your response MUST be a single, valid JSON object and nothing else, following the structure below. Do not include any other text, explanations, or markdown formatting outside of the JSON object.

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

        # 3. Invoke the model
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

        if not generated_text:
            raise HTTPException(status_code=500, detail="Model did not return any content.")

        # 4. Parse the JSON response robustly
        try:
            start_index = generated_text.find('{')
            if start_index == -1:
                raise json.JSONDecodeError("No JSON object start found", generated_text, 0)
            
            decoder = json.JSONDecoder()
            obj, _ = decoder.raw_decode(generated_text[start_index:])
            return obj
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from model output: {generated_text}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to parse JSON from model output. Error: {e}")

    except (ClientError, BotoCoreError) as e:
        logger.error(f"AWS error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="AWS Bedrock error occurred.")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {type(e).__name__}")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("PORT", 8000)), reload=True)