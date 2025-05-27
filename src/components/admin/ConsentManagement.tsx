import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast-enhanced';
import { 
  getUsersNeedingConsentReminders, 
  sendConsentReminder,
  validateUserConsentStatus 
} from '@/lib/services/legalConsentService';
import { supabase } from '@/lib/supabase';
import { 
  AlertTriangle, 
  Mail, 
  Users, 
  Clock, 
  CheckCircle, 
  RefreshCw,
  Eye 
} from 'lucide-react';

interface UserWithConsentStatus {
  id: string;
  email: string;
  full_name: string | null;
  account_status: string;
  consent_reminder_count: number;
  last_consent_reminder: string | null;
  created_at: string;
}

/**
 * Admin component for managing users with pending consent
 */
export function ConsentManagement() {
  const [users, setUsers] = useState<UserWithConsentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sendingReminders, setSendingReminders] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersWithPendingConsent();
  }, []);

  const fetchUsersWithPendingConsent = async () => {
    setIsLoading(true);
    try {
      // Get users with pending consent status
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, account_status, consent_reminder_count, last_consent_reminder, created_at')
        .eq('account_status', 'pending_consent')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users with pending consent:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users with pending consent',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminder = async (userId: string, userEmail: string) => {
    setSendingReminders(prev => new Set(prev).add(userId));
    
    try {
      const result = await sendConsentReminder(userId);
      
      if (result.success) {
        toast({
          title: 'Reminder Sent',
          description: `Consent reminder sent to ${userEmail}`,
          variant: 'default',
        });
        
        // Refresh the user list to show updated reminder count
        await fetchUsersWithPendingConsent();
      } else {
        throw new Error(result.error || 'Failed to send reminder');
      }
    } catch (error: any) {
      console.error('Error sending reminder:', error);
      toast({
        title: 'Error',
        description: `Failed to send reminder: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setSendingReminders(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleSendBulkReminders = async () => {
    setIsRefreshing(true);
    
    try {
      const usersNeedingReminders = await getUsersNeedingConsentReminders();
      
      if (!usersNeedingReminders.success || !usersNeedingReminders.data) {
        throw new Error(usersNeedingReminders.error || 'Failed to get users needing reminders');
      }

      const reminderPromises = usersNeedingReminders.data.map(user => 
        sendConsentReminder(user.id)
      );

      const results = await Promise.allSettled(reminderPromises);
      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;

      toast({
        title: 'Bulk Reminders Sent',
        description: `Successfully sent ${successCount} consent reminders`,
        variant: 'default',
      });

      // Refresh the user list
      await fetchUsersWithPendingConsent();
    } catch (error: any) {
      console.error('Error sending bulk reminders:', error);
      toast({
        title: 'Error',
        description: `Failed to send bulk reminders: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_consent':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending Consent
          </Badge>
        );
      case 'active':
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const daysSinceCreated = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Consent Management</h2>
          <p className="text-muted-foreground">
            Manage users with pending legal consent
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchUsersWithPendingConsent}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleSendBulkReminders}
            disabled={isRefreshing || users.length === 0}
          >
            <Mail className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-pulse' : ''}`} />
            Send Bulk Reminders
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Consent</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Users awaiting consent completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Reminders</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.consent_reminder_count < 3).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Eligible for reminder emails
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => daysSinceCreated(u.created_at) > 7).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending for over 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users with Pending Consent</CardTitle>
          <CardDescription>
            Users who have not completed all required legal agreements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No users with pending consent found. All users have completed their legal agreements!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {user.full_name || 'Unnamed User'}
                      </h4>
                      {getStatusBadge(user.account_status)}
                      {daysSinceCreated(user.created_at) > 7 && (
                        <Badge variant="destructive" className="text-xs">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Created: {formatDate(user.created_at)}</span>
                      <span>Reminders sent: {user.consent_reminder_count}</span>
                      <span>Last reminder: {formatDate(user.last_consent_reminder)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSendReminder(user.id, user.email)}
                      disabled={
                        sendingReminders.has(user.id) || 
                        user.consent_reminder_count >= 3
                      }
                    >
                      {sendingReminders.has(user.id) ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Mail className="h-3 w-3" />
                      )}
                      {user.consent_reminder_count >= 3 ? 'Max Reminders' : 'Send Reminder'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ConsentManagement;
