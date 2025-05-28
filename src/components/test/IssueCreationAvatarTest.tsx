import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getUserInitials, getUserDisplayName, getUserAvatarUrl } from '@/lib/utils/userUtils';
import CreateIssueDialog from '@/components/issues/CreateIssueDialog';

/**
 * Test component to verify avatar consistency during issue creation
 * This component simulates the issue creation flow and verifies avatar handling
 */
export const IssueCreationAvatarTest: React.FC = () => {
  const { user, profile } = useAuth();
  const { avatarUrl } = useUserAvatar(user?.id);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  if (!user || !profile) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Issue Creation Avatar Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please sign in to test issue creation avatar functionality</p>
        </CardContent>
      </Card>
    );
  }

  const runAvatarTests = () => {
    const results: string[] = [];
    
    // Test 1: Check if getUserAvatarUrl works with profile data
    const profileAvatarUrl = getUserAvatarUrl(profile, user);
    results.push(`✅ Profile Avatar URL: ${profileAvatarUrl ? 'Generated' : 'Failed'}`);
    
    // Test 2: Check if getUserAvatarUrl works with author_id only
    const authorOnlyAvatarUrl = getUserAvatarUrl({ id: user.id, avatar_url: null });
    results.push(`✅ Author ID Only Avatar: ${authorOnlyAvatarUrl ? 'Generated' : 'Failed'}`);
    
    // Test 3: Check if getUserAvatarUrl works with empty avatar
    const emptyAvatarUrl = getUserAvatarUrl({ id: user.id, avatar_url: '' });
    results.push(`✅ Empty Avatar Fallback: ${emptyAvatarUrl ? 'Generated' : 'Failed'}`);
    
    // Test 4: Check consistency between different methods
    const consistent = profileAvatarUrl === avatarUrl;
    results.push(`${consistent ? '✅' : '❌'} Avatar Consistency: ${consistent ? 'Consistent' : 'Inconsistent'}`);
    
    // Test 5: Check if initials are generated correctly
    const initials = getUserInitials(profile, user);
    results.push(`✅ User Initials: ${initials || 'Generated'}`);
    
    setTestResults(results);
  };

  const handleIssueCreated = (data: any) => {
    console.log('Issue created with data:', data);
    setTestResults(prev => [...prev, `✅ Issue Created: ${data.title || 'Success'}`]);
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Issue Creation Avatar Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current User Info */}
          <div className="space-y-3">
            <h3 className="font-semibold">Current User</h3>
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={avatarUrl}
                  alt={getUserDisplayName(profile, user)}
                />
                <AvatarFallback>
                  {getUserInitials(profile, user)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{getUserDisplayName(profile, user)}</p>
                <Badge variant="secondary">{profile.role || 'citizen'}</Badge>
              </div>
            </div>
          </div>

          {/* Avatar URL Comparison */}
          <div className="space-y-3">
            <h3 className="font-semibold">Avatar URL Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Hook Avatar URL:</p>
                <p className="text-xs text-muted-foreground break-all">{avatarUrl}</p>
              </div>
              <div>
                <p className="font-medium">Profile Avatar URL:</p>
                <p className="text-xs text-muted-foreground break-all">
                  {profile.avatar_url || 'None'}
                </p>
              </div>
            </div>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Test Results</h3>
              <div className="space-y-1">
                {testResults.map((result, index) => (
                  <p key={index} className="text-sm font-mono">
                    {result}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Test Actions */}
          <div className="space-y-3">
            <h3 className="font-semibold">Test Actions</h3>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={runAvatarTests}
              >
                Run Avatar Tests
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Test Issue Creation
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('refreshProfile'));
                  setTestResults(prev => [...prev, '🔄 Profile Refresh Triggered']);
                }}
              >
                Trigger Profile Refresh
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setTestResults([])}
              >
                Clear Results
              </Button>
            </div>
          </div>

          {/* Avatar Rendering Test */}
          <div className="space-y-3">
            <h3 className="font-semibold">Avatar Rendering Test</h3>
            <div className="flex items-center space-x-4">
              {/* Test different avatar scenarios */}
              <div className="text-center">
                <Avatar className="h-10 w-10 mx-auto mb-2">
                  <AvatarImage
                    src={getUserAvatarUrl(profile, user)}
                    alt="Profile + User"
                  />
                  <AvatarFallback>
                    {getUserInitials(profile, user)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs">Profile + User</p>
              </div>
              
              <div className="text-center">
                <Avatar className="h-10 w-10 mx-auto mb-2">
                  <AvatarImage
                    src={getUserAvatarUrl({ id: user.id, avatar_url: '' })}
                    alt="ID Only"
                  />
                  <AvatarFallback>
                    {getUserInitials({ full_name: profile.full_name })}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs">ID Only</p>
              </div>
              
              <div className="text-center">
                <Avatar className="h-10 w-10 mx-auto mb-2">
                  <AvatarImage
                    src={getUserAvatarUrl({ id: user.id, avatar_url: profile.avatar_url })}
                    alt="ID + Avatar"
                  />
                  <AvatarFallback>
                    {getUserInitials(profile, user)}
                  </AvatarFallback>
                </Avatar>
                <p className="text-xs">ID + Avatar</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issue Creation Dialog */}
      <CreateIssueDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleIssueCreated}
      />
    </div>
  );
};

export default IssueCreationAvatarTest;
