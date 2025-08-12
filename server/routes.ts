import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTranslationRequestSchema, 
  insertUserSchema, 
  insertAccountSchema, 
  subscriptionPlans,
  userLanguagePreferencesSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import multer from 'multer';
import AdmZip from 'adm-zip';
import { z } from "zod";
import apiRouter from "./api-v1";
import { requireAuth, requireAdmin, getSession } from "./auth";
import { registerAuthRoutes } from "./authRoutes";
import adminRoutes from "./adminRoutes";

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
  preferredLanguages: ["French", "Italian", "German", "Spanish"] as string[],
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

const languagePreferencesSchema = z.object({
  preferredLanguages: z.array(z.string()),
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
  // Register authentication routes
  registerAuthRoutes(app);
  
  // Register admin routes
  app.use('/api/admin', adminRoutes);
  
  // Serve static files from the public directory
  app.use(express.static(path.join(process.cwd(), 'public')));
  
  // Translation requests endpoint (using simple auth check for web interface)
  app.post('/api/translation-requests', async (req, res) => {
    // Simple auth check - if no session userId, use the mock user for now
    if (!req.session?.userId) {
      console.log('No session userId found, using mock authentication');
      req.user = currentUser;  // Use the mock user from routes.ts
    } else {
      try {
        const user = await storage.getUser(req.session.userId);
        if (!user) {
          return res.status(401).json({ message: 'User not found' });
        }
        req.user = user;
      } catch (error) {
        console.error('Auth error:', error);
        return res.status(500).json({ message: 'Authentication error' });
      }
    }
    
    try {
      // Schema for translation request body - make everything optional first to debug
      const translationRequestBodySchema = z.object({
        fileName: z.string().optional(),
        fileFormat: z.string().optional(),
        fileSize: z.number().optional(),
        wordCount: z.number().optional(), 
        characterCount: z.number().optional(),
        imagesWithText: z.number().optional(),
        subjectMatter: z.string().optional(),
        sourceLanguage: z.string().optional(),
        targetLanguages: z.array(z.string()).optional(),
        workflow: z.string().optional(),
        priority: z.string().optional(),
        creditsRequired: z.number().optional(),
        totalCost: z.string().optional(),
        dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
      });

      // Validate request body
      console.log('Request body:', JSON.stringify(req.body, null, 2));
      const validatedData = translationRequestBodySchema.parse(req.body);
      
      // Use data from request or defaults
      const creditsRequired = validatedData.creditsRequired || 5000;
      
      // Prepare data for storage
      const newTranslationRequest = {
        userId: req.user?.id || 1,
        fileName: validatedData.fileName || 'Unknown File',
        fileFormat: validatedData.fileFormat || (validatedData.fileName ? validatedData.fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN' : 'UNKNOWN'),
        fileSize: validatedData.fileSize || 256000,
        wordCount: validatedData.wordCount || 5000,
        characterCount: validatedData.characterCount || 25000,
        imagesWithText: validatedData.imagesWithText || 3,
        subjectMatter: validatedData.subjectMatter || 'Technical, Marketing',
        sourceLanguage: validatedData.sourceLanguage || 'English',
        targetLanguages: validatedData.targetLanguages || ['French'],
        workflow: validatedData.workflow || 'ai-neural',
        priority: validatedData.priority || 'medium',
        dueDate: validatedData.dueDate,
        status: 'pending' as const,
        completionPercentage: 0,
        creditsRequired,
        totalCost: validatedData.totalCost || `£${(creditsRequired * 0.001).toFixed(2)}`,
        createdAt: new Date()
      };
      
      // Create translation request in database
      const translationRequest = await storage.createTranslationRequest(newTranslationRequest);
      
      // Log for external workflow trigger
      console.log(`Translation request ${translationRequest.id} created - ready for external workflow trigger`);
      
      res.status(201).json({
        id: translationRequest.id,
        status: translationRequest.status,
        creditsRequired: translationRequest.creditsRequired,
        totalCost: translationRequest.totalCost,
        estimatedCompletionTime: new Date(Date.now() + 86400000).toISOString(),
        webhook_ready: true
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error('Translation request error:', error);
      res.status(500).json({ error: 'Failed to create translation request' });
    }
  });

  // Register the API v1 router for advanced API access (still with API key auth)
  app.use('/api/v1', apiRouter);
  
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
  
  // Language preferences endpoint
  app.patch("/api/user/language-preferences", (req, res) => {
    try {
      const validatedData = userLanguagePreferencesSchema.parse(req.body);
      
      // Update language preferences
      currentUser = {
        ...currentUser,
        preferredLanguages: validatedData.preferredLanguages,
        updatedAt: new Date()
      };
      
      res.json({ 
        message: "Language preferences updated successfully",
        preferredLanguages: currentUser.preferredLanguages
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        res.status(500).json({ message: "Failed to update language preferences" });
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
      
      // First add the userId to the request body
      const requestWithUserId = {
        ...req.body,
        userId: req.user.id
      };
      
      // Then validate the complete data with userId included
      const validatedData = insertTranslationRequestSchema.parse(requestWithUserId);
      
      const translationRequest = await storage.createTranslationRequest(validatedData);
      res.status(201).json(translationRequest);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        console.error("Validation error details:", JSON.stringify(error.format(), null, 2));
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating translation request:", error);
        res.status(500).json({ message: "Failed to create translation request" });
      }
    }
  });

  // Get a single translation request with its project updates
  app.get("/api/translation-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const request = await storage.getTranslationRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Translation request not found" });
      }
      
      // Get project updates for this request
      const updates = await storage.getProjectUpdates(id);
      
      res.json({
        ...request,
        updates
      });
    } catch (error) {
      console.error("Error fetching translation request details:", error);
      res.status(500).json({ message: "Failed to fetch translation request details" });
    }
  });
  
  // Update a translation request (project tracking fields)
  app.patch("/api/translation-requests/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      const request = await storage.getTranslationRequest(id);
      if (!request) {
        return res.status(404).json({ message: "Translation request not found" });
      }
      
      // Update the request with new data
      const updatedRequest = await storage.updateTranslationRequest(id, req.body);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating translation request:", error);
      res.status(500).json({ message: "Failed to update translation request" });
    }
  });
  
  // Add a project update/note to a translation request
  app.post("/api/translation-requests/:id/updates", async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      if (isNaN(requestId)) {
        return res.status(400).json({ message: "Invalid request ID" });
      }
      
      // Check if the request exists
      const request = await storage.getTranslationRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Translation request not found" });
      }
      
      // Create the project update
      const newUpdate = await storage.createProjectUpdate({
        requestId,
        userId: req.user?.id || 1, // Default to user 1 if not authenticated
        updateText: req.body.updateText,
        updateType: req.body.updateType || 'note',
        newStatus: req.body.newStatus
      });
      
      res.status(201).json(newUpdate);
    } catch (error) {
      console.error("Error adding project update:", error);
      res.status(500).json({ message: "Failed to add project update" });
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
            characterCount: chars,
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
        
        // Subject matter detection function
        const detectSubjectMatter = (text: string): string => {
          // Categories with keywords
          const categories = [
            { 
              name: 'Technical/IT', 
              keywords: ['software', 'hardware', 'code', 'programming', 'algorithm', 'database', 'server', 
                'computer', 'network', 'interface', 'cloud', 'api', 'application', 'digital', 'developer',
                'system', 'technology', 'platform', 'framework', 'function', 'module'] 
            },
            { 
              name: 'Medical/Healthcare', 
              keywords: ['health', 'patient', 'doctor', 'hospital', 'clinical', 'medical', 'treatment', 
                'disease', 'diagnosis', 'therapy', 'pharmaceutical', 'medicine', 'symptom', 'healthcare',
                'clinic', 'physician', 'nurse', 'drug', 'prescription', 'vaccine'] 
            },
            { 
              name: 'Legal', 
              keywords: ['law', 'legal', 'contract', 'agreement', 'court', 'attorney', 'plaintiff', 
                'defendant', 'clause', 'provision', 'jurisdiction', 'statute', 'regulation', 'compliance',
                'litigant', 'paragraph', 'judicial', 'lawyer', 'dispute', 'settlement'] 
            },
            { 
              name: 'Financial/Business', 
              keywords: ['finance', 'business', 'market', 'investment', 'profit', 'revenue', 'strategy', 
                'commercial', 'economic', 'fiscal', 'budget', 'corporate', 'asset', 'stock', 'management',
                'accounting', 'capital', 'financial', 'transaction', 'enterprise'] 
            },
            { 
              name: 'Marketing/Advertising', 
              keywords: ['marketing', 'brand', 'advertising', 'campaign', 'consumer', 'customer', 'product', 
                'service', 'market', 'sales', 'promotion', 'audience', 'demographic', 'media', 'content',
                'creative', 'advertisement', 'commercial', 'communication', 'engagement'] 
            },
            { 
              name: 'Academic/Educational', 
              keywords: ['research', 'study', 'education', 'academic', 'student', 'university', 'school', 
                'learning', 'teaching', 'theory', 'concept', 'analysis', 'methodology', 'science', 'literature',
                'experiment', 'hypothesis', 'thesis', 'dissertation', 'curriculum'] 
            }
          ];
          
          // Convert to lowercase and clean up text
          const normalizedText = text.toLowerCase();
          
          // Count keyword matches for each category
          const categoryScores = categories.map(category => {
            let score = 0;
            category.keywords.forEach(keyword => {
              // Use word boundary to match whole words only
              const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
              const matches = (normalizedText.match(regex) || []).length;
              score += matches;
            });
            return { name: category.name, score };
          });
          
          // Sort by score (highest first)
          categoryScores.sort((a, b) => b.score - a.score);
          
          // If highest score is 0 or very low, return generic response
          if (categoryScores[0].score < 3) {
            return 'General Content';
          }
          
          return categoryScores[0].name;
        };
        
        // Get text sample from the file
        const fileData = fileToAnalyze.getData();
        const fileText = fileData.toString().substring(0, 5000); // Use first 5000 chars for detection
        
        // Detect language from the file content
        const detectedLanguage = detectLanguage(fileText);
        
        // Detect subject matter from the file content
        const detectedSubjectMatter = detectSubjectMatter(fileText);
        
        // Use the first valid file from the ZIP for analysis
        const fileAnalysis = {
          fileName: `${req.file.originalname} (analyzing ${fileToAnalyze.name})`,
          fileFormat: `ZIP (${validFileCount} file${validFileCount !== 1 ? 's' : ''})`,
          fileSize: req.file.size,
          wordCount: Math.floor(fileToAnalyze.getData().length / 10), // Simplified estimate
          characterCount: Math.floor(fileToAnalyze.getData().length / 2),  // Simplified estimate - renamed to match frontend
          imagesWithText: Math.floor(Math.random() * 3), // Simplified detection
          subjectMatter: detectedSubjectMatter,
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
      
      // Get text sample for language and subject matter detection
      const fileText = req.file.buffer.toString().substring(0, 5000); // Take first 5000 chars
      const detectedLanguage = detectLanguage(fileText);
      
      // Subject matter detection function
      const detectSubjectMatter = (text: string): string => {
        // Categories with keywords
        const categories = [
          { 
            name: 'Technical/IT', 
            keywords: ['software', 'hardware', 'code', 'programming', 'algorithm', 'database', 'server', 
              'computer', 'network', 'interface', 'cloud', 'api', 'application', 'digital', 'developer',
              'system', 'technology', 'platform', 'framework', 'function', 'module'] 
          },
          { 
            name: 'Medical/Healthcare', 
            keywords: ['health', 'patient', 'doctor', 'hospital', 'clinical', 'medical', 'treatment', 
              'disease', 'diagnosis', 'therapy', 'pharmaceutical', 'medicine', 'symptom', 'healthcare',
              'clinic', 'physician', 'nurse', 'drug', 'prescription', 'vaccine'] 
          },
          { 
            name: 'Legal', 
            keywords: ['law', 'legal', 'contract', 'agreement', 'court', 'attorney', 'plaintiff', 
              'defendant', 'clause', 'provision', 'jurisdiction', 'statute', 'regulation', 'compliance',
              'litigant', 'paragraph', 'judicial', 'lawyer', 'dispute', 'settlement'] 
          },
          { 
            name: 'Financial/Business', 
            keywords: ['finance', 'business', 'market', 'investment', 'profit', 'revenue', 'strategy', 
              'commercial', 'economic', 'fiscal', 'budget', 'corporate', 'asset', 'stock', 'management',
              'accounting', 'capital', 'financial', 'transaction', 'enterprise'] 
          },
          { 
            name: 'Marketing/Advertising', 
            keywords: ['marketing', 'brand', 'advertising', 'campaign', 'consumer', 'customer', 'product', 
              'service', 'market', 'sales', 'promotion', 'audience', 'demographic', 'media', 'content',
              'creative', 'advertisement', 'commercial', 'communication', 'engagement'] 
          },
          { 
            name: 'Academic/Educational', 
            keywords: ['research', 'study', 'education', 'academic', 'student', 'university', 'school', 
              'learning', 'teaching', 'theory', 'concept', 'analysis', 'methodology', 'science', 'literature',
              'experiment', 'hypothesis', 'thesis', 'dissertation', 'curriculum'] 
          }
        ];
        
        // Convert to lowercase and clean up text
        const normalizedText = text.toLowerCase();
        
        // Count keyword matches for each category
        const categoryScores = categories.map(category => {
          let score = 0;
          category.keywords.forEach(keyword => {
            // Use word boundary to match whole words only
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = (normalizedText.match(regex) || []).length;
            score += matches;
          });
          return { name: category.name, score };
        });
        
        // Sort by score (highest first)
        categoryScores.sort((a, b) => b.score - a.score);
        
        // If highest score is 0 or very low, return generic response
        if (categoryScores[0].score < 3) {
          return 'General Content';
        }
        
        return categoryScores[0].name;
      };
      
      // Detect subject matter from the text
      const detectedSubjectMatter = detectSubjectMatter(fileText);

      // Standard file upload analysis (non-ZIP)
      const fileAnalysis = {
        fileName: req.file.originalname,
        fileFormat: fileExtension.toUpperCase(),
        fileSize: req.file.size,
        wordCount: Math.floor(req.file.size / 10), // Simplified estimate
        characterCount: Math.floor(req.file.size / 2), // Simplified estimate - renamed to match frontend expectations
        imagesWithText: Math.floor(Math.random() * 3), // Simplified detection
        subjectMatter: detectedSubjectMatter,
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
