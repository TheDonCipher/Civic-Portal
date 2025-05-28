import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ConsentStatusIndicator } from '@/components/auth/ConsentStatusBanner';
import {
  QuickSubscriptionInfo,
  useSubscriptionStatus,
} from '@/components/subscription/SubscriptionStatusIndicator';
import {
  getUserDisplayName,
  getUserAvatarUrl,
  getUserInitials,
  getUserRoleDisplay,
  getUserEmail,
} from '@/lib/utils/userUtils';
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
  CreditCard,
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
  const { t } = useTranslation('ui');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check if we're in demo mode
  const isDemoMode =
    location.search.includes('demo=true') ||
    location.pathname.startsWith('/demo');

  // Get subscription status
  const { tier, status } = useSubscriptionStatus(profile?.role, isDemoMode);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: t('auth.signedOutSuccessfully'),
        description: t('auth.signedOutDescription'),
        variant: 'default',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: t('auth.signInError'),
        description: t('auth.signInErrorDescription'),
        variant: 'destructive',
      });
    }
  };

  const getNavLinks = () => {
    if (user && !isDemoMode) {
      return [
        { href: '/', label: t('nav.home'), icon: Home },
        { href: `/user/${user.id}`, label: t('nav.dashboard'), icon: User },
        {
          href: `/user/${user.id}/issues`,
          label: t('nav.issues'),
          icon: FileText,
        },
        { href: '/reports', label: t('nav.reports'), icon: BarChart3 },
      ];
    } else {
      return [
        { href: '/', label: t('nav.home'), icon: Home },
        {
          href: isDemoMode ? '/demo/issues' : '/issues',
          label: t('nav.issues'),
          icon: FileText,
        },
        {
          href: isDemoMode ? '/demo/reports' : '/reports',
          label: t('nav.reports'),
          icon: BarChart3,
        },
        { href: '/about', label: t('nav.about'), icon: Users },
        { href: '/faq', label: t('nav.faq'), icon: FileText },
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

            {/* Language Switcher */}
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>

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
                    {t('buttons.myDashboard')}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {t('buttons.tryDemo')}
                  </>
                )}
              </Button>
            )}

            {/* Subscription Status for authenticated users */}
            {user && (
              <QuickSubscriptionInfo
                tier={tier}
                status={status}
                compact={true}
                onClick={() => navigate('/subscription')}
              />
            )}

            {/* Notification Bell for authenticated users */}
            {user && <NotificationBell />}

            {/* Consent Status Indicator for authenticated users */}
            {user && <ConsentStatusIndicator />}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full touch-target"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getUserAvatarUrl(profile, user)}
                        alt={getUserDisplayName(profile, user)}
                      />
                      <AvatarFallback>
                        {getUserInitials(profile, user)}
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
                        {getUserDisplayName(profile, user)}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {getUserEmail(user)}
                      </p>
                      <Badge variant="secondary" className="w-fit mt-1">
                        {getUserRoleDisplay(profile)}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => navigate(`/user/${user.id}`)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('nav.dashboard')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate(`/user/${user.id}/profile`)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('profile.settings')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/subscription')}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Subscription</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCreateIssue?.()}>
                    <Plus className="mr-2 h-4 w-4" />
                    <span>{t('buttons.createIssue')}</span>
                  </DropdownMenuItem>
                  {profile?.role === 'official' || profile?.role === 'admin' ? (
                    <DropdownMenuItem onClick={() => navigate('/stakeholder')}>
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>{t('profile.stakeholderDashboard')}</span>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('auth.signOut')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={() => setIsAuthDialogOpen(true)}
                className="touch-target"
                size="sm"
              >
                {t('auth.signIn')}
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
                      {t('buttons.myDashboard')}
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-3" />
                      {t('buttons.tryDemo')}
                    </>
                  )}
                </Button>
              </div>

              {/* Language Switcher for Mobile */}
              <div className="border-t pt-3 mt-3 flex items-center justify-between px-4">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('language.english')} / {t('language.setswana')}
                </span>
                <LanguageSwitcher size="sm" />
              </div>

              {/* Theme Toggle for Mobile */}
              <div className="border-t pt-3 mt-3 flex items-center justify-between px-4">
                <span className="text-sm font-medium text-muted-foreground">
                  {t('theme.toggleTheme')}
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
