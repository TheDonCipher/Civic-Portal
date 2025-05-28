import React from 'react';
import { useAuth } from '@/lib/auth';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getUserInitials, getUserDisplayName } from '@/lib/utils/userUtils';

/**
 * Test component to verify avatar consistency across the application
 * This component can be temporarily added to any page to test avatar functionality
 */
export const AvatarTestComponent: React.FC = () => {
  const { user, profile } = useAuth();
  const { avatarUrl, refresh } = useUserAvatar(user?.id);

  if (!user || !profile) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Avatar Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Please sign in to test avatar functionality</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Avatar Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current User Avatar */}
        <div className="space-y-2">
          <h3 className="font-semibold">Current User Avatar</h3>
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
              <p className="text-sm text-muted-foreground">
                {profile.role || 'citizen'}
              </p>
            </div>
          </div>
        </div>

        {/* Avatar URL Info */}
        <div className="space-y-2">
          <h3 className="font-semibold">Avatar URL</h3>
          <p className="text-xs text-muted-foreground break-all">
            {avatarUrl}
          </p>
        </div>

        {/* Profile Data */}
        <div className="space-y-2">
          <h3 className="font-semibold">Profile Data</h3>
          <div className="text-xs space-y-1">
            <p><strong>Profile Avatar URL:</strong> {profile.avatar_url || 'None'}</p>
            <p><strong>User Metadata Avatar:</strong> {user.user_metadata?.avatar_url || 'None'}</p>
            <p><strong>Full Name:</strong> {profile.full_name || 'None'}</p>
            <p><strong>Username:</strong> {profile.username || 'None'}</p>
          </div>
        </div>

        {/* Test Actions */}
        <div className="space-y-2">
          <h3 className="font-semibold">Test Actions</h3>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
            >
              Refresh Avatar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('refreshProfile'));
              }}
            >
              Trigger Profile Refresh
            </Button>
          </div>
        </div>

        {/* Multiple Avatar Sizes */}
        <div className="space-y-2">
          <h3 className="font-semibold">Avatar Sizes</h3>
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={avatarUrl} alt="Small" />
              <AvatarFallback className="text-xs">
                {getUserInitials(profile, user)}
              </AvatarFallback>
            </Avatar>
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarUrl} alt="Medium" />
              <AvatarFallback className="text-sm">
                {getUserInitials(profile, user)}
              </AvatarFallback>
            </Avatar>
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl} alt="Large" />
              <AvatarFallback>
                {getUserInitials(profile, user)}
              </AvatarFallback>
            </Avatar>
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl} alt="Extra Large" />
              <AvatarFallback>
                {getUserInitials(profile, user)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarTestComponent;
