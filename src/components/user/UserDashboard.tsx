import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import PageTitle from "../common/PageTitle";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  User,
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
} from "lucide-react";

interface UserStats {
  issuesCreated: number;
  issuesWatching: number;
  commentsPosted: number;
  issuesSupported: number;
}

interface RecentActivity {
  id: string;
  type:
    | "issue_created"
    | "comment_posted"
    | "issue_supported"
    | "issue_watched";
  title: string;
  description: string;
  date: string;
  issueId?: string;
}

const UserDashboard = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userStats, setUserStats] = useState<UserStats>({
    issuesCreated: 0,
    issuesWatching: 0,
    commentsPosted: 0,
    issuesSupported: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnDashboard, setIsOwnDashboard] = useState(false);

  useEffect(() => {
    // Check if this is the user's own dashboard
    if (user && userId === user.id) {
      setIsOwnDashboard(true);
    } else if (user && userId !== user.id) {
      // User is trying to access someone else's dashboard
      toast({
        title: "Access Denied",
        description: "You can only access your own dashboard",
        variant: "destructive",
      });
      navigate(`/user/${user.id}`);
      return;
    } else if (!user) {
      // User is not authenticated
      toast({
        title: "Authentication Required",
        description: "Please sign in to access your dashboard",
        variant: "destructive",
      });
      navigate("/?signin=true");
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
        .from("issues")
        .select("*", { count: "exact", head: true })
        .eq("author_id", user.id);

      // Fetch issues user is watching
      const { count: issuesWatching } = await supabase
        .from("issue_watchers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Fetch comments posted by user
      const { count: commentsPosted } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("author_id", user.id);

      // Fetch issues user has supported (voted for)
      const { count: issuesSupported } = await supabase
        .from("issue_votes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setUserStats({
        issuesCreated: issuesCreated || 0,
        issuesWatching: issuesWatching || 0,
        commentsPosted: commentsPosted || 0,
        issuesSupported: issuesSupported || 0,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive",
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
        .from("issues")
        .select("id, title, created_at")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      // Fetch recent comments
      const { data: recentComments } = await supabase
        .from("comments")
        .select("id, content, created_at, issue_id, issues(title)")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false })
        .limit(3);

      const activities: RecentActivity[] = [];

      // Add recent issues
      recentIssues?.forEach((issue) => {
        activities.push({
          id: `issue-${issue.id}`,
          type: "issue_created",
          title: "Created new issue",
          description: issue.title,
          date: new Date(issue.created_at).toLocaleDateString(),
          issueId: issue.id,
        });
      });

      // Add recent comments
      recentComments?.forEach((comment) => {
        activities.push({
          id: `comment-${comment.id}`,
          type: "comment_posted",
          title: "Posted a comment",
          description: `On: ${(comment.issues as any)?.title || "Unknown issue"}`,
          date: new Date(comment.created_at).toLocaleDateString(),
          issueId: comment.issue_id,
        });
      });

      // Sort by date and take the most recent 5
      activities.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error("Error fetching recent activity:", error);
    }
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "issue_created":
        return <Plus className="h-4 w-4 text-blue-500" />;
      case "comment_posted":
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case "issue_supported":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "issue_watched":
        return <Eye className="h-4 w-4 text-purple-500" />;
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
    <div className="bg-background min-h-screen">
      <PageTitle
        title={
          isOwnDashboard ? "My Dashboard" : `${profile.full_name}'s Dashboard`
        }
        description={
          isOwnDashboard
            ? "Welcome back! Here's your civic engagement overview."
            : "User dashboard"
        }
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Dashboard", href: "#" },
        ]}
        actions={
          <div className="flex gap-2">
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

      <div className="container mx-auto py-6 space-y-6">
        {/* User Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={profile.avatar_url || ""}
                  alt={profile.full_name || ""}
                />
                <AvatarFallback>
                  {profile.full_name?.charAt(0) || user.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-bold">
                  {profile.full_name || "User"}
                </h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">
                    {profile.role === "citizen"
                      ? "Citizen"
                      : profile.role === "official"
                        ? "Government Official"
                        : "Administrator"}
                  </Badge>
                  {profile.constituency && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-3 w-3" />
                      {profile.constituency}
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Member since{" "}
                  {new Date(user.created_at || "").toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Issues Created
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : userStats.issuesCreated}
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
                {loading ? "..." : userStats.issuesWatching}
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
                {loading ? "..." : userStats.commentsPosted}
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
                {loading ? "..." : userStats.issuesSupported}
              </div>
              <p className="text-xs text-muted-foreground">
                Issues you've voted for
              </p>
            </CardContent>
          </Card>
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
                            {activity.date}
                          </p>
                        </div>
                        {activity.issueId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/user/${user.id}/issues?highlight=${activity.issueId}`,
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/user/${user.id}/issues`)}
              >
                {" "}
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
                {" "}
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
                onClick={() => navigate(`/user/${user.id}/reports`)}
              >
                {" "}
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
    </div>
  );
};

export default UserDashboard;
