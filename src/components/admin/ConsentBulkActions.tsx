import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast-enhanced';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Mail,
  Download,
  RefreshCw,
  Users,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { type UserConsentStatus } from '@/lib/api/adminConsentApi';

interface ConsentBulkActionsProps {
  selectedUsers: UserConsentStatus[];
  allUsers: UserConsentStatus[];
  onRefreshAll?: () => void;
  onSendBulkReminders?: (userIds: string[]) => Promise<void>;
  onExportData?: (users: UserConsentStatus[]) => void;
  isLoading?: boolean;
}

export function ConsentBulkActions({
  selectedUsers,
  allUsers,
  onRefreshAll,
  onSendBulkReminders,
  onExportData,
  isLoading = false,
}: ConsentBulkActionsProps) {
  const { toast } = useToast();
  const [isSendingReminders, setIsSendingReminders] = useState(false);
  const [showReminderDialog, setShowReminderDialog] = useState(false);

  // Filter users who can receive reminders (pending or incomplete status)
  const usersForReminders = selectedUsers.filter(
    (user) =>
      user.consentStatus === 'pending' || user.consentStatus === 'incomplete'
  );

  const handleSendBulkReminders = async () => {
    if (usersForReminders.length === 0) {
      toast({
        title: 'No Users Selected',
        description:
          'Please select users with pending or incomplete consent status.',
        variant: 'destructive',
      });
      return;
    }

    setIsSendingReminders(true);
    try {
      const userIds = usersForReminders.map((user) => user.userId);
      await onSendBulkReminders?.(userIds);

      toast({
        title: 'Reminders Sent',
        description: `Consent reminders sent to ${usersForReminders.length} users.`,
        variant: 'success',
      });

      setShowReminderDialog(false);
    } catch (error: any) {
      console.error('Error sending bulk reminders:', error);
      toast({
        title: 'Failed to Send Reminders',
        description:
          error.message || 'An error occurred while sending reminders.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingReminders(false);
    }
  };

  const handleExportData = () => {
    const usersToExport = selectedUsers.length > 0 ? selectedUsers : allUsers;
    onExportData?.(usersToExport);

    toast({
      title: 'Export Started',
      description: `Exporting consent data for ${usersToExport.length} users.`,
      variant: 'success',
    });
  };

  const getConsentSummary = (users: UserConsentStatus[]) => {
    const summary = users.reduce((acc, user) => {
      acc[user.consentStatus] = (acc[user.consentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: users.length,
      complete: summary['complete'] || 0,
      pending: summary['pending'] || 0,
      incomplete: summary['incomplete'] || 0,
      failed: summary['failed'] || 0,
    };
  };

  const selectedSummary = getConsentSummary(selectedUsers);
  const allSummary = getConsentSummary(allUsers);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Users
                </p>
                <p className="text-2xl font-bold">{allSummary.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Complete
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {allSummary.complete}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {allSummary.pending}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold">
                  {allSummary.total > 0
                    ? Math.round((allSummary.complete / allSummary.total) * 100)
                    : 0}
                  %
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Users Summary */}
      {selectedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Selected Users ({selectedUsers.length})
            </CardTitle>
            <CardDescription>
              Summary of consent status for selected users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedSummary.complete > 0 && (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  {selectedSummary.complete} Complete
                </Badge>
              )}
              {selectedSummary.pending > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800"
                >
                  {selectedSummary.pending} Pending
                </Badge>
              )}
              {selectedSummary.incomplete > 0 && (
                <Badge
                  variant="outline"
                  className="bg-orange-100 text-orange-800"
                >
                  {selectedSummary.incomplete} Incomplete
                </Badge>
              )}
              {selectedSummary.failed > 0 && (
                <Badge
                  variant="destructive"
                  className="bg-red-100 text-red-800"
                >
                  {selectedSummary.failed} Failed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onRefreshAll} disabled={isLoading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
          />
          Refresh All Status
        </Button>

        <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={usersForReminders.length === 0}>
              <Mail className="h-4 w-4 mr-2" />
              Send Reminders ({usersForReminders.length})
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Consent Reminders</DialogTitle>
              <DialogDescription>
                Send consent completion reminders to selected users with pending
                or incomplete status.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  This will send email reminders to {usersForReminders.length}{' '}
                  users who have not completed their consent requirements.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h4 className="font-medium">Users to receive reminders:</h4>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {usersForReminders.map((user) => (
                    <div
                      key={user.userId}
                      className="flex items-center justify-between text-sm p-2 bg-muted rounded"
                    >
                      <span>
                        {user.fullName} ({user.username})
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {user.consentStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowReminderDialog(false)}
                  disabled={isSendingReminders}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendBulkReminders}
                  disabled={isSendingReminders}
                >
                  {isSendingReminders ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Reminders
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" onClick={handleExportData}>
          <Download className="h-4 w-4 mr-2" />
          Export Data (
          {selectedUsers.length > 0 ? selectedUsers.length : allUsers.length})
        </Button>
      </div>
    </div>
  );
}

export default ConsentBulkActions;
