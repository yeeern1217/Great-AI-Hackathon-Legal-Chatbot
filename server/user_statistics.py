import boto3
from decimal import Decimal
from boto3.dynamodb.conditions import Attr
from collections import Counter

# --- AWS Configuration ---
DYNAMODB_TABLE_NAME = 'user_statistics' 

# Initialize DynamoDB Resource
dynamodb = boto3.resource('dynamodb')

def get_all_statistics():
    """
    Scans the DynamoDB table and returns all items.
    """
    print(f"\nFetching all data from '{DYNAMODB_TABLE_NAME}'...")
    table = dynamodb.Table(DYNAMODB_TABLE_NAME)
    
    try:
        response = table.scan()
        items = response['Items']
        
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response['Items'])
            
        return items

    except Exception as e:
        print(f"An error occurred while retrieving data: {e}")
        return None

# --- New Function to Retrieve and Process Data ---
def get_filtered_statistics(role, state):
    """
    Scans the DynamoDB table, filters by job role and state,
    and calculates average employment statistics.
    """
    print(f"\nSearching for data for Role: '{role}' in State: '{state}'...")
    table = dynamodb.Table(DYNAMODB_TABLE_NAME)
    
    try:
        # Define the filter expression using boto3.dynamodb.conditions.Attr
        if role == "All" and state == "All":
            filter_expression = None
        elif role == "All":
            filter_expression = Attr('analysisResult.state').eq(state)
        elif state == "All":
            filter_expression = Attr('analysisResult.keyMetrics.jobRole').eq(role)
        else:
            filter_expression = Attr('analysisResult.keyMetrics.jobRole').eq(role) & Attr('analysisResult.state').eq(state)
        
        scan_kwargs = {}
        if filter_expression:
            scan_kwargs['FilterExpression'] = filter_expression

        response = table.scan(**scan_kwargs)
        
        items = response['Items']
        
        while 'LastEvaluatedKey' in response:
            scan_kwargs['ExclusiveStartKey'] = response['LastEvaluatedKey']
            response = table.scan(**scan_kwargs)
            items.extend(response['Items'])

        if not items:
            return None

        total_working_hours = sum(item['analysisResult']['keyMetrics']['workingHours'] for item in items)
        total_annual_leave = sum(item['analysisResult']['keyMetrics']['annualLeave'] for item in items)
        total_salary = sum(item['analysisResult']['keyMetrics']['salary'] for item in items)
        probation_periods = [item['analysisResult']['keyMetrics']['probationPeriod'] for item in items]
        
        num_items = len(items)

        avg_working_hours = total_working_hours / num_items
        avg_annual_leave = total_annual_leave / num_items
        avg_salary = total_salary / num_items

        probation_period_counts = Counter(probation_periods)
        most_common_probation = probation_period_counts.most_common(1)[0][0] if probation_period_counts else "N/A"

        statistics = {
            "Working Hours (avg)": f"{avg_working_hours:.2f} hours/week",
            "Annual Leave (avg)": f"{avg_annual_leave:.2f} days/year",
            "Probation Period (most common)": most_common_probation,
            "Average Wage (avg)": f"RM {avg_salary:.2f}"
        }

        return statistics

    except Exception as e:
        print(f"An error occurred while retrieving data: {e}")
        return None