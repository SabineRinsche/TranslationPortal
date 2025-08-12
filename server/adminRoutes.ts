import { Router } from 'express';
import { requireAdmin } from './auth';
import { storage } from './storage';
import { hashPassword } from './auth';
import { z } from 'zod';

const router = Router();

// Get all teams in the account
router.get('/teams', requireAdmin, async (req, res) => {
  try {
    const teams = await storage.getAllTeams();
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
});

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

// Get users by team ID
router.get('/teams/:teamId/users', requireAdmin, async (req, res) => {
  try {
    const currentUser = req.user!;
    const teamId = parseInt(req.params.teamId);
    
    // Verify team exists
    const team = await storage.getTeam(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const users = await storage.getUsersByTeamId(teamId);
    res.json(users);
  } catch (error) {
    console.error('Error fetching team users:', error);
    res.status(500).json({ message: 'Failed to fetch team users' });
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
// Create a new team
const createTeamSchema = z.object({
  name: z.string().min(1, 'Team name is required'),
  description: z.string().optional(),
  billingEmail: z.string().email('Invalid email address').optional().nullable().or(z.literal("")),
});

router.post('/teams', requireAdmin, async (req, res) => {
  try {
    const currentUser = req.user!;
    const validatedData = createTeamSchema.parse(req.body);
    
    const teamData = {
      ...validatedData,
      billingEmail: validatedData.billingEmail || null,
    };
    
    console.log('Creating team with data:', teamData);
    const newTeam = await storage.createTeam(teamData);
    
    res.status(201).json(newTeam);
  } catch (error: any) {
    console.error('Error creating team:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to create team' });
  }
});

// Update a team
const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  billingEmail: z.string().email('Invalid email address').optional().nullable().or(z.literal("")),
});

router.patch('/teams/:teamId', requireAdmin, async (req, res) => {
  try {
    const currentUser = req.user!;
    const teamId = parseInt(req.params.teamId);
    const validatedData = updateTeamSchema.parse(req.body);
    
    // Check if the team exists
    const existingTeam = await storage.getTeam(teamId);
    if (!existingTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const updatedTeam = await storage.updateTeam(teamId, validatedData);
    res.json(updatedTeam);
  } catch (error: any) {
    console.error('Error updating team:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to update team' });
  }
});

// Delete a team
router.delete('/teams/:teamId', requireAdmin, async (req, res) => {
  try {
    const currentUser = req.user!;
    const teamId = parseInt(req.params.teamId);
    
    // Check if the team exists
    const existingTeam = await storage.getTeam(teamId);
    if (!existingTeam) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if team has users before deleting
    const teamUsers = await storage.getUsersByTeamId(teamId);
    if (teamUsers.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete team with users. Please reassign or remove users first.' 
      });
    }
    
    await storage.deleteTeam(teamId);
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Failed to delete team' });
  }
});

// Get individual team by ID
router.get('/teams/:teamId', requireAdmin, async (req, res) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const team = await storage.getTeam(teamId);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Failed to fetch team' });
  }
});

// Add credits to team
const addTeamCreditsSchema = z.object({
  amount: z.number().int().positive('Amount must be a positive integer'),
  description: z.string().optional(),
});

router.post('/teams/:teamId/credits', requireAdmin, async (req, res) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const { amount, description } = addTeamCreditsSchema.parse(req.body);
    
    // Get team to verify it exists
    const team = await storage.getTeam(teamId);
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Add credits to the team
    await storage.addCreditsToTeam(teamId, amount);
    
    // Record the credit transaction
    await storage.createCreditTransaction({
      accountId: team.id, // Using team ID as account ID for team-based structure
      userId: req.user!.id,
      amount,
      type: 'admin_adjustment',
      description: description || `Credits added to team: ${team.name}`,
    });
    
    res.json({ message: 'Credits added successfully', amount });
    
  } catch (error: any) {
    console.error('Error adding credits to team:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors[0].message });
    }
    res.status(500).json({ message: 'Failed to add credits' });
  }
});

const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'client']),
  teamId: z.number().int().positive().optional(),
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
    
    // Get current user to check role (we need to fetch full user data)
    const fullCurrentUser = await storage.getUser(currentUser.id);
    if (!fullCurrentUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Prevent admin from changing their own role
    if (userId === currentUser.id && validatedData.role && validatedData.role !== fullCurrentUser.role) {
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