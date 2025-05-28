import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Mail,
  MapPin,
  Calendar,
  Settings,
  Crown,
  CreditCard,
} from 'lucide-react';
import IssueGrid from '../issues/IssueGrid';
import ProfileSettings from './ProfileSettings';
import {
  SubscriptionStatusIndicator,
  QuickSubscriptionInfo,
} from '@/components/subscription';
import { useDemoMode } from '@/providers/DemoProvider';
import { getUserInitials, getUserRoleDisplay } from '@/lib/utils/userUtils';
import type { Issue } from '../issues/IssueGrid';
import { useAuth } from '@/lib/auth';

export interface UserProfileProps {
  user: {
    name: string;
    avatar: string;
    banner_url?: string;
    email: string;
    role: string;
    joinDate: string;
    issuesCreated: Issue[];
    issuesWatching: Issue[];
    issuesSolved?: Issue[];
    isRealUser?: boolean;
  };
  onIssueClick: (issue: Issue) => void;
  onCreateIssue: () => void;
  onDeleteIssue?: (issueId: string) => void;
  settingsMode?: boolean;
}

export const UserProfile = ({
  user,
  onIssueClick,
  onCreateIssue,
  onDeleteIssue,
  settingsMode = false,
}: UserProfileProps) => {
  const [activeTab, setActiveTab] = useState(
    settingsMode ? 'settings' : 'created'
  );
  const { user: authUser } = useAuth ? useAuth() : { user: null };
  const { isDemoMode } = useDemoMode();
  const isCurrentUser = Boolean(authUser?.id && user.isRealUser);

  // Mock subscription data for demo/development
  const mockSubscriptionData = {
    tier:
      user.role === 'official'
        ? 'kgotla'
        : user.role === 'admin'
        ? 'tlhaloso'
        : user.role === 'business'
        ? 'tirisano'
        : 'motse',
    status: 'active' as const,
    nextBillingDate: '2024-02-01',
    amount:
      user.role === 'official'
        ? 750
        : user.role === 'admin'
        ? 2000
        : user.role === 'business'
        ? 500
        : 0,
    currency: 'BWP',
    billingCycle: user.role === 'citizen' ? 'forever' : 'monthly',
  };

  // Process user issues to ensure no duplicates
  const userWithIssues = {
    ...user,
    // Only add mock issue for demo users, NOT for real users
    issuesCreated: user.isRealUser
      ? [...user.issuesCreated]
      : user.issuesCreated,
    // Make sure we don't have duplicate issues between created and watching
    issuesWatching: user.issuesWatching.filter(
      (watchedIssue) =>
        !user.issuesCreated.some(
          (createdIssue) => createdIssue.id === watchedIssue.id
        )
    ),
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6" data-testid="user-profile">
      <Card className="overflow-hidden">
        <div
          className="h-32 bg-gradient-to-r from-primary/10 to-primary/5 bg-cover bg-center"
          style={{
            backgroundImage: user.banner_url
              ? `url(${user.banner_url})`
              : user.role === 'citizen'
              ? 'url(https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=300&fit=crop&crop=center)'
              : undefined,
          }}
        />
        <CardContent className="relative pt-16 pb-8 px-6 -mt-12">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar
              className="h-24 w-24 border-4 border-background"
              data-testid="user-avatar"
            >
              <AvatarImage
                src={userWithIssues.avatar}
                alt={userWithIssues.name}
              />
              <AvatarFallback>
                {getUserInitials({ full_name: userWithIssues.name })}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold" data-testid="user-name">
                  {userWithIssues.name}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="text-sm"
                    data-testid="user-role"
                  >
                    {getUserRoleDisplay({ role: userWithIssues.role as any })}
                  </Badge>
                  {/* Subscription Tier Badge */}
                  <SubscriptionStatusIndicator
                    tier={mockSubscriptionData.tier as any}
                    status={mockSubscriptionData.status}
                    variant="compact"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                <div
                  className="flex items-center gap-2"
                  data-testid="user-email"
                >
                  <Mail className="h-4 w-4" />
                  {userWithIssues.email}
                </div>
                <div
                  className="flex items-center gap-2"
                  data-testid="user-join-date"
                >
                  <Calendar className="h-4 w-4" />
                  Joined{' '}
                  {new Date(userWithIssues.joinDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Subscription Quick Info - Only for current user */}
            {isCurrentUser && (
              <div className="md:ml-auto">
                <QuickSubscriptionInfo
                  tier={mockSubscriptionData.tier as any}
                  status={mockSubscriptionData.status}
                  nextBillingDate={mockSubscriptionData.nextBillingDate}
                  amount={mockSubscriptionData.amount}
                  currency={mockSubscriptionData.currency}
                  onManageClick={() => (window.location.href = '/subscription')}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
            data-testid="user-tabs"
          >
            <TabsList>
              {!settingsMode && (
                <>
                  <TabsTrigger value="created" data-testid="created-issues-tab">
                    Issues Created
                  </TabsTrigger>
                  <TabsTrigger
                    value="watching"
                    data-testid="watching-issues-tab"
                  >
                    Issues Watching
                  </TabsTrigger>
                  {user.issuesSolved && user.issuesSolved.length > 0 && (
                    <TabsTrigger value="solved" data-testid="solved-issues-tab">
                      Issues Solved
                    </TabsTrigger>
                  )}
                </>
              )}
              {isCurrentUser && !settingsMode && (
                <>
                  <TabsTrigger
                    value="subscription"
                    data-testid="subscription-tab"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Subscription
                  </TabsTrigger>
                  <TabsTrigger value="settings" data-testid="settings-tab">
                    Settings
                  </TabsTrigger>
                </>
              )}
              {settingsMode && (
                <TabsTrigger value="settings" data-testid="settings-tab">
                  Settings
                </TabsTrigger>
              )}
            </TabsList>

            {!settingsMode && (
              <>
                <TabsContent
                  value="created"
                  data-testid="created-issues-content"
                >
                  <div className="flex justify-end mb-4">
                    <Button
                      onClick={onCreateIssue}
                      className="flex items-center gap-2"
                      data-testid="create-issue-button"
                    >
                      <Plus className="h-4 w-4" />
                      Report Issue
                    </Button>
                  </div>

                  {userWithIssues.issuesCreated.length > 0 ? (
                    <IssueGrid
                      issues={userWithIssues.issuesCreated}
                      onIssueClick={onIssueClick}
                      onDelete={isCurrentUser ? onDeleteIssue : undefined}
                      showDeleteButton={isCurrentUser}
                      compact
                    />
                  ) : (
                    <div
                      className="text-center py-12 border border-dashed rounded-lg"
                      data-testid="no-created-issues"
                    >
                      <p className="text-muted-foreground">
                        You haven't created any issues yet.
                      </p>
                      <Button onClick={onCreateIssue} className="mt-4">
                        Report Your First Issue
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent
                  value="watching"
                  data-testid="watching-issues-content"
                >
                  {userWithIssues.issuesWatching.length > 0 ? (
                    <IssueGrid
                      issues={userWithIssues.issuesWatching}
                      onIssueClick={onIssueClick}
                      compact
                    />
                  ) : (
                    <div
                      className="text-center py-12 border border-dashed rounded-lg"
                      data-testid="no-watching-issues"
                    >
                      <p className="text-muted-foreground">
                        You're not watching any issues yet.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('created')}
                        className="mt-4"
                      >
                        Browse Issues
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {user.issuesSolved && (
                  <TabsContent
                    value="solved"
                    data-testid="solved-issues-content"
                  >
                    {user.issuesSolved.length > 0 ? (
                      <IssueGrid
                        issues={user.issuesSolved}
                        onIssueClick={onIssueClick}
                        compact
                      />
                    ) : (
                      <div
                        className="text-center py-12 border border-dashed rounded-lg"
                        data-testid="no-solved-issues"
                      >
                        <p className="text-muted-foreground">
                          {user.role === 'official'
                            ? "You haven't marked any issues as resolved yet."
                            : "You don't have any solved issues yet."}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                )}
              </>
            )}

            {isCurrentUser && (
              <>
                <TabsContent
                  value="subscription"
                  data-testid="subscription-content"
                >
                  <div className="space-y-6">
                    {/* Current Subscription Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Crown className="h-5 w-5" />
                          Current Subscription
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SubscriptionStatusIndicator
                          tier={mockSubscriptionData.tier as any}
                          status={mockSubscriptionData.status}
                          variant="detailed"
                          showUpgradePrompt={
                            mockSubscriptionData.tier === 'motse'
                          }
                          onUpgradeClick={() =>
                            (window.location.href = '/pricing')
                          }
                        />
                      </CardContent>
                    </Card>

                    {/* Billing Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Billing Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Next Billing Date
                            </label>
                            <p className="text-lg font-semibold">
                              {new Date(
                                mockSubscriptionData.nextBillingDate
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-muted-foreground">
                              Amount
                            </label>
                            <p className="text-lg font-semibold">
                              {mockSubscriptionData.currency}{' '}
                              {mockSubscriptionData.amount}
                              <span className="text-sm text-muted-foreground ml-1">
                                /{mockSubscriptionData.billingCycle}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              (window.location.href = '/subscription')
                            }
                          >
                            Manage Subscription
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => (window.location.href = '/pricing')}
                          >
                            View Plans
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="settings" data-testid="settings-content">
                  <ProfileSettings onUpdate={() => setActiveTab('created')} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
