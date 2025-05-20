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
import { LayoutDashboard, User, HelpCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { HelpButton } from "@/components/HelpButton";

const Header = () => {
  
  // Define UserData type to match API response
  interface UserData {
    id: number;
    accountId: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    profileImageUrl: string | null;
  }
  
  // Fetch user data for avatar
  const { data: userData } = useQuery<UserData>({
    queryKey: ['/api/user/profile'],
  });

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
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden md:inline">Dashboard</span>
            </Button>
          </Link>
          
          <ThemeToggle />
          
          <HelpButton />

          <NotificationsDropdown />

          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 text-sm focus:outline-none user-menu-button">
                  <Avatar className="h-8 w-8 bg-primary text-primary-foreground">
                    {userData && userData.profileImageUrl ? (
                      <AvatarImage 
                        src={userData.profileImageUrl} 
                        alt={`${userData.firstName} ${userData.lastName}`} 
                      />
                    ) : (
                      <AvatarFallback>
                        {userData ? `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}` : "JD"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span className="font-medium text-foreground hidden md:inline-block">
                    {userData ? `${userData.firstName} ${userData.lastName}` : "John Doe"}
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
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <Link href="/dashboard?tab=usage">
                  <DropdownMenuItem>
                    Credit Usage
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
