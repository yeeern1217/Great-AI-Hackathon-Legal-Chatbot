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
    // Define the URL for the Bedrock RAG service
    const bedrockUrl = "http://127.0.0.1:8000/bedrock/query";

    // Prepare the request parameters
    const params = new URLSearchParams();
    // The documentContext can be passed as part of the user question for the RAG to consider.
    const queryText = documentContext
      ? `Based on the following document context, please answer the user's question.

<document_context>
${documentContext}
</document_context>

Question: ${userQuestion}`
      : userQuestion;

    params.append("text", queryText);

    // Make the request to the Bedrock service
    const response = await axios.get(bedrockUrl, { params });

    // Check if the response contains the expected data from the RAG service
    if (response.data && response.data.response) {
      return response.data.response;
    } else {
      console.error("Invalid response from Bedrock RAG service:", response.data);
      return "I apologize, but I received an invalid response from the legal analysis service. Please try again later.";
    }
  } catch (error) {
    console.error("Error calling Bedrock RAG service:", error);

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
  try {
    const bedrockUrl = "http://127.0.0.1:8000/bedrock/analyze-contract";
    const response = await axios.post(bedrockUrl, { contract_text: documentText });

    const analysisResult = response.data;

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
