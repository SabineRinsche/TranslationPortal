import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Define user interface
interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  profileImageUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing without backend authentication
const DEMO_USERS = {
  admin: {
    id: 1,
    username: "admin",
    firstName: "Admin",
    lastName: "User",
    email: "admin@example.com",
    role: "admin",
    profileImageUrl: null
  },
  client: {
    id: 2,
    username: "client",
    firstName: "Client",
    lastName: "User",
    email: "client@example.com",
    role: "client",
    profileImageUrl: null
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if user is already in local storage on initialization
  const storedUser = localStorage.getItem('currentUser');
  const [user, setUser] = useState<User | null>(storedUser ? JSON.parse(storedUser) : null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Simple login function that uses demo users
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // For demo, just check against our hardcoded users
      if (username === "admin" && password === "admin123") {
        setUser(DEMO_USERS.admin);
        localStorage.setItem('currentUser', JSON.stringify(DEMO_USERS.admin));
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Admin!',
        });
        return true;
      } else if (username === "client" && password === "client123") {
        setUser(DEMO_USERS.client);
        localStorage.setItem('currentUser', JSON.stringify(DEMO_USERS.client));
        toast({
          title: 'Login Successful',
          description: 'Welcome back, Client!',
        });
        return true;
      } else {
        toast({
          title: 'Login Failed',
          description: 'Invalid username or password',
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Simple logout function
  const logout = async (): Promise<void> => {
    setUser(null);
    localStorage.removeItem('currentUser');
    toast({
      title: 'Logout Successful',
      description: 'You have been logged out.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};