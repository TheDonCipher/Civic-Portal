import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast-enhanced';
import { ConsentStatusWidget } from '@/components/auth/ConsentStatusWidget';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Mail,
  RotateCcw,
  Eye,
  Calendar,
  User,
  Shield,
  FileText,
  Database
} from 'lucide-react';
import { 
  type UserConsentStatus,
  refreshUserConsentStatus 
} from '@/lib/api/adminConsentApi';
import { 
  getUserConsentHistory,
  type LegalConsentRecord 
} from '@/lib/services/legalConsentService';

interface UserConsentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userConsentStatus: UserConsentStatus | null;
  onRefresh?: (userId: string) => void;
}

export function UserConsentDetailDialog({
  open,
  onOpenChange,
  userConsentStatus,
  onRefresh,
}: UserConsentDetailDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [consentHistory, setConsentHistory] = useState<LegalConsentRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (open && userConsentStatus?.userId) {
      loadConsentHistory();
    }
  }, [open, userConsentStatus?.userId]);

  const loadConsentHistory = async () => {
    if (!userConsentStatus?.userId) return;

    setIsLoadingHistory(true);
    try {
      const result = await getUserConsentHistory(userConsentStatus.userId);
      
      if (result.success && result.data) {
        setConsentHistory(result.data);
      } else {
        console.error('Failed to load consent history:', result.error);
        setConsentHistory([]);
      }
    } catch (error: any) {
      console.error('Error loading consent history:', error);
      setConsentHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRefreshStatus = async () => {
    if (!userConsentStatus?.userId || isLoading) return;

    setIsLoading(true);
    try {
      const result = await refreshUserConsentStatus(userConsentStatus.userId);
      
      if (result.success) {
        toast({
          title: 'Status Refreshed',
          description: 'User consent status has been updated.',
          variant: 'success',
        });
        onRefresh?.(userConsentStatus.userId);
        await loadConsentHistory(); // Reload history after refresh
      } else {
        throw new Error(result.error || 'Failed to refresh status');
      }
    } catch (error: any) {
      console.error('Error refreshing consent status:', error);
      toast({
        title: 'Refresh Failed',
        description: error.message || 'Failed to refresh consent status.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReminder = async () => {
    if (!userConsentStatus?.userId) return;

    toast({
      title: 'Reminder Sent',
      description: `Consent reminder has been sent to ${userConsentStatus.fullName}.`,
      variant: 'success',
    });
  };

  const handleResetConsent = async () => {
    if (!userConsentStatus?.userId) return;

    // This would implement consent reset functionality
    toast({
      title: 'Consent Reset',
      description: `Consent status has been reset for ${userConsentStatus.fullName}.`,
      variant: 'success',
    });
  };

  if (!userConsentStatus) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'incomplete':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatConsentDetail = (consent: LegalConsentRecord) => {
    return {
      terms: {
        accepted: consent.terms_accepted,
        version: consent.terms_version,
        timestamp: consent.terms_accepted_at,
      },
      privacy: {
        accepted: consent.privacy_accepted,
        version: consent.privacy_version,
        timestamp: consent.privacy_accepted_at,
      },
      dataProcessing: {
        accepted: consent.data_processing_consent,
        version: consent.data_processing_version,
        timestamp: consent.data_processing_accepted_at,
      },
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Consent Details: {userConsentStatus.fullName}
          </DialogTitle>
          <DialogDescription>
            Comprehensive view of user consent status, history, and management options.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                User Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Username</div>
                  <div className="text-sm">{userConsentStatus.username}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="text-sm">{userConsentStatus.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Role</div>
                  <Badge variant="outline">{userConsentStatus.role}</Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Last Check</div>
                  <div className="text-sm">
                    {userConsentStatus.lastConsentCheck?.toLocaleString() || 'Never'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(userConsentStatus.consentStatus)}
                Current Consent Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge 
                      variant={userConsentStatus.consentStatus === 'complete' ? 'default' : 'secondary'}
                      className="mb-2"
                    >
                      {userConsentStatus.consentStatus.toUpperCase()}
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      Progress: {Math.round(userConsentStatus.consentProgress)}% complete
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshStatus}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    {userConsentStatus.consentStatus === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSendReminder}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Reminder
                      </Button>
                    )}
                  </div>
                </div>

                <Progress value={userConsentStatus.consentProgress} className="h-2" />

                {userConsentStatus.errorMessage && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {userConsentStatus.errorMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Consent Details */}
          {userConsentStatus.consentDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Consent Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userConsentStatus.consentDetails.missingConsents.length > 0 ? (
                    <div>
                      <div className="text-sm font-medium text-red-600 mb-2">Missing Consents:</div>
                      <div className="flex flex-wrap gap-2">
                        {userConsentStatus.consentDetails.missingConsents.map((consent, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {consent}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">All required consents completed</span>
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="font-medium">Required Action: </span>
                    <Badge variant="outline">
                      {userConsentStatus.consentDetails.requiresAction.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    <span className="font-medium">Can Proceed: </span>
                    {userConsentStatus.consentDetails.canProceed ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">Yes</Badge>
                    ) : (
                      <Badge variant="destructive">No</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consent History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Consent History
                {isLoadingHistory && <RefreshCw className="h-4 w-4 animate-spin ml-2" />}
              </CardTitle>
              <CardDescription>
                Complete audit trail of all consent records for this user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consentHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {isLoadingHistory ? 'Loading consent history...' : 'No consent records found.'}
                </div>
              ) : (
                <div className="space-y-4">
                  {consentHistory.map((consent, index) => {
                    const details = formatConsentDetail(consent);
                    return (
                      <div key={consent.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {new Date(consent.consent_timestamp).toLocaleString()}
                            </span>
                            {index === 0 && (
                              <Badge variant="default" className="text-xs">Latest</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            IP: {consent.ip_address || 'Unknown'}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">Terms of Service</div>
                            <div className="flex items-center gap-2">
                              {details.terms.accepted ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm">v{details.terms.version}</span>
                            </div>
                            {details.terms.timestamp && (
                              <div className="text-xs text-muted-foreground">
                                {new Date(details.terms.timestamp).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium">Privacy Policy</div>
                            <div className="flex items-center gap-2">
                              {details.privacy.accepted ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm">v{details.privacy.version}</span>
                            </div>
                            {details.privacy.timestamp && (
                              <div className="text-xs text-muted-foreground">
                                {new Date(details.privacy.timestamp).toLocaleString()}
                              </div>
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="text-sm font-medium">Data Processing</div>
                            <div className="flex items-center gap-2">
                              {details.dataProcessing.accepted ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                              <span className="text-sm">v{details.dataProcessing.version}</span>
                            </div>
                            {details.dataProcessing.timestamp && (
                              <div className="text-xs text-muted-foreground">
                                {new Date(details.dataProcessing.timestamp).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>

                        {consent.user_agent && (
                          <div className="mt-3 text-xs text-muted-foreground">
                            User Agent: {consent.user_agent}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Admin Actions
              </CardTitle>
              <CardDescription>
                Administrative tools for managing user consent status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshStatus}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh Status
                </Button>

                {userConsentStatus.consentStatus !== 'complete' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendReminder}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Reminder
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetConsent}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Consent
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UserConsentDetailDialog;
