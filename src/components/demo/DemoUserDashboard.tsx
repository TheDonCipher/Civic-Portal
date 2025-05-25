import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDemoMode } from '@/providers/DemoProvider';
import MainLayout from '@/components/layout/MainLayout';
import { DemoBanner } from './DemoBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  MessageSquare,
  Heart,
  Eye,
  Calendar,
  MapPin,
  TrendingUp,
  Award,
  Target,
  Activity,
  Settings,
  Bell,
} from 'lucide-react';

const DemoUserDashboard: React.FC = () => {
  const { demoUser, getDemoUserStats, getDemoUserActivity, getDemoIssues } = useDemoMode();
  const [activeTab, setActiveTab] = useState('overview');

  const userStats = getDemoUserStats(demoUser?.id || 'user-1');
  const userActivity = getDemoUserActivity(demoUser?.id || 'user-1');
  const allIssues = getDemoIssues();
  
  // Get user's issues
  const userIssues = allIssues.filter(issue => issue.author_id === (demoUser?.id || 'user-1'));
  const watchedIssues = allIssues.slice(0, userStats.issuesWatching); // Mock watched issues

  const StatCard = ({ title, value, description, icon, color = 'blue' }: any) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`p-3 rounded-lg bg-${color}-100 text-${color}-600`}>
            {icon}
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-${color}-400 to-${color}-600`} />
      </CardContent>
    </Card>
  );

  const ActivityItem = ({ activity }: { activity: any }) => {
    const getActivityIcon = (type: string) => {
      switch (type) {
        case 'issue_created':
          return <Plus className="h-4 w-4" />;
        case 'comment_posted':
          return <MessageSquare className="h-4 w-4" />;
        case 'issue_supported':
          return <Heart className="h-4 w-4" />;
        case 'issue_watched':
          return <Eye className="h-4 w-4" />;
        case 'solution_offered':
          return <Target className="h-4 w-4" />;
        default:
          return <Activity className="h-4 w-4" />;
      }
    };

    const getActivityColor = (type: string) => {
      switch (type) {
        case 'issue_created':
          return 'bg-blue-100 text-blue-600';
        case 'comment_posted':
          return 'bg-green-100 text-green-600';
        case 'issue_supported':
          return 'bg-red-100 text-red-600';
        case 'issue_watched':
          return 'bg-purple-100 text-purple-600';
        case 'solution_offered':
          return 'bg-orange-100 text-orange-600';
        default:
          return 'bg-gray-100 text-gray-600';
      }
    };

    return (
      <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">{activity.title}</p>
          <p className="text-sm text-muted-foreground">{activity.description}</p>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(activity.date).toLocaleDateString()}
          </div>
        </div>
      </div>
    );
  };

  const IssueCard = ({ issue, type }: { issue: any; type: 'created' | 'watching' }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm line-clamp-2">{issue.title}</h4>
          <Badge
            variant={
              issue.status === 'open' ? 'destructive' :
              issue.status === 'in-progress' ? 'default' : 'secondary'
            }
            className="text-xs"
          >
            {issue.status}
          </Badge>
        </div>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {issue.description}
        </p>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {issue.location}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {issue.votes}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {issue.comments?.length || 0}
            </span>
          </div>
        </div>
        
        {type === 'watching' && (
          <div className="pt-2 border-t">
            <Badge variant="outline" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Watching
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <>
      <DemoBanner />
      <MainLayout>
        <div className="container mx-auto py-6 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
          >
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={demoUser?.avatar_url} alt={demoUser?.full_name} />
                <AvatarFallback>
                  {demoUser?.full_name?.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{demoUser?.full_name}</h1>
                <p className="text-muted-foreground">@{demoUser?.username}</p>
                {demoUser?.constituency && (
                  <Badge variant="outline" className="mt-1">
                    {demoUser.constituency}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="created">My Issues</TabsTrigger>
              <TabsTrigger value="watching">Watching</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
              >
                <StatCard
                  title="Issues Created"
                  value={userStats.issuesCreated}
                  description="Total issues submitted"
                  icon={<Plus className="h-5 w-5" />}
                  color="blue"
                />
                <StatCard
                  title="Issues Watching"
                  value={userStats.issuesWatching}
                  description="Following for updates"
                  icon={<Eye className="h-5 w-5" />}
                  color="purple"
                />
                <StatCard
                  title="Comments Posted"
                  value={userStats.commentsPosted}
                  description="Community engagement"
                  icon={<MessageSquare className="h-5 w-5" />}
                  color="green"
                />
                <StatCard
                  title="Issues Supported"
                  value={userStats.issuesSupported}
                  description="Votes cast"
                  icon={<Heart className="h-5 w-5" />}
                  color="red"
                />
              </motion.div>

              {/* Engagement Level */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Civic Engagement Level
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Active Citizen</span>
                        <Badge variant="default">Level 3</Badge>
                      </div>
                      <Progress value={75} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        You're 25% away from reaching "Community Leader" status. 
                        Keep engaging with civic issues to unlock new features!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recent Activity Preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Activity
                      <Button variant="ghost" size="sm" onClick={() => setActiveTab('activity')}>
                        View All
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userActivity.slice(0, 3).map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="created" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Issues I've Created ({userIssues.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {userIssues.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} type="created" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="watching" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Issues I'm Watching ({watchedIssues.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {watchedIssues.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} type="watching" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Activity History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userActivity.map((activity) => (
                        <ActivityItem key={activity.id} activity={activity} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </>
  );
};

export default DemoUserDashboard;
