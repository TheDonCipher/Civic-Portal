import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDemoMode } from '@/providers/DemoProvider';
import MainLayout from '@/components/layout/MainLayout';
import { DemoBanner } from './DemoBanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  Users,
  TrendingUp,
  MessageSquare,
  FileText,
  Calendar,
  MapPin,
  ArrowUpRight,
  Filter,
  Download,
  Building2,
  Search,
  BarChart3,
  Settings,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { departments } from '@/lib/demoData';
import PageTitle from '@/components/common/PageTitle';
import IssueDetailDialog from '@/components/issues/IssueDetailDialog';
import { UIIssue } from '@/types/enhanced';

interface DemoIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  votes: number;
  watchers_count: number;
  location: string | null;
  constituency: string | null;
  thumbnail: string | null;
  author_id: string;
  author_name: string | null;
  author_avatar: string | null;
  created_at: string;
  updated_at: string;
  department_id: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  comments?: Array<{
    id: number;
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    date: string;
  }>;
}

interface DepartmentStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  avgResponseTime: number;
  monthlyResolved: number;
}

const DemoStakeholderDashboard: React.FC = () => {
  const { getDemoIssues, getDemoStats, demoUser } = useDemoMode();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Demo department assignment - simulate official assigned to Health department
  const [selectedDepartment] = useState('health');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<UIIssue | null>(null);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);

  const demoIssues = getDemoIssues();
  const demoStats = getDemoStats();

  // Filter issues by assigned department (Health for demo)
  const departmentIssues = demoIssues.filter(
    (issue: any) => issue.department_id === selectedDepartment
  );

  const departmentInfo = departments.find((d) => d.id === selectedDepartment);
  const departmentStats = demoStats.departmentStats.find(
    (d: any) => d.department === departmentInfo?.name
  );

  // Simulate demo user as official assigned to Health department
  const demoOfficialProfile = {
    role: 'official',
    department_id: selectedDepartment,
    full_name: 'Dr. Sarah Johnson',
    username: 'demo_health_official',
  };

  // Calculate enhanced stats for the selected department
  const calculateDepartmentStats = (issues: any[]): DepartmentStats => {
    const totalIssues = issues.length;
    const openIssues = issues.filter((i: any) => i.status === 'open').length;
    const inProgressIssues = issues.filter(
      (i: any) => i.status === 'in-progress'
    ).length;
    const resolvedIssues = issues.filter(
      (i: any) => i.status === 'resolved' || i.status === 'closed'
    ).length;

    // Use demo data for response time
    const avgResponseTime = departmentStats?.responseTime || 12;

    // Calculate monthly resolved (simulate last 30 days)
    const monthlyResolved = Math.floor(resolvedIssues * 0.3);

    return {
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      avgResponseTime,
      monthlyResolved,
    };
  };

  const currentStats = calculateDepartmentStats(departmentIssues);

  // Simulate status update functionality
  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    setRefreshing(true);

    // Simulate API call delay
    setTimeout(() => {
      toast({
        title: 'Status Updated',
        description: `Issue status updated to ${newStatus} (Demo Mode)`,
        variant: 'default',
      });
      setRefreshing(false);
    }, 1000);
  };

  // Simulate refresh functionality
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      toast({
        title: 'Data Refreshed',
        description: 'Dashboard data has been refreshed (Demo Mode)',
        variant: 'default',
      });
      setRefreshing(false);
    }, 1500);
  };

  // Handle opening issue management dialog
  const handleManageIssue = (issue: DemoIssue) => {
    // Transform DemoIssue to UIIssue format
    const transformedIssue: UIIssue = {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      category: issue.category,
      status: issue.status as 'open' | 'in-progress' | 'resolved',
      votes: issue.votes,
      comments: issue.comments || [],
      date: issue.created_at,
      author: {
        name: issue.author_name || 'Unknown',
        avatar:
          issue.author_avatar ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${issue.author_id}`,
      },
      author_id: issue.author_id,
      thumbnail:
        issue.thumbnail ||
        'https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg',
      location: issue.location || '',
      constituency: issue.constituency || '',
      watchers: issue.watchers_count || 0,
      watchers_count: issue.watchers_count,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      resolved_at: issue.resolved_at || '',
      resolved_by: issue.resolved_by || '',
      department_id: issue.department_id || '',
    };
    setSelectedIssue(transformedIssue);
    setIsIssueDialogOpen(true);
  };

  // Handle closing issue dialog
  const handleCloseIssueDialog = () => {
    setIsIssueDialogOpen(false);
    setSelectedIssue(null);
  };

  // Filter issues based on search and status
  const filteredIssues = departmentIssues.filter((issue: any) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || issue.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <DemoBanner />
      <MainLayout>
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center justify-between">
            <PageTitle
              title={
                departmentInfo
                  ? `${departmentInfo.name} - Issue Management (Demo)`
                  : 'Issue Management Dashboard (Demo)'
              }
              description={
                departmentInfo
                  ? `Managing citizen issues for the ${departmentInfo.name} Department - Demo Mode`
                  : 'Manage government responses to citizen issues - Demo Mode'
              }
              breadcrumbs={[
                { label: 'Demo Home', href: '/demo' },
                { label: 'Issue Management', href: '#' },
                ...(departmentInfo
                  ? [{ label: departmentInfo.name, href: '#' }]
                  : []),
              ]}
            />
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  toast({
                    title: 'Demo Mode',
                    description:
                      'Admin panel is available in the real application',
                    variant: 'default',
                  })
                }
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            </div>
          </div>

          {/* Enhanced Department Info for Demo Official */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Your Department
                </CardTitle>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  Demo Official
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Department
                    </Label>
                    <p className="text-xl font-semibold text-foreground mt-1">
                      {departmentInfo?.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Your Role
                    </Label>
                    <p className="text-lg font-medium text-blue-600 mt-1">
                      Department Official
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Description
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {departmentInfo?.description}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t">
                  <Label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Quick Actions
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto py-3 flex-col gap-1"
                      onClick={() => setActiveTab('open')}
                    >
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs">Review Open</span>
                      <span className="text-xs font-semibold">
                        {currentStats?.openIssues || 0}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto py-3 flex-col gap-1"
                      onClick={() => setActiveTab('in-progress')}
                    >
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-xs">In Progress</span>
                      <span className="text-xs font-semibold">
                        {currentStats?.inProgressIssues || 0}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto py-3 flex-col gap-1"
                      onClick={() => setActiveTab('resolved')}
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-xs">Resolved</span>
                      <span className="text-xs font-semibold">
                        {currentStats?.resolvedIssues || 0}
                      </span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-auto py-3 flex-col gap-1"
                      onClick={() => setActiveTab('overview')}
                    >
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      <span className="text-xs">Overview</span>
                      <span className="text-xs font-semibold">Stats</span>
                    </Button>
                  </div>
                </div>

                {/* Demo Mode Notice */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Demo Mode - Department Filtering
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        You are viewing as an official assigned to{' '}
                        <strong>{departmentInfo?.name}</strong>. In the real
                        application, officials can only manage issues within
                        their assigned department and cannot access other
                        departments' data.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Summary for Demo Official */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                <BarChart3 className="h-5 w-5" />
                {departmentInfo?.name} Performance Summary (Demo)
              </CardTitle>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                Your department's issue management statistics - Demo Mode
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {currentStats.totalIssues > 0
                      ? Math.round(
                          (currentStats.resolvedIssues /
                            currentStats.totalIssues) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Resolution Rate
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {currentStats.resolvedIssues} of {currentStats.totalIssues}{' '}
                    resolved
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {currentStats.inProgressIssues}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Active Issues
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Currently being addressed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                    {currentStats.openIssues}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Pending Review
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Awaiting your action
                  </div>
                </div>
              </div>

              {currentStats.openIssues > 0 ? (
                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      {currentStats.openIssues} issue
                      {currentStats.openIssues > 1 ? 's' : ''} in{' '}
                      {departmentInfo?.name} need
                      {currentStats.openIssues === 1 ? 's' : ''} your attention
                      (Demo)
                    </span>
                  </div>
                </div>
              ) : currentStats.totalIssues > 0 ? (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Great work! All issues in {departmentInfo?.name} are being
                      managed. (Demo)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      No issues have been assigned to {departmentInfo?.name}{' '}
                      yet. (Demo)
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DemoEnhancedStatsCard
              title="Total Issues"
              value={currentStats.totalIssues}
              description="In your department"
              icon={<FileText className="h-4 w-4" />}
              trend={null}
              color="blue"
              onClick={() => setActiveTab('overview')}
            />
            <DemoEnhancedStatsCard
              title="Open Issues"
              value={currentStats.openIssues}
              description="Requiring attention"
              icon={<AlertCircle className="h-4 w-4" />}
              trend={currentStats.openIssues > 0 ? 'urgent' : 'good'}
              color="red"
              onClick={() => setActiveTab('open')}
            />
            <DemoEnhancedStatsCard
              title="In Progress"
              value={currentStats.inProgressIssues}
              description="Currently being addressed"
              icon={<Clock className="h-4 w-4" />}
              trend={currentStats.inProgressIssues > 0 ? 'active' : 'none'}
              color="blue"
              onClick={() => setActiveTab('in-progress')}
            />
            <DemoEnhancedStatsCard
              title="Resolved"
              value={currentStats.resolvedIssues}
              description="Successfully completed"
              icon={<CheckCircle className="h-4 w-4" />}
              trend="positive"
              color="green"
              onClick={() => setActiveTab('resolved')}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <TabsList className="grid w-full md:w-auto grid-cols-4">
                <TabsTrigger
                  value="overview"
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="open" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Open</span>
                  {currentStats?.openIssues > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {currentStats.openIssues}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="in-progress"
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">In Progress</span>
                  {currentStats?.inProgressIssues > 0 && (
                    <Badge variant="default" className="ml-1 text-xs">
                      {currentStats.inProgressIssues}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="resolved"
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Resolved</span>
                  {currentStats?.resolvedIssues > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {currentStats.resolvedIssues}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="text-sm text-muted-foreground">
                Managing issues for{' '}
                <span className="font-medium">{departmentInfo?.name}</span>{' '}
                (Demo)
              </div>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {currentStats.totalIssues > 0
                          ? Math.round(
                              (currentStats.resolvedIssues /
                                currentStats.totalIssues) *
                                100
                            )
                          : 0}
                        %
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Resolution Rate
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {currentStats.monthlyResolved}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Resolved This Month
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {currentStats.avgResponseTime}d
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Avg Response Time
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Issues */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Recent Issues
                      <Button variant="ghost" size="sm">
                        View All <ArrowUpRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {departmentIssues.slice(0, 3).map((issue) => (
                        <div
                          key={issue.id}
                          className="flex items-start gap-4 p-4 border rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">{issue.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {issue.description.substring(0, 100)}...
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {issue.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {issue.votes} votes
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {issue.comments?.length || 0} comments
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant={
                              issue.status === 'open'
                                ? 'destructive'
                                : issue.status === 'in-progress'
                                ? 'default'
                                : 'secondary'
                            }
                          >
                            {issue.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Issue Management Tabs */}
            {['open', 'in-progress', 'resolved'].map((status) => (
              <TabsContent key={status} value={status} className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="capitalize">
                        {status.replace('-', ' ')} Issues
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search issues..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 w-64"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <DemoIssueManagementGrid
                      issues={filteredIssues.filter(
                        (i: any) => i.status === status
                      )}
                      onStatusUpdate={updateIssueStatus}
                      onManageIssue={handleManageIssue}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Issue Detail Dialog for Management */}
        {selectedIssue && (
          <IssueDetailDialog
            open={isIssueDialogOpen}
            onOpenChange={handleCloseIssueDialog}
            issue={selectedIssue}
            isStakeholderMode={true}
            initialTab="updates"
            onStatusUpdate={updateIssueStatus}
          />
        )}
      </MainLayout>
    </>
  );
};

// StatsCard Component
interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

// Demo Issue Management Grid Component
interface DemoIssueManagementGridProps {
  issues: any[];
  onStatusUpdate: (issueId: string, newStatus: string) => void;
  onManageIssue: (issue: any) => void;
}

const DemoIssueManagementGrid: React.FC<DemoIssueManagementGridProps> = ({
  issues,
  onStatusUpdate,
  onManageIssue,
}) => {
  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Great work! There are no issues in this status for your department.
          (Demo Mode)
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {issues.map((issue: any) => (
        <motion.div
          key={issue.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base line-clamp-2">
                    {issue.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={getStatusVariant(issue.status)}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => onManageIssue(issue)}
                    >
                      {issue.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {issue.category}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {issue.description}
              </p>

              <div className="space-y-2 text-xs text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(issue.created_at).toLocaleDateString()}
                </div>
                {issue.location && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {issue.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {issue.votes} votes • {issue.watchers_count} watching
                </div>
              </div>

              {/* Priority indicators for demo official */}
              <div className="flex items-center gap-2 mb-3">
                {issue.status === 'open' && (
                  <Badge variant="destructive" className="text-xs">
                    Needs Review
                  </Badge>
                )}
                {issue.votes && issue.votes > 5 && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                  >
                    High Interest
                  </Badge>
                )}
                {new Date(issue.created_at) >
                  new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Recent
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                >
                  Demo
                </Badge>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <DemoStatusUpdateSelect
                  currentStatus={issue.status}
                  onStatusChange={(newStatus) =>
                    onStatusUpdate(issue.id, newStatus)
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManageIssue(issue)}
                  className="flex-1"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Demo Status Update Select Component
interface DemoStatusUpdateSelectProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const DemoStatusUpdateSelect: React.FC<DemoStatusUpdateSelectProps> = ({
  currentStatus,
  onStatusChange,
}) => {
  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  return (
    <Select value={currentStatus} onValueChange={onStatusChange}>
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Helper function to get status badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'open':
      return 'destructive';
    case 'in-progress':
      return 'default';
    case 'resolved':
    case 'closed':
      return 'secondary';
    default:
      return 'outline';
  }
};

// Demo Enhanced Stats Card Component
interface DemoEnhancedStatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  trend: 'positive' | 'urgent' | 'active' | 'good' | 'none' | null;
  color: 'blue' | 'red' | 'green' | 'yellow';
  onClick?: () => void;
}

const DemoEnhancedStatsCard: React.FC<DemoEnhancedStatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  color,
  onClick,
}) => {
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-red-50 dark:bg-red-950',
          border: 'border-red-200 dark:border-red-800',
          icon: 'text-red-600 dark:text-red-400',
          value: 'text-red-700 dark:text-red-300',
        };
      case 'green':
        return {
          bg: 'bg-green-50 dark:bg-green-950',
          border: 'border-green-200 dark:border-green-800',
          icon: 'text-green-600 dark:text-green-400',
          value: 'text-green-700 dark:text-green-300',
        };
      case 'blue':
        return {
          bg: 'bg-blue-50 dark:bg-blue-950',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'text-blue-600 dark:text-blue-400',
          value: 'text-blue-700 dark:text-blue-300',
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-950',
          border: 'border-yellow-200 dark:border-yellow-800',
          icon: 'text-yellow-600 dark:text-yellow-400',
          value: 'text-yellow-700 dark:text-yellow-300',
        };
      default:
        return {
          bg: 'bg-muted',
          border: 'border-border',
          icon: 'text-muted-foreground',
          value: 'text-foreground',
        };
    }
  };

  const getTrendIndicator = (trend: string | null) => {
    switch (trend) {
      case 'urgent':
        return (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        );
      case 'active':
        return (
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        );
      case 'positive':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      case 'good':
        return <div className="w-2 h-2 bg-green-500 rounded-full" />;
      default:
        return null;
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Card
      className={`${colorClasses.bg} ${
        colorClasses.border
      } transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${colorClasses.icon}`}
            >
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className={`text-2xl font-bold ${colorClasses.value}`}>
                {value}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {getTrendIndicator(trend)}
            {onClick && (
              <div className="text-xs text-muted-foreground">Click to view</div>
            )}
            <Badge
              variant="outline"
              className="text-xs bg-purple-50 text-purple-700 border-purple-200"
            >
              Demo
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  );
};

export default DemoStakeholderDashboard;
