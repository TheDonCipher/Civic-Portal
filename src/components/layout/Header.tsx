import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  LogOut,
  Settings,
  FileText,
  BarChart3,
  Home,
  Menu,
  X,
  Globe,
  Users,
} from "lucide-react";
import AuthDialog from "../auth/AuthDialog";

const Header = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
        variant: "default",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isDemoMode =
    location.search.includes("demo=true") ||
    location.pathname.startsWith("/demo");
  const isUserRoute = location.pathname.startsWith("/user/");

  const getNavLinks = () => {
    if (user && !isDemoMode) {
      return [
        { href: `/user/${user.id}`, label: "Dashboard", icon: Home },
        { href: `/user/${user.id}/issues`, label: "Issues", icon: FileText },
        { href: `/user/${user.id}/reports`, label: "Reports", icon: BarChart3 },
      ];
    } else {
      return [
        { href: "/", label: "Home", icon: Home },
        {
          href: isDemoMode ? "/demo/issues" : "/issues",
          label: "Issues",
          icon: FileText,
        },
        {
          href: isDemoMode ? "/demo/reports" : "/reports",
          label: "Reports",
          icon: BarChart3,
        },
        { href: "/about", label: "About", icon: Users },
        { href: "/faq", label: "FAQ", icon: FileText },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link
            to={user && !isDemoMode ? `/user/${user.id}` : "/"}
            className="flex items-center space-x-2"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                CP
              </span>
            </div>
            <span className="font-bold text-xl">Civic Portal</span>
            {isDemoMode && (
              <Badge variant="secondary" className="ml-2">
                Demo
              </Badge>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-primary ${
                    location.pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4">
            {/* Demo Mode Toggle */}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate(isDemoMode ? `/user/${user.id}` : "/?demo=true")
                }
                className="hidden sm:flex"
              >
                <Globe className="h-4 w-4 mr-2" />
                {isDemoMode ? "My Dashboard" : "Demo Mode"}
              </Button>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          profile?.avatar_url ||
                          "https://api.dicebear.com/7.x/avataaars/svg?seed=john"
                        }
                        alt={profile?.full_name || ""}
                      />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0) ||
                          user.email?.charAt(0) ||
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <Badge variant="secondary" className="w-fit mt-1">
                        {profile?.role === "citizen"
                          ? "Citizen"
                          : profile?.role === "official"
                            ? "Official"
                            : "Admin"}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate(`/user/${user.id}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate(`/user/${user.id}/profile`)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  {profile?.role === "official" || profile?.role === "admin" ? (
                    <DropdownMenuItem onClick={() => navigate("/stakeholder")}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Stakeholder Dashboard</span>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setIsAuthDialogOpen(true)}>Sign In</Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent ${
                      location.pathname === link.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              {user && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(isDemoMode ? `/user/${user.id}` : "/?demo=true");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  {isDemoMode ? "My Dashboard" : "Demo Mode"}
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
    </>
  );
};

export default Header;
