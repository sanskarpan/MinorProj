import { useState } from 'react';
import { Link } from 'react-router-dom';  
import useAuthStore from '@/store/authStore'; // Use alias
import { Button } from "@/components/ui/button"; // ShadCN Button
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // ShadCN Dropdown
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // ShadCN Avatar
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; // For mobile sidebar trigger if needed elsewhere
import { Menu, Moon, Sun, User, Settings, LogOut, LayoutDashboard } from "lucide-react"; // Icons
import { useTheme } from "@/components/ThemeProvider"; // Theme hook

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       {/* Mobile Menu Button */}
       <Button
          variant="outline"
          size="icon"
          className="lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

      {/* Optional: Add Breadcrumbs or Search later */}
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Search Bar Placeholder */}
      </div>

       {/* Theme Toggle */}
       <Button variant="outline" size="icon" onClick={toggleTheme}>
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {/* User Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
            <Avatar className="h-8 w-8">
              {/* Add AvatarImage if user has profile picture URL */}
              {/* <AvatarImage src={user?.avatarUrl} alt={user?.name} /> */}
              <AvatarFallback>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{user?.name || 'My Account'}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
             {/* Update these paths if you create Profile/Settings pages */}
            <Link to="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem disabled> {/* Placeholder */}
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
           </DropdownMenuItem>
          <DropdownMenuItem disabled> {/* Placeholder */}
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Navbar;