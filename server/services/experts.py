
import os
import boto3
from boto3.dynamodb.conditions import Attr
from typing import List
from shared.schema import Expert
from server.services.model import categorize_prompt

def get_expert_recommendations(prompt: str) -> List[Expert]:
    """
    Get expert recommendations based on a prompt.
    """
    print(f"[Experts Service] Received prompt: \"{prompt}\"")
    
    matched_specializations = categorize_prompt(prompt)
    print(f"[Experts Service] Matched specializations: {matched_specializations}")

    if not matched_specializations:
        print("[Experts Service] No matched specializations found. Returning empty array.")
        return []

    try:
        dynamodb = boto3.resource(
            'dynamodb',
            region_name=os.getenv("AWS_REGION"),
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
        )
        table = dynamodb.Table(os.getenv("EXPERTS_DYNAMODB_TABLE", "experts"))

        filter_expression = None
        for spec in matched_specializations:
            if filter_expression is None:
                filter_expression = Attr('specialization').eq(spec)
            else:
                filter_expression = filter_expression | Attr('specialization').eq(spec)
        
        if not filter_expression:
            return []
            
        print(f"[Experts Service] Querying DynamoDB with filter: {filter_expression}")
        
        response = table.scan(FilterExpression=filter_expression)
        
        items = response.get('Items', [])
        print(f"[Experts Service] Found {len(items)} experts in DynamoDB.")

        experts = [Expert(**item) for item in items]
        return experts

    except Exception as e:
        print(f"[Experts Service] Error fetching experts from DynamoDB: {e}")
        return []
