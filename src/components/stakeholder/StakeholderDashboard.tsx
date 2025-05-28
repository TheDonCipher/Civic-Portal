import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { getDepartmentStats, getBudgetAllocations } from '@/lib/api/statsApi';
import {
  getIssuesByDepartment,
  updateIssueStatus,
} from '@/lib/api/enhancedIssues';
import {
  getCategoriesByDepartment,
  getCategoryStats,
} from '@/lib/api/categoriesApi';
import {
  fetchIssues,
  updateIssueStatus as updateIssueStatusApi,
} from '@/lib/api/issuesApi';
import {
  getUserDisplayName,
  getUserAvatarUrl,
  getUserInitials,
} from '@/lib/utils/userUtils';
import { SubscriptionFeatureGate } from '@/components/subscription';
import VerificationPending from '@/components/auth/VerificationPending';
import MainLayout from '../layout/MainLayout';
import PageTitle from '../common/PageTitle';
import IssueCard from '../issues/IssueCard';
import IssueDetailDialog from '../issues/IssueDetailDialog';
import type { UIIssue, DepartmentWithStats } from '@/types/enhanced';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Building2,
  Filter,
  Search,
  TrendingUp,
  MessageSquare,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  RefreshCw,
  Shield,
  Crown,
} from 'lucide-react';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  votes: number | null;
  watchers_count: number | null;
  location: string | null;
  constituency: string | null;
  thumbnail: string | null;
  author_id: string;
  author_name: string | null;
  author_avatar: string | null;
  created_at: string | null;
  updated_at: string | null;
  department_id?: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
}

interface Department {
  id: string;
  name: string;
  description: string | null;
}

interface DepartmentStats {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  avgResponseTime: number | string;
  monthlyResolved: number;
  budgetAllocated?: number;
  budgetSpent?: number;
  budgetUtilization?: number;
}

interface BudgetAllocation {
  id: string;
  category: string;
  allocated_amount: number;
  spent_amount: number;
  fiscal_year: number;
  description?: string;
  departments?: {
    id: string;
    name: string;
  };
}

// Helper function to convert Issue to UIIssue
const convertIssueToUIIssue = (issue: Issue): UIIssue => {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    category: issue.category,
    status: issue.status as 'open' | 'in-progress' | 'resolved',
    votes: issue.votes || 0,
    comments: [], // Empty array for now, would need to fetch separately
    date: issue.created_at || new Date().toISOString(),
    author: {
      name: issue.author_name || 'Unknown',
      avatar: issue.author_avatar || '', // Will be dynamically fetched by getUserAvatarUrl
    },
    author_id: issue.author_id,
    thumbnail: issue.thumbnail || '',
    location: issue.location || '',
    constituency: issue.constituency || '',
    watchers: issue.watchers_count || 0,
    watchers_count: issue.watchers_count || 0,
    created_at: issue.created_at || new Date().toISOString(),
    updated_at: issue.updated_at || new Date().toISOString(),
    resolved_at: issue.resolved_at || '',
    resolved_by: issue.resolved_by || '',
    department_id: issue.department_id || '',
  };
};

const StakeholderDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State declarations - must be before any early returns
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);

  // Data states
  const [issues, setIssues] = useState<Issue[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentStats, setDepartmentStats] =
    useState<DepartmentStats | null>(null);
  const [allStats, setAllStats] = useState<DepartmentStats | null>(null);
  const [budgetAllocations, setBudgetAllocations] = useState<
    BudgetAllocation[]
  >([]);
  const [categoryStats, setCategoryStats] = useState<any>({});

  // Derived state
  const selectedDepartmentInfo = departments.find(
    (d) => d.id === selectedDepartment
  );

  // Access control - only allow officials and admins
  if (profile && profile.role !== 'official' && profile.role !== 'admin') {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                <p className="text-muted-foreground">
                  You don't have permission to access the stakeholder dashboard.
                  This area is restricted to government officials and
                  administrators.
                </p>
                <Button className="mt-4" onClick={() => navigate('/')}>
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Verification check for officials (admins bypass this check)
  if (
    profile &&
    profile.role === 'official' &&
    profile.verification_status !== 'verified'
  ) {
    const handleContactSupport = () => {
      window.open(
        'mailto:support@civicportal.gov.bw?subject=Account Verification Support&body=Hello,%0D%0A%0D%0AI need assistance with my account verification.%0D%0A%0D%0AUser ID: ' +
          user?.id +
          '%0D%0AName: ' +
          (profile.full_name || 'Not provided') +
          '%0D%0AEmail: ' +
          (user?.email || 'Not provided') +
          '%0D%0ADepartment: ' +
          (selectedDepartmentInfo?.name || 'Not assigned') +
          '%0D%0A%0D%0AThank you.',
        '_blank'
      );
    };

    const handleReturnHome = () => {
      navigate('/');
    };

    const getVerificationStatusMessage = () => {
      switch (profile.verification_status) {
        case 'pending':
          return {
            title: 'Account Verification Pending',
            message:
              'Your government official account is currently under review. You will receive a notification once your verification is complete.',
            icon: '⏳',
            color: 'text-yellow-600',
          };
        case 'rejected':
          return {
            title: 'Account Verification Rejected',
            message:
              profile.verification_status === 'rejected'
                ? `Your verification was not approved. Please contact support for more information.`
                : 'Your verification was not approved. Please contact support for more information.',
            icon: '❌',
            color: 'text-red-600',
          };
        default:
          return {
            title: 'Account Verification Required',
            message:
              'Your account requires verification to access the stakeholder dashboard.',
            icon: '🔒',
            color: 'text-gray-600',
          };
      }
    };

    const statusInfo = getVerificationStatusMessage();

    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-6xl mb-4 ${statusInfo.color}`}>
                  {statusInfo.icon}
                </div>
                <h2 className="text-xl font-semibold mb-2">
                  {statusInfo.title}
                </h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {statusInfo.message}
                </p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={handleReturnHome}>
                    Return to Home
                  </Button>
                  <Button onClick={handleContactSupport}>
                    Contact Support
                  </Button>
                </div>
                {profile.verification_status === 'pending' && (
                  <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-800">
                      <strong>What happens next?</strong>
                      <br />
                      Our administrators will review your account and verify
                      your government official status. This process typically
                      takes 1-2 business days. You'll receive a notification
                      once your account is verified.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Set default department based on user's assignment
  useEffect(() => {
    if (profile?.department_id && !selectedDepartment) {
      setSelectedDepartment(profile.department_id);
    }
  }, [profile, selectedDepartment]);

  // Function to handle department change - restricted for stakeholders
  const handleDepartmentChange = (departmentId: string) => {
    // Only allow admins to change departments
    if (profile?.role === 'admin') {
      setSelectedDepartment(departmentId);
    } else {
      toast({
        title: 'Access Restricted',
        description:
          'You can only manage issues within your assigned department.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (profile) {
      fetchInitialData();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedDepartment && profile) {
      fetchDepartmentData();
    } else if (profile?.role === 'admin') {
      fetchAllData();
    }
  }, [selectedDepartment, profile]);

  // Set up real-time subscriptions for dashboard updates
  useEffect(() => {
    if (!user || !profile) return;

    // Subscribe to issues table changes
    const issuesSubscription = supabase
      .channel('stakeholder-issues-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues',
        },
        (payload) => {
          console.log('Issues table change detected:', payload);
          // Refresh data when issues change
          if (selectedDepartment) {
            fetchDepartmentData();
          } else {
            fetchAllData();
          }
        }
      )
      .subscribe();

    // Subscribe to updates table changes for real-time latest updates
    const updatesSubscription = supabase
      .channel('stakeholder-updates-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'updates',
        },
        (payload) => {
          console.log('New update detected:', payload);
          // Show notification for new updates
          if (payload.new && payload.new['author_id'] !== user.id) {
            toast({
              title: 'New Update',
              description: 'An issue has been updated',
              variant: 'default',
            });
          }
        }
      )
      .subscribe();

    return () => {
      issuesSubscription.unsubscribe();
      updatesSubscription.unsubscribe();
    };
  }, [user, profile, selectedDepartment, toast]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch departments
      console.log('Fetching departments...');
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (departmentsError) {
        console.error('Error fetching departments:', departmentsError);
        throw departmentsError;
      }

      console.log('Departments fetched:', departmentsData?.length || 0);
      setDepartments(departmentsData || []);

      // For stakeholders (officials), restrict to their assigned department only
      if (profile?.role === 'official') {
        if (profile?.department_id) {
          console.log(
            'Official user detected with department_id:',
            profile.department_id
          );

          // Check if the department exists in the fetched departments
          const departmentExists = departmentsData?.find(
            (d) => d.id === profile.department_id
          );
          if (!departmentExists) {
            console.warn(
              'Official assigned to non-existent department:',
              profile.department_id
            );
            toast({
              title: 'Department Not Found',
              description:
                'Your assigned department could not be found. Please contact support.',
              variant: 'destructive',
            });
          }

          setSelectedDepartment(profile.department_id);
          // Immediately fetch department-specific data
          await fetchDepartmentData(profile.department_id);
        } else {
          console.log('Official user without department assignment');
          toast({
            title: 'No Department Assignment',
            description:
              'You have not been assigned to a department yet. Please contact your administrator.',
            variant: 'destructive',
          });
          // Official without department assignment - show empty state
          setIssues([]);
          setDepartmentStats({
            totalIssues: 0,
            openIssues: 0,
            inProgressIssues: 0,
            resolvedIssues: 0,
            avgResponseTime: 0,
            monthlyResolved: 0,
          });
        }
      } else if (profile?.role === 'admin') {
        // Admin users can see all departments - set default to their department if assigned
        if (profile?.department_id) {
          setSelectedDepartment(profile.department_id);
          await fetchDepartmentData(profile.department_id);
        } else {
          await fetchAllData();
        }
      } else {
        // For other roles, show all data
        await fetchAllData();
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentData = async (departmentId?: string) => {
    const targetDepartment = departmentId || selectedDepartment;
    if (!targetDepartment) return;

    try {
      setRefreshing(true);
      console.log('Fetching enhanced department data for:', targetDepartment);

      // Use enhanced API to get comprehensive department statistics
      const [departmentStatsData, budgetData, issuesResult, categoryStatsData] =
        await Promise.all([
          getDepartmentStats(targetDepartment),
          getBudgetAllocations(targetDepartment),
          getIssuesByDepartment(targetDepartment, {}, { pageSize: 100 }),
          getCategoryStats(targetDepartment),
        ]);

      console.log('Enhanced department data fetched:', {
        issues: issuesResult.data?.length || 0,
        budget: budgetData?.length || 0,
        stats: departmentStatsData,
      });

      // Convert UIIssue back to Issue format for compatibility
      const convertedIssues = issuesResult.data.map((uiIssue) => ({
        id: uiIssue.id,
        title: uiIssue.title,
        description: uiIssue.description,
        category: uiIssue.category,
        status: uiIssue.status,
        votes: uiIssue.vote_count,
        watchers_count: uiIssue.watchers_count,
        location: uiIssue.location,
        constituency: uiIssue.constituency,
        thumbnail: uiIssue.thumbnail,
        author_id: uiIssue.author_id,
        author_name: uiIssue.author.name,
        author_avatar: uiIssue.author.avatar,
        created_at: uiIssue.created_at,
        updated_at: uiIssue.updated_at,
        department_id: uiIssue.department_id,
        resolved_at: uiIssue.resolved_at,
        resolved_by: uiIssue.resolved_by,
      }));

      // Set the fetched data
      setIssues(convertedIssues);
      setBudgetAllocations(budgetData || []);
      setCategoryStats(categoryStatsData || {});

      // Use enhanced stats from API
      setDepartmentStats(departmentStatsData);

      // For officials, ensure they can only see their department's data
      if (
        profile?.role === 'official' &&
        profile?.department_id !== targetDepartment
      ) {
        console.warn('Official attempting to access different department data');
        toast({
          title: 'Access Restricted',
          description:
            'You can only view issues from your assigned department.',
          variant: 'destructive',
        });
        return;
      }
    } catch (error) {
      console.error('Error fetching department data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load department data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const fetchAllData = async () => {
    try {
      setRefreshing(true);

      // Fetch all issues
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (issuesError) throw issuesError;
      setIssues(issuesData || []);

      // Calculate overall stats
      const stats = calculateStats(issuesData || []);
      setAllStats(stats);
    } catch (error) {
      console.error('Error fetching all data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const calculateStats = (issuesData: Issue[]): DepartmentStats => {
    const totalIssues = issuesData.length;
    const openIssues = issuesData.filter((i) => i.status === 'open').length;
    const inProgressIssues = issuesData.filter(
      (i) => i.status === 'in-progress'
    ).length;
    const resolvedIssues = issuesData.filter(
      (i) => i.status === 'resolved' || i.status === 'closed'
    ).length;

    // Calculate average response time (simplified - days between creation and first update)
    const avgResponseTime = 0; // TODO: Implement proper calculation

    // Calculate monthly resolved issues (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyResolved = issuesData.filter(
      (i) => i.resolved_at && new Date(i.resolved_at) >= thirtyDaysAgo
    ).length;

    return {
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      avgResponseTime,
      monthlyResolved,
    };
  };

  const handleUpdateIssueStatus = async (
    issueId: string,
    newStatus: string
  ) => {
    try {
      // Validate status transition
      const currentIssue = issues.find((i) => i.id === issueId);
      if (!currentIssue) {
        throw new Error('Issue not found');
      }

      // Validate status workflow for enhanced schema
      const validTransitions: Record<string, string[]> = {
        draft: ['open'],
        open: ['in_progress', 'resolved', 'closed'],
        in_progress: ['resolved', 'closed', 'open'],
        resolved: ['closed', 'in_progress'],
        closed: ['in_progress'],
      };

      if (!validTransitions[currentIssue.status]?.includes(newStatus)) {
        toast({
          title: 'Invalid Status Transition',
          description: `Cannot change status from ${currentIssue.status} to ${newStatus}`,
          variant: 'destructive',
        });
        return;
      }

      // Use centralized API for status update
      await updateIssueStatusApi(issueId, newStatus, user?.id || '');

      // Add an update record
      if (user?.id) {
        const { error: updateError } = await supabase.from('updates').insert({
          issue_id: issueId,
          author_id: user.id,
          content: `Issue status updated to ${newStatus.replace('-', ' ')}`,
          type: 'status',
          created_at: new Date().toISOString(),
        });

        if (updateError) {
          console.error('Error creating update record:', updateError);
        }
      }

      // Send notifications to issue author and watchers
      await sendStatusChangeNotifications(
        issueId,
        newStatus,
        currentIssue.title
      );

      toast({
        title: 'Status Updated',
        description: `Issue status changed to ${newStatus.replace('-', ' ')}`,
        variant: 'default',
      });

      // Refresh data to reflect changes
      if (selectedDepartment) {
        fetchDepartmentData();
      } else {
        fetchAllData();
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update issue status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Send notifications for status changes
  const sendStatusChangeNotifications = async (
    issueId: string,
    newStatus: string,
    issueTitle: string
  ) => {
    try {
      // Get issue author and watchers
      const { data: issueData } = await supabase
        .from('issues')
        .select('author_id')
        .eq('id', issueId)
        .single();

      const { data: watchers } = await supabase
        .from('watchers')
        .select('user_id')
        .eq('issue_id', issueId);

      // Collect all users to notify (author + watchers, excluding current user)
      const usersToNotify = new Set<string>();
      if (issueData?.author_id && issueData.author_id !== user?.id) {
        usersToNotify.add(issueData.author_id);
      }
      watchers?.forEach((w) => {
        if (w.user_id !== user?.id) {
          usersToNotify.add(w.user_id);
        }
      });

      // Create notifications for each user
      const notifications = Array.from(usersToNotify).map((userId) => ({
        user_id: userId,
        title: 'Issue Status Updated',
        message: `The status of "${issueTitle}" has been updated to ${newStatus.replace(
          '-',
          ' '
        )}`,
        type: 'status_change',
        issue_id: issueId,
        created_at: new Date().toISOString(),
        read: false,
      }));

      if (notifications.length > 0) {
        const { error } = await supabase
          .from('notifications')
          .insert(notifications);

        if (error) {
          console.error('Error sending notifications:', error);
        }
      }
    } catch (error) {
      console.error('Error in notification system:', error);
    }
  };

  // Handle opening issue management dialog
  const handleManageIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsIssueDialogOpen(true);
  };

  // Handle closing issue dialog
  const handleCloseIssueDialog = () => {
    setIsIssueDialogOpen(false);
    setSelectedIssue(null);
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || issue.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const currentStats = selectedDepartment ? departmentStats : allStats;

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <PageTitle
            title={
              profile?.role === 'admin'
                ? 'Stakeholder Dashboard'
                : selectedDepartmentInfo
                ? `${selectedDepartmentInfo.name} - Issue Management`
                : 'Issue Management Dashboard'
            }
            description={
              profile?.role === 'official' && selectedDepartmentInfo
                ? `Managing citizen issues for the ${selectedDepartmentInfo.name} Department`
                : profile?.role === 'admin' && selectedDepartmentInfo
                ? `Managing issues for ${selectedDepartmentInfo.name} Department`
                : profile?.role === 'admin'
                ? 'Manage government responses to citizen issues across departments'
                : 'Manage government responses to citizen issues'
            }
            breadcrumbs={[
              { label: 'Home', href: '/' },
              {
                label:
                  profile?.role === 'admin'
                    ? 'Stakeholder Dashboard'
                    : 'Issue Management',
                href: '#',
              },
              ...(profile?.role === 'official' && selectedDepartmentInfo
                ? [{ label: selectedDepartmentInfo.name, href: '#' }]
                : []),
            ]}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                selectedDepartment ? fetchDepartmentData() : fetchAllData()
              }
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            {profile?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin Panel
              </Button>
            )}
          </div>
        </div>

        {/* Department Selector - Only for Admins */}
        {profile?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Department Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="department">Select Department</Label>
                  <Select
                    value={selectedDepartment}
                    onValueChange={handleDepartmentChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedDepartmentInfo && (
                  <div className="flex-1">
                    <Label>Department Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedDepartmentInfo.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Department Info for Stakeholders */}
        {profile?.role === 'official' && (
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Your Department
                </CardTitle>
                {selectedDepartmentInfo && (
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                  >
                    Official
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedDepartmentInfo ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Department
                      </Label>
                      <p className="text-xl font-semibold text-foreground mt-1">
                        {selectedDepartmentInfo.name}
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
                      {selectedDepartmentInfo.description}
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

                  {/* Capabilities Info */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">
                          Your Management Capabilities
                        </h4>
                        <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                          <li>• Update issue status and priority</li>
                          <li>• Add official updates and responses</li>
                          <li>• Select and approve solutions</li>
                          <li>• Track implementation progress</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    No Department Assigned
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                    You haven't been assigned to a department yet. Please
                    contact an administrator to assign you to a department so
                    you can manage issues.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = '/contact')}
                  >
                    Contact Administrator
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Performance Summary for Officials */}
        {profile?.role === 'official' &&
          selectedDepartmentInfo &&
          currentStats && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <BarChart3 className="h-5 w-5" />
                  {selectedDepartmentInfo.name} Performance Summary
                </CardTitle>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Your department's issue management statistics
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
                      {currentStats.resolvedIssues} of{' '}
                      {currentStats.totalIssues} resolved
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
                        {selectedDepartmentInfo?.name || 'your department'} need
                        {currentStats.openIssues === 1 ? 's' : ''} your
                        attention
                      </span>
                    </div>
                  </div>
                ) : currentStats.totalIssues > 0 ? (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Great work! All issues in{' '}
                        {selectedDepartmentInfo?.name || 'your department'} are
                        being managed.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        No issues have been assigned to{' '}
                        {selectedDepartmentInfo?.name || 'your department'} yet.
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        {/* Budget Tracking Section for Officials and Admins */}
        {(profile?.role === 'official' || profile?.role === 'admin') &&
          selectedDepartmentInfo &&
          budgetAllocations.length > 0 && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <TrendingUp className="h-5 w-5" />
                  {selectedDepartmentInfo.name} Budget Overview
                </CardTitle>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Financial allocation and spending for fiscal year{' '}
                  {new Date().getFullYear()}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {budgetAllocations.map((budget) => (
                    <div
                      key={budget.id}
                      className="bg-white dark:bg-gray-800 p-4 rounded-lg border"
                    >
                      <h4 className="font-medium text-sm mb-2">
                        {budget.category}
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">
                            Allocated:
                          </span>
                          <span className="font-medium">
                            P{budget.allocated_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Spent:</span>
                          <span className="font-medium">
                            P{budget.spent_amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                (budget.spent_amount /
                                  budget.allocated_amount) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-center text-muted-foreground">
                          {Math.round(
                            (budget.spent_amount / budget.allocated_amount) *
                              100
                          )}
                          % utilized
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {currentStats?.budgetAllocated && currentStats?.budgetSpent && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Total Budget Utilization:{' '}
                        {currentStats.budgetUtilization}%
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        P{currentStats.budgetSpent.toLocaleString()} of P
                        {currentStats.budgetAllocated.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        {/* Enhanced Stats Cards */}
        {currentStats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <EnhancedStatsCard
              title="Total Issues"
              value={currentStats.totalIssues}
              description={
                profile?.role === 'official' ? 'In your department' : 'All time'
              }
              icon={<FileText className="h-4 w-4" />}
              trend={null}
              color="blue"
              onClick={() => setActiveTab('overview')}
            />
            <EnhancedStatsCard
              title="Open Issues"
              value={currentStats.openIssues}
              description="Requiring attention"
              icon={<AlertCircle className="h-4 w-4" />}
              trend={currentStats.openIssues > 0 ? 'urgent' : 'good'}
              color="red"
              onClick={() => setActiveTab('open')}
            />
            <EnhancedStatsCard
              title="In Progress"
              value={currentStats.inProgressIssues}
              description="Currently being addressed"
              icon={<Clock className="h-4 w-4" />}
              trend={currentStats.inProgressIssues > 0 ? 'active' : 'none'}
              color="blue"
              onClick={() => setActiveTab('in-progress')}
            />
            <EnhancedStatsCard
              title="Resolved"
              value={currentStats.resolvedIssues}
              description="Successfully completed"
              icon={<CheckCircle className="h-4 w-4" />}
              trend="positive"
              color="green"
              onClick={() => setActiveTab('resolved')}
            />
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <TabsList className="grid w-full md:w-auto grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="open" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Open</span>
                {currentStats && currentStats.openIssues > 0 && (
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
                {currentStats && currentStats.inProgressIssues > 0 && (
                  <Badge variant="default" className="ml-1 text-xs">
                    {currentStats.inProgressIssues}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="resolved" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Resolved</span>
                {currentStats && currentStats.resolvedIssues > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {currentStats.resolvedIssues}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {profile?.role === 'official' && (
              <div className="text-sm text-muted-foreground">
                Managing issues for{' '}
                <span className="font-medium">
                  {selectedDepartmentInfo?.name}
                </span>
              </div>
            )}
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Basic Performance Metrics - Available to all */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentStats ? (
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
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Select a department to view performance metrics
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Advanced Analytics - Kgotla+ Subscription Required */}
            <SubscriptionFeatureGate
              requiredTier={['kgotla', 'tlhaloso']}
              userTier={profile?.role === 'official' ? 'kgotla' : 'motse'}
              userStatus="active"
              fallbackMessage="Advanced analytics and detailed performance insights are available with Kgotla+ Local Governance Solutions subscription. Upgrade to access cross-ward coordination, budget utilization tracking, and policy impact simulation tools."
              featureName="Advanced Analytics & Governance Tools"
              variant="banner"
              onUpgradeClick={() => (window.location.href = '/pricing')}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    Advanced Analytics
                    <Badge variant="outline" className="ml-2">
                      Kgotla+
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Trend Analysis */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Trend Analysis</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            Issue Resolution Trend
                          </span>
                          <span className="text-sm font-medium text-green-600">
                            +15% this month
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Citizen Satisfaction</span>
                          <span className="text-sm font-medium text-blue-600">
                            87% positive
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            Response Time Improvement
                          </span>
                          <span className="text-sm font-medium text-orange-600">
                            -2.3 days avg
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="space-y-4">
                      <h4 className="font-semibold">Category Performance</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Infrastructure</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: '75%' }}
                              />
                            </div>
                            <span className="text-sm">75%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Public Safety</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: '90%' }}
                              />
                            </div>
                            <span className="text-sm">90%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Environment</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-600 h-2 rounded-full"
                                style={{ width: '60%' }}
                              />
                            </div>
                            <span className="text-sm">60%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SubscriptionFeatureGate>

            <Card>
              <CardHeader>
                <CardTitle>Recent Issues</CardTitle>
              </CardHeader>
              <CardContent>
                {issues.length > 0 ? (
                  <div className="space-y-4">
                    {issues.slice(0, 5).map((issue) => (
                      <div
                        key={issue.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{issue.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {issue.location} •{' '}
                            {new Date(
                              issue.created_at || new Date()
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusVariant(issue.status)}>
                            {issue.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/issues?id=${issue.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No issues found for the selected department
                  </p>
                )}
              </CardContent>
            </Card>
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
                  <IssueManagementGrid
                    issues={filteredIssues.filter((i) => i.status === status)}
                    onStatusUpdate={handleUpdateIssueStatus}
                    onManageIssue={handleManageIssue}
                    currentUserRole={profile?.role || 'citizen'}
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
          issue={convertIssueToUIIssue(selectedIssue)}
          isStakeholderMode={true}
          initialTab="updates"
          onStatusUpdate={handleUpdateIssueStatus}
        />
      )}
    </MainLayout>
  );
};

// Helper function to get status badge variant for enhanced schema
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'draft':
      return 'outline';
    case 'open':
      return 'destructive';
    case 'in_progress':
    case 'in-progress': // Legacy support
      return 'default';
    case 'resolved':
      return 'secondary';
    case 'closed':
      return 'secondary';
    default:
      return 'outline';
  }
};

// Issue Management Grid Component
interface IssueManagementGridProps {
  issues: Issue[];
  onStatusUpdate: (issueId: string, newStatus: string) => void;
  onManageIssue: (issue: Issue) => void;
  currentUserRole: string;
}

const IssueManagementGrid: React.FC<IssueManagementGridProps> = ({
  issues,
  onStatusUpdate,
  onManageIssue,
  currentUserRole,
}) => {
  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
        <p className="text-muted-foreground">
          There are no issues with this status in the selected department.
        </p>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Issues Found</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {currentUserRole === 'official'
            ? 'Great work! There are no issues in this status for your department.'
            : 'There are no issues in this status at the moment.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {issues.map((issue) => (
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
                      className={`${
                        currentUserRole === 'official' ||
                        currentUserRole === 'admin'
                          ? 'cursor-pointer hover:opacity-80 transition-opacity'
                          : ''
                      }`}
                      onClick={() => {
                        if (
                          currentUserRole === 'official' ||
                          currentUserRole === 'admin'
                        ) {
                          onManageIssue(issue);
                        }
                      }}
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
                  {new Date(
                    issue.created_at || new Date()
                  ).toLocaleDateString()}
                </div>
                {issue.location && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {issue.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {issue.votes || 0} votes • {issue.watchers_count || 0}{' '}
                  watching
                </div>
              </div>

              {/* Priority and urgency indicators for officials */}
              {(currentUserRole === 'official' ||
                currentUserRole === 'admin') && (
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
                  {new Date(issue.created_at || new Date()) >
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                    >
                      Recent
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 mt-4">
                <StatusUpdateSelect
                  currentStatus={issue.status}
                  onStatusChange={(newStatus) =>
                    onStatusUpdate(issue.id, newStatus)
                  }
                  disabled={
                    currentUserRole !== 'official' &&
                    currentUserRole !== 'admin'
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

// Status Update Select Component
interface StatusUpdateSelectProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  disabled?: boolean;
}

const StatusUpdateSelect: React.FC<StatusUpdateSelectProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false,
}) => {
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  if (disabled) {
    return (
      <Badge variant={getStatusVariant(currentStatus)} className="capitalize">
        {currentStatus.replace('-', ' ')}
      </Badge>
    );
  }

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

// Enhanced Stats Card Component
interface EnhancedStatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  trend: 'positive' | 'urgent' | 'active' | 'good' | 'none' | null;
  color: 'blue' | 'red' | 'green' | 'yellow';
  onClick?: () => void;
}

const EnhancedStatsCard: React.FC<EnhancedStatsCardProps> = ({
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
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  );
};

export default StakeholderDashboard;
