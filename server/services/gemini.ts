import * as fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdf from "pdf-parse";

// Load environment variables
dotenv.config();

// Get API key safely from env
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("❌ Missing GEMINI_API_KEY in .env file");
}

const genAI = new GoogleGenerativeAI(apiKey);

// ========================== 
// Chat / Legal Advice
// ========================== 
export async function generateLegalAdvice(userQuestion: string, documentContext?: string): Promise<string> {
  let systemPrompt = `You are an AI-powered legal advisor specializing in providing information about basic laws in Malaysia. 
Your role is to help users understand legal concepts in simple and clear language.

Guidelines:
1. Provide general legal information only (not personal legal advice).
2. Keep answers short, clear, and easy to understand.
3. Cover topics such as:
   - Fundamental rights and duties
   - Consumer rights
   - Cyber laws
   - Labor laws
   - Contract basics
   - Family law (marriage, divorce, inheritance)
   - Property law basics
4. Always include a disclaimer: 
   "I am not a lawyer. This is only general information about Malaysian laws. For legal advice specific to your case, consult a qualified advocate."
5. If a user asks something outside Malaysian law or very specific to their personal case, politely redirect them to seek professional legal help.

Format your response clearly with bullet points where appropriate and always end with the disclaimer.`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  if (documentContext) {
    const contextualPrompt = [
      `You are an AI-powered legal advisor. A user has uploaded a document and is asking questions about it. Here is the summary of the document analysis:`, 
      "--- DOCUMENT CONTEXT ---",
      documentContext,
      "--- END DOCUMENT CONTEXT ---",
      "Based on the document context provided above, please answer the user's question. Adhere to all other guidelines and disclaimers.",
      "User's Question: " + userQuestion
    ].join('\n');
    
    try {
      const response = await model.generateContent(contextualPrompt);
      return response.response.text() || 
        "I apologize, but I couldn't generate a response based on the document. Please try again or consult a legal professional.";
    } catch (error) {
      console.error("Gemini API error with context:", error);
      return "I'm experiencing technical difficulties with the document analysis. Please try again later.";
    }

  } else {
    // Original behavior without document context
    try {
      const response = await model.generateContent([systemPrompt, userQuestion]);
      return response.response.text() || 
        "I apologize, but I couldn't generate a response. Please try again or consult a legal professional.";
    } catch (error) {
      console.error("Gemini API error:", error);
      return "I'm experiencing technical difficulties. Please try again later or consult a qualified advocate for immediate legal assistance.";
    }
  }
}

// ========================== 
// Document Analysis
// ========================== 
export async function analyzeDocument(filePath: string, mimeType: string): Promise<string> {
  try {
    let documentText: string | null = null;
    const fileExtension = path.extname(filePath).toLowerCase();

    // 1. Extract text from PDF or text files
    if (mimeType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      documentText = data.text;
    } else if (mimeType.startsWith("text/") || fileExtension === '.txt' || fileExtension === '.md') {
      documentText = fs.readFileSync(filePath, "utf-8");
    }

    // 2. If text was extracted, summarize it
    if (documentText) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Summarize the following document text concisely. This summary will be used as context for a legal chat assistant. Focus on extracting the key points, parties involved, and main obligations or clauses.`;
      const response = await model.generateContent([prompt, documentText]);
      return response.response.text() + "\n\nDisclaimer: This analysis provides a summary for informational purposes only. For specific advice, consult a qualified advocate.";
    }
    // 3. If it's an image, process it
    else if (mimeType.startsWith("image/")) {
      const imageBytes = fs.readFileSync(filePath);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const response = await model.generateContent([
        {
          inlineData: {
            data: imageBytes.toString("base64"),
            mimeType: mimeType,
          },
        },
        "Analyze this legal document image and provide a concise summary of its content. This summary will be used as context for a legal chat assistant. Focus on key points, parties involved, and main obligations or clauses. Always add a disclaimer."
      ]);

      return response.response.text() + "\n\nDisclaimer: This analysis provides general legal information only. For specific advice, consult a qualified advocate.";
    }
    // 4. Otherwise, it's an unsupported format
    else {
      return "I can assist with PDF, text, and image files. Please upload a supported format.";
    }
  } catch (error) {
    console.error("Document analysis error:", error);
    return "I couldn't analyze this document. Please try again or consult a legal professional.";
  }
}


// ========================== 
// Voice Input
// ========================== 
export async function processVoiceInput(audioText: string, language: string): Promise<string> {
  const prompt = `The user has spoken in ${language}. Their message is: "${audioText}". 
Respond about Malaysian laws in a clear, helpful manner. 
If not English, reply in the same language when possible, but always include the disclaimer.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(prompt);

    return response.response.text() || "I couldn't process your voice input. Please try again.";
  } catch (error) {
    console.error("Voice processing error:", error);
    return "I couldn't process your voice input. Please try again or type your question.";
  }
}

// =================================
// Labour Contract Visual Analysis
// =================================
export async function analyzeLabourContract(documentText: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are a specialized AI legal assistant for Malaysian labour contracts. Your task is to conduct a detailed analysis of the provided contract text and return a structured JSON output.

    **Analysis Categories (Traffic Light System):**
    *   **🔴 Red:** Critical, high-risk, or potentially unfair clauses under Malaysian law.
    *   **🟡 Yellow:** Clauses that are ambiguous, unusual, or require caution and clarification.
    *   **🟢 Green:** Standard, fair, and generally acceptable clauses.

    **JSON Output Structure:**
    You must return a single, valid JSON object with the following structure. Do not include any markdown formatting or other text outside the JSON object. Each clause object MUST have a "color" property with one of three string values: 'Red', 'Yellow', or 'Green'.
    {
      "summary": {
        "criticalIssues": <count_of_red_clauses>,
        "areasForCaution": <count_of_yellow_clauses>
      },
      "clauses": [
        {
          "title": "<A concise, descriptive title for the clause>",
          "originalText": "<The exact, verbatim text of the clause from the document>",
          "color": "'Red' or 'Yellow' or 'Green'",
          "explanation": "<A simple, clear explanation of what the clause means>",
          "whyItMatters": "<Explain the potential impact or risk for the user>",
          "suggestion": "<Provide an actionable suggestion, e.g., 'Request clarification on...', 'Negotiate to change...', 'This is a standard clause.'>"
        }
      ]
    }

    **Instructions:**
    1.  Thoroughly read the entire contract text.
    2.  Identify all distinct clauses.
    3.  For each clause, populate all fields in the JSON structure above, especially the "color" field.
    4.  Calculate the summary counts accurately.
    5.  Ensure the 'originalText' is an exact match to the source document to enable frontend highlighting.
    6.  If the document is not a labour contract or is unanalyzable, return a JSON object with an "error" key: 
    
    Now, analyze the following labour contract:
  `;

  try {
    const result = await model.generateContent([prompt, documentText]);
    const responseText = result.response.text();

    // Clean the response to ensure it's a valid JSON string
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    
    const analysisResult = JSON.parse(jsonString);

    // Normalize color values and then calculate the summary
    if (analysisResult.clauses && Array.isArray(analysisResult.clauses)) {
      analysisResult.clauses.forEach((c: any) => {
        if (typeof c.color === 'string') {
          const color = c.color.toLowerCase();
          if (color.includes('red')) {
            c.color = 'Red';
          } else if (color.includes('yellow')) {
            c.color = 'Yellow';
          } else { // Includes green or any other string
            c.color = 'Green';
          }
        } else { // color property is missing or not a string
          c.color = 'Green';
        }
      });

      const criticalIssues = analysisResult.clauses.filter((c: any) => c.color === 'Red').length;
      const areasForCaution = analysisResult.clauses.filter((c: any) => c.color === 'Yellow').length;
      analysisResult.summary = {
        criticalIssues,
        areasForCaution,
      };
    } else {
      // If there are no clauses, ensure summary exists and is zeroed out.
      analysisResult.summary = {
        criticalIssues: 0,
        areasForCaution: 0,
      };
    }

    // Add the full document text to the response for the frontend
    analysisResult.documentText = documentText;

    return analysisResult;

  } catch (error) {
    console.error("Labour contract analysis error:", error);
    return {
      error: "Failed to analyze the labour contract due to a technical issue. Please try again."
    };
  }
}



export async function analyzeLabourContractFile(filePath: string, mimeType: string): Promise<any> {
  let documentText = "";

  try {
    if (mimeType === "application/pdf") {
      const fileBytes = fs.readFileSync(filePath);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const response = await model.generateContent([
        {
          inlineData: {
            data: fileBytes.toString("base64"),
            mimeType: mimeType,
          },
        },
        "Extract all text from this document. If the document contains images of text (scanned document), perform OCR to extract the text."
      ]);
      documentText = response.response.text();
    } else if (mimeType.startsWith("image/")) {
      const imageBytes = fs.readFileSync(filePath);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const response = await model.generateContent([
        {
          inlineData: {
            data: imageBytes.toString("base64"),
            mimeType: mimeType,
          },
        },
        "Extract the text from this image."
      ]);
      documentText = response.response.text();
    } else {
      documentText = fs.readFileSync(filePath, "utf-8");
    }

    if (!documentText.trim()) {
      return { error: "Could not extract text from the document. The document might be empty, a scanned image that is hard to read, or in an unsupported format." };
    }

    return await analyzeLabourContract(documentText);

  } catch (error) {
    console.error("Labour contract file analysis error:", error);
    return {
      error: "Failed to analyze the file due to a technical issue. Please try again."
    };
  }
}
