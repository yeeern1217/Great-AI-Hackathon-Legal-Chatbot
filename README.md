# SembangLaw!

SembangLaw! is a web-based application that provides legal assistance to users. It leverages AI to answer legal questions, analyze contracts and connect users with legal experts.

## Features

*   Chat Assistant: A multimodal and multilingual conversational AI that can answer legal questions in real-time.
*   Labor Contract Analysis: Users can upload their labor contracts for analysis, and the AI will identify key clauses and potential issues.
*   Community Empowerment Dashboard: Users can contribute their labor contracts for analysis where we will display real life insights about legal contract from community real voice.
*   Find a Lawyer: Recommends legal experts to users based on their needs.

## Tech Stack

### Frontend

*   Framework: React (with Vite)
*   Language: TypeScript
*   Styling: Tailwind CSS, shadcn/ui
*   State Management: React Query
*   Routing: React Router

### Backend

*   Framework: FastAPI
*   Language: Python
*   AI/ML: AWS Services (Bedrock, OpenSearch, S3, etc)
*   Real-time Communication: WebSockets

## Getting Started

### Prerequisites

*   Node.js and npm
*   Python 3.9+ and pip
*   An AWS account (for transcription services)

### Installation

1.  Clone the repository:
    bash
    git clone https://github.com/your-username/Ai-LegalAdvisor.git
    cd Ai-LegalAdvisor
    

2.  Environment setup:
    Create a .env file in the root directory and add the following:
    bash
    AWS_ACCESS_KEY_ID=your_aws_access_key
    AWS_SECRET_ACCESS_KEY=your_aws_secret_key
    AWS_REGION=your_service_region
    MODEL_ID=your_model_id
    KNOWLEDGE_BASE_ID=your_knowledge_base
    MODEL_ARN=your_model_arn
         

4.  Prepare application :
    bash
    cd server
    python -m venv venv
    .\venv\Scripts\Activate.ps1
    pip install -r requirements.txt
    python -m uvicorn main:app --reload --port 8000
    

    Separate terminal
    bash
    npm install
    

5.  Prepare application :
    bash
    npm run dev
    

6.  Open your browser:
    Navigate to http://localhost:5173 to use the application.

## Project Structure


Ai-LegalAdvisor/
├── client/           # Frontend React application
│   ├── src/
│   └── ...
├── server/           # Backend FastAPI application
│   ├── services/
│   └── ...
└── ...
