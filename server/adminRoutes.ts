import { Router } from 'express';
import { requireAdmin } from './auth';
import { storage } from './storage';
import { hashPassword } from './auth';
import { z } from 'zod';

const router = Router();

// Get all users in the same account
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const currentUser = req.user!;
    const users = await storage.getUsersByAccountId(currentUser.accountId);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Get account information
router.get('/account', requireAdmin, async (req, res) => {
  try {
    const currentUser = req.user!;
    const account = await storage.getAccount(currentUser.accountId);
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    console.error('Error fetching account:', error);
    res.status(500).json({ message: 'Failed to fetch account information' });
  }
});

// Get credit transactions for the account
router.get('/credit-transactions', requireAdmin, async (req, res) => {
  try {
    const currentUser = req.user!;
    const transactions = await storage.getCreditTransactionsByAccountId(currentUser.accountId);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    res.status(500).json({ message: 'Failed to fetch credit transactions' });
  }
});

// Create a new user
const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'client']),
  jobTitle: z.string().optional(),
  phoneNumber: z.string().optional(),
});

router.post('/users', requireAdmin, async (req, res) => {
  try {
    const currentUser = req.user!;
    const validatedData = createUserSchema.parse(req.body);
    
    // Check if email or username already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const existingUsername = await storage.getUserByUsername(validatedData.username);
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Create the user in the same account as the admin
    const newUser = await storage.createUser({
      ...validatedData,
      accountId: currentUser.accountId,
      password: hashedPassword,
      isEmailVerified: true, // Admin-created users are automatically verified
      preferredLanguages: ['French', 'Italian', 'German', 'Spanish'],
    });
    
    // Remove sensitive data before sending response
    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
    
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update a user
const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  username: z.string().min(3).optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['admin', 'client']).optional(),
  jobTitle: z.string().optional(),
  phoneNumber: z.string().optional(),
});

router.patch('/users/:userId', requireAdmin, async (req, res) => {
  try {
    const currentUser = req.user!;
    const userId = parseInt(req.params.userId);
    const validatedData = updateUserSchema.parse(req.body);
    
    // Check if the user exists and belongs to the same account
    const existingUser = await storage.getUser(userId);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (existingUser.accountId !== currentUser.accountId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Prevent admin from changing their own role
    if (userId === currentUser.id && validatedData.role && validatedData.role !== currentUser.role) {
      return res.status(400).json({ message: 'Cannot change your own role' });
    }
    
    // Hash password if provided
    const updateData = { ...validatedData };
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }
    
    const updatedUser = await storage.updateUser(userId, updateData);
    
    // Remove sensitive data before sending response
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
    
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Add credits to account
const addCreditsSchema = z.object({
  amount: z.number().int().positive('Amount must be a positive integer'),
  description: z.string().min(1, 'Description is required'),
});

router.post('/credits', requireAdmin, async (req, res) => {
  try {
    const currentUser = req.user!;
    const { amount, description } = addCreditsSchema.parse(req.body);
    
    // Add credits to the account
    await storage.addCreditsToAccount(currentUser.accountId, amount);
    
    // Record the credit transaction
    await storage.createCreditTransaction({
      accountId: currentUser.accountId,
      userId: currentUser.id,
      amount,
      type: 'admin_adjustment',
      description,
    });
    
    res.json({ message: 'Credits added successfully', amount });
    
  } catch (error: any) {
    console.error('Error adding credits:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to add credits' });
  }
});

export default router;