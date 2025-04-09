import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getAppInfo } from "@/lib/utils/info";

interface HeaderProps {
  onCreateIssue?: () => void;
  onSearch?: (term: string) => void;
}

const Header = ({
  onCreateIssue = () => {},
  onSearch = () => {},
}: HeaderProps) => {
  const { user, profile } = useAuth ? useAuth() : { user: null, profile: null };
  const { toast } = useToast();
  const isDev = process.env.NODE_ENV === "development";
  const info = getAppInfo ? getAppInfo() : { name: "Issue Tracker" };

  return (
    <header className="fixed top-10 left-0 right-0 h-[72px] bg-background border-b border-border z-50">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between max-w-[1800px] mx-auto">
        <div className="flex items-center gap-8">
          <Button
            variant="link"
            className="text-xl font-bold p-0"
            onClick={() => (window.location.href = "/")}
          >
            {info.name}
          </Button>
          <nav className="hidden md:flex items-center gap-6">
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/issues")}
            >
              Issues
            </Button>
            <Button
              variant="ghost"
              onClick={() => (window.location.href = "/reports")}
            >
              Reports
            </Button>
          </nav>
          <div className="relative w-full sm:w-[300px] md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search issues..."
              className="pl-10"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <Button onClick={onCreateIssue} className="hidden sm:flex">
                <Plus className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
              <Button onClick={onCreateIssue} size="icon" className="sm:hidden">
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar>
                  {user ? (
                    <>
                      <AvatarImage
                        src={
                          profile?.avatar_url ||
                          "https://api.dicebear.com/7.x/avataaars/svg?seed=john"
                        }
                      />
                      <AvatarFallback>
                        {profile?.full_name?.[0] || "U"}
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=guest" />
                      <AvatarFallback>G</AvatarFallback>
                    </>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {user ? (
                <>
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/profile")}
                  >
                    My Profile
                  </DropdownMenuItem>
                  {profile?.role === "official" && (
                    <DropdownMenuItem
                      onClick={() => (window.location.href = "/stakeholder")}
                    >
                      Department Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      await supabase.auth.signOut();
                      toast({
                        title: "Signed Out",
                        description: "You have been successfully signed out.",
                      });
                    }}
                  >
                    Sign Out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/?signin=true")}
                  >
                    Sign In
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/profile")}
                  >
                    Citizen Profile (Demo)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => (window.location.href = "/stakeholder")}
                  >
                    Department Dashboard (Demo)
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
