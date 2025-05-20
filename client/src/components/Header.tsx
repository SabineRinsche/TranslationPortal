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
import { HelpCircle, Bell, LayoutDashboard, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [notificationsCount, setNotificationsCount] = useState(0);
  
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
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-primary">
                  <HelpCircle className="h-6 w-6" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Help & FAQ</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-primary relative">
                  <Bell className="h-6 w-6" />
                  {notificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {notificationsCount}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 text-sm focus:outline-none">
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
