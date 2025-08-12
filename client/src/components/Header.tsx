import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { LayoutDashboard, User, HelpCircle, LogIn, FileCode, Palette, Users, Zap, BookOpen, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  
  // Function to handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <img 
              src="/images/alpha_logo.png" 
              alt="Alpha Logo" 
              className="h-12 w-auto"
            />
          </div>
        </Link>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/workspace">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="hidden md:inline">Workspace</span>
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>
              
              <Link href="/user-guide">
                <Button variant="ghost" size="sm" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden md:inline">User Guide</span>
                </Button>
              </Link>
              
              {/* Admin-only navigation items */}
              {user && user.role === 'admin' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Shield className="h-4 w-4" />
                      <span className="hidden md:inline">Admin</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>Administration</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/teams">
                      <DropdownMenuItem>
                        <Users className="h-4 w-4 mr-2" />
                        Teams
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/api-docs">
                      <DropdownMenuItem>
                        <FileCode className="h-4 w-4 mr-2" />
                        API Docs
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/style-guide">
                      <DropdownMenuItem>
                        <Palette className="h-4 w-4 mr-2" />
                        Style Guide
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/admin-guide">
                      <DropdownMenuItem>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Admin Guide
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              <ThemeToggle />
              
              {/* Notifications */}
              <NotificationsDropdown />

              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 text-sm focus:outline-none user-menu-button">
                      <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        <AvatarFallback>
                          {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : "JD"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground hidden md:inline-block">
                        {user ? `${user.firstName} ${user.lastName}` : "User"}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem>
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/settings">
                      <DropdownMenuItem>
                        Settings
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/user-guide">
                      <DropdownMenuItem>
                        <BookOpen className="h-4 w-4 mr-2" />
                        User Guide
                      </DropdownMenuItem>
                    </Link>
                    {user && user.role === 'admin' && (
                      <Link href="/admin-guide">
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Guide
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <Link href="/dashboard?tab=usage">
                      <DropdownMenuItem>
                        Credit Usage
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <>
              <ThemeToggle />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
