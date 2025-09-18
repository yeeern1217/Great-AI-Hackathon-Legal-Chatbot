import * as fs from "fs";
import path from "path";
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

import axios from "axios";
export async function generateLegalAdvice(userQuestion: string, documentContext?: string): Promise<string> {
  try {
    // Define the URL for the Bedrock service
    const bedrockUrl = "http://127.0.0.1:8000/bedrock/invoke";

    // Prepare the request parameters
    const params = new URLSearchParams();
    params.append("text", userQuestion);
    if (documentContext) {
      params.append("document_context", documentContext);
    }

    // Make the request to the Bedrock service
    const response = await axios.get(bedrockUrl, { params });

    // Check if the response contains the expected data
    if (response.data && response.data.assistant) {
      return response.data.assistant;
    } else {
      console.error("Invalid response from Bedrock service:", response.data);
      return "I apologize, but I received an invalid response from the legal analysis service. Please try again later.";
    }
  } catch (error) {
    console.error("Error calling Bedrock service:", error);

    // Provide a more specific error message if the service is unavailable
    if (axios.isAxiosError(error) && error.code === 'ECONNREFUSED') {
      return "I'm sorry, but the legal analysis service is currently unavailable. Please make sure the service is running and try again.";
    }
    
    return "I'm experiencing technical difficulties with the legal analysis service. Please try again later.";
  }
}

// ========================== 
// Document Analysis
// ========================== 
export async function analyzeDocument(filePath: string, mimeType: string): Promise<string> {
  try {
    let documentText: string | null = null;

    if (mimeType === "application/pdf") {
      const fileBytes = fs.readFileSync(filePath);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const response = await model.generateContent([
        { inlineData: { data: fileBytes.toString("base64"), mimeType: mimeType } },
        "Extract the text from this document."
      ]);
      documentText = response.response.text();
    } else if (mimeType.startsWith("text/")) {
      documentText = fs.readFileSync(filePath, "utf-8");
    } else if (mimeType.startsWith("image/")) {
      const imageBytes = fs.readFileSync(filePath);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const response = await model.generateContent([
        { inlineData: { data: imageBytes.toString("base64"), mimeType: mimeType } },
        "Analyze this legal document image and provide a concise summary of its content. This summary will be used as context for a legal chat assistant. Focus on key points, parties involved, and main obligations or clauses. Always add a disclaimer."
      ]);

      return response.response.text() + "\n\nDisclaimer: This analysis provides general legal information only. For specific advice, consult a qualified advocate.";
    }

    if (documentText) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Summarize the following document text concisely. This summary will be used as context for a legal chat assistant. Focus on extracting the key points, parties involved, and main obligations or clauses.`;
      const response = await model.generateContent([prompt, documentText]);
      return response.response.text() + "\n\nDisclaimer: This analysis provides a summary for informational purposes only. For specific advice, consult a qualified advocate.";
    } else {
      return "Unsupported file format. I can assist with PDF, text, and image files.";
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
