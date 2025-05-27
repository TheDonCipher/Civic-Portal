import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import UserProfile from './UserProfile';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import PageTitle from '../common/PageTitle';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileData } from '@/types/supabase-extensions';

interface ExtendedProfileData {
  name: string;
  avatar: string;
  banner_url?: string;
  email: string;
  role: string;
  joinDate: string;
  issuesCreated: any[];
  issuesWatching: any[];
  issuesSolved: any[];
  isRealUser: boolean;
}

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profileData, setProfileData] =
    React.useState<ExtendedProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Check if we're in settings mode
  const settingsMode = searchParams.get('tab') === 'settings';

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const targetUserId = userId || user?.id;

      if (!targetUserId) {
        toast({
          title: 'Error',
          description: 'User not found',
          variant: 'destructive',
        });
        navigate('/');
        return;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (profileError) throw profileError;

      // Fetch issues created by the user
      const { data: issuesCreated, error: issuesError } = await supabase
        .from('issues')
        .select('*')
        .eq('author_id', targetUserId);

      if (issuesError) throw issuesError;

      // Fetch issues the user is watching
      const { data: watchingData, error: watchingError } = await supabase
        .from('issue_watchers')
        .select('issue_id')
        .eq('user_id', targetUserId);

      if (watchingError) throw watchingError;

      // If watching any issues, fetch their details
      let issuesWatching: any[] = [];
      if (watchingData && watchingData.length > 0) {
        const watchingIds = watchingData.map((item) => item.issue_id);
        const { data: watchedIssues, error: watchedError } = await supabase
          .from('issues')
          .select('*')
          .in('id', watchingIds);

        if (watchedError) throw watchedError;
        issuesWatching = watchedIssues || [];
      }

      // Fetch issues solved by the user (if they're an official)
      let issuesSolved: any[] = [];
      if (profile.role === 'official') {
        const { data: solvedData, error: solvedError } = await supabase
          .from('issues')
          .select('*')
          .eq('resolved_by', targetUserId);

        if (solvedError) throw solvedError;
        issuesSolved = solvedData || [];
      }

      // Format the data for the UserProfile component
      setProfileData({
        name: profile.full_name || 'User',
        avatar:
          profile.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUserId}`,
        banner_url: (profile as any).banner_url || undefined,
        email:
          user?.email || user?.user_metadata?.['email'] || 'No email provided',
        role: profile.role || 'citizen',
        joinDate: profile.created_at || new Date().toISOString(),
        issuesCreated: issuesCreated || [],
        issuesWatching: issuesWatching || [],
        issuesSolved: issuesSolved || [],
        isRealUser: true,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfileData();
  }, [userId, user, toast, navigate]);

  const handleIssueClick = (issue: any) => {
    // Navigate to the user's issues page with the specific issue highlighted
    navigate(`/user/${user?.id}/issues?highlight=${issue.id}`);
  };

  const handleCreateIssue = () => {
    // Navigate to the user's issues page with create mode enabled
    navigate(`/user/${user?.id}/issues?create=true`);
  };

  const handleDeleteIssue = async (issueId: string) => {
    if (!user) return;

    try {
      // Check if user has permission to delete
      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .select('author_id')
        .eq('id', issueId)
        .single();

      if (issueError) throw issueError;

      if (issueData.author_id !== user.id) {
        toast({
          title: 'Permission Denied',
          description: 'You can only delete issues you created',
          variant: 'destructive',
        });
        return;
      }

      // Delete the issue
      const { error: deleteError } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueId);

      if (deleteError) throw deleteError;

      // Update local state by refetching profile data
      await fetchProfileData();

      toast({
        title: 'Issue Deleted',
        description: 'The issue has been successfully deleted',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete issue. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">User Not Found</h1>
        <Button onClick={() => navigate('/')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Return Home
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageTitle
        title={`${profileData.name}'s Profile`}
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Profile', href: '#' },
        ]}
        actions={
          <Button onClick={() => navigate(-1)} variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
      <UserProfile
        user={profileData}
        onIssueClick={handleIssueClick}
        onCreateIssue={handleCreateIssue}
        onDeleteIssue={handleDeleteIssue}
        settingsMode={settingsMode}
      />
    </div>
  );
};

export default ProfilePage;
