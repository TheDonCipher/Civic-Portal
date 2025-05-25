import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/common/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import {
  sendVerificationApprovedNotification,
  sendVerificationRejectedNotification,
  sendRoleChangedNotification,
} from '@/lib/utils/notificationUtils';
import {
  Users,
  Shield,
  Building2,
  Search,
  Edit,
  Save,
  X,
  UserCheck,
  UserX,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Trash2,
  Plus,
  RefreshCw,
  Download,
  Upload,
} from 'lucide-react';

// Fallback departments data when table doesn't exist
const getFallbackDepartments = () => [
  {
    id: 'finance',
    name: 'Finance',
    description: 'Financial management and economic policy',
    category: 'Economic Affairs',
  },
  {
    id: 'international-relations',
    name: 'International Relations',
    description: 'Foreign affairs and diplomatic relations',
    category: 'External Affairs',
  },
  {
    id: 'health',
    name: 'Health',
    description: 'Public health services and medical care',
    category: 'Social Services',
  },
  {
    id: 'child-welfare-education',
    name: 'Child Welfare and Basic Education',
    description: 'Primary education and child protection services',
    category: 'Education & Welfare',
  },
  {
    id: 'higher-education',
    name: 'Higher Education',
    description: 'Tertiary education and research institutions',
    category: 'Education & Welfare',
  },
  {
    id: 'lands-agriculture',
    name: 'Lands and Agriculture',
    description: 'Land management and agricultural development',
    category: 'Economic Affairs',
  },
  {
    id: 'youth-gender',
    name: 'Youth and Gender Affairs',
    description: 'Youth development and gender equality programs',
    category: 'Social Services',
  },
  {
    id: 'state-presidency',
    name: 'State Presidency',
    description: 'Executive office and state administration',
    category: 'Government Administration',
  },
  {
    id: 'justice-correctional',
    name: 'Justice and Correctional Services',
    description: 'Legal system and correctional facilities',
    category: 'Justice & Security',
  },
  {
    id: 'local-government',
    name: 'Local Government and Traditional Affairs',
    description: 'Local governance and traditional leadership',
    category: 'Government Administration',
  },
  {
    id: 'minerals-energy',
    name: 'Minerals and Energy',
    description: 'Mining sector and energy resources',
    category: 'Economic Affairs',
  },
  {
    id: 'communications-innovation',
    name: 'Communications and Innovation',
    description: 'Telecommunications and technology innovation',
    category: 'Technology & Innovation',
  },
  {
    id: 'environment-tourism',
    name: 'Environment and Tourism',
    description: 'Environmental protection and tourism development',
    category: 'Environment & Tourism',
  },
  {
    id: 'labour-home-affairs',
    name: 'Labour and Home Affairs',
    description: 'Employment relations and internal affairs',
    category: 'Government Administration',
  },
  {
    id: 'sports-arts',
    name: 'Sports and Arts',
    description: 'Sports development and cultural affairs',
    category: 'Social Services',
  },
  {
    id: 'trade-entrepreneurship',
    name: 'Trade and Entrepreneurship',
    description: 'Trade promotion and business development',
    category: 'Economic Affairs',
  },
  {
    id: 'transport-infrastructure',
    name: 'Transport and Infrastructure',
    description: 'Transportation systems and infrastructure development',
    category: 'Infrastructure',
  },
  {
    id: 'water-human-settlement',
    name: 'Water and Human Settlement',
    description: 'Water resources and housing development',
    category: 'Infrastructure',
  },
];

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  role: string | null;
  constituency: string | null;
  department_id: string | null;
  verification_status: string | null;
  created_at: string;
  department?: {
    id: string;
    name: string;
  };
}

interface Department {
  id: string;
  name: string;
  description: string | null;
}

interface Issue {
  id: string;
  title: string;
  status: string;
  category: string;
  created_at: string;
  author_id: string;
}

interface SystemStats {
  totalUsers: number;
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  totalDepartments: number;
  activeStakeholders: number;
  monthlyGrowth: number;
  avgResolutionTime: number;
}

const AdminPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [verificationDialog, setVerificationDialog] = useState<{
    open: boolean;
    userId: string;
    action: 'verify' | 'reject';
    userName: string;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Check if user is admin
  if (profile?.role !== 'admin') {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
                <p className="text-muted-foreground">
                  You don't have permission to access the admin panel.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Helper function to log admin actions for audit purposes
  const logAdminAction = async (action: string, details: any) => {
    try {
      const { error } = await supabase.from('audit_logs').insert({
        action,
        resource_type: 'user_management',
        resource_id: details.target_user_id,
        user_id: user?.id,
        details: details,
      });

      if (error) {
        console.warn('Failed to log admin action:', error);
        // Don't throw error as this shouldn't block the main operation
      }
    } catch (error) {
      console.warn('Error logging admin action:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all profiles - start with basic columns and add more if available
      let profilesData: any[] = [];
      try {
        // First try with all columns
        const { data, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        profilesData = data || [];
        console.log(
          'Profiles fetched successfully:',
          profilesData.length,
          'users'
        );
        if (profilesData.length > 0) {
          console.log('Sample profile columns:', Object.keys(profilesData[0]));
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      // Try to fetch departments - handle gracefully if table doesn't exist
      let departmentsData: any[] = [];
      try {
        const { data, error: departmentsError } = await supabase
          .from('departments')
          .select('*')
          .order('name');

        if (departmentsError) {
          if (departmentsError.code === '42P01') {
            // Table doesn't exist - use fallback data
            console.warn(
              'Departments table does not exist, using fallback data'
            );
            departmentsData = getFallbackDepartments();
          } else {
            throw departmentsError;
          }
        } else {
          departmentsData = data || [];
        }
      } catch (error) {
        console.warn('Error fetching departments, using fallback:', error);
        departmentsData = getFallbackDepartments();
      }

      // Fetch all issues for system statistics
      const { data: issuesData, error: issuesError } = await supabase
        .from('issues')
        .select('id, title, status, category, created_at, author_id')
        .order('created_at', { ascending: false });

      if (issuesError) {
        console.error('Error fetching issues:', issuesError);
        throw issuesError;
      }

      console.log(
        'Issues fetched successfully:',
        (issuesData || []).length,
        'issues'
      );

      // Manually join profiles with departments
      const profilesWithDepartments = (profilesData || []).map((profile) => {
        const department = profile.department_id
          ? (departmentsData || []).find(
              (dept) => dept.id === profile.department_id
            )
          : null;
        return {
          ...profile,
          // Ensure all required fields exist with defaults
          department_id: profile.department_id || null,
          verification_status: profile.verification_status || 'verified',
          department: department
            ? { id: department.id, name: department.name }
            : null,
        };
      });

      // Calculate system statistics
      const stats = calculateSystemStats(
        profilesWithDepartments,
        issuesData || [],
        departmentsData || []
      );

      setProfiles(profilesWithDepartments);
      setDepartments(departmentsData || []);
      setIssues(issuesData || []);
      setSystemStats(stats);

      // Set debug info
      setDebugInfo({
        profilesCount: profilesWithDepartments.length,
        departmentsCount: departmentsData.length,
        issuesCount: (issuesData || []).length,
        sampleProfile: profilesWithDepartments[0] || null,
        profileColumns: profilesWithDepartments[0]
          ? Object.keys(profilesWithDepartments[0])
          : [],
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: `Failed to load admin data: ${
          error.message || 'Unknown error'
        }`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSystemStats = (
    profiles: Profile[],
    issues: Issue[],
    departments: Department[]
  ): SystemStats => {
    const totalUsers = profiles.length;
    const totalIssues = issues.length;
    const openIssues = issues.filter((i) => i.status === 'open').length;
    const resolvedIssues = issues.filter(
      (i) => i.status === 'resolved' || i.status === 'closed'
    ).length;
    const totalDepartments = departments.length;
    const activeStakeholders = profiles.filter(
      (p) => p.role === 'official'
    ).length;

    // Calculate monthly growth (simplified - last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = profiles.filter(
      (p) => new Date(p.created_at) >= thirtyDaysAgo
    ).length;
    const monthlyGrowth =
      totalUsers > 0 ? Math.round((recentUsers / totalUsers) * 100) : 0;

    // Calculate average resolution time (simplified)
    const avgResolutionTime = 12; // TODO: Implement proper calculation

    return {
      totalUsers,
      totalIssues,
      openIssues,
      resolvedIssues,
      totalDepartments,
      activeStakeholders,
      monthlyGrowth,
      avgResolutionTime,
    };
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast({
      title: 'Data Refreshed',
      description: 'Admin dashboard data has been updated.',
      variant: 'default',
    });
  };

  const updateUserRole = async (
    userId: string,
    newRole: string,
    departmentId?: string
  ) => {
    try {
      // Get user details for logging
      const userProfile = profiles.find((p) => p.id === userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const oldRole = userProfile.role;
      const updateData: any = { role: newRole };

      if (newRole === 'official') {
        // For officials, preserve their original department assignment
        // The department they signed up with should remain the same
        if (userProfile.department_id) {
          // Keep existing department assignment
          updateData.department_id = userProfile.department_id;
        } else if (departmentId) {
          // Only set new department if user doesn't have one (shouldn't happen in normal flow)
          updateData.department_id = departmentId;
        }
        // Set verification status to pending for officials
        updateData.verification_status = 'pending';
      } else if (newRole === 'citizen') {
        // Citizens don't need department assignment
        updateData.department_id = null;
        // Citizens don't need verification
        updateData.verification_status = 'verified';
      } else if (newRole === 'admin') {
        // Admins keep their department assignment if they have one
        // This allows department-specific admins
        if (userProfile.department_id) {
          updateData.department_id = userProfile.department_id;
        }
        // Admins are automatically verified
        updateData.verification_status = 'verified';
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      // Log the admin action
      await logAdminAction('role_update', {
        target_user_id: userId,
        target_user_name: userProfile.full_name || userProfile.username,
        old_role: oldRole,
        new_role: newRole,
        department_id: departmentId || null,
        admin_id: user?.id,
        admin_name: profile?.full_name || profile?.username,
      });

      // Send notification to user about role change
      const departmentName = departmentId
        ? departments.find((d) => d.id === departmentId)?.name
        : undefined;

      await sendRoleChangedNotification(
        userId,
        userProfile.full_name || userProfile.username || 'User',
        oldRole || 'citizen',
        newRole,
        departmentName
      );

      toast({
        title: 'Success',
        description: `User role updated successfully. ${
          newRole === 'official'
            ? 'User will need admin verification to access stakeholder features.'
            : newRole === 'admin'
            ? 'User now has full administrative access.'
            : 'User role has been updated to citizen.'
        }`,
        variant: 'default',
      });

      fetchData(); // Refresh the data
      setIsEditDialogOpen(false);
      setEditingProfile(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateVerificationStatus = async (
    userId: string,
    status: 'verified' | 'rejected',
    reason?: string
  ) => {
    try {
      // Get user details for notification
      const userProfile = profiles.find((p) => p.id === userId);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      const updateData: any = { verification_status: status };

      // If rejected, we might want to store the reason
      if (status === 'rejected' && reason) {
        updateData.verification_notes = reason;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      // Log the admin action for audit purposes
      await logAdminAction('verification_update', {
        target_user_id: userId,
        target_user_name: userProfile.full_name || userProfile.username,
        verification_status: status,
        reason: reason || null,
        admin_id: user?.id,
        admin_name: profile?.full_name || profile?.username,
      });

      // Send notification to user about verification status change
      const departmentName = userProfile.department?.name;
      const userName = userProfile.full_name || userProfile.username || 'User';

      if (status === 'verified') {
        await sendVerificationApprovedNotification(
          userId,
          userName,
          departmentName
        );
      } else if (status === 'rejected') {
        await sendVerificationRejectedNotification(userId, userName, reason);
      }

      toast({
        title: 'Success',
        description: `User verification ${status} successfully. ${
          status === 'verified'
            ? 'The user can now access the stakeholder dashboard.'
            : 'The user has been notified of the rejection.'
        }`,
        variant: 'default',
      });

      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error updating verification status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update verification status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Helper functions for verification dialog
  const openVerificationDialog = (
    userId: string,
    action: 'verify' | 'reject',
    userName: string
  ) => {
    setVerificationDialog({ open: true, userId, action, userName });
    setRejectionReason('');
  };

  const closeVerificationDialog = () => {
    setVerificationDialog(null);
    setRejectionReason('');
  };

  const handleVerificationConfirm = async () => {
    if (!verificationDialog) return;

    const { userId, action } = verificationDialog;
    const status = action === 'verify' ? 'verified' : 'rejected';

    await updateVerificationStatus(
      userId,
      status,
      rejectionReason || undefined
    );
    closeVerificationDialog();
  };

  const filteredProfiles = profiles.filter((profile) => {
    const matchesSearch =
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.constituency?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = selectedRole === 'all' || profile.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role: string | null) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'official':
        return 'default';
      case 'citizen':
        return 'secondary';
      default:
        return 'outline';
    }
  };

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
            title="Admin Panel"
            description="Manage users, departments, and system settings"
            breadcrumbs={[
              { label: 'Home', href: '/' },
              { label: 'Admin Panel', href: '#' },
            ]}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={refreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {systemStats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStats.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  +{systemStats.monthlyGrowth}% this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Issues
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStats.totalIssues}
                </div>
                <p className="text-xs text-muted-foreground">
                  {systemStats.openIssues} open, {systemStats.resolvedIssues}{' '}
                  resolved
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Stakeholders
                </CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStats.activeStakeholders}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {systemStats.totalDepartments} departments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Resolution
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {systemStats.avgResolutionTime}d
                </div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Debug Info */}
        {debugInfo && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-sm">Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1">
                <p>Profiles: {debugInfo.profilesCount}</p>
                <p>Departments: {debugInfo.departmentsCount}</p>
                <p>Issues: {debugInfo.issuesCount}</p>
                <p>Profile columns: {debugInfo.profileColumns.join(', ')}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="system">System Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Users</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name, username, or constituency..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="role-filter">Filter by Role</Label>
                    <Select
                      value={selectedRole}
                      onValueChange={setSelectedRole}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="citizen">Citizens</SelectItem>
                        <SelectItem value="official">Officials</SelectItem>
                        <SelectItem value="admin">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Users Table */}
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Constituency</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="text-muted-foreground">
                              {profiles.length === 0
                                ? 'No users found in the database.'
                                : `No users match the current filters. Total users: ${profiles.length}`}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProfiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {profile.full_name || 'No name'}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  @{profile.username || 'no-username'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getRoleBadgeVariant(profile.role)}
                              >
                                {profile.role || 'citizen'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {profile.role === 'official' ? (
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={
                                      profile.verification_status === 'verified'
                                        ? 'default'
                                        : profile.verification_status ===
                                          'rejected'
                                        ? 'destructive'
                                        : 'secondary'
                                    }
                                  >
                                    {profile.verification_status || 'pending'}
                                  </Badge>
                                  {profile.verification_status ===
                                    'pending' && (
                                    <div className="flex gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                                        onClick={() =>
                                          openVerificationDialog(
                                            profile.id,
                                            'verify',
                                            profile.full_name ||
                                              profile.username ||
                                              'User'
                                          )
                                        }
                                        title="Verify user"
                                      >
                                        ✓
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-6 px-2 text-xs bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                                        onClick={() =>
                                          openVerificationDialog(
                                            profile.id,
                                            'reject',
                                            profile.full_name ||
                                              profile.username ||
                                              'User'
                                          )
                                        }
                                        title="Reject verification"
                                      >
                                        ✗
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  N/A
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {profile.department?.name || '-'}
                            </TableCell>
                            <TableCell>{profile.constituency || '-'}</TableCell>
                            <TableCell>
                              {new Date(
                                profile.created_at
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Dialog
                                open={
                                  isEditDialogOpen &&
                                  editingProfile?.id === profile.id
                                }
                                onOpenChange={(open) => {
                                  setIsEditDialogOpen(open);
                                  if (!open) setEditingProfile(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingProfile(profile)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <EditUserDialog
                                  profile={profile}
                                  departments={departments}
                                  onSave={updateUserRole}
                                  onCancel={() => {
                                    setIsEditDialogOpen(false);
                                    setEditingProfile(null);
                                  }}
                                />
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Department Management</CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Department
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {departments.map((dept) => (
                    <Card key={dept.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">
                            {dept.name}
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-sm text-muted-foreground mb-3">
                          {dept.description || 'No description available'}
                        </p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Stakeholders:
                          </span>
                          <Badge variant="secondary">
                            {
                              profiles.filter(
                                (p) => p.department_id === dept.id
                              ).length
                            }
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Issue Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {systemStats && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Open Issues</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (systemStats.openIssues /
                                    systemStats.totalIssues) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {systemStats.openIssues}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Resolved Issues</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{
                                width: `${
                                  (systemStats.resolvedIssues /
                                    systemStats.totalIssues) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">
                            {systemStats.resolvedIssues}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Citizens</span>
                      <Badge variant="secondary">
                        {
                          profiles.filter(
                            (p) => p.role === 'citizen' || !p.role
                          ).length
                        }
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Officials</span>
                      <Badge variant="default">
                        {profiles.filter((p) => p.role === 'official').length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Administrators</span>
                      <Badge variant="destructive">
                        {profiles.filter((p) => p.role === 'admin').length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export User Data
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="h-4 w-4 mr-2" />
                      Import Users
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh All Data
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {issues.slice(0, 5).map((issue) => (
                      <div
                        key={issue.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex-1">
                          <p className="font-medium truncate">{issue.title}</p>
                          <p className="text-muted-foreground">
                            {new Date(issue.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge
                          variant={
                            issue.status === 'open'
                              ? 'destructive'
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
            </div>
          </TabsContent>
        </Tabs>

        {/* Verification Confirmation Dialog */}
        <Dialog
          open={verificationDialog?.open || false}
          onOpenChange={(open) => !open && closeVerificationDialog()}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {verificationDialog?.action === 'verify'
                  ? 'Verify User'
                  : 'Reject Verification'}
              </DialogTitle>
              <DialogDescription>
                {verificationDialog?.action === 'verify'
                  ? `Are you sure you want to verify ${verificationDialog?.userName}? This will grant them access to the stakeholder dashboard.`
                  : `Are you sure you want to reject the verification for ${verificationDialog?.userName}? Please provide a reason for the rejection.`}
              </DialogDescription>
            </DialogHeader>

            {verificationDialog?.action === 'reject' && (
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Reason for rejection</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Please provide a clear reason for rejecting this verification..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={closeVerificationDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleVerificationConfirm}
                variant={
                  verificationDialog?.action === 'verify'
                    ? 'default'
                    : 'destructive'
                }
                disabled={
                  verificationDialog?.action === 'reject' &&
                  !rejectionReason.trim()
                }
              >
                {verificationDialog?.action === 'verify'
                  ? 'Verify User'
                  : 'Reject Verification'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

// Edit User Dialog Component
interface EditUserDialogProps {
  profile: Profile;
  departments: Department[];
  onSave: (userId: string, role: string, departmentId?: string) => void;
  onCancel: () => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  profile,
  departments,
  onSave,
  onCancel,
}) => {
  const [selectedRole, setSelectedRole] = useState(profile.role || 'citizen');

  // Department is preserved from signup - not changeable by admin
  const userDepartment = profile.department?.name || 'No department assigned';

  const handleSave = () => {
    // Don't pass department ID since it should be preserved from the user's original signup
    onSave(profile.id, selectedRole);
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit User Role</DialogTitle>
        <DialogDescription>
          Update the role for {profile.full_name || profile.username}.
          Department assignments are preserved from the user's original signup.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Current Department Info (Read-only) */}
        {profile.department && (
          <div className="p-3 bg-muted rounded-lg">
            <Label className="text-sm font-medium">Current Department</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {userDepartment}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Department assignments are based on the user's original signup and
              cannot be changed.
            </p>
          </div>
        )}

        <div>
          <Label htmlFor="role">Role</Label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="citizen">Citizen</SelectItem>
              <SelectItem value="official">Official/Stakeholder</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedRole === 'official' && profile.department
              ? `This user will be assigned to ${userDepartment} as an official.`
              : selectedRole === 'official' && !profile.department
              ? 'This user has no department assignment from signup.'
              : selectedRole === 'admin'
              ? 'Administrators have full system access.'
              : 'Citizens have standard platform access.'}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AdminPage;
