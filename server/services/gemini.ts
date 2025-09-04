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
export async function generateLegalAdvice(userQuestion: string): Promise<string> {
  const systemPrompt = `You are an AI-powered legal advisor specializing in providing information about basic laws in India. 
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

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const response = await model.generateContent([systemPrompt, userQuestion]);
    return response.response.text() || 
      "I apologize, but I couldn't generate a response. Please try again or consult a legal professional.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm experiencing technical difficulties. Please try again later or consult a qualified advocate for immediate legal assistance.";
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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

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
