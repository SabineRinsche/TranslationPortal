import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTranslationRequestSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from 'multer';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes with /api prefix
  app.post("/api/translation-requests", async (req, res) => {
    try {
      const validatedData = insertTranslationRequestSchema.parse(req.body);
      const translationRequest = await storage.createTranslationRequest(validatedData);
      res.status(201).json(translationRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to create translation request" });
      }
    }
  });

  app.get("/api/translation-requests", async (req, res) => {
    try {
      const translationRequests = await storage.getAllTranslationRequests();
      res.json(translationRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch translation requests" });
    }
  });

  app.get("/api/translation-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const translationRequest = await storage.getTranslationRequest(id);
      if (!translationRequest) {
        return res.status(404).json({ message: "Translation request not found" });
      }
      
      res.json(translationRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch translation request" });
    }
  });

  // File upload endpoint
  app.post("/api/files/upload", upload.single("file"), (req: Request & { file?: Express.Multer.File }, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // This is where we'd normally process the file
    // For now, we'll just return a mock analysis based on the file metadata
    const fileAnalysis = {
      fileName: req.file.originalname,
      fileFormat: req.file.originalname.split('.').pop() || "unknown",
      fileSize: req.file.size,
      wordCount: Math.floor(req.file.size / 10), // Simplified estimate
      charCount: Math.floor(req.file.size / 2), // Simplified estimate
      imagesWithText: Math.floor(Math.random() * 3), // Simplified detection
      subjectMatter: "Auto-detected content",
      sourceLanguage: "Auto-detected language",
    };

    res.status(200).json(fileAnalysis);
  });

  const httpServer = createServer(app);

  return httpServer;
}
