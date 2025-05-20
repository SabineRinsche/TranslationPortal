import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Add a basic user database (in a real app, this would use the storage system)
export const users = [
  {
    id: 1,
    accountId: 1,
    firstName: "John",
    lastName: "Doe",
    email: "admin@example.com",
    username: "admin",
    password: "admin123",
    role: "admin",
    jobTitle: "Localization Manager",
    phoneNumber: "+44 1234 567890",
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    accountId: 1,
    firstName: "Jane",
    lastName: "Smith",
    email: "client@example.com",
    username: "client",
    password: "client123",
    role: "client",
    jobTitle: "Project Manager",
    phoneNumber: "+44 9876 543210",
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Authentication middleware
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip auth for the login route and public assets
  if (req.path === '/api/login' || !req.path.startsWith('/api')) {
    return next();
  }
  
  // Check if user is in session
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Unauthorized. Please log in." });
  }
  
  // Set user in request object
  req.user = req.session.user;
  next();
};

// Role-based authorization middleware
export const roleMiddleware = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden. You don't have permission to access this resource." });
    }
    
    next();
  };
};

// Login handler
export const loginHandler = (req: Request, res: Response) => {
  const { username, password } = req.body;
  
  // Find user by username
  const user = users.find(u => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }
  
  // Store user in session
  req.session.user = user;
  
  // Return user info without password
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
};

// Logout handler
export const logoutHandler = (req: Request, res: Response) => {
  // Clear the session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.json({ message: "Logged out successfully" });
  });
};

// Get current user info
export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  res.json(req.user);
};