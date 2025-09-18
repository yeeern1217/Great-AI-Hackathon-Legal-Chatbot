from fastapi import FastAPI, HTTPException, Query
import boto3
import os
import json
import logging
from dotenv import load_dotenv
from botocore.exceptions import BotoCoreError, ClientError
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

# AWS config
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
MODEL_ID = os.getenv("MODEL_ID")   
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")  
MODEL_ARN = os.getenv("MODEL_ARN")

if not AWS_REGION:
    raise ValueError("AWS_REGION environment variable is missing.")

app = FastAPI()

# Initialize AWS clients
try:
    bedrock_client = boto3.client("bedrock-runtime", region_name=AWS_REGION)
    bedrock_agent_client = boto3.client("bedrock-agent-runtime", region_name=AWS_REGION)
except (BotoCoreError, ClientError) as e:
    logger.error(f"Failed to initialize AWS clients: {e}")
    raise

@app.get("/")
async def root():
    return {"message": "FastAPI is running with Bedrock!"}

@app.get("/bedrock/invoke")
async def invoke_model(
    text: str = Query(..., description="Input text for the model"),
    user: str = Query("user", description="User identifier (optional)")
):
    if not MODEL_ID:
        raise HTTPException(status_code=500, detail="MODEL_ID is not configured.")
    try:
        # Define system prompt
        system_prompt = (
            "You are an Malaysia AI legal assistant to answer normal citizen question on legal labor and employement laws. "
            "Always answer based on prodvided content in clear, simple language. "
            "If the question is outside employment law, politely decline."
        )

        # Format prompt with system and user messages
        formatted_prompt = f"""
        <|begin_of_text|>
        <|start_header_id|>system<|end_header_id|>
        {system_prompt}
        <|eot_id|>

        <|start_header_id|>{user}<|end_header_id|>
        {text}
        <|eot_id|>

        <|start_header_id|>assistant<|end_header_id|>
        """

        request_payload = {
            "prompt": formatted_prompt,
            "max_gen_len": 512,
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
            logger.error("Model did not return any content.")
            raise HTTPException(status_code=500, detail="Model did not return any content.")

        return {
            "system": system_prompt,
            "user": text,
            "assistant": generated_text
        }

    except ClientError as e:
        logger.error(f"AWS ClientError: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AWS ClientError: {e.response['Error']['Message']}")
    except BotoCoreError as e:
        logger.error(f"AWS BotoCoreError: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="AWS BotoCore error occurred.")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")



@app.get("/bedrock/query")
async def query_with_knowledge_base(text: str = Query(..., description="Input text for the model")):
    """Model invocation with knowledge base retrieval + generation."""
    if not KNOWLEDGE_BASE_ID or not MODEL_ARN:
        raise HTTPException(status_code=500, detail="Knowledge base configuration is missing.")

    try:
        response = bedrock_agent_client.retrieve_and_generate(
            input={"text": text},
            retrieveAndGenerateConfiguration={
                "knowledgeBaseConfiguration": {
                    "knowledgeBaseId": KNOWLEDGE_BASE_ID,
                    "modelArn": MODEL_ARN
                },
                "type": "KNOWLEDGE_BASE"
            }
        )
        return {"response": response["output"]["text"]}

    except ClientError:
        raise HTTPException(status_code=500, detail="AWS Client error occurred.")
    except BotoCoreError:
        raise HTTPException(status_code=500, detail="AWS BotoCore error occurred.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("PORT", 8000)), reload=True)
