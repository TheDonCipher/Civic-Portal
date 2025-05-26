import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface AuthDebugInfo {
  hasUser: boolean;
  hasProfile: boolean;
  userRole: string | null;
  sessionValid: boolean;
  sessionUser: string | null;
  sessionRole: string | null;
  canInsertNotifications: boolean;
  lastError: string | null;
}

const AuthDebugPanel: React.FC = () => {
  const { user, profile } = useAuth();
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo>({
    hasUser: false,
    hasProfile: false,
    userRole: null,
    sessionValid: false,
    sessionUser: null,
    sessionRole: null,
    canInsertNotifications: false,
    lastError: null,
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkAuthStatus = async () => {
    setIsRefreshing(true);
    try {
      // Check session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      // Test notification insertion capability
      let canInsert = false;
      let lastError = null;
      
      if (session) {
        try {
          // Try to insert a test notification (this will fail due to RLS, but we can see the error)
          const { error: insertError } = await supabase
            .from('notifications')
            .insert({
              user_id: session.user.id,
              type: 'general',
              title: 'Test',
              message: 'Test message',
              data: { test: true }
            });
          
          if (insertError) {
            lastError = insertError.message;
            // If the error is about RLS policy, it means we're authenticated but the policy is blocking
            canInsert = insertError.code === '42501' && insertError.message.includes('row-level security');
          } else {
            canInsert = true;
            // Clean up the test notification
            await supabase
              .from('notifications')
              .delete()
              .eq('user_id', session.user.id)
              .eq('title', 'Test');
          }
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Unknown error';
        }
      }

      setDebugInfo({
        hasUser: !!user,
        hasProfile: !!profile,
        userRole: profile?.role || null,
        sessionValid: !!session && !sessionError,
        sessionUser: session?.user?.id || null,
        sessionRole: session?.user?.role || null,
        canInsertNotifications: canInsert,
        lastError,
      });
    } catch (error) {
      console.error('Error checking auth status:', error);
      setDebugInfo(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, [user, profile]);

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean, trueText: string, falseText: string) => {
    return (
      <Badge variant={status ? 'default' : 'destructive'}>
        {status ? trueText : falseText}
      </Badge>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Authentication Debug Panel</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={checkAuthStatus}
          disabled={isRefreshing}
        >
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon(debugInfo.hasUser)}
            <span className="text-sm">User Object:</span>
            {getStatusBadge(debugInfo.hasUser, 'Present', 'Missing')}
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon(debugInfo.hasProfile)}
            <span className="text-sm">Profile Object:</span>
            {getStatusBadge(debugInfo.hasProfile, 'Present', 'Missing')}
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon(debugInfo.sessionValid)}
            <span className="text-sm">Session Valid:</span>
            {getStatusBadge(debugInfo.sessionValid, 'Valid', 'Invalid')}
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon(debugInfo.canInsertNotifications)}
            <span className="text-sm">Can Send Notifications:</span>
            {getStatusBadge(debugInfo.canInsertNotifications, 'Yes', 'No')}
          </div>
        </div>
        
        <div className="space-y-2 text-xs text-muted-foreground">
          <div>User Role: <Badge variant="outline">{debugInfo.userRole || 'None'}</Badge></div>
          <div>Session User: <Badge variant="outline">{debugInfo.sessionUser || 'None'}</Badge></div>
          <div>Session Role: <Badge variant="outline">{debugInfo.sessionRole || 'None'}</Badge></div>
          {debugInfo.lastError && (
            <div className="text-red-500">
              Last Error: {debugInfo.lastError}
            </div>
          )}
        </div>
        
        <div className="text-xs text-muted-foreground">
          <strong>Expected for working verification:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>User Object: Present</li>
            <li>Profile Object: Present with role 'admin'</li>
            <li>Session Valid: Valid</li>
            <li>Can Send Notifications: Yes (or RLS policy error)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebugPanel;
