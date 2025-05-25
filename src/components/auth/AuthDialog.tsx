import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import '../../styles/botswana-theme.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import ResetPasswordForm from './ResetPasswordForm';
import { EnhancedSignInForm } from './EnhancedSignInForm';
import { EnhancedSignUpForm } from './EnhancedSignUpForm';
import { ForgotPasswordFlow } from './ForgotPasswordFlow';
import { SimpleThemeToggle } from '@/components/ui/ThemeToggle';
import { cn } from '@/lib/utils';

interface AuthDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultTab?: 'sign-in' | 'sign-up';
  enhanced?: boolean; // Use enhanced forms with better UX and security
}

const AuthDialog = ({
  open = false,
  onOpenChange = () => {},
  defaultTab = 'sign-in',
  enhanced = false,
}: AuthDialogProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<
    'sign-in' | 'sign-up' | 'reset-password'
  >(defaultTab);

  // Use enhanced forms if requested
  if (enhanced) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            'auth-dialog-enhanced w-[95vw] max-w-[600px] max-h-[90vh] p-0',
            'bg-gradient-to-br from-blue-50/95 via-white/98 to-slate-50/95',
            'dark:from-gray-900/95 dark:via-gray-800/98 dark:to-blue-900/20',
            'border-2 border-blue-200/60 dark:border-blue-700/60',
            'shadow-2xl dark:shadow-blue-900/30 backdrop-blur-md',
            'transition-all duration-300 ease-out',
            'flex flex-col overflow-hidden'
          )}
        >
          {/* Enhanced Header with Botswana Branding */}
          <div
            className={cn(
              'auth-dialog-header relative overflow-hidden',
              'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800',
              'dark:from-blue-700 dark:via-blue-800 dark:to-blue-900'
            )}
          >
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]" />
            </div>

            <div className="relative z-10 flex items-center justify-between p-6">
              <div className="space-y-2 flex-1">
                <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                  Civic Portal Botswana
                </DialogTitle>
                <p className="text-blue-100/90 text-sm leading-relaxed max-w-md">
                  {activeTab === 'sign-in'
                    ? 'Sign in to report issues and engage with your community'
                    : activeTab === 'sign-up'
                    ? "Join Botswana's digital civic community"
                    : "We'll help you regain access to your account"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <SimpleThemeToggle
                  className={cn(
                    'text-white hover:bg-white/20 transition-colors duration-200',
                    'border border-white/20 hover:border-white/40'
                  )}
                />
                <Badge
                  className={cn(
                    'botswana-badge bg-white/20 text-white border-white/30',
                    'hover:bg-white/30 transition-colors duration-200'
                  )}
                >
                  🇧🇼 Botswana
                </Badge>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div
            className={cn(
              'flex-1 overflow-y-auto',
              'bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm',
              'border-t border-blue-100/50 dark:border-blue-800/50'
            )}
          >
            <div className="p-6 space-y-6 flex flex-col min-h-full">
              {(activeTab === 'sign-in' || activeTab === 'sign-up') && (
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as any)}
                  className="flex flex-col flex-1"
                >
                  <TabsList
                    className={cn(
                      'grid w-full grid-cols-2 h-12 p-1',
                      'bg-gradient-to-r from-slate-100/80 via-slate-50/90 to-slate-100/80',
                      'dark:from-slate-800/80 dark:via-slate-700/90 dark:to-slate-800/80',
                      'border border-slate-200/60 dark:border-slate-600/60',
                      'shadow-inner rounded-xl backdrop-blur-sm',
                      'transition-all duration-300'
                    )}
                  >
                    <TabsTrigger
                      value="sign-in"
                      className={cn(
                        'relative text-sm font-semibold rounded-lg px-6 py-2.5',
                        'transition-all duration-300 ease-out',
                        'data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800',
                        'data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300',
                        'data-[state=active]:shadow-lg data-[state=active]:shadow-blue-200/30',
                        'dark:data-[state=active]:shadow-blue-900/30',
                        'data-[state=active]:border data-[state=active]:border-blue-200/50',
                        'dark:data-[state=active]:border-blue-700/50',
                        'text-slate-600 dark:text-slate-400',
                        'hover:text-blue-600 dark:hover:text-blue-400',
                        'hover:bg-white/60 dark:hover:bg-slate-700/60',
                        'focus-visible:outline-none focus-visible:ring-2',
                        'focus-visible:ring-blue-500/50 focus-visible:ring-offset-2',
                        'transform data-[state=active]:scale-[1.02]'
                      )}
                    >
                      <span className="relative z-10">Sign In</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="sign-up"
                      className={cn(
                        'relative text-sm font-semibold rounded-lg px-6 py-2.5',
                        'transition-all duration-300 ease-out',
                        'data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800',
                        'data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300',
                        'data-[state=active]:shadow-lg data-[state=active]:shadow-blue-200/30',
                        'dark:data-[state=active]:shadow-blue-900/30',
                        'data-[state=active]:border data-[state=active]:border-blue-200/50',
                        'dark:data-[state=active]:border-blue-700/50',
                        'text-slate-600 dark:text-slate-400',
                        'hover:text-blue-600 dark:hover:text-blue-400',
                        'hover:bg-white/60 dark:hover:bg-slate-700/60',
                        'focus-visible:outline-none focus-visible:ring-2',
                        'focus-visible:ring-blue-500/50 focus-visible:ring-offset-2',
                        'transform data-[state=active]:scale-[1.02]'
                      )}
                    >
                      <span className="relative z-10">Sign Up</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="sign-in"
                    className={cn(
                      'mt-6 flex-1 focus-visible:outline-none',
                      'animate-in fade-in-50 slide-in-from-bottom-2 duration-300'
                    )}
                  >
                    <EnhancedSignInForm
                      onSuccess={() => onOpenChange(false)}
                      onForgotPassword={() => setActiveTab('reset-password')}
                    />
                  </TabsContent>

                  <TabsContent
                    value="sign-up"
                    className={cn(
                      'mt-6 flex-1 focus-visible:outline-none',
                      'animate-in fade-in-50 slide-in-from-bottom-2 duration-300'
                    )}
                  >
                    <EnhancedSignUpForm
                      onSuccess={() => setActiveTab('sign-in')}
                      onSignIn={() => setActiveTab('sign-in')}
                    />
                  </TabsContent>
                </Tabs>
              )}

              {activeTab === 'reset-password' && (
                <div
                  className={cn(
                    'mt-6 flex-1',
                    'animate-in fade-in-50 slide-in-from-bottom-2 duration-300'
                  )}
                >
                  <ForgotPasswordFlow
                    onBack={() => setActiveTab('sign-in')}
                    onSuccess={() => setActiveTab('sign-in')}
                  />
                </div>
              )}

              {/* Enhanced Footer */}
              <div className="mt-8 pt-6 border-t-2 border-blue-200 dark:border-blue-700 bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-lg p-4 shadow-inner border-2 border-blue-100 dark:border-blue-800">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-medium">
                        Secure Connection
                      </span>
                    </div>
                    <div className="w-1 h-4 bg-blue-200"></div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-blue-600 font-medium">
                        Government Verified
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">
                    By using Civic Portal, you agree to our{' '}
                    <a
                      href="/terms"
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy"
                      className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                  </p>
                  <div className="text-xs text-gray-500">
                    🏛️ Official Government of Botswana Digital Platform
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Original basic forms
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'w-[95vw] max-w-[450px] max-h-[90vh] p-0',
          'bg-gradient-to-br from-blue-50/95 via-white/98 to-slate-50/95',
          'dark:from-gray-900/95 dark:via-gray-800/98 dark:to-blue-900/20',
          'border-2 border-blue-200/60 dark:border-blue-700/60',
          'shadow-xl dark:shadow-blue-900/20 backdrop-blur-sm',
          'transition-all duration-300',
          'flex flex-col overflow-hidden'
        )}
      >
        <div className="flex-shrink-0 p-6 pb-0">
          <DialogHeader className="space-y-3">
            <DialogTitle
              className={cn(
                'text-center text-2xl font-bold tracking-tight',
                'text-gray-900 dark:text-gray-100'
              )}
            >
              Welcome to Civic Portal
            </DialogTitle>
            <p
              className={cn(
                'text-center text-sm leading-relaxed',
                'text-muted-foreground'
              )}
            >
              Join our community to report and track civic issues
            </p>
          </DialogHeader>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 pt-4">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="space-y-6"
            >
              <TabsList
                className={cn(
                  'grid grid-cols-2 w-full h-11 p-1',
                  'bg-gradient-to-r from-slate-100/80 via-slate-50/90 to-slate-100/80',
                  'dark:from-slate-800/80 dark:via-slate-700/90 dark:to-slate-800/80',
                  'border border-slate-200/60 dark:border-slate-600/60',
                  'shadow-inner rounded-xl backdrop-blur-sm'
                )}
              >
                <TabsTrigger
                  value="sign-in"
                  className={cn(
                    'rounded-lg text-sm font-medium px-4 py-2',
                    'transition-all duration-300 ease-out',
                    'data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800',
                    'data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300',
                    'data-[state=active]:shadow-md data-[state=active]:shadow-blue-200/30',
                    'dark:data-[state=active]:shadow-blue-900/30',
                    'data-[state=active]:border data-[state=active]:border-blue-200/50',
                    'dark:data-[state=active]:border-blue-700/50',
                    'text-slate-600 dark:text-slate-400',
                    'hover:text-blue-600 dark:hover:text-blue-400',
                    'hover:bg-white/60 dark:hover:bg-slate-700/60',
                    'transform data-[state=active]:scale-[1.02]'
                  )}
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="sign-up"
                  className={cn(
                    'rounded-lg text-sm font-medium px-4 py-2',
                    'transition-all duration-300 ease-out',
                    'data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800',
                    'data-[state=active]:text-blue-700 dark:data-[state=active]:text-blue-300',
                    'data-[state=active]:shadow-md data-[state=active]:shadow-blue-200/30',
                    'dark:data-[state=active]:shadow-blue-900/30',
                    'data-[state=active]:border data-[state=active]:border-blue-200/50',
                    'dark:data-[state=active]:border-blue-700/50',
                    'text-slate-600 dark:text-slate-400',
                    'hover:text-blue-600 dark:hover:text-blue-400',
                    'hover:bg-white/60 dark:hover:bg-slate-700/60',
                    'transform data-[state=active]:scale-[1.02]'
                  )}
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="sign-in"
                className={cn(
                  'mt-6 focus-visible:outline-none',
                  'animate-in fade-in-50 slide-in-from-bottom-2 duration-300'
                )}
              >
                <SignInForm onSuccess={() => onOpenChange(false)} />
                <div className="mt-6 text-center">
                  <Button
                    variant="link"
                    className={cn(
                      'text-sm text-muted-foreground hover:text-blue-600',
                      'dark:hover:text-blue-400 transition-colors duration-200'
                    )}
                    onClick={() => setActiveTab('reset-password')}
                  >
                    Forgot your password?
                  </Button>
                </div>
              </TabsContent>

              <TabsContent
                value="sign-up"
                className={cn(
                  'mt-6 focus-visible:outline-none',
                  'animate-in fade-in-50 slide-in-from-bottom-2 duration-300'
                )}
              >
                <SignUpForm
                  onSuccess={() => {
                    setActiveTab('sign-in');
                  }}
                />
              </TabsContent>

              <TabsContent
                value="reset-password"
                className={cn(
                  'mt-6 focus-visible:outline-none',
                  'animate-in fade-in-50 slide-in-from-bottom-2 duration-300'
                )}
              >
                <ResetPasswordForm
                  onSuccess={() => {
                    setActiveTab('sign-in');
                  }}
                />
                <div className="mt-6 text-center">
                  <Button
                    variant="link"
                    className={cn(
                      'text-sm text-muted-foreground hover:text-blue-600',
                      'dark:hover:text-blue-400 transition-colors duration-200'
                    )}
                    onClick={() => setActiveTab('sign-in')}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
