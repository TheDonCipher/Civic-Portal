import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { NotificationBell } from '@/components/notifications/NotificationBell';
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
  Play,
  Plus,
} from 'lucide-react';
import AuthDialog from '../auth/AuthDialog';

interface HeaderProps {
  onCreateIssue?: () => void;
  onSearch?: (term: string) => void;
}

const Header = ({ onCreateIssue, onSearch }: HeaderProps) => {
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
        title: 'Signed out successfully',
        description: 'You have been signed out of your account.',
        variant: 'default',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const isDemoMode =
    location.search.includes('demo=true') ||
    location.pathname.startsWith('/demo');

  const getNavLinks = () => {
    if (user && !isDemoMode) {
      return [
        { href: '/', label: 'Home', icon: Home },
        { href: `/user/${user.id}`, label: 'Dashboard', icon: User },
        { href: `/user/${user.id}/issues`, label: 'Issues', icon: FileText },
        { href: '/reports', label: 'Reports', icon: BarChart3 },
      ];
    } else {
      return [
        { href: '/', label: 'Home', icon: Home },
        {
          href: isDemoMode ? '/demo/issues' : '/issues',
          label: 'Issues',
          icon: FileText,
        },
        {
          href: isDemoMode ? '/demo/reports' : '/reports',
          label: 'Reports',
          icon: BarChart3,
        },
        { href: '/about', label: 'About', icon: Users },
        { href: '/faq', label: 'FAQ', icon: FileText },
      ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
          isDemoMode
            ? 'bg-gradient-to-r from-blue-50/95 to-purple-50/95 border-blue-200 dark:from-blue-950/95 dark:to-purple-950/95 dark:border-blue-800'
            : 'bg-background/95'
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between mobile-padding">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                CP
              </span>
            </div>
            <span className="font-bold text-responsive-lg hidden xs:block">
              Civic Portal
            </span>
            <span className="font-bold text-lg xs:hidden">CP</span>
            {isDemoMode && (
              <Badge
                variant="secondary"
                className="ml-2 hidden sm:inline-flex bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-300 dark:from-blue-900 dark:to-purple-900 dark:text-blue-200 dark:border-blue-700 animate-pulse"
              >
                🚀 Demo Mode
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
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Demo Mode Button - Start Demo Experience */}
            {!user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/demo')}
                className="hidden lg:flex touch-target bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 text-blue-700 hover:text-blue-800"
              >
                <Play className="h-4 w-4 mr-2" />
                Try Demo
              </Button>
            )}

            {/* Theme Toggle */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Demo Mode Toggle for authenticated users */}
            {user && (
              <Button
                variant={isDemoMode ? 'ghost' : 'outline'}
                size="sm"
                onClick={() =>
                  navigate(isDemoMode ? `/user/${user.id}` : '/demo')
                }
                className={`hidden lg:flex touch-target ${
                  !isDemoMode
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 text-blue-700 hover:text-blue-800'
                    : ''
                }`}
              >
                {isDemoMode ? (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    My Dashboard
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Try Demo
                  </>
                )}
              </Button>
            )}

            {/* Notification Bell for authenticated users */}
            {user && <NotificationBell />}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full touch-target"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          profile?.avatar_url ||
                          'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
                        }
                        alt={profile?.full_name || ''}
                      />
                      <AvatarFallback>
                        {profile?.full_name?.charAt(0) ||
                          user.email?.charAt(0) ||
                          'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-64 sm:w-56"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      <Badge variant="secondary" className="w-fit mt-1">
                        {profile?.role === 'citizen'
                          ? 'Citizen'
                          : profile?.role === 'official'
                          ? 'Official'
                          : 'Admin'}
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
                  <DropdownMenuItem onClick={() => onCreateIssue?.()}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>Report Issue</span>
                  </DropdownMenuItem>
                  {profile?.role === 'official' || profile?.role === 'admin' ? (
                    <DropdownMenuItem onClick={() => navigate('/stakeholder')}>
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
              <Button
                onClick={() => setIsAuthDialogOpen(true)}
                className="touch-target"
                size="sm"
              >
                Sign In
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden touch-target"
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
          <div
            className={`md:hidden border-t shadow-lg ${
              isDemoMode
                ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 dark:from-blue-950 dark:to-purple-950 dark:border-blue-800'
                : 'bg-background'
            }`}
          >
            <nav className="container mx-auto mobile-padding py-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors touch-target ${
                      location.pathname === link.href
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Demo Mode Indicator for Mobile */}
              {isDemoMode && (
                <div className="border-t pt-3 mt-3">
                  <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border border-blue-300 rounded-lg dark:from-blue-900 dark:to-purple-900 dark:text-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-lg">🚀</span>
                      <span className="font-medium">Demo Mode Active</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Demo Button */}
              <div className="border-t pt-3 mt-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start touch-target px-4 py-3 text-base"
                  onClick={() => {
                    navigate(isDemoMode && user ? `/user/${user.id}` : '/demo');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {isDemoMode && user ? (
                    <>
                      <Globe className="h-5 w-5 mr-3" />
                      My Dashboard
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-3" />
                      Try Demo
                    </>
                  )}
                </Button>
              </div>

              {/* Theme Toggle for Mobile */}
              <div className="border-t pt-3 mt-3 flex items-center justify-between px-4">
                <span className="text-sm font-medium text-muted-foreground">
                  Theme
                </span>
                <ThemeToggle />
              </div>
            </nav>
          </div>
        )}
      </header>

      <AuthDialog
        open={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        enhanced={true}
      />
    </>
  );
};

export default Header;
