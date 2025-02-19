import React from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useLocation, Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "../ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Bell, Menu, Plus, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  user?: {
    name: string;
    avatar: string;
  };
  onCreateIssue?: () => void;
  onSearch?: (term: string) => void;
  notifications?: number;
}

const Header = ({
  user = {
    name: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  },
  onCreateIssue = () => {},
  onSearch = () => {},
  notifications = 3,
}: HeaderProps) => {
  const location = useLocation();

  const isCurrentPath = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const NavLinks = () => (
    <div className="flex md:flex-row flex-col space-y-2 md:space-y-0 md:space-x-4">
      <Link
        to="/"
        className={cn(
          "text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors",
          isCurrentPath("/") && "bg-gray-100 text-gray-900",
        )}
      >
        Dashboard
      </Link>
      <Link
        to="/issues"
        className={cn(
          "text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors",
          isCurrentPath("/issues") && "bg-gray-100 text-gray-900",
        )}
      >
        Issues
      </Link>
      <Link
        to="/reports"
        className={cn(
          "text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md transition-colors",
          isCurrentPath("/reports") && "bg-gray-100 text-gray-900",
        )}
      >
        Reports
      </Link>
    </div>
  );

  return (
    <header className="w-full h-[72px] bg-background border-b border-border px-2 sm:px-4 md:px-6 flex items-center justify-between fixed top-0 z-50">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-foreground">Civic Portal</h1>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <NavLinks />
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col space-y-4 mt-6">
              <NavLinks />
              {!isCurrentPath("/reports") && (
                <Button onClick={onCreateIssue} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Issue
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center space-x-4">
        {!isCurrentPath("/reports") && (
          <Button onClick={onCreateIssue} className="hidden md:flex">
            <Plus className="h-4 w-4 mr-2" />
            Create Issue
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="relative dark:text-gray-400 dark:hover:text-gray-100"
          onClick={() => document.documentElement.classList.toggle("dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {notifications}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
