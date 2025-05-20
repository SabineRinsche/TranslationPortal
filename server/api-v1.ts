import express, { Router, Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import multer from 'multer';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { insertTranslationRequestSchema, type User } from '@shared/schema';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for translation files
  },
});

// Create folders for file storage
const uploadsDir = path.join(process.cwd(), 'uploads');
const translationsDir = path.join(uploadsDir, 'translations');
const assetsDir = path.join(uploadsDir, 'assets');
const outputDir = path.join(uploadsDir, 'output');

// Ensure directories exist
[uploadsDir, translationsDir, assetsDir, outputDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// API key validation middleware
const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid API key' });
  }
  
  const apiKey = authHeader.split(' ')[1];
  
  // In a real implementation, verify the API key against a database
  // For demo purposes, we'll accept any non-empty API key
  if (!apiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Attach the user ID to the request for later use
  // In a real implementation, this would be retrieved from the API key
  req.user = { 
    id: 1,
    accountId: 1
  };
  
  next();
};

// File upload validation
const validateFileUpload = (req: Request & { file?: Express.Multer.File }, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Validate file type parameter
  const fileType = req.body.type;
  if (!fileType || !['translation', 'asset'].includes(fileType)) {
    return res.status(400).json({ error: 'Invalid file type. Must be "translation" or "asset"' });
  }
  
  next();
};

// Schema for translation request creation/update
const translationRequestBodySchema = z.object({
  fileName: z.string().optional(),
  fileId: z.string(),
  sourceLanguage: z.string(),
  targetLanguages: z.array(z.string()),
  workflow: z.enum(['ai-neural', 'ai-translation-qc', 'ai-translation-human']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
});

// Schema for translation request status update
const updateStatusSchema = z.object({
  status: z.enum([
    'pending', 
    'translation-in-progress', 
    'lqa-in-progress', 
    'human-reviewer-assigned', 
    'human-review-in-progress', 
    'complete'
  ]).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional().transform(val => val ? new Date(val) : undefined),
  assignedTo: z.string().optional(),
});

// Schema for project update
const projectUpdateSchema = z.object({
  updateType: z.enum(['note', 'status_change', 'milestone', 'issue']),
  updateText: z.string().min(1, 'Update text is required'),
  newStatus: z.string().optional(),
});

// Create API router
const apiRouter = Router();

// Apply API key validation to all routes
apiRouter.use(validateApiKey);

// 1. Translation Requests API Endpoints

// Create a translation request
apiRouter.post('/translation-requests', async (req, res) => {
  try {
    // Validate request body
    const validatedData = translationRequestBodySchema.parse(req.body);
    
    // Check if file exists (in a real implementation)
    // For demo purposes, we'll assume the file exists
    
    // Calculate credits required based on workflow type and file size
    // In a real implementation, this would be based on actual file analysis
    const creditsRequired = 5000; // Placeholder
    
    // Prepare data for storage
    const newTranslationRequest = {
      userId: req.user?.id || 1,
      fileName: validatedData.fileName || 'Unknown File',
      fileFormat: validatedData.fileName ? validatedData.fileName.split('.').pop()?.toUpperCase() || 'UNKNOWN' : 'UNKNOWN',
      fileSize: 256000, // Will be replaced with actual file size in production
      wordCount: 5000, // Will be replaced with actual word count in production
      characterCount: 25000, // Will be replaced with actual character count in production
      imagesWithText: 3, // Will be replaced with actual image count in production
      subjectMatter: 'Technical, Marketing', // Will be determined through analysis in production
      sourceLanguage: validatedData.sourceLanguage,
      targetLanguages: validatedData.targetLanguages,
      workflow: validatedData.workflow,
      priority: validatedData.priority || 'medium',
      dueDate: validatedData.dueDate,
      status: 'pending',
      completionPercentage: 0,
      creditsRequired,
      totalCost: `£${(creditsRequired * 0.001).toFixed(2)}`,
      createdAt: new Date()
    };
    
    // Create translation request in database
    const translationRequest = await storage.createTranslationRequest(newTranslationRequest);
    
    res.status(201).json({
      id: translationRequest.id,
      status: translationRequest.status,
      creditsRequired: translationRequest.creditsRequired,
      totalCost: translationRequest.totalCost,
      estimatedCompletionTime: new Date(Date.now() + 86400000).toISOString() // 1 day from now
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    console.error('Error creating translation request:', error);
    res.status(500).json({ error: 'Failed to create translation request' });
  }
});

// Get a specific translation request
apiRouter.get('/translation-requests/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }
    
    // Get translation request
    const request = await storage.getTranslationRequest(id);
    if (!request) {
      return res.status(404).json({ error: 'Translation request not found' });
    }
    
    // Get project updates for this request
    const updates = await storage.getProjectUpdates(id);
    
    res.json({
      ...request,
      updates
    });
  } catch (error) {
    console.error('Error fetching translation request:', error);
    res.status(500).json({ error: 'Failed to fetch translation request' });
  }
});

// Update a translation request
apiRouter.patch('/translation-requests/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }
    
    // Get translation request
    const request = await storage.getTranslationRequest(id);
    if (!request) {
      return res.status(404).json({ error: 'Translation request not found' });
    }
    
    // Validate request body
    const validatedData = updateStatusSchema.parse(req.body);
    
    // Update translation request
    const updatedRequest = await storage.updateTranslationRequest(id, validatedData);
    
    res.json({
      id: updatedRequest.id,
      status: updatedRequest.status,
      completionPercentage: updatedRequest.completionPercentage,
      updatedAt: new Date()
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    console.error('Error updating translation request:', error);
    res.status(500).json({ error: 'Failed to update translation request' });
  }
});

// Add an update to a translation request
apiRouter.post('/translation-requests/:id/updates', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }
    
    // Get translation request
    const request = await storage.getTranslationRequest(id);
    if (!request) {
      return res.status(404).json({ error: 'Translation request not found' });
    }
    
    // Validate request body
    const validatedData = projectUpdateSchema.parse(req.body);
    
    // Create project update
    const update = await storage.createProjectUpdate({
      requestId: id,
      userId: req.user?.id || 1,
      updateText: validatedData.updateText,
      updateType: validatedData.updateType,
      newStatus: validatedData.newStatus
    });
    
    // If this is a status change update, also update the translation request status
    if (validatedData.updateType === 'status_change' && validatedData.newStatus) {
      await storage.updateTranslationRequest(id, {
        status: validatedData.newStatus
      });
    }
    
    res.status(201).json({
      id: update.id,
      requestId: update.requestId,
      content: update.updateText,
      type: update.updateType,
      createdAt: update.createdAt
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    console.error('Error adding update to translation request:', error);
    res.status(500).json({ error: 'Failed to add update to translation request' });
  }
});

// List all translation requests
apiRouter.get('/translation-requests', async (req, res) => {
  try {
    // Parse query parameters
    const status = req.query.status as string | undefined;
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
    const limit = parseInt(req.query.limit as string || '50');
    const offset = parseInt(req.query.offset as string || '0');
    
    // For demo purposes, we'll just get all translation requests
    // In a real implementation, we would apply filters and pagination
    const translationRequests = await storage.getAllTranslationRequests();
    
    // Apply filters (basic implementation)
    let filteredRequests = translationRequests;
    if (status) {
      filteredRequests = filteredRequests.filter(req => req.status === status);
    }
    
    if (dateFrom) {
      filteredRequests = filteredRequests.filter(req => new Date(req.createdAt) >= dateFrom);
    }
    
    if (dateTo) {
      filteredRequests = filteredRequests.filter(req => new Date(req.createdAt) <= dateTo);
    }
    
    // Apply pagination
    const paginatedRequests = filteredRequests.slice(offset, offset + limit);
    
    res.json({
      totalCount: filteredRequests.length,
      results: paginatedRequests.map(req => ({
        id: req.id,
        fileName: req.fileName,
        status: req.status,
        sourceLanguage: req.sourceLanguage,
        targetLanguages: req.targetLanguages,
        completionPercentage: req.completionPercentage,
        createdAt: req.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching translation requests:', error);
    res.status(500).json({ error: 'Failed to fetch translation requests' });
  }
});

// 2. Account & User Management API Endpoints

// Get account details
apiRouter.get('/account', async (req, res) => {
  try {
    // Get account ID from authenticated user
    const accountId = req.user?.accountId || 1;
    
    // Get account details
    const account = await storage.getAccount(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Get all users associated with this account
    const users = await storage.getUsersByAccountId(accountId);
    
    res.json({
      id: account.id,
      name: account.name,
      credits: account.credits,
      subscriptionPlan: account.subscriptionPlan,
      subscriptionStatus: account.subscriptionStatus,
      subscriptionRenewal: account.subscriptionRenewal,
      usersCount: users.length
    });
  } catch (error) {
    console.error('Error fetching account details:', error);
    res.status(500).json({ error: 'Failed to fetch account details' });
  }
});

// Purchase credits
apiRouter.post('/account/purchase-credits', async (req, res) => {
  try {
    // Get account ID from authenticated user
    const accountId = req.user?.accountId || 1;
    
    // Get account details
    const account = await storage.getAccount(accountId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Validate request body
    const { creditAmount } = req.body;
    const amount = parseInt(creditAmount);
    
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid credit amount' });
    }
    
    // In a real implementation, we would process a payment here
    // For demo purposes, we'll just update the account credits
    
    const updatedAccount = await storage.updateAccountCredits(accountId, account.credits + amount);
    
    res.json({
      id: updatedAccount.id,
      credits: updatedAccount.credits,
      purchasedCredits: amount,
      purchaseDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error purchasing credits:', error);
    res.status(500).json({ error: 'Failed to purchase credits' });
  }
});

// Get user profile
apiRouter.get('/user/profile', async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user?.id || 1;
    
    // Get user details
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Exclude sensitive information (like password hash)
    const { password, ...userProfile } = user;
    
    res.json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
apiRouter.patch('/user/profile', async (req, res) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user?.id || 1;
    
    // Get user details
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Validate request body
    const { firstName, lastName, email, jobTitle, phoneNumber } = req.body;
    
    // Update fields that were provided
    const updatedFields: any = {};
    if (firstName) updatedFields.firstName = firstName;
    if (lastName) updatedFields.lastName = lastName;
    if (email) updatedFields.email = email;
    if (jobTitle) updatedFields.jobTitle = jobTitle;
    if (phoneNumber) updatedFields.phoneNumber = phoneNumber;
    
    // Update user
    const updatedUser = await storage.updateUser(userId, updatedFields);
    
    // Exclude sensitive information (like password hash)
    const { password, ...userProfile } = updatedUser;
    
    res.json(userProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Get all users for the account
apiRouter.get('/users', async (req, res) => {
  try {
    // Get account ID from authenticated user
    const accountId = req.user?.accountId || 1;
    
    // Get all users for the account
    const users = await storage.getUsersByAccountId(accountId);
    
    // Exclude sensitive information (like password hash)
    const sanitizedUsers = users.map(user => {
      const { password, ...sanitizedUser } = user;
      return sanitizedUser;
    });
    
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 3. Files & Assets API Endpoints

// Upload a file
apiRouter.post('/files/upload', upload.single('file'), validateFileUpload, (req: Request & { file?: Express.Multer.File }, res) => {
  try {
    const file = req.file!;
    const fileType = req.body.type;
    const description = req.body.description || '';
    
    // Generate a unique file ID
    const fileId = `file_${Date.now()}`;
    
    // Determine the target directory based on file type
    const targetDir = fileType === 'translation' ? translationsDir : assetsDir;
    
    // Create a unique filename
    const fileName = `${fileId}_${file.originalname}`;
    const filePath = path.join(targetDir, fileName);
    
    // Write the file to disk
    fs.writeFileSync(filePath, file.buffer);
    
    // Extract file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase() || 'unknown';
    
    // For demo purposes, generate mock file analysis for translation files
    let analysis = null;
    if (fileType === 'translation') {
      analysis = {
        wordCount: 5000,
        characterCount: 25000,
        imagesWithText: Math.floor(Math.random() * 5),
        sourceLanguage: 'English',
        subjectMatter: 'Technical, Marketing'
      };
    }
    
    res.status(201).json({
      fileId,
      fileName: file.originalname,
      fileSize: file.size,
      fileFormat: fileExtension.toUpperCase(),
      uploadedAt: new Date().toISOString(),
      description,
      analysis
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Get file analysis
apiRouter.get('/files/:fileId/analysis', (req, res) => {
  try {
    const fileId = req.params.fileId;
    
    // In a real implementation, we would retrieve the file and its analysis
    // For demo purposes, we'll return mock data
    
    res.json({
      fileId,
      fileName: 'example.docx',
      fileSize: 256000,
      fileFormat: 'DOCX',
      analysis: {
        wordCount: 5000,
        characterCount: 25000,
        imagesWithText: 3,
        sourceLanguage: 'English',
        subjectMatter: 'Technical, Marketing',
        complexityScore: 0.75,
        estimatedTimeToTranslate: '2 hours'
      }
    });
  } catch (error) {
    console.error('Error getting file analysis:', error);
    res.status(500).json({ error: 'Failed to get file analysis' });
  }
});

// Download translated file
apiRouter.get('/translation-requests/:requestId/files/:language', async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);
    const language = req.params.language;
    
    if (isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }
    
    // Get translation request
    const request = await storage.getTranslationRequest(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Translation request not found' });
    }
    
    // Check if the translation is complete
    if (request.status !== 'complete') {
      return res.status(400).json({ error: 'Translation is not yet complete' });
    }
    
    // Check if the requested language is valid
    if (!request.targetLanguages.includes(language)) {
      return res.status(400).json({ error: 'Requested language is not part of this translation' });
    }
    
    // In a real implementation, we would retrieve the translated file
    // For demo purposes, we'll create a sample file
    
    const sampleContent = `This is a sample translated file for ${request.fileName} in ${language}.`;
    const tempFilePath = path.join(outputDir, `${requestId}_${language}_${request.fileName}`);
    
    fs.writeFileSync(tempFilePath, sampleContent);
    
    // Set content disposition header for download
    res.setHeader('Content-Disposition', `attachment; filename=${language}_${request.fileName}`);
    res.setHeader('Content-Type', 'application/octet-stream');
    
    // Stream the file to the client
    const fileStream = fs.createReadStream(tempFilePath);
    fileStream.pipe(res);
    
    // Clean up the temp file after sending
    fileStream.on('end', () => {
      fs.unlinkSync(tempFilePath);
    });
  } catch (error) {
    console.error('Error downloading translated file:', error);
    res.status(500).json({ error: 'Failed to download translated file' });
  }
});

// Update translated files
apiRouter.post('/translation-requests/:requestId/files', upload.single('file'), async (req: Request & { file?: Express.Multer.File }, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const requestId = parseInt(req.params.requestId);
    const language = req.body.language;
    const version = parseInt(req.body.version || '0');
    
    if (isNaN(requestId)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }
    
    if (!language) {
      return res.status(400).json({ error: 'Language is required' });
    }
    
    // Get translation request
    const request = await storage.getTranslationRequest(requestId);
    if (!request) {
      return res.status(404).json({ error: 'Translation request not found' });
    }
    
    // Check if the language is valid
    if (!request.targetLanguages.includes(language)) {
      return res.status(400).json({ error: 'Language is not part of this translation request' });
    }
    
    // Save the translated file
    const fileName = `${requestId}_${language}_v${version + 1}_${req.file.originalname}`;
    const filePath = path.join(outputDir, fileName);
    
    fs.writeFileSync(filePath, req.file.buffer);
    
    // Generate a unique file ID
    const fileId = `file_${Date.now()}`;
    
    res.status(201).json({
      fileId,
      language,
      version: version + 1,
      uploadedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating translated file:', error);
    res.status(500).json({ error: 'Failed to update translated file' });
  }
});

// List translation assets
apiRouter.get('/assets', (req, res) => {
  try {
    // Parse query parameters
    const fileType = req.query.fileType as string | undefined;
    const limit = parseInt(req.query.limit as string || '50');
    const offset = parseInt(req.query.offset as string || '0');
    
    // In a real implementation, we would retrieve assets from the database
    // For demo purposes, we'll return mock data
    
    const assets = [
      {
        id: 'asset_123',
        fileName: 'company-glossary.xlsx',
        fileType: 'glossary',
        fileSize: 102400,
        description: 'Official company terminology',
        uploadedAt: '2023-04-15T09:30:00Z'
      },
      {
        id: 'asset_124',
        fileName: 'style-guide.pdf',
        fileType: 'style-guide',
        fileSize: 524288,
        description: 'Brand style guidelines',
        uploadedAt: '2023-03-20T14:45:00Z'
      },
      {
        id: 'asset_125',
        fileName: 'reference-material.zip',
        fileType: 'reference',
        fileSize: 1048576,
        description: 'Product documentation for reference',
        uploadedAt: '2023-05-10T11:15:00Z'
      }
    ];
    
    // Apply filter if fileType is provided
    let filteredAssets = assets;
    if (fileType) {
      filteredAssets = assets.filter(asset => asset.fileType === fileType);
    }
    
    // Apply pagination
    const paginatedAssets = filteredAssets.slice(offset, offset + limit);
    
    res.json({
      totalCount: filteredAssets.length,
      results: paginatedAssets
    });
  } catch (error) {
    console.error('Error listing assets:', error);
    res.status(500).json({ error: 'Failed to list assets' });
  }
});

// 3. Account & User API Endpoints

// Get account details
apiRouter.get('/account', async (req, res) => {
  try {
    // In a real implementation, we would retrieve the account from the database
    // For demo purposes, we'll return the mock account
    
    // Get account based on user's accountId
    const accountId = req.user?.accountId || 1;
    const account = await storage.getAccount(accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    res.json({
      id: account.id,
      name: account.name,
      credits: account.credits,
      subscriptionPlan: account.subscriptionPlan,
      subscriptionStatus: account.subscriptionStatus,
      subscriptionRenewal: account.subscriptionRenewal
    });
  } catch (error) {
    console.error('Error getting account details:', error);
    res.status(500).json({ error: 'Failed to get account details' });
  }
});

// Get user details
apiRouter.get('/user', async (req, res) => {
  try {
    // Get user based on API key
    const userId = req.user?.id || 1;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      id: user.id,
      accountId: user.accountId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      jobTitle: user.jobTitle
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

// Get account users
apiRouter.get('/account/users', async (req, res) => {
  try {
    // Get users based on account ID
    const accountId = req.user?.accountId || 1;
    const users = await storage.getUsersByAccountId(accountId);
    
    res.json({
      totalCount: users.length,
      results: users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        lastActive: user.updatedAt.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error getting account users:', error);
    res.status(500).json({ error: 'Failed to get account users' });
  }
});

// Purchase credits
apiRouter.post('/account/credits/purchase', async (req, res) => {
  try {
    // Validate request body
    const { credits, paymentMethod, paymentToken } = req.body;
    
    if (!credits || typeof credits !== 'number' || credits <= 0) {
      return res.status(400).json({ error: 'Invalid credit amount' });
    }
    
    if (!paymentMethod || !['card', 'invoice'].includes(paymentMethod)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }
    
    if (paymentMethod === 'card' && !paymentToken) {
      return res.status(400).json({ error: 'Payment token is required for card payments' });
    }
    
    // Process payment (in a real implementation)
    // For demo purposes, we'll just add the credits to the account
    
    const accountId = req.user?.accountId || 1;
    const account = await storage.getAccount(accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Update account credits
    const updatedAccount = await storage.updateAccountCredits(accountId, account.credits + credits);
    
    res.json({
      transactionId: `txn_${Date.now()}`,
      creditsAdded: credits,
      totalCredits: updatedAccount.credits,
      receipt: `https://example.com/receipts/txn_${Date.now()}`
    });
  } catch (error) {
    console.error('Error purchasing credits:', error);
    res.status(500).json({ error: 'Failed to purchase credits' });
  }
});

// Get credit usage history
apiRouter.get('/account/credits/history', (req, res) => {
  try {
    // Parse query parameters
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : undefined;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : undefined;
    const type = req.query.type as string | undefined;
    const limit = parseInt(req.query.limit as string || '50');
    const offset = parseInt(req.query.offset as string || '0');
    
    // In a real implementation, we would retrieve credit history from the database
    // For demo purposes, we'll return mock data
    
    const history = [
      {
        id: 'hist_123',
        type: 'usage',
        amount: -5000,
        description: 'Translation request #12345',
        requestId: 12345,
        timestamp: '2023-05-19T10:15:00Z'
      },
      {
        id: 'hist_122',
        type: 'purchase',
        amount: 10000,
        description: 'Credit purchase',
        transactionId: 'txn_123456',
        timestamp: '2023-05-15T14:30:00Z'
      },
      {
        id: 'hist_121',
        type: 'usage',
        amount: -3000,
        description: 'Translation request #12344',
        requestId: 12344,
        timestamp: '2023-05-10T09:45:00Z'
      }
    ];
    
    // Apply filters
    let filteredHistory = history;
    
    if (type) {
      filteredHistory = filteredHistory.filter(item => item.type === type);
    }
    
    if (dateFrom) {
      filteredHistory = filteredHistory.filter(item => new Date(item.timestamp) >= dateFrom);
    }
    
    if (dateTo) {
      filteredHistory = filteredHistory.filter(item => new Date(item.timestamp) <= dateTo);
    }
    
    // Apply pagination
    const paginatedHistory = filteredHistory.slice(offset, offset + limit);
    
    res.json({
      totalCount: filteredHistory.length,
      results: paginatedHistory
    });
  } catch (error) {
    console.error('Error getting credit history:', error);
    res.status(500).json({ error: 'Failed to get credit history' });
  }
});

// Export typed request interface for use in other files
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        accountId: number;
      };
    }
  }
}

export default apiRouter;