from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
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

# Pydantic model for the request body
class ContractText(BaseModel):
    contract_text: str

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


@app.post("/bedrock/analyze-contract")
async def analyze_contract(item: ContractText):
    if not MODEL_ID:
        raise HTTPException(status_code=500, detail="MODEL_ID is not configured.")

    try:
        # 1. Retrieve context from Knowledge Base if available
        retrieved_text = ""
        if KNOWLEDGE_BASE_ID:
            try:
                retrieval_response = bedrock_agent_client.retrieve(
                    knowledgeBaseId=KNOWLEDGE_BASE_ID,
                    retrievalQuery={
                        'text': item.contract_text
                    },
                    retrievalConfiguration={
                        'vectorSearchConfiguration': {
                            'numberOfResults': 5  # Get top 5 relevant chunks
                        }
                    }
                )
                
                retrieved_chunks = [result['content']['text'] for result in retrieval_response.get('retrievalResults', [])]
                if retrieved_chunks:
                    retrieved_text = "\n\n".join(retrieved_chunks)
                    logger.info(f"Retrieved {len(retrieved_chunks)} chunks from knowledge base.")

            except (ClientError, BotoCoreError) as e:
                logger.error(f"Error retrieving from knowledge base: {e}")
                # Proceed without context if retrieval fails
                pass

        # 2. Define the detailed prompt for contract analysis, now including retrieved context
        prompt = f'''You are a specialized AI legal assistant for Malaysian labour contracts. Your task is to conduct a detailed analysis of the provided contract text and return a structured JSON output.

**Thinking Process:**
1.  First, review the `<knowledge_base_context>` for relevant Malaysian legal principles.
2.  Second, read the entire `<contract_text>` to understand its scope.
3.  Third, for each clause in the contract, critically evaluate it against the knowledge base context and general Malaysian employment law. Identify any clauses that are potentially unfair, illegal, ambiguous, or non-standard.
4.  Finally, construct the JSON output according to the specified structure. Your reasoning for the 'color' classification should be reflected in the 'explanation' and 'whyItMatters' fields.

<contract_text>
{item.contract_text}
</contract_text>

<knowledge_base_context>
{retrieved_text if retrieved_text else "No specific context was retrieved from the knowledge base for this document."}
</knowledge_base_context>


**Example of a "Red" Clause Analysis:**
```json
{{
  "title": "Unilateral Salary Deduction",
  "originalText": "The Company reserves the right to deduct from the Employee's salary any monies owed to the Company...",
  "color": "Red",
  "explanation": "This clause gives the company the right to deduct money from the employee's salary for various reasons, with the company being the sole judge of the amount.",
  "whyItMatters": "Under Malaysia's Employment Act 1955, deductions from salary are strictly regulated. This clause is overly broad and could allow for unlawful deductions beyond what is permitted by law, putting the employee's salary at risk.",
  "suggestion": "Negotiate to limit these deductions to only those specified and permitted under the Employment Act 1955, and require that any deduction be substantiated with clear documentation."
}}
```

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

        # 3. Invoke the model with the augmented prompt
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
            logger.error("Model did not return any content.")
            raise HTTPException(status_code=500, detail="Model did not return any content.")

        logger.info(f"Generated text from model: {generated_text}")
        try:
            # Find the start of the JSON object
            start_index = generated_text.find('{')
            if start_index == -1:
                raise json.JSONDecodeError("No JSON object start found", generated_text, 0)

            # Use raw_decode to parse the first valid JSON object from the string
            decoder = json.JSONDecoder()
            obj, end = decoder.raw_decode(generated_text[start_index:])
            return obj

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from model output: {generated_text}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Failed to parse JSON from model output. Error: {e}")

    except ClientError as e:
        logger.error(f"AWS ClientError: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AWS ClientError: {e.response['Error']['Message']}")
    except BotoCoreError as e:
        logger.error(f"AWS BotoCoreError: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="AWS BotoCore error occurred.")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {type(e).__name__}")


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=int(os.getenv("PORT", 8000)), reload=True)
