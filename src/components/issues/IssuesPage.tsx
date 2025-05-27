import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '../layout/MainLayout';
import IssueGrid from './IssueGrid';
import IssueDetailDialog from './IssueDetailDialog';
import CreateIssueDialog from './CreateIssueDialog';
import type { Issue } from './IssueGrid';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast-enhanced';
import { useAuth } from '@/lib/auth';
import { safeDate } from '@/lib/utils/dateUtils';
import { handleApiError } from '@/lib/utils/errorHandler';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  location: z.string().min(1, 'Location is required'),
  constituency: z.string().min(1, 'Constituency is required'),
});

export const IssuesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth() || { user: null, profile: null };

  // Prevent duplicate issues by ensuring we only fetch once
  const [hasFetched, setHasFetched] = useState(false);

  // Check for create=true URL parameter and open dialog
  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setIsCreateDialogOpen(true);
      // Clean up the URL parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('create');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleDeleteIssue = async (issueId: string) => {
    try {
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'You must be signed in to delete issues',
          variant: 'destructive',
        });
        return;
      }

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

      // Delete the issue from Supabase
      const { error: deleteError } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueId);

      if (deleteError) throw deleteError;

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
      toast({
        title: 'Error',
        description: 'Failed to delete issue. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Fetch issues from the database when the component mounts
  useEffect(() => {
    if (hasFetched) return;

    const fetchIssues = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Format the issues to match our Issue type
          const formattedIssues = data.map((issue) => {
            console.log('Issue thumbnail:', issue.thumbnail);

            // Validate and process the thumbnail URL
            let thumbnailUrl: string = issue.thumbnail || '';
            const category = issue.category?.toLowerCase() || 'infrastructure';
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
            const defaultThumbnail: string =
              defaultImages[category] ||
              defaultImages['infrastructure'] ||
              'https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg';

            // Validate the thumbnail URL
            if (thumbnailUrl) {
              try {
                // Check if the URL is valid
                new URL(thumbnailUrl);
                // Make sure it starts with http or https
                if (!thumbnailUrl.startsWith('http')) {
                  console.warn(
                    `Invalid thumbnail URL format: ${thumbnailUrl}, using default`
                  );
                  thumbnailUrl = defaultThumbnail;
                }
              } catch (e) {
                console.warn(
                  `Invalid thumbnail URL: ${thumbnailUrl}, using default`,
                  e
                );
                thumbnailUrl = defaultThumbnail;
              }
            } else {
              thumbnailUrl = defaultThumbnail;
            }

            return {
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
              author_id: issue.author_id, // Add this line for delete functionality
              thumbnail: thumbnailUrl,
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
            };
          });

          setIssues(formattedIssues);
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
        handleApiError(error, 'IssuesPage', 'fetchIssues');
      } finally {
        setIsLoading(false);
        setHasFetched(true);
      }
    };

    fetchIssues();
  }, [hasFetched]);

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
          avatar:
            profile.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        },
        author_id: user.id, // Add this line for delete functionality
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
    if (!term) {
      // If search term is empty, reset to all issues
      const fetchIssues = async () => {
        try {
          const { data, error } = await supabase
            .from('issues')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          if (data && data.length > 0) {
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
              author_id: issue.author_id, // Add this line for delete functionality
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
        }
      };

      fetchIssues();
      return;
    }

    // Search in title and description
    const searchIssues = async () => {
      try {
        const { data, error } = await supabase
          .from('issues')
          .select('*')
          .or(`title.ilike.%${term}%,description.ilike.%${term}%`)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
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
            author_id: issue.author_id, // Add this line for delete functionality
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
        console.error('Error searching issues:', error);
      }
    };

    searchIssues();
  };

  const handleFilterChange = (filters: any) => {
    // Handle filter changes
    const filterIssues = async () => {
      try {
        let query = supabase.from('issues').select('*');

        // Apply category filter
        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }

        // Apply status filter
        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        // Apply sorting
        if (filters.sortBy) {
          switch (filters.sortBy) {
            case 'newest':
              query = query.order('created_at', { ascending: false });
              break;
            case 'oldest':
              query = query.order('created_at', { ascending: true });
              break;
            case 'most-votes':
              query = query.order('votes', { ascending: false });
              break;
            case 'least-votes':
              query = query.order('votes', { ascending: true });
              break;
            default:
              query = query.order('created_at', { ascending: false });
          }
        } else {
          query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
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
            author_id: issue.author_id, // Add this line for delete functionality
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
        console.error('Error filtering issues:', error);
      }
    };

    filterIssues();
  };

  return (
    <MainLayout
      onCreateIssue={() => setIsCreateDialogOpen(true)}
      onSearch={handleSearch}
    >
      <div className="max-w-[1800px] mx-auto">
        <IssueGrid
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          issues={issues}
          onIssueClick={(issue) => setSelectedIssue(issue)}
          onDelete={handleDeleteIssue}
          showDeleteButton={!!user}
        />
      </div>

      <CreateIssueDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateIssue}
      />

      {selectedIssue && selectedIssue.title && (
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
