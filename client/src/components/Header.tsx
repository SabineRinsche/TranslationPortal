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
import { LayoutDashboard, User, HelpCircle, LogIn, FileCode, Palette, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
// Temporarily comment out problematic components
// import { NotificationsDropdown } from "@/components/NotificationsDropdown";
// import { HelpButton } from "@/components/HelpButton";
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
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>
              
              {/* Admin-only navigation items */}
              {user && user.role === 'admin' && (
                <>
                  <Link href="/user-management">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Users className="h-4 w-4" />
                      <span className="hidden md:inline">Users</span>
                    </Button>
                  </Link>
                  <Link href="/api-docs">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <FileCode className="h-4 w-4" />
                      <span className="hidden md:inline">API Docs</span>
                    </Button>
                  </Link>
                  <Link href="/style-guide">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Palette className="h-4 w-4" />
                      <span className="hidden md:inline">Style Guide</span>
                    </Button>
                  </Link>
                </>
              )}
              
              <ThemeToggle />
              
              {/* Temporarily disabled components causing issues */}

              <div className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 text-sm focus:outline-none user-menu-button">
                      <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                        {user && user.profileImageUrl ? (
                          <AvatarImage 
                            src={user.profileImageUrl} 
                            alt={`${user.firstName} ${user.lastName}`} 
                          />
                        ) : (
                          <AvatarFallback>
                            {user ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}` : "JD"}
                          </AvatarFallback>
                        )}
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
              
              <Link href="/login">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
