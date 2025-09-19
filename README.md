# AI Legal Chatbot ⚖️


## 📂 Project Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/yeeern1217/Great-AI-Hackathon-Legal-Chatbot.git
2. Run the demo:
   ```bash
   .\.venv\Scripts\Activate.ps1
   npm install
   uvicorn bedrock:app --reload
   npm run dev

3. For error '\\test\\data\\05-versions-space.pdf' run below script:
   ```bash
   echo "%PDF-1.4
   1 0 obj
   <<>>
   endobj
   trailer
   <<>>
   %%EOF" > test/data/05-versions-space.pdf
