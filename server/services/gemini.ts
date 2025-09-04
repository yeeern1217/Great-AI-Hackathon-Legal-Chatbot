import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            config: {
                systemInstruction: systemPrompt,
            },
            contents: userQuestion,
        });

        return response.text || "I apologize, but I couldn't generate a response. Please try again or consult a legal professional.";
    } catch (error) {
        console.error("Gemini API error:", error);
        return "I'm experiencing technical difficulties. Please try again later or consult a qualified advocate for immediate legal assistance.";
    }
}

export async function analyzeDocument(filePath: string, mimeType: string): Promise<string> {
    try {
        let contents: any[] = [];
        
        if (mimeType === 'application/pdf') {
            // For PDF, we'll provide general guidance since we can't parse it without additional libraries
            return "I can see you've uploaded a PDF document. While I can't directly read PDF content in this version, I can help you with general questions about the legal document type you're dealing with. Please describe your document or ask specific questions about Indian laws related to your document.";
        } else if (mimeType.startsWith('image/')) {
            const imageBytes = fs.readFileSync(filePath);
            contents = [
                {
                    inlineData: {
                        data: imageBytes.toString("base64"),
                        mimeType: mimeType,
                    },
                },
                `Analyze this legal document image and provide information about Indian laws related to its content. 
                Focus on explaining relevant legal concepts and rights. Always include appropriate legal disclaimers.`
            ];
        } else {
            return "I can assist with PDF and image files. Please upload a supported file format.";
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: contents,
        });

        const analysis = response.text || "";
        return analysis + "\n\nDisclaimer: This analysis provides general legal information only. For legal advice specific to your document, consult a qualified advocate.";
    } catch (error) {
        console.error("Document analysis error:", error);
        return "I couldn't analyze this document. Please try again or consult a legal professional for document review.";
    }
}

export async function processVoiceInput(audioText: string, language: string): Promise<string> {
    const prompt = `The user has spoken in ${language}. Their message is: "${audioText}". 
    Please respond appropriately about Indian laws in a clear and helpful manner. 
    If the language is not English, you may respond in the same language if appropriate, but always include the legal disclaimer.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text || "I couldn't process your voice input. Please try again or type your question.";
    } catch (error) {
        console.error("Voice processing error:", error);
        return "I couldn't process your voice input. Please try again or type your question.";
    }
}
