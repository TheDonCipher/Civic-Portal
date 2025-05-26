import { useState } from 'react';
import '../../styles/botswana-theme.css';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
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
import { DialogViewportHandler } from './DialogViewportHandler';
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
  const [activeTab, setActiveTab] = useState<
    'sign-in' | 'sign-up' | 'reset-password'
  >(defaultTab);

  // Use enhanced forms if requested
  if (enhanced) {
    return (
      <>
        <DialogViewportHandler isOpen={open || false} />
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent
            className={cn(
              'auth-dialog-enhanced w-[95vw] max-w-[500px] sm:max-w-[600px]',
              'max-h-[90vh] sm:max-h-[95vh] p-0',
              'bg-gradient-to-br from-blue-50/98 via-white/99 to-slate-50/98',
              'dark:from-gray-900/98 dark:via-gray-800/99 dark:to-blue-900/95',
              'border-2 border-blue-200/70 dark:border-blue-700/70',
              'shadow-2xl dark:shadow-blue-900/40 backdrop-blur-lg',
              'transition-all duration-300 ease-out',
              'flex flex-col overflow-hidden',
              'relative',
              // Ensure dialog is always visible and scrollable
              'my-4 sm:my-8',
              'top-auto translate-y-0',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
            )}
            style={{
              background: 'var(--civic-gradient)',
              position: 'fixed',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              maxHeight: 'calc(100vh - 2rem)',
            }}
          >
            {/* Enhanced Header with Botswana Branding */}
            <div
              className={cn(
                'auth-dialog-header relative overflow-hidden border-b-0',
                'bg-gradient-to-r from-[var(--gov-primary)] via-[var(--gov-primary-light)] to-[var(--gov-primary-dark)]',
                'dark:from-blue-700 dark:via-blue-800 dark:to-blue-900'
              )}
              style={{
                background: 'var(--botswana-gradient)',
              }}
            >
              {/* Enhanced decorative background pattern */}
              <div className="absolute inset-0 opacity-15">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4yIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')]" />
              </div>

              {/* Subtle gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5"></div>

              <div className="relative z-10 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                      Civic Portal Botswana
                    </DialogTitle>
                    <DialogDescription className="text-blue-100/95 text-sm leading-relaxed font-medium mt-2">
                      {activeTab === 'sign-in'
                        ? 'Sign in to report issues and engage with your community'
                        : activeTab === 'sign-up'
                        ? "Join Botswana's digital civic community"
                        : "We'll help you regain access to your account"}
                    </DialogDescription>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge
                      className={cn(
                        'botswana-badge bg-white/25 text-white border-white/40',
                        'hover:bg-white/35 transition-all duration-200',
                        'backdrop-blur-sm shadow-sm font-semibold text-xs'
                      )}
                    >
                      🇧🇼 Botswana
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div
              className={cn(
                'auth-dialog-content flex-1 overflow-y-auto overflow-x-hidden',
                'bg-transparent backdrop-blur-sm',
                'relative'
              )}
              style={{
                maxHeight: 'calc(100vh - 12rem)', // Account for header and margins
              }}
            >
              {/* Seamless background continuation */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white/80 dark:via-gray-800/60 dark:to-gray-800/80"></div>

              <div className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6 flex flex-col">
                {(activeTab === 'sign-in' || activeTab === 'sign-up') && (
                  <Tabs
                    value={activeTab}
                    onValueChange={(v) => setActiveTab(v as any)}
                    className="flex flex-col flex-1"
                  >
                    <TabsList
                      className={cn(
                        'grid w-full grid-cols-2 h-11 p-1',
                        'bg-white/90 dark:bg-gray-800/90',
                        'border border-blue-200/50 dark:border-blue-700/50',
                        'rounded-lg',
                        'transition-all duration-200'
                      )}
                    >
                      <TabsTrigger
                        value="sign-in"
                        className={cn(
                          'text-sm font-medium rounded-md px-4 py-2',
                          'transition-all duration-200',
                          'data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700',
                          'data-[state=active]:text-[var(--gov-primary)] dark:data-[state=active]:text-blue-300',
                          'data-[state=active]:shadow-sm',
                          'text-gray-600 dark:text-gray-400',
                          'hover:text-[var(--gov-primary)] dark:hover:text-blue-400',
                          'hover:bg-white/50 dark:hover:bg-gray-700/50',
                          'focus-visible:outline-none focus-visible:ring-2',
                          'focus-visible:ring-blue-500/50 focus-visible:ring-offset-1'
                        )}
                      >
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger
                        value="sign-up"
                        className={cn(
                          'text-sm font-medium rounded-md px-4 py-2',
                          'transition-all duration-200',
                          'data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700',
                          'data-[state=active]:text-[var(--gov-primary)] dark:data-[state=active]:text-blue-300',
                          'data-[state=active]:shadow-sm',
                          'text-gray-600 dark:text-gray-400',
                          'hover:text-[var(--gov-primary)] dark:hover:text-blue-400',
                          'hover:bg-white/50 dark:hover:bg-gray-700/50',
                          'focus-visible:outline-none focus-visible:ring-2',
                          'focus-visible:ring-blue-500/50 focus-visible:ring-offset-1'
                        )}
                      >
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent
                      value="sign-in"
                      className={cn(
                        'mt-4 sm:mt-6 flex-1 focus-visible:outline-none',
                        'animate-in fade-in-50 slide-in-from-bottom-2 duration-300'
                      )}
                    >
                      <div className="auth-form-container p-1">
                        <EnhancedSignInForm
                          onSuccess={() => onOpenChange(false)}
                          onForgotPassword={() =>
                            setActiveTab('reset-password')
                          }
                          className="bg-transparent border-0 shadow-none p-4 sm:p-5"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="sign-up"
                      className={cn(
                        'mt-4 sm:mt-6 flex-1 focus-visible:outline-none',
                        'animate-in fade-in-50 slide-in-from-bottom-2 duration-300'
                      )}
                    >
                      <div className="auth-form-container p-1">
                        <EnhancedSignUpForm
                          onSuccess={() => setActiveTab('sign-in')}
                          onSignIn={() => setActiveTab('sign-in')}
                          className="bg-transparent border-0 shadow-none p-4 sm:p-5"
                        />
                      </div>
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
                    <div className="auth-form-container p-6">
                      <ForgotPasswordFlow
                        onBack={() => setActiveTab('sign-in')}
                        onSuccess={() => setActiveTab('sign-in')}
                      />
                    </div>
                  </div>
                )}

                {/* Enhanced Footer with Botswana Branding */}
                <div
                  className={cn(
                    'mt-6 sm:mt-8 pt-4 sm:pt-6 rounded-xl p-3 sm:p-4 shadow-lg border-2',
                    'bg-gradient-to-r from-white/90 via-blue-50/95 to-white/90',
                    'dark:from-gray-800/90 dark:via-gray-700/95 dark:to-gray-800/90',
                    'border-blue-200/60 dark:border-blue-700/60',
                    'backdrop-blur-md'
                  )}
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, var(--gov-accent) 50%, rgba(255,255,255,0.95) 100%)',
                  }}
                >
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                        <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                          Secure Connection
                        </span>
                      </div>
                      <div className="w-1 h-4 bg-blue-300/60 rounded-full"></div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[var(--gov-primary)] rounded-full shadow-sm"></div>
                        <span className="text-xs text-[var(--gov-primary)] dark:text-blue-400 font-semibold">
                          Government Verified
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      By using Civic Portal, you agree to our{' '}
                      <a
                        href="/terms"
                        className="text-[var(--gov-primary)] hover:text-[var(--gov-primary-dark)] hover:underline font-semibold transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a
                        href="/privacy"
                        className="text-[var(--gov-primary)] hover:text-[var(--gov-primary-dark)] hover:underline font-semibold transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy Policy
                      </a>
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      🏛️ Official Government of Botswana Digital Platform
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Original basic forms with improved Botswana branding
  return (
    <>
      <DialogViewportHandler isOpen={open || false} />
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={cn(
            'auth-dialog-basic w-[95vw] max-w-[400px] sm:max-w-[450px]',
            'max-h-[90vh] sm:max-h-[95vh] p-0',
            'bg-gradient-to-br from-blue-50/98 via-white/99 to-slate-50/98',
            'dark:from-gray-900/98 dark:via-gray-800/99 dark:to-blue-900/95',
            'border-2 border-blue-200/70 dark:border-blue-700/70',
            'shadow-xl dark:shadow-blue-900/30 backdrop-blur-md',
            'transition-all duration-300',
            'flex flex-col overflow-hidden',
            // Ensure dialog is always visible and scrollable
            'my-4 sm:my-8',
            'top-auto translate-y-0',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
          style={{
            background: 'var(--civic-gradient)',
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            maxHeight: 'calc(100vh - 2rem)',
          }}
        >
          {/* Improved Header with Botswana Branding */}
          <div
            className={cn(
              'flex-shrink-0 relative overflow-hidden',
              'bg-gradient-to-r from-[var(--gov-primary)] via-[var(--gov-primary-light)] to-[var(--gov-primary-dark)]'
            )}
            style={{
              background: 'var(--botswana-gradient)',
            }}
          >
            {/* Decorative pattern */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4yIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzIi8+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMiIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjIiLz48L2c+PC9nPjwvc3ZnPg==')]" />
            </div>

            {/* Subtle gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5"></div>

            <div className="relative z-10 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-sm">
                    Civic Portal Botswana
                  </DialogTitle>
                  <DialogDescription className="text-blue-100/95 text-sm leading-relaxed font-medium mt-2">
                    Join our community to report and track civic issues
                  </DialogDescription>
                </div>
                <div className="flex-shrink-0">
                  <Badge
                    className={cn(
                      'botswana-badge bg-white/25 text-white border-white/40',
                      'hover:bg-white/35 transition-all duration-200',
                      'backdrop-blur-sm shadow-sm font-semibold text-xs'
                    )}
                  >
                    🇧🇼 Botswana
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area with seamless integration */}
          <div
            className={cn(
              'auth-dialog-content flex-1 overflow-y-auto overflow-x-hidden bg-transparent relative'
            )}
            style={{
              maxHeight: 'calc(100vh - 10rem)', // Account for header and margins
            }}
          >
            {/* Seamless background continuation */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white/85 dark:via-gray-800/70 dark:to-gray-800/85"></div>

            <div className="relative z-10 p-4 sm:p-6 pt-4">
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as any)}
                className="space-y-4 sm:space-y-6"
              >
                <TabsList
                  className={cn(
                    'grid w-full grid-cols-2 h-11 p-1',
                    'bg-white/90 dark:bg-gray-800/90',
                    'border border-blue-200/50 dark:border-blue-700/50',
                    'rounded-lg',
                    'transition-all duration-200'
                  )}
                >
                  <TabsTrigger
                    value="sign-in"
                    className={cn(
                      'text-sm font-medium rounded-md px-4 py-2',
                      'transition-all duration-200',
                      'data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700',
                      'data-[state=active]:text-[var(--gov-primary)] dark:data-[state=active]:text-blue-300',
                      'data-[state=active]:shadow-sm',
                      'text-gray-600 dark:text-gray-400',
                      'hover:text-[var(--gov-primary)] dark:hover:text-blue-400',
                      'hover:bg-white/50 dark:hover:bg-gray-700/50',
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-blue-500/50 focus-visible:ring-offset-1'
                    )}
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger
                    value="sign-up"
                    className={cn(
                      'text-sm font-medium rounded-md px-4 py-2',
                      'transition-all duration-200',
                      'data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700',
                      'data-[state=active]:text-[var(--gov-primary)] dark:data-[state=active]:text-blue-300',
                      'data-[state=active]:shadow-sm',
                      'text-gray-600 dark:text-gray-400',
                      'hover:text-[var(--gov-primary)] dark:hover:text-blue-400',
                      'hover:bg-white/50 dark:hover:bg-gray-700/50',
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-blue-500/50 focus-visible:ring-offset-1'
                    )}
                  >
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="sign-in"
                  className={cn(
                    'mt-4 sm:mt-6 focus-visible:outline-none',
                    'animate-in fade-in-50 slide-in-from-bottom-2 duration-300'
                  )}
                >
                  <div className="auth-form-container p-4 sm:p-6">
                    <SignInForm onSuccess={() => onOpenChange(false)} />
                    <div className="mt-4 sm:mt-6 text-center">
                      <Button
                        variant="link"
                        className={cn(
                          'text-sm text-[var(--gov-primary)] hover:text-[var(--gov-primary-dark)]',
                          'dark:hover:text-blue-400 transition-colors duration-200 font-medium'
                        )}
                        onClick={() => setActiveTab('reset-password')}
                      >
                        Forgot your password?
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="sign-up"
                  className={cn(
                    'mt-4 sm:mt-6 focus-visible:outline-none',
                    'animate-in fade-in-50 slide-in-from-bottom-2 duration-300'
                  )}
                >
                  <div className="auth-form-container p-4 sm:p-6">
                    <SignUpForm
                      onSuccess={() => {
                        setActiveTab('sign-in');
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent
                  value="reset-password"
                  className={cn(
                    'mt-4 sm:mt-6 focus-visible:outline-none',
                    'animate-in fade-in-50 slide-in-from-bottom-2 duration-300'
                  )}
                >
                  <div className="auth-form-container p-4 sm:p-6">
                    <ResetPasswordForm
                      onSuccess={() => {
                        setActiveTab('sign-in');
                      }}
                    />
                    <div className="mt-4 sm:mt-6 text-center">
                      <Button
                        variant="link"
                        className={cn(
                          'text-sm text-[var(--gov-primary)] hover:text-[var(--gov-primary-dark)]',
                          'dark:hover:text-blue-400 transition-colors duration-200 font-medium'
                        )}
                        onClick={() => setActiveTab('sign-in')}
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Footer with Botswana Branding */}
              <div
                className={cn(
                  'mt-4 sm:mt-6 pt-3 sm:pt-4 rounded-lg p-3 shadow-md border',
                  'bg-gradient-to-r from-white/90 via-blue-50/95 to-white/90',
                  'dark:from-gray-800/90 dark:via-gray-700/95 dark:to-gray-800/90',
                  'border-blue-200/50 dark:border-blue-700/50',
                  'backdrop-blur-sm'
                )}
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, var(--gov-accent) 50%, rgba(255,255,255,0.9) 100%)',
                }}
              >
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        Secure
                      </span>
                    </div>
                    <div className="w-0.5 h-3 bg-blue-300/60 rounded-full"></div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-[var(--gov-primary)] rounded-full"></div>
                      <span className="text-xs text-[var(--gov-primary)] dark:text-blue-400 font-medium">
                        Verified
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    🏛️ Government of Botswana
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthDialog;
