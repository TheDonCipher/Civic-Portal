import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import AuthDialog from './auth/AuthDialog';
import MainLayout from './layout/MainLayout';
import LatestUpdates from './issues/LatestUpdates';
import StatCards from './dashboard/StatCards';
import IssueGrid from './issues/IssueGrid';
import IssueDetailDialog from './issues/IssueDetailDialog';
import type { Issue } from './issues/IssueGrid';
import CreateIssueDialog from './issues/CreateIssueDialog';
import { z } from 'zod';
import { useToast } from '@/components/ui/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { safeDate } from '@/lib/utils/dateUtils';
import { handleApiError } from '@/lib/utils/errorHandler';
import {
  ConsentProtectedRoute,
  ConsentProtectedButton,
} from '@/components/auth/ConsentProtectedRoute';
import { ConsentStatusWidget } from '@/components/auth/ConsentStatusWidget';

interface HomeProps {
  initialIssues?: Issue[];
}

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  constituency: z.string().min(1, 'Constituency is required'),
});

const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Road Maintenance Required',
    description:
      'Multiple potholes need attention along the Serowe-Palapye road.',
    category: 'Infrastructure',
    status: 'open',
    votes: 42,
    comments: [
      {
        id: 1,
        author: {
          name: 'Jane Smith',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
        },
        content:
          "This needs immediate attention. I've seen multiple cars damaged.",
        date: '2024-03-21',
      },
      {
        id: 2,
        author: {
          name: 'Michael Brown',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
        },
        content: 'I agree, this is becoming a serious safety hazard.',
        date: '2024-03-21',
      },
    ],
    date: '2024-03-20',
    author: {
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    },
    author_id: 'demo-user-1',
    thumbnail:
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400&h=300&fit=crop',
    location: 'Serowe-Palapye Road',
    constituency: 'Serowe north',
    watchers: 68,
    watchers_count: 68,
    created_at: '2024-03-20T10:00:00Z',
    updated_at: '2024-03-20T10:00:00Z',
    resolved_at: '',
    resolved_by: '',
    department_id: '',
  },
  {
    id: '2',
    title: 'Cleanup Initiative',
    description:
      'Organizing community cleanup at Main Mall. Need volunteers and equipment.',
    category: 'Environment',
    status: 'in-progress',
    votes: 28,
    comments: [
      {
        id: 1,
        author: {
          name: 'Environmental Team',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=env',
        },
        content: "We'll provide cleaning equipment and safety gear.",
        date: '2024-03-19',
      },
      {
        id: 2,
        author: {
          name: 'Community Leader',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=leader',
        },
        content: "Great initiative! We'll help coordinate volunteers.",
        date: '2024-03-20',
      },
    ],
    date: '2024-03-19',
    author: {
      name: 'Jane Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
    },
    author_id: 'demo-user-2',
    thumbnail:
      'https://images.unsplash.com/photo-1571954471509-801c155e01ec?w=400&h=300&fit=crop',
    location: 'Main Mall',
    constituency: 'Gaborone central',
    watchers: 42,
    watchers_count: 42,
    created_at: '2024-03-19T14:30:00Z',
    updated_at: '2024-03-19T14:30:00Z',
    resolved_at: '',
    resolved_by: '',
    department_id: '',
  },
];

const Home = ({ initialIssues = mockIssues }: HomeProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Check URL params for signin=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('signin') === 'true' && !user) {
      setIsAuthDialogOpen(true);
      // Clean up the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [user]);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issues, setIssues] = useState(initialIssues);

  // Prevent duplicate issues by ensuring we only fetch once
  const [hasFetched, setHasFetched] = useState(false);

  // Check if we're in demo mode
  const isDemoMode =
    location.search.includes('demo=true') ||
    location.pathname.startsWith('/demo');

  // Fetch issues from the database when the component mounts
  useEffect(() => {
    if (hasFetched) return;

    const fetchIssues = async () => {
      try {
        const { supabase } = await import('@/lib/supabase');
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Format the issues to match our Issue type
          const formattedIssues = data.map((issue) => ({
            id: issue.id,
            title: issue.title,
            description: issue.description,
            category: issue.category,
            status: issue.status as 'open' | 'in-progress' | 'resolved',
            votes: issue.votes || 0,
            comments: [],
            date: safeDate.toString(issue.created_at),
            author: {
              name: issue.author_name || 'Unknown',
              avatar:
                issue.author_avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${issue.author_id}`,
            },
            author_id: issue.author_id, // Add this required field
            thumbnail: ((): string => {
              if (issue.thumbnail) {
                return issue.thumbnail;
              }
              // Select a default image based on category if thumbnail is missing
              const category =
                issue.category?.toLowerCase() || 'infrastructure';
              const defaultImages: Record<string, string> = {
                infrastructure:
                  'https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg',
                environment:
                  'https://cdn.pixabay.com/photo/2015/12/01/20/28/green-1072828_1280.jpg',
                safety:
                  'https://cdn.pixabay.com/photo/2019/04/13/00/47/police-4123365_1280.jpg',
                community:
                  'https://cdn.pixabay.com/photo/2017/02/10/12/03/volunteer-2055010_1280.jpg',
              };
              const validCategories = [
                'infrastructure',
                'environment',
                'safety',
                'community',
              ];
              const validCategory = validCategories.includes(category)
                ? category
                : 'infrastructure';
              return (
                defaultImages[validCategory as keyof typeof defaultImages] ||
                defaultImages['infrastructure']
              );
            })(),
            location: issue.location || '',
            constituency: issue.constituency || '',
            watchers: issue.watchers_count || 0,
            watchers_count: issue.watchers_count || 0,
            created_at: safeDate.toString(issue.created_at),
            updated_at: safeDate.toString(issue.updated_at),
            resolved_at: issue.resolved_at
              ? safeDate.toString(issue.resolved_at)
              : '',
            resolved_by: issue.resolved_by || '',
            department_id: (issue as any).department_id || '',
          }));

          setIssues(formattedIssues);
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
        handleApiError(error, 'Home', 'fetchIssues');
      } finally {
        setHasFetched(true);
      }
    };

    fetchIssues();
  }, [hasFetched]);

  const handleDeleteIssue = async (issueId: string) => {
    try {
      // Remove the issue from the local state
      setIssues(issues.filter((issue) => issue.id !== issueId));
      setSelectedIssue(null);

      toast({
        title: 'Issue Deleted',
        description: 'The issue has been successfully deleted.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error handling issue deletion:', error);
    }
  };

  const handleCreateIssue = async (data: any) => {
    // Handle issue creation - the issue has already been created by CreateIssueDialog
    // We just need to add it to the local state and close the dialog
    console.log('Received created issue data:', data);

    if (user && profile && data.id) {
      // The issue was successfully created by CreateIssueDialog
      // Add the new issue to the local state
      const newIssue = {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        status: 'open' as const,
        votes: 0,
        comments: [],
        date: safeDate.toString(data.created_at),
        author: {
          name: profile.full_name || 'User',
          avatar: '', // Will be dynamically fetched by IssueCard component
        },
        author_id: user.id, // Add this required field
        thumbnail:
          data.thumbnails?.[0] ||
          data.thumbnail ||
          'https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg',
        location: data.location || '',
        constituency: data.constituency || '',
        watchers: 1, // Start with 1 watcher (the creator)
        watchers_count: 1,
        created_at: safeDate.toString(data.created_at),
        updated_at: safeDate.toString(new Date().toISOString()),
        resolved_at: '',
        resolved_by: '',
        department_id: '',
      };

      setIssues([newIssue, ...issues]);

      toast({
        title: 'Issue Created',
        description: 'Your issue has been successfully created.',
        variant: 'default',
        duration: 3000,
      });
    }

    setIsCreateDialogOpen(false);
  };

  const handleSearch = (term: string) => {
    // Handle search
    console.log('Searching for:', term);
  };

  const handleFilterChange = (filters: any) => {
    // Handle filter changes
    console.log('Filters changed:', filters);
  };

  // Filter issues to show only open and in-progress ones
  const activeIssues = issues.filter(
    (issue) => issue.status === 'open' || issue.status === 'in-progress'
  );

  return (
    <MainLayout
      onCreateIssue={() => {
        if (!user && !isDemoMode) {
          setIsAuthDialogOpen(true);
        } else {
          setIsCreateDialogOpen(true);
        }
      }}
      onSearch={handleSearch}
    >
      <div className="max-w-[1800px] mx-auto section-spacing mobile-padding">
        {/* Statistics Section */}
        <section className="w-full">
          <StatCards />
        </section>

        {/* Latest Updates - Mobile (appears before Issues Grid) */}
        <section className="lg:hidden">
          <div className="mb-6 sm:mb-8">
            <LatestUpdates
              onIssueClick={(issueId) => {
                const issue = issues.find((i) => i.id === issueId);
                if (issue) {
                  setSelectedIssue(issue);
                }
              }}
            />
          </div>
        </section>

        {/* Main Content Layout */}
        <section className="w-full">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
            {/* Issues Grid - Main Content */}
            <div className="flex-1 min-w-0">
              <IssueGrid
                issues={activeIssues}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onIssueClick={(issue) => setSelectedIssue(issue)}
                enablePagination={true}
                initialPageSize={20}
              />
            </div>

            {/* Latest Updates Sidebar - Desktop */}
            <div className="w-full lg:w-[400px] xl:w-[420px] hidden lg:block">
              <div className="sticky top-[100px]">
                <LatestUpdates
                  onIssueClick={(issueId) => {
                    const issue = issues.find((i) => i.id === issueId);
                    if (issue) {
                      setSelectedIssue(issue);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      <CreateIssueDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          if (!user && open) {
            setIsAuthDialogOpen(true);
            return;
          }
          setIsCreateDialogOpen(open);
        }}
        onSubmit={handleCreateIssue}
      />

      <AuthDialog
        open={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        enhanced={true}
      />

      {selectedIssue && (
        <IssueDetailDialog
          open={true}
          onOpenChange={() => setSelectedIssue(null)}
          issue={selectedIssue}
          onDelete={handleDeleteIssue}
        />
      )}
    </MainLayout>
  );
};

export default Home;
