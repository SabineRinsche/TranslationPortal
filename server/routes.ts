import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTranslationRequestSchema, 
  insertUserSchema, 
  insertAccountSchema, 
  subscriptionPlans 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from 'multer';
import AdmZip from 'adm-zip';
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Create a folder for profile pictures if it doesn't exist
import fs from 'fs';
import path from 'path';
const publicDir = path.join(process.cwd(), 'public');
const profilePicsDir = path.join(publicDir, 'profile-pics');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(profilePicsDir)) {
  fs.mkdirSync(profilePicsDir, { recursive: true });
}

// Mock authenticated user and account for demo purposes
let currentUser = {
  id: 1,
  accountId: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  username: "johndoe",
  password: "password123",
  role: "admin",
  jobTitle: "Localization Manager",
  phoneNumber: "+44 1234 567890",
  profileImageUrl: "" as string | null, // Will store the URL to the profile image
  createdAt: new Date(),
  updatedAt: new Date()
};

let currentAccount = {
  id: 1,
  name: "Alpha Translations Ltd",
  credits: 75000,
  subscriptionPlan: "pro",
  subscriptionStatus: "active",
  subscriptionRenewal: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  createdAt: new Date()
};

const userUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  jobTitle: z.string().optional(),
});

const passwordUpdateSchema = z.object({
  password: z.string().min(8),
});

const creditPurchaseSchema = z.object({
  credits: z.number().positive(),
});

const subscriptionUpdateSchema = z.object({
  planId: z.string(),
});

// Extend Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: typeof currentUser;
    }
  }
}

// Middleware to simulate authentication
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // In a real app, this would verify a token or session
  // For demo purposes, we'll always consider the user authenticated
  req.user = currentUser;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from the public directory
  app.use(express.static(path.join(process.cwd(), 'public')));
  
  // Apply auth middleware to all API routes
  app.use('/api', authMiddleware);
  
  // User profile routes
  app.get("/api/user/profile", (req, res) => {
    res.json(currentUser);
  });
  
  app.patch("/api/user/profile", (req, res) => {
    try {
      const validatedData = userUpdateSchema.parse(req.body);
      
      // Update the user data
      currentUser = {
        ...currentUser,
        ...validatedData,
        updatedAt: new Date()
      };
      
      res.json(currentUser);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to update profile" });
      }
    }
  });
  
  // Profile picture upload endpoint
  app.post("/api/user/profile-picture", upload.single("profilePicture"), (req: Request & { file?: Express.Multer.File }, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    try {
      // Check file type
      const fileType = req.file.mimetype;
      if (!fileType.startsWith('image/')) {
        return res.status(400).json({ message: "Uploaded file must be an image" });
      }
      
      // Generate a unique filename
      const fileExtension = fileType.split('/')[1];
      const fileName = `profile-${currentUser.id}-${Date.now()}.${fileExtension}`;
      const filePath = path.join(profilePicsDir, fileName);
      
      // Write the file to disk
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Update the user's profile image URL with full URL
      // This ensures the image path is properly resolved
      const profileImageUrl = `${req.protocol}://${req.get('host')}/profile-pics/${fileName}`;
      
      // Update the currentUser directly to avoid type issues
      currentUser.profileImageUrl = profileImageUrl;
      currentUser.updatedAt = new Date();
      
      res.json({ 
        message: "Profile picture updated successfully", 
        profileImageUrl 
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });
  
  app.patch("/api/user/password", (req, res) => {
    try {
      const validatedData = passwordUpdateSchema.parse(req.body);
      
      // Update password
      currentUser = {
        ...currentUser,
        password: validatedData.password,
        updatedAt: new Date()
      };
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to update password" });
      }
    }
  });
  
  // Account routes
  app.get("/api/account", (req, res) => {
    // In a real implementation, we would fetch account details based on the user's accountId
    // For demo purposes, we'll return the mock account
    
    // Add the current users to the account response
    const accountWithUsers = {
      ...currentAccount,
      users: [currentUser] // In a real app, we would fetch all users for the account
    };
    
    res.json(accountWithUsers);
  });
  
  app.post("/api/account/credits/purchase", (req, res) => {
    try {
      const validatedData = creditPurchaseSchema.parse(req.body);
      
      // Add credits to the account
      currentAccount = {
        ...currentAccount,
        credits: currentAccount.credits + validatedData.credits
      };
      
      res.json({ 
        message: `${validatedData.credits} credits added successfully`,
        currentCredits: currentAccount.credits
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to purchase credits" });
      }
    }
  });
  
  app.post("/api/account/subscription", (req, res) => {
    try {
      const validatedData = subscriptionUpdateSchema.parse(req.body);
      
      const plan = subscriptionPlans.find(p => p.id === validatedData.planId);
      if (!plan) {
        return res.status(400).json({ message: "Invalid subscription plan" });
      }
      
      // Update subscription data
      const renewalDate = new Date();
      renewalDate.setMonth(renewalDate.getMonth() + 1);
      
      currentAccount = {
        ...currentAccount,
        subscriptionPlan: plan.id,
        subscriptionStatus: "active",
        subscriptionRenewal: renewalDate
      };
      
      res.json({ 
        message: `Subscription updated to ${plan.name} plan`,
        subscription: {
          plan: plan.id,
          status: "active",
          renewal: renewalDate
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to update subscription" });
      }
    }
  });
  // API routes with /api prefix
  app.post("/api/translation-requests", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const validatedData = insertTranslationRequestSchema.parse(req.body);
      
      // Add the current user's ID to the request
      const translationRequestWithUser = {
        ...validatedData,
        userId: req.user.id
      };
      
      const translationRequest = await storage.createTranslationRequest(translationRequestWithUser);
      res.status(201).json(translationRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating translation request:", error);
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
            userId: req.user?.id || 1, // Use the current user ID or default to 1
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
        
        // Basic language detection function for server-side processing
        const detectLanguage = (text: string): string => {
          // Language patterns
          const patterns = [
            { lang: 'English', regex: /\b(the|and|or|if|in|on|at|to|for|with|by|about|is|are)\b/gi, threshold: 0.04 },
            { lang: 'Spanish', regex: /\b(el|la|los|las|y|o|si|en|con|por|para|es|son|está)\b/gi, threshold: 0.03 },
            { lang: 'French', regex: /\b(le|la|les|et|ou|si|dans|sur|avec|par|pour|est|sont)\b/gi, threshold: 0.03 },
            { lang: 'German', regex: /\b(der|die|das|und|oder|wenn|in|auf|mit|durch|für|ist|sind)\b/gi, threshold: 0.03 },
            { lang: 'Italian', regex: /\b(il|la|i|gli|le|e|o|se|in|su|con|per|è|sono)\b/gi, threshold: 0.03 },
          ];
          
          // Convert binary data to text (simplified)
          const sampleText = text.toString().replace(/[^\x20-\x7E]/g, ''); // Keep only ASCII printable characters
          
          if (!sampleText || sampleText.trim().length < 50) {
            return 'Unknown (insufficient text)';
          }
          
          const wordCount = sampleText.split(/\s+/).length;
          
          // Check each language pattern
          for (const pattern of patterns) {
            const matches = (sampleText.match(pattern.regex) || []).length;
            const matchRatio = matches / wordCount;
            
            if (matchRatio > pattern.threshold) {
              return pattern.lang;
            }
          }
          
          return 'English (default)';
        };
        
        // Get text sample from the file
        const fileData = fileToAnalyze.getData();
        const fileText = fileData.toString().substring(0, 5000); // Use first 5000 chars for detection
        
        // Detect language from the file content
        const detectedLanguage = detectLanguage(fileText);
        
        // Use the first valid file from the ZIP for analysis
        const fileAnalysis = {
          fileName: `${req.file.originalname} (analyzing ${fileToAnalyze.name})`,
          fileFormat: `ZIP (${validFileCount} file${validFileCount !== 1 ? 's' : ''})`,
          fileSize: req.file.size,
          wordCount: Math.floor(fileToAnalyze.getData().length / 10), // Simplified estimate
          charCount: Math.floor(fileToAnalyze.getData().length / 2),  // Simplified estimate
          imagesWithText: Math.floor(Math.random() * 3), // Simplified detection
          subjectMatter: "Auto-detected content",
          sourceLanguage: detectedLanguage,
        };
        
        return res.status(200).json(fileAnalysis);
      }
      
      // Basic language detection function for non-ZIP files
      const detectLanguage = (text: string): string => {
        // Language patterns
        const patterns = [
          { lang: 'English', regex: /\b(the|and|or|if|in|on|at|to|for|with|by|about|is|are)\b/gi, threshold: 0.04 },
          { lang: 'Spanish', regex: /\b(el|la|los|las|y|o|si|en|con|por|para|es|son|está)\b/gi, threshold: 0.03 },
          { lang: 'French', regex: /\b(le|la|les|et|ou|si|dans|sur|avec|par|pour|est|sont)\b/gi, threshold: 0.03 },
          { lang: 'German', regex: /\b(der|die|das|und|oder|wenn|in|auf|mit|durch|für|ist|sind)\b/gi, threshold: 0.03 },
          { lang: 'Italian', regex: /\b(il|la|i|gli|le|e|o|se|in|su|con|per|è|sono)\b/gi, threshold: 0.03 },
        ];
        
        // Convert binary data to text (simplified)
        const sampleText = text.toString().replace(/[^\x20-\x7E]/g, ''); // Keep only ASCII printable characters
        
        if (!sampleText || sampleText.trim().length < 50) {
          return 'Unknown (insufficient text)';
        }
        
        const wordCount = sampleText.split(/\s+/).length;
        
        // Check each language pattern
        for (const pattern of patterns) {
          const matches = (sampleText.match(pattern.regex) || []).length;
          const matchRatio = matches / wordCount;
          
          if (matchRatio > pattern.threshold) {
            return pattern.lang;
          }
        }
        
        return 'English (default)';
      };
      
      // Get text sample for language detection
      const fileText = req.file.buffer.toString().substring(0, 5000); // Take first 5000 chars
      const detectedLanguage = detectLanguage(fileText);

      // Standard file upload analysis (non-ZIP)
      const fileAnalysis = {
        fileName: req.file.originalname,
        fileFormat: fileExtension.toUpperCase(),
        fileSize: req.file.size,
        wordCount: Math.floor(req.file.size / 10), // Simplified estimate
        charCount: Math.floor(req.file.size / 2), // Simplified estimate
        imagesWithText: Math.floor(Math.random() * 3), // Simplified detection
        subjectMatter: "Auto-detected content",
        sourceLanguage: detectedLanguage,
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
