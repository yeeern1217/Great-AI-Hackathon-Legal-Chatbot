import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema, insertChatSessionSchema } from "@shared/schema";
import { generateLegalAdvice, analyzeDocument, analyzeTenancyAgreement, analyzeTenancyAgreementFile } from "./services/gemini";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get or create chat session
  app.post("/api/chat/session", async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(validatedData);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get chat session by ID
  app.get("/api/chat/session/:id", async (req, res) => {
    try {
      const session = await storage.getChatSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get chat messages for a session
  app.get("/api/chat/session/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Send a chat message
  app.post("/api/chat/message", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      
      // Store user message
      const userMessage = await storage.addChatMessage(validatedData);
      
      // Generate AI response using Gemini
      const aiResponse = await generateLegalAdvice(validatedData.content, validatedData.documentContext || undefined);
      
      // Store AI response
      const assistantMessage = await storage.addChatMessage({
        sessionId: validatedData.sessionId,
        role: 'assistant',
        content: aiResponse,
      });

      res.json({
        userMessage,
        assistantMessage
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // File upload endpoint
  app.post("/api/upload", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      };

      const uploadedFile = await storage.saveUploadedFile(fileData);
      
      // Analyze the document using Gemini
      const filePath = req.file.path;
      const analysis = await analyzeDocument(filePath, req.file.mimetype);

      res.json({
        file: uploadedFile,
        analysis
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Tenancy agreement analysis endpoint (text)
  app.post("/api/analyze-tenancy-agreement", async (req, res) => {
    try {
      const { documentText } = req.body;
      if (!documentText) {
        return res.status(400).json({ message: "No document text provided" });
      }

      const analysisResult = await analyzeTenancyAgreement(documentText);
      res.json(analysisResult);

    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Tenancy agreement analysis endpoint (file)
  app.post("/api/analyze-tenancy-agreement-file", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const analysisResult = await analyzeTenancyAgreementFile(req.file.path, req.file.mimetype);
      res.json(analysisResult);

    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Quick legal topics endpoint
  app.get("/api/legal-topics", async (req, res) => {
    const topics = [
      { id: 'ipc', name: 'Indian Penal Code', query: 'Explain the Indian Penal Code basics' },
      { id: 'fundamental-rights', name: 'Fundamental Rights', query: 'What are fundamental rights in Indian Constitution?' },
      { id: 'consumer-protection', name: 'Consumer Protection', query: 'Tell me about Consumer Protection Act 2019' },
      { id: 'cyber-laws', name: 'Cyber Laws', query: 'What are the cyber laws in India?' },
      { id: 'labor-laws', name: 'Labor Laws', query: 'Explain labor laws in India' },
      { id: 'property-law', name: 'Property Law', query: 'What are property laws in India?' }
    ];
    res.json(topics);
  });

  const httpServer = createServer(app);
  return httpServer;
}