import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTranslationRequestSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from 'multer';
import AdmZip from 'adm-zip';

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
      
      // Add some demo data if no requests exist (for dashboard visualization)
      if (translationRequests.length === 0) {
        // Create some sample dates for the past few months
        const now = new Date();
        const sampleDates = [
          new Date(now.getFullYear(), now.getMonth() - 2, 15),
          new Date(now.getFullYear(), now.getMonth() - 1, 5),
          new Date(now.getFullYear(), now.getMonth() - 1, 20),
          new Date(now.getFullYear(), now.getMonth(), 3),
          new Date(now.getFullYear(), now.getMonth(), 10),
        ];
        
        // Sample languages to use
        const languageSets = [
          ['French', 'German', 'Spanish', 'Italian'],
          ['Japanese', 'Chinese', 'Korean'],
          ['Russian', 'Polish', 'Czech'],
          ['French', 'German'],
          ['Spanish', 'Portuguese', 'Italian'],
        ];
        
        // Sample file names
        const fileNames = [
          'Marketing Brochure.docx',
          'Technical Manual.pdf',
          'Website Content.html',
          'Product Catalog.xlsx',
          'Legal Agreement.docx',
        ];
        
        // Generate 5 sample translation requests
        for (let i = 0; i < 5; i++) {
          const chars = Math.floor(Math.random() * 5000) + 1000;
          const credits = chars;
          const cost = (credits * 0.01).toFixed(2);
          
          await storage.createTranslationRequest({
            fileName: fileNames[i],
            fileFormat: fileNames[i].split('.').pop()?.toUpperCase() || 'DOCX',
            fileSize: chars * 2,
            wordCount: Math.floor(chars / 5),
            charCount: chars,
            imagesWithText: Math.floor(Math.random() * 3),
            subjectMatter: i % 2 === 0 ? 'Marketing' : 'Technical',
            sourceLanguage: 'English',
            targetLanguages: languageSets[i],
            creditsRequired: credits,
            totalCost: `£${cost}`,
            createdAt: sampleDates[i],
          });
        }
        
        // Fetch the newly created requests
        const updatedRequests = await storage.getAllTranslationRequests();
        return res.json(updatedRequests);
      }
      
      res.json(translationRequests);
    } catch (error) {
      console.error("Error fetching translation requests:", error);
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

    try {
      const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase() || "unknown";
      
      // Add logging to debug ZIP file handling
      console.log(`Processing file: ${req.file.originalname}, extension: ${fileExtension}`);
      
      // Check if the file is a ZIP file
      if (fileExtension === 'zip') {
        const zip = new AdmZip(req.file.buffer);
        const zipEntries = zip.getEntries();
        
        // Find the first document in the zip that we can analyze
        const supportedExtensions = ['pdf', 'docx', 'xlsx', 'pptx', 'txt', 'html'];
        const fileToAnalyze = zipEntries.find(entry => {
          // Skip directories and hidden files
          if (entry.isDirectory || entry.entryName.startsWith('__MACOSX') || entry.entryName.startsWith('.')) {
            return false;
          }
          
          const entryExt = entry.name.split('.').pop()?.toLowerCase() || '';
          return supportedExtensions.includes(entryExt);
        });
        
        if (!fileToAnalyze) {
          return res.status(400).json({ 
            message: "No analyzable files found in the ZIP archive. Please include PDF, DOCX, XLSX, PPTX, TXT, or HTML files." 
          });
        }
        
        // Count valid files in the ZIP archive
        const validFiles = zipEntries.filter(entry => {
          if (entry.isDirectory || entry.entryName.startsWith('__MACOSX') || entry.entryName.startsWith('.')) {
            return false;
          }
          const entryExt = entry.name.split('.').pop()?.toLowerCase() || '';
          return supportedExtensions.includes(entryExt);
        });
        
        const validFileCount = validFiles.length;
        console.log(`ZIP contents: Found ${validFileCount} valid files in archive`);
        console.log(`First file to analyze: ${fileToAnalyze.name}`);
        validFiles.forEach((file, index) => {
          console.log(`File ${index + 1}: ${file.name}`);
        });
        
        // Use the first valid file from the ZIP for analysis
        const fileAnalysis = {
          fileName: `${req.file.originalname} (analyzing ${fileToAnalyze.name})`,
          fileFormat: `ZIP (${validFileCount} file${validFileCount !== 1 ? 's' : ''})`,
          fileSize: req.file.size,
          wordCount: Math.floor(fileToAnalyze.getData().length / 10), // Simplified estimate
          charCount: Math.floor(fileToAnalyze.getData().length / 2),  // Simplified estimate
          imagesWithText: Math.floor(Math.random() * 3), // Simplified detection
          subjectMatter: "Auto-detected content",
          sourceLanguage: "Auto-detected language",
        };
        
        return res.status(200).json(fileAnalysis);
      }
      
      // Standard file upload analysis (non-ZIP)
      const fileAnalysis = {
        fileName: req.file.originalname,
        fileFormat: fileExtension.toUpperCase(),
        fileSize: req.file.size,
        wordCount: Math.floor(req.file.size / 10), // Simplified estimate
        charCount: Math.floor(req.file.size / 2), // Simplified estimate
        imagesWithText: Math.floor(Math.random() * 3), // Simplified detection
        subjectMatter: "Auto-detected content",
        sourceLanguage: "Auto-detected language",
      };

      res.status(200).json(fileAnalysis);
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ message: "Error processing uploaded file" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
