import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConsentStatusBanner } from '@/components/auth/ConsentStatusBanner';
import { ConsentProtectedRoute } from '@/components/auth/ConsentProtectedRoute';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  SubscriptionStatusIndicator,
  SubscriptionFeatureGate,
} from '@/components/subscription';
import { useDemoMode } from '@/providers/DemoProvider';
import { getDemoSubscriptionData } from '@/lib/demoData';
import MainLayout from '../layout/MainLayout';
import PageTitle from '../common/PageTitle';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { getUserInitials } from '@/lib/utils/userUtils';
import {
  Settings,
  FileText,
  BarChart3,
  Plus,
  Eye,
  MessageSquare,
  Heart,
  Calendar,
  MapPin,
  Users,
  Mail,
  Crown,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface UserStats {
  issuesCreated: number;
  issuesWatching: number;
  commentsPosted: number;
  issuesSupported: number;
}

interface RecentActivity {
  id: string;
  type:
    | 'issue_created'
    | 'comment_posted'
    | 'issue_supported'
    | 'issue_watched'
    | 'solution_offered';
  title: string;
  description: string;
  date: string;
  issueId?: string;
}

const UserDashboard = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, profile } = useAuth();
  const { isDemoMode } = useDemoMode();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { avatarUrl } = useUserAvatar(user?.id);
  const [userStats, setUserStats] = useState<UserStats>({
    issuesCreated: 0,
    issuesWatching: 0,
    commentsPosted: 0,
    issuesSupported: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnDashboard, setIsOwnDashboard] = useState(false);

  // Get subscription data - use demo data in demo mode, otherwise mock data
  const getSubscriptionData = () => {
    if (isDemoMode && user?.id) {
      return getDemoSubscriptionData(user.id);
    }

    // Enhanced fallback mock data for Mmogo Impact Ecosystem
    return {
      tier:
        profile?.role === 'official'
          ? 'kgotla'
          : profile?.role === 'admin'
          ? 'tlhaloso'
          : profile?.role === 'business'
          ? 'tirisano'
          : 'motse',
      status: 'active' as const,
      nextBillingDate: '2024-02-01',
      amount:
        profile?.role === 'official'
          ? 750
          : profile?.role === 'admin'
          ? 2000
          : profile?.role === 'business'
          ? 500
          : 0,
      currency: 'BWP',
      billingCycle: profile?.role === 'citizen' ? 'forever' : 'monthly',
      usageLimit:
        profile?.role === 'official'
          ? 100
          : profile?.role === 'business'
          ? 50
          : 10,
      currentUsage: userStats.issuesCreated + userStats.commentsPosted,
      tierLevel: profile?.role === 'official' ? 'ward' : undefined,
    };
  };

  const mockSubscriptionData = getSubscriptionData();

  useEffect(() => {
    // Check if this is the user's own dashboard
    if (user && userId === user.id) {
      setIsOwnDashboard(true);
    } else if (user && userId !== user.id) {
      // User is trying to access someone else's dashboard
      toast({
        title: 'Access Denied',
        description: 'You can only access your own dashboard',
        variant: 'destructive',
      });
      navigate(`/user/${user.id}`);
      return;
    } else if (!user) {
      // User is not authenticated
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to access your dashboard',
        variant: 'destructive',
      });
      navigate('/?signin=true');
      return;
    }

    fetchUserStats();
    fetchRecentActivity();
  }, [userId, user, navigate, toast]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch issues created by user
      const { count: issuesCreated } = await supabase
        .from('issues')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id);

      // Fetch issues user is watching
      const { count: issuesWatching } = await supabase
        .from('issue_watchers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Fetch comments posted by user
      const { count: commentsPosted } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id);

      // Fetch issues user has supported (voted for)
      const { count: issuesSupported } = await supabase
        .from('issue_votes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setUserStats({
        issuesCreated: issuesCreated || 0,
        issuesWatching: issuesWatching || 0,
        commentsPosted: commentsPosted || 0,
        issuesSupported: issuesSupported || 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    if (!user) return;

    try {
      // Fetch recent issues created
      const { data: recentIssues } = await supabase
        .from('issues')
        .select('id, title, created_at')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent comments
      const { data: recentComments } = await supabase
        .from('comments')
        .select('id, content, created_at, issue_id, issues(title)')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent solutions offered
      const { data: recentSolutions } = await supabase
        .from('solutions')
        .select('id, title, created_at, issue_id, issues(title)')
        .eq('proposed_by', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent votes (issue support) - simplified query
      const { data: recentVotes } = await supabase
        .from('issue_votes')
        .select('created_at, issue_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Fetch recent watches - simplified query
      const { data: recentWatches } = await supabase
        .from('issue_watchers')
        .select('created_at, issue_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      const activities: RecentActivity[] = [];

      // Add recent issues
      recentIssues?.forEach((issue) => {
        activities.push({
          id: `issue-${issue.id}`,
          type: 'issue_created',
          title: 'Created new issue',
          description: issue.title,
          date: issue.created_at || new Date().toISOString(),
          issueId: issue.id,
        });
      });

      // Add recent comments
      recentComments?.forEach((comment) => {
        activities.push({
          id: `comment-${comment.id}`,
          type: 'comment_posted',
          title: 'Posted a comment',
          description: `On: ${
            (comment.issues as any)?.title || 'Unknown issue'
          }`,
          date: comment.created_at || new Date().toISOString(),
          issueId: comment.issue_id,
        });
      });

      // Add recent solutions
      recentSolutions?.forEach((solution) => {
        activities.push({
          id: `solution-${solution.id}`,
          type: 'solution_offered',
          title: 'Offered a solution',
          description: `${solution.title} for: ${
            (solution.issues as any)?.title || 'Unknown issue'
          }`,
          date: solution.created_at || new Date().toISOString(),
          issueId: solution.issue_id,
        });
      });

      // Add recent votes
      recentVotes?.forEach((vote, index) => {
        activities.push({
          id: `vote-${vote.issue_id}-${index}`,
          type: 'issue_supported',
          title: 'Supported an issue',
          description: 'Voted for an issue',
          date: vote.created_at || new Date().toISOString(),
          issueId: vote.issue_id,
        });
      });

      // Add recent watches
      recentWatches?.forEach((watch, index) => {
        activities.push({
          id: `watch-${watch.issue_id}-${index}`,
          type: 'issue_watched',
          title: 'Started watching',
          description: 'Now following an issue',
          date: watch.created_at || new Date().toISOString(),
          issueId: watch.issue_id,
        });
      });

      // Sort by date and take the most recent 5
      activities.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'issue_created':
        return <Plus className="h-4 w-4 text-blue-500" />;
      case 'comment_posted':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'issue_supported':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'issue_watched':
        return <Eye className="h-4 w-4 text-purple-500" />;
      case 'solution_offered':
        return <BarChart3 className="h-4 w-4 text-orange-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MainLayout>
      <PageTitle
        title={
          isOwnDashboard ? 'My Dashboard' : `${profile.full_name}'s Dashboard`
        }
        description={
          isOwnDashboard
            ? "Welcome back! Here's your civic engagement overview."
            : 'User dashboard'
        }
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Dashboard', href: '#' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/user/${user.id}/issues?create=true`)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/user/${user.id}/issues`)}
            >
              <FileText className="mr-2 h-4 w-4" />
              My Issues
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/user/${user.id}/profile`)}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        }
      />

      <ConsentProtectedRoute
        showBanner={true}
        enhancedUX={true}
        showProgress={true}
        recoveryScenario="partial_signup"
      >
        <div className="container mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 mobile-padding">
          {/* User Profile Card */}
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <Avatar className="h-16 w-16 mx-auto sm:mx-0">
                  <AvatarImage
                    src={avatarUrl}
                    alt={profile?.full_name || 'User'}
                  />
                  <AvatarFallback>
                    {getUserInitials(profile, user)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center sm:text-left w-full">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    {profile.full_name || 'User'}
                  </h2>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-2 sm:space-y-0 sm:space-x-2">
                    <Badge variant="secondary">
                      {profile.role === 'citizen'
                        ? 'Citizen'
                        : profile.role === 'official'
                        ? 'Government Official'
                        : 'Administrator'}
                    </Badge>
                    {profile.constituency && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {profile.constituency}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-center sm:justify-start text-sm text-muted-foreground">
                    <Mail className="mr-1 h-3 w-3" />
                    <span className="truncate">
                      {user?.email ||
                        user?.user_metadata?.['email'] ||
                        'No email provided'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Member since{' '}
                    {new Date(user.created_at || '').toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Issues Created
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : userStats.issuesCreated}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total issues you've reported
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Issues Watching
                </CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : userStats.issuesWatching}
                </div>
                <p className="text-xs text-muted-foreground">
                  Issues you're following
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Comments Posted
                </CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : userStats.commentsPosted}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your community contributions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Issues Supported
                </CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : userStats.issuesSupported}
                </div>
                <p className="text-xs text-muted-foreground">
                  Issues you've voted for
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Status Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Subscription Status</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/subscription')}
              >
                <Crown className="h-4 w-4 mr-2" />
                Manage
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Current Subscription Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SubscriptionStatusIndicator
                    tier={mockSubscriptionData.tier as any}
                    status={mockSubscriptionData.status}
                    variant="detailed"
                    showUpgradePrompt={mockSubscriptionData.tier === 'motse'}
                    onUpgradeClick={() => navigate('/pricing')}
                    tierLevel={mockSubscriptionData.tierLevel}
                    showMmogoContext={true}
                  />
                </CardContent>
              </Card>

              {/* Usage & Limits Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Usage & Limits
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Monthly Activity</span>
                      <span>
                        {mockSubscriptionData.currentUsage} /{' '}
                        {mockSubscriptionData.usageLimit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (mockSubscriptionData.currentUsage /
                              mockSubscriptionData.usageLimit) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <p>
                      Next billing:{' '}
                      {new Date(
                        mockSubscriptionData.nextBillingDate
                      ).toLocaleDateString()}
                    </p>
                    <p>
                      Amount: {mockSubscriptionData.currency}{' '}
                      {mockSubscriptionData.amount}/
                      {mockSubscriptionData.billingCycle}
                    </p>
                  </div>

                  {mockSubscriptionData.currentUsage /
                    mockSubscriptionData.usageLimit >
                    0.8 && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">
                        You're approaching your usage limit. Consider upgrading.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="quick-actions">Quick Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-3 p-3 rounded-lg bg-muted/50"
                        >
                          {getActivityIcon(activity.type)}
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">
                              {activity.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                          {activity.issueId && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(
                                  `/user/${user.id}/issues?highlight=${activity.issueId}`
                                )
                              }
                            >
                              View
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-sm font-semibold">
                        No recent activity
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Start engaging with civic issues to see your activity
                        here.
                      </p>
                      <div className="mt-6">
                        <Button
                          onClick={() => navigate(`/user/${user.id}/issues`)}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Issue
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quick-actions" className="space-y-4">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() =>
                    navigate(`/user/${user.id}/issues?create=true`)
                  }
                >
                  {' '}
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Plus className="h-5 w-5" />
                      <span>Report New Issue</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Report a civic issue in your community
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/user/${user.id}/issues`)}
                >
                  {' '}
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="h-5 w-5" />
                      <span>Browse Issues</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Explore and support community issues
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/reports')}
                >
                  {' '}
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>View Reports</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Check community progress and statistics
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ConsentProtectedRoute>
    </MainLayout>
  );
};

export default UserDashboard;
