import boto3
import json
import random
from faker import Faker
from datetime import datetime
from decimal import Decimal
from boto3.dynamodb.conditions import Attr

# --- AWS Configuration ---
DYNAMODB_TABLE_NAME = 'user_statistics' 

# Initialize Faker and DynamoDB Resource
fake = Faker('en_US') 
dynamodb = boto3.resource('dynamodb')

# --- Helper Lists for Realistic Data ---
COMPANY_CATEGORIES = [
    "Information Technology",
    "Finance & Banking",
    "Retail & E-commerce",
    "Manufacturing",
    "Telecommunications",
    "Healthcare",
    "Education",
    "Food & Beverage",
    "Real Estate",
    "Logistics & Transportation"
]

EMPLOYMENT_TYPES = ["Full-Time", "Fixed-Term", "Part-Time", "Contract"]

MALAYSIAN_STATES = [
    "Johor", "Kedah", "Kelantan", "Kuala Lumpur", "Labuan", "Malacca",
    "Negeri Sembilan", "Pahang", "Perak", "Perlis", "Penang",
    "Putrajaya", "Sabah", "Sarawak", "Selangor", "Terengganu"
]

# --- Mock Data Generation Functions ---

def generate_mock_employment_item(user_id):
    """
    Generates a mock DynamoDB item with a simple primary key schema (user_id only).
    """
    # Generate realistic working hours and leave
    working_hours = Decimal(str(random.choice([40, 42.5, 45, 47.5, 50]))) 
    service_years = random.randint(1, 10)
    annual_leave = 8 if service_years <= 2 else (12 if service_years <= 5 else 16)
        
    item = {
        # Partition Key must be named exactly 'user_id' and its value must be unique.
        "user_id": user_id,
        # Document and Analysis Data
        "document_type": "Employment Contract",
        "upload_date": datetime.now().isoformat(),
        "risk_level": random.choice(["Green", "Yellow", "Red"]),
        "analysisResult": {
            "companyCategory": random.choice(COMPANY_CATEGORIES),
            "employmentType": random.choice(EMPLOYMENT_TYPES),
            "state": random.choice(MALAYSIAN_STATES),
            "flaggedClauses": [
                {
                    "clauseName": "Probation Period",
                    "extractedValue": f"{random.choice([3, 6, 9])} months",
                    "flagReason": "Clause may exceed typical industry standard.",
                    "riskCategory": "High" if random.random() > 0.7 else "Low"
                },
                {
                    "clauseName": "Salary",
                    "extractedValue": f"RM {random.randint(3000, 15000)}",
                    "flagReason": "Salary is within standard range.",
                    "riskCategory": "Green"
                },
                {
                    "clauseName": "Working Hours",
                    "extractedValue": f"{working_hours} hours/week",
                    "flagReason": "Working hours exceed legal limit of 45 hours.",
                    "riskCategory": "High" if working_hours > 45 else "Green"
                },
                {
                    "clauseName": "Annual Leave",
                    "extractedValue": f"{annual_leave} days/year",
                    "flagReason": "Annual leave is below legal minimum for years of service.",
                    "riskCategory": "High" if annual_leave < 12 and service_years > 2 else "Green"
                }
            ],
            "keyMetrics": {
                "jobRole": random.choice(["Software Engineer", "Marketing Manager", "Accountant", "HR Executive"]),
                "probationPeriod": f"{random.choice([3, 6, 9])} months",
                "salary": Decimal(random.randint(3000, 15000)),
                "workingHours": working_hours,
                "annualLeave": Decimal(annual_leave)
            }
        }
    }
    return item

def bulk_insert_to_dynamodb(num_records):
    """
    Generates a specified number of mock documents and inserts them in bulk into DynamoDB.
    """
    print(f"Connecting to DynamoDB table '{DYNAMODB_TABLE_NAME}'...")
    table = dynamodb.Table(DYNAMODB_TABLE_NAME)
    
    print(f"Generating and inserting {num_records} mock items...")
    
    try:
        with table.batch_writer() as batch:
            for i in range(num_records):
                # Use a unique ID for each record since it's the only key
                user_id = fake.uuid4()
                
                mock_item = generate_mock_employment_item(user_id)
                batch.put_item(Item=mock_item)
                
                if (i + 1) % 10 == 0:
                    print(f"  Processed {i + 1} items...")
        
        print(f"Successfully inserted all {num_records} items into DynamoDB.")

    except Exception as e:
        print(f"An error occurred: {e}")

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


# --- Execution ---
if __name__ == "__main__":
    NUM_MOCK_RECORDS = 50 
    bulk_insert_to_dynamodb(NUM_MOCK_RECORDS)