import * as fs from "fs";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  let systemPrompt = `You are an AI-powered legal advisor specializing in providing information about basic laws in India. 
Your role is to help users understand legal concepts in simple and clear language.

Guidelines:
1. Provide general legal information only (not personal legal advice).
2. Keep answers short, clear, and easy to understand.
3. Cover topics such as:
   - Indian Penal Code (IPC) basics
   - Fundamental rights and duties
   - Consumer rights
   - Cyber laws
   - Labor laws
   - Contract basics
   - Family law (marriage, divorce, inheritance)
   - Property law basics
4. Always include a disclaimer: 
   "I am not a lawyer. This is only general information about Indian laws. For legal advice specific to your case, consult a qualified advocate."
5. If a user asks something outside Indian law or very specific to their personal case, politely redirect them to seek professional legal help.

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
    if (mimeType === "application/pdf") {
      return "I can see you've uploaded a PDF. I can't directly read PDF content here, but I can help with general legal questions about its type. Please describe your document or ask specific legal questions.";
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
        "Analyze this legal document image and provide Indian law-related explanations. Always add a disclaimer."
      ]);

      return response.response.text() + "\n\nDisclaimer: This analysis provides general legal information only. For specific advice, consult a qualified advocate.";
    } else {
      return "I can assist with PDF and image files. Please upload a supported format.";
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
Respond about Indian laws in a clear, helpful manner. 
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
// Tenancy Agreement Visual Analysis
// =================================
export async function analyzeTenancyAgreement(documentText: string): Promise<any> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are a specialized AI legal assistant for Malaysian tenancy agreements. Your task is to analyze the provided tenancy agreement text and classify its clauses into a "traffic light" system.

    **Analysis Categories:**
    *   **🔴 Merah (Red):** High-risk, potentially illegal, or predatory clauses under Malaysian law. These are clauses that heavily favor the landlord, are unenforceable, or contradict the Contracts Act 1950 or other relevant legislation.
    *   **🟡 Kuning (Yellow):** Clauses that are unusual, ambiguous, or require careful consideration and negotiation. They may not be illegal but could lead to disputes if not clarified.
    *   **🟢 Hijau (Green):** Standard, fair, and generally acceptable clauses that are common in Malaysian tenancy agreements.

    **Instructions:**
    1.  Thoroughly read the entire tenancy agreement text provided.
    2.  Identify each distinct clause or provision.
    3.  For each clause, determine its risk level (Red, Yellow, or Green).
    4.  Provide a **brief, simple explanation** for your classification.
    5.  Extract the **exact original text** of the clause.
    6.  Return the analysis as a JSON object with the following structure:
        \
        {
          "analysis": [
            {
              "clause": "The exact text of the clause from the document...",
              "risk": "Red",
              "explanation": "Your brief explanation here..."
            },
            {
              "clause": "Another exact clause text...",
              "risk": "Yellow",
              "explanation": "Your brief explanation here..."
            },
            {
              "clause": "And another one...",
              "risk": "Green",
              "explanation": "Your brief explanation here..."
            }
          ]
        }
        \

    **IMPORTANT:**
    *   Ensure the output is **only** a valid JSON object. Do not include any introductory text, markdown formatting, or apologies.
    *   The 'clause' field in the JSON must contain the verbatim text from the agreement to allow for frontend highlighting.
    *   If the document is not a tenancy agreement or is unanalyzable, return a JSON object with an "error" key: "{\"error\": \"The provided document does not appear to be a valid tenancy agreement.\"}"

    Now, analyze the following tenancy agreement:
  `;

  try {
    const result = await model.generateContent([prompt, documentText]);
    const responseText = result.response.text();

    // Clean the response to ensure it's a valid JSON string
    const jsonString = responseText.replace(/```json|```/g, "").trim();
    
    const analysisResult = JSON.parse(jsonString);
    return analysisResult;

  } catch (error) {
    console.error("Tenancy agreement analysis error:", error);
    return {
      error: "Failed to analyze the tenancy agreement due to a technical issue. Please try again."
    };
  }
}

export async function analyzeTenancyAgreementFile(filePath: string, mimeType: string): Promise<any> {
  let documentText = "";

  try {
    if (mimeType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      documentText = data.text;
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

    if (!documentText) {
      return { error: "Could not extract text from the document." };
    }

    return await analyzeTenancyAgreement(documentText);

  } catch (error) {
    console.error("Tenancy agreement file analysis error:", error);
    return {
      error: "Failed to analyze the file due to a technical issue. Please try again."
    };
  }
}
