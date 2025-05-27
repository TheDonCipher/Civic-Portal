import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast-enhanced';
import { fixExistingUserConsentTimestamps } from '@/lib/services/legalConsentService';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Debug component to fix existing users who have NULL consent timestamps in profiles table
 * This component should only be used by administrators for data migration purposes
 */
export function ConsentTimestampFixer() {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    updatedCount?: number;
    error?: string;
  } | null>(null);
  const { toast } = useToast();

  const handleFixTimestamps = async () => {
    setIsFixing(true);
    setResult(null);

    try {
      const fixResult = await fixExistingUserConsentTimestamps();
      setResult(fixResult);

      if (fixResult.success) {
        toast({
          title: 'Fix Completed',
          description: `Successfully updated ${fixResult.updatedCount || 0} users with missing consent timestamps.`,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Fix Failed',
          description: fixResult.error || 'Failed to fix consent timestamps',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setResult({
        success: false,
        error: errorMessage,
      });

      toast({
        title: 'Fix Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Consent Timestamp Fixer
        </CardTitle>
        <CardDescription>
          Fix existing users who have legal consent records but NULL timestamps in their profiles.
          This utility updates the profiles table with consent timestamps from the legal_consents table.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Administrator Tool:</strong> This tool is designed for data migration and should only be used by administrators.
            It will update the profiles table for users who have legal consent records but missing timestamps.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">What this tool does:</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Finds users with NULL terms_accepted_at or privacy_accepted_at in profiles table</li>
              <li>• Looks up their legal consent records from legal_consents table</li>
              <li>• Updates the profiles table with the consent timestamps</li>
              <li>• Provides a summary of how many users were updated</li>
            </ul>
          </div>

          <Button 
            onClick={handleFixTimestamps}
            disabled={isFixing}
            className="w-full"
            size="lg"
          >
            {isFixing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Fixing Consent Timestamps...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Fix Consent Timestamps
              </>
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? 'default' : 'destructive'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                {result.success ? (
                  <>
                    <strong>Success!</strong> Updated {result.updatedCount || 0} users with missing consent timestamps.
                    {result.updatedCount === 0 && ' No users needed updating.'}
                  </>
                ) : (
                  <>
                    <strong>Error:</strong> {result.error}
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
          <strong>Technical Details:</strong> This tool addresses the issue where legal consent is stored in the 
          legal_consents table but the corresponding timestamps in the profiles table remain NULL. 
          This can happen if the profile update step failed during user registration or if users 
          were created before the profile timestamp update functionality was implemented.
        </div>
      </CardContent>
    </Card>
  );
}

export default ConsentTimestampFixer;
