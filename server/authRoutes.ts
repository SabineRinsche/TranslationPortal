import type { Express } from 'express';
import { 
  registerSchema, 
  loginSchema, 
  passwordResetRequestSchema,
  passwordResetSchema,
  twoFactorSetupSchema,
  type User 
} from '@shared/schema';
import { storage } from './storage';
import { 
  hashPassword, 
  verifyPassword, 
  generateEmailVerificationToken,
  generatePasswordResetToken,
  generateTwoFactorSecret,
  generateQRCode,
  verifyTwoFactorToken,
  sendEmailVerification,
  sendPasswordReset,
  requireAuth 
} from './auth';
import { ZodError } from 'zod';

export function registerAuthRoutes(app: Express) {
  // Registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(409).json({ message: 'Username already taken' });
      }

      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Generate email verification token
      const emailToken = generateEmailVerificationToken();
      const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create account first
      const account = await storage.createAccount({
        name: validatedData.accountName,
        credits: 5000, // Free tier credits
      });

      // Create user
      const user = await storage.createUser({
        accountId: account.id,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        username: validatedData.username,
        password: hashedPassword,
        role: 'user',
        jobTitle: validatedData.jobTitle || null,
        phoneNumber: validatedData.phoneNumber || null,
        emailVerificationToken: emailToken,
        emailVerificationExpires: tokenExpiry,
      });

      // Send verification email
      await sendEmailVerification(validatedData.email, emailToken);

      res.status(201).json({ 
        message: 'Registration successful. Please check your email to verify your account.',
        userId: user.id
      });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Login endpoint
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, twoFactorCode } = loginSchema.parse(req.body);
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(401).json({ 
          message: 'Email not verified. Please check your email and verify your account.' 
        });
      }

      // Check 2FA if enabled
      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          return res.status(200).json({ 
            requiresTwoFactor: true,
            message: 'Two-factor authentication required' 
          });
        }

        if (!user.twoFactorSecret || !verifyTwoFactorToken(twoFactorCode, user.twoFactorSecret)) {
          return res.status(401).json({ message: 'Invalid two-factor code' });
        }
      }

      // Update last login
      await storage.updateUserLastLogin(user.id);

      // Set session
      req.session.userId = user.id;

      // Return user data without sensitive fields
      const { password: _, twoFactorSecret: __, emailVerificationToken: ___, passwordResetToken: ____, ...safeUser } = user;
      
      res.json({ 
        message: 'Login successful',
        user: safeUser 
      });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  });

  // Get current user endpoint
  app.get('/api/auth/user', requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      const { password: _, twoFactorSecret: __, emailVerificationToken: ___, passwordResetToken: ____, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Failed to get user data' });
    }
  });

  // Email verification endpoint
  app.get('/api/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Invalid verification token' });
      }

      const user = await storage.getUserByEmailVerificationToken(token);
      if (!user) {
        return res.status(404).json({ message: 'Invalid or expired verification token' });
      }

      // Check if token is expired
      if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
        return res.status(400).json({ message: 'Verification token has expired' });
      }

      // Verify email
      await storage.updateUserEmailVerification(user.id, true);

      res.json({ message: 'Email verified successfully' });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ message: 'Email verification failed' });
    }
  });

  // Password reset request endpoint
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = passwordResetRequestSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ message: 'If an account with that email exists, a password reset email has been sent.' });
      }

      // Generate reset token
      const resetToken = generatePasswordResetToken();
      const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Update user with reset token
      await storage.updateUser(user.id, {
        passwordResetToken: resetToken,
        passwordResetExpires: tokenExpiry,
      });

      // Send reset email
      await sendPasswordReset(email, resetToken);

      res.json({ message: 'If an account with that email exists, a password reset email has been sent.' });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Password reset request error:', error);
      res.status(500).json({ message: 'Password reset request failed' });
    }
  });

  // Password reset endpoint
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = passwordResetSchema.parse(req.body);
      
      const user = await storage.getUserByPasswordResetToken(token);
      if (!user) {
        return res.status(404).json({ message: 'Invalid or expired reset token' });
      }

      // Check if token is expired
      if (user.passwordResetExpires && user.passwordResetExpires < new Date()) {
        return res.status(400).json({ message: 'Reset token has expired' });
      }

      // Hash new password and update user
      const hashedPassword = await hashPassword(password);
      await storage.updateUserPassword(user.id, hashedPassword);

      res.json({ message: 'Password reset successful' });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('Password reset error:', error);
      res.status(500).json({ message: 'Password reset failed' });
    }
  });

  // Two-factor authentication setup
  app.post('/api/auth/2fa/setup', requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      
      if (user.twoFactorEnabled) {
        return res.status(400).json({ message: 'Two-factor authentication is already enabled' });
      }

      // Generate secret
      const secret = generateTwoFactorSecret();
      
      // Generate QR code
      const qrCodeUrl = await generateQRCode(secret, user.email);

      res.json({ 
        secret,
        qrCode: qrCodeUrl,
        message: 'Scan the QR code with your authenticator app and verify with a code to enable 2FA'
      });

    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({ message: 'Failed to setup two-factor authentication' });
    }
  });

  // Two-factor authentication verification
  app.post('/api/auth/2fa/verify', requireAuth, async (req, res) => {
    try {
      const { secret, token } = twoFactorSetupSchema.parse(req.body);
      const user = req.user!;

      // Verify the token
      if (!verifyTwoFactorToken(token, secret)) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }

      // Enable 2FA for the user
      await storage.updateUserTwoFactor(user.id, secret, true);

      res.json({ message: 'Two-factor authentication enabled successfully' });

    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      console.error('2FA verification error:', error);
      res.status(500).json({ message: 'Failed to verify two-factor authentication' });
    }
  });

  // Disable two-factor authentication
  app.post('/api/auth/2fa/disable', requireAuth, async (req, res) => {
    try {
      const user = req.user!;
      
      if (!user.twoFactorEnabled) {
        return res.status(400).json({ message: 'Two-factor authentication is not enabled' });
      }

      // Disable 2FA
      await storage.updateUserTwoFactor(user.id, '', false);

      res.json({ message: 'Two-factor authentication disabled successfully' });

    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({ message: 'Failed to disable two-factor authentication' });
    }
  });
}