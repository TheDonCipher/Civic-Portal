import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error?: Error | undefined;
  errorInfo?: ErrorInfo | undefined;
  errorId?: string | undefined;
}

class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  private retryCount = 0;
  private maxRetries = 3;

  public static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.group('🚨 Error Boundary Caught Error');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Error ID:', this.state.errorId);
    console.groupEnd();

    this.setState({ errorInfo });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details for debugging
    this.logErrorDetails(error, errorInfo);
  }

  private logErrorDetails = (error: Error, errorInfo: ErrorInfo) => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component',
    };

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(
        localStorage.getItem('civic-portal-errors') || '[]'
      );
      existingErrors.push(errorDetails);
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('civic-portal-errors', JSON.stringify(recentErrors));
    } catch (e) {
      console.warn('Failed to store error details in localStorage:', e);
    }
  };

  private handleRetry = () => {
    if (this.retryCount >= this.maxRetries) {
      console.warn('Max retry attempts reached');
      return;
    }

    this.retryCount++;
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { level = 'component', showDetails = false } = this.props;
      const isRetryDisabled = this.retryCount >= this.maxRetries;

      // Component-level error (smaller UI)
      if (level === 'component') {
        return (
          <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">
                Component Error
              </span>
              {this.state.errorId && (
                <Badge variant="outline" className="text-xs">
                  {this.state.errorId.slice(-8)}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              This component encountered an error and couldn't render properly.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={this.handleRetry}
                disabled={isRetryDisabled}
                className="text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry{' '}
                {isRetryDisabled && `(${this.retryCount}/${this.maxRetries})`}
              </Button>
            </div>
          </div>
        );
      }

      // Page-level or critical error (full UI)
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              {this.state.errorId && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    Error ID: {this.state.errorId.slice(-8)}
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                We're sorry, but something unexpected happened. Please try again
                or return to the home page.
              </p>

              {(showDetails || process.env['NODE_ENV'] === 'development') &&
                this.state.error && (
                  <details className="mt-4 p-3 bg-muted rounded-md">
                    <summary className="cursor-pointer text-sm font-medium">
                      Error Details{' '}
                      {process.env['NODE_ENV'] === 'development' &&
                        '(Development)'}
                    </summary>
                    <div className="mt-2 text-xs font-mono text-muted-foreground">
                      <div className="mb-2">
                        <strong>Message:</strong> {this.state.error.message}
                      </div>
                      {process.env['NODE_ENV'] === 'development' && (
                        <>
                          <div className="mb-2">
                            <strong>Stack:</strong>
                            <pre className="whitespace-pre-wrap mt-1 text-xs">
                              {this.state.error.stack}
                            </pre>
                          </div>
                          {this.state.errorInfo && (
                            <div>
                              <strong>Component Stack:</strong>
                              <pre className="whitespace-pre-wrap mt-1 text-xs">
                                {this.state.errorInfo.componentStack}
                              </pre>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </details>
                )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="flex gap-2 w-full">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="outline"
                  disabled={isRetryDisabled}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again{' '}
                  {isRetryDisabled && `(${this.retryCount}/${this.maxRetries})`}
                </Button>
                <Button onClick={this.handleGoHome} className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>
              <Button
                onClick={this.handleReload}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Reload Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
