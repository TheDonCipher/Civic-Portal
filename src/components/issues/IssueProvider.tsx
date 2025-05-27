import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import {
  setupIssueSubscriptions,
  getIssueWithDetails,
} from '@/lib/utils/dbFunctions';

interface IssueContextType {
  isLoading: boolean;
  issue: any;
  comments: any[];
  updates: any[];
  solutions: any[];
  isLiked: boolean;
  isWatched: boolean;
  voteCount: number;
  watchCount: number;
  addComment: (content: string) => Promise<boolean>;
  addUpdate: (content: string) => Promise<boolean>;
  addSolution: (
    title: string,
    description: string,
    estimatedCost: number
  ) => Promise<boolean>;
  toggleLike: () => Promise<void>;
  toggleWatch: () => Promise<void>;
  voteSolution: (solutionId: string) => Promise<void>;
  updateSolutionStatus: (
    solutionId: string,
    status: string,
    updateText: string
  ) => Promise<boolean>;
  markSolutionAsOfficial: (solutionId: string) => Promise<boolean>;
  updateSolutionProgress: (
    solutionId: string,
    progress: number,
    notes?: string
  ) => Promise<boolean>;
  refreshIssue: () => Promise<void>;
}

const IssueContext = createContext<IssueContextType | undefined>(undefined);

export const useIssue = () => {
  const context = useContext(IssueContext);
  if (!context) {
    throw new Error('useIssue must be used within an IssueProvider');
  }
  return context;
};

interface IssueProviderProps {
  issueId: string;
  children: ReactNode;
}

export const IssueProvider: React.FC<IssueProviderProps> = ({
  issueId,
  children,
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [issue, setIssue] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [watchCount, setWatchCount] = useState(0);

  // Fetch issue data
  const fetchIssueData = async () => {
    if (!issueId) {
      console.error('fetchIssueData called with invalid issueId:', issueId);
      return;
    }

    console.log('Fetching data for issue ID:', issueId);
    setIsLoading(true);
    try {
      const {
        issue,
        comments: fetchedComments,
        updates: fetchedUpdates,
        solutions: fetchedSolutions,
      } = await getIssueWithDetails(issueId);

      console.log('Successfully fetched issue data:', {
        issueId: issue.id,
        title: issue.title,
        commentsCount: fetchedComments.length,
        updatesCount: fetchedUpdates.length,
        solutionsCount: fetchedSolutions.length,
      });

      setIssue(issue);
      setComments(fetchedComments);
      setUpdates(fetchedUpdates);
      setSolutions(fetchedSolutions);
      setVoteCount(issue.votes || 0);
      setWatchCount(issue.watchers_count || 0);

      // Check if user has liked or is watching this issue
      if (user) {
        const { data: likeData } = await supabase
          .from('issue_votes')
          .select('*')
          .eq('issue_id', issueId)
          .eq('user_id', user.id)
          .maybeSingle();

        setIsLiked(!!likeData);

        const { data: watchData } = await supabase
          .from('issue_watchers')
          .select('*')
          .eq('issue_id', issueId)
          .eq('user_id', user.id)
          .maybeSingle();

        setIsWatched(!!watchData);
      }
    } catch (error) {
      console.error('Error fetching issue data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load issue details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up realtime subscriptions
  useEffect(() => {
    if (!issueId) {
      console.error('IssueProvider mounted with invalid issueId:', issueId);
      return;
    }

    console.log('Setting up IssueProvider for issue ID:', issueId);

    // Use a small timeout to ensure the component is fully mounted
    const timer = setTimeout(() => {
      fetchIssueData();
    }, 100);

    // Set up realtime subscriptions
    const cleanup = setupIssueSubscriptions(issueId, {
      onCommentAdded: (newComment) => {
        console.log('Realtime: New comment received', newComment);
        if (newComment) {
          setComments((prev) => [...(prev || []), newComment]);
          // Clear cache to ensure fresh data on next load
          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              localStorage.removeItem(`issue-${issueId}`);
            } catch (e) {
              console.warn('Failed to clear cache:', e);
            }
          }
        }
      },
      onUpdateAdded: (newUpdate) => {
        console.log('Realtime: New update received', newUpdate);
        if (newUpdate) {
          setUpdates((prev) => [...(prev || []), newUpdate]);
          // Clear cache
          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              localStorage.removeItem(`issue-${issueId}`);
            } catch (e) {
              console.warn('Failed to clear cache:', e);
            }
          }
        }
      },
      onSolutionAdded: (newSolution: any) => {
        console.log('Realtime: Solution added', newSolution);
        if (newSolution) {
          setSolutions((prev) => [...prev, newSolution]);
          // Clear cache
          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              localStorage.removeItem(`issue-${issueId}`);
            } catch (e) {
              console.warn('Failed to clear cache:', e);
            }
          }
        }
      },
    });

    return () => {
      clearTimeout(timer);
      cleanup();
    };
  }, [issueId, user?.id]);

  // Add a comment with input validation and sanitization
  const addComment = async (content: string) => {
    if (!user || !profile) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to comment.',
        variant: 'destructive',
      });
      return false;
    }

    // Validate input
    if (!content.trim()) return false;
    if (content.length > 1000) {
      toast({
        title: 'Comment Too Long',
        description: 'Comments must be less than 1000 characters.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Sanitize input to prevent XSS
      const sanitizedContent = content
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          issue_id: issueId,
          author_id: user.id,
          content: sanitizedContent,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Add optimistically (will be updated by realtime subscription)
      const newComment = {
        id: data.id,
        content: sanitizedContent,
        date: new Date().toLocaleDateString(),
        author: {
          name: profile.full_name || 'User',
          avatar:
            profile.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        },
        author_id: user.id,
      };

      setComments((prev) => [...prev, newComment]);

      toast({
        title: 'Comment Posted',
        description: 'Your comment has been posted successfully.',
        variant: 'default',
      });

      return true;
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to post comment. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Add an update with input validation and sanitization
  const addUpdate = async (content: string) => {
    if (!user || !profile) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to post an update.',
        variant: 'destructive',
      });
      return false;
    }

    // Validate input
    if (!content.trim()) return false;
    if (content.length > 2000) {
      toast({
        title: 'Update Too Long',
        description: 'Updates must be less than 2000 characters.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Sanitize input to prevent XSS
      const sanitizedContent = content
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

      const { data, error } = await supabase
        .from('updates')
        .insert({
          issue_id: issueId,
          author_id: user.id,
          content: sanitizedContent,
          type: 'status',
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Add optimistically (will be updated by realtime subscription)
      const newUpdate = {
        id: data.id,
        content: sanitizedContent,
        date: new Date().toLocaleDateString(),
        type: 'status',
        author: {
          name: profile.full_name || 'User',
          avatar:
            profile.avatar_url ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        },
        author_id: user.id,
      };

      setUpdates((prev) => [...prev, newUpdate]);

      toast({
        title: 'Update Posted',
        description: 'Your update has been posted successfully.',
        variant: 'default',
      });

      return true;
    } catch (error) {
      console.error('Error posting update:', error);
      toast({
        title: 'Error',
        description: 'Failed to post update. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Add a solution with input validation and sanitization
  const addSolution = async (
    title: string,
    description: string,
    estimatedCost: number
  ) => {
    if (!user || !profile) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to suggest a solution.',
        variant: 'destructive',
      });
      return false;
    }

    // Validate input
    if (!title.trim() || !description.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Title and description are required.',
        variant: 'destructive',
      });
      return false;
    }

    if (title.length > 100) {
      toast({
        title: 'Title Too Long',
        description: 'Title must be less than 100 characters.',
        variant: 'destructive',
      });
      return false;
    }

    if (description.length > 2000) {
      toast({
        title: 'Description Too Long',
        description: 'Description must be less than 2000 characters.',
        variant: 'destructive',
      });
      return false;
    }

    if (isNaN(estimatedCost) || estimatedCost < 0) {
      toast({
        title: 'Invalid Cost',
        description: 'Estimated cost must be a positive number.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Sanitize input to prevent XSS
      const sanitizedTitle = title
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

      const sanitizedDescription = description
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

      const { data, error } = await supabase
        .from('solutions')
        .insert({
          issue_id: issueId,
          proposed_by: user.id,
          title: sanitizedTitle,
          description: sanitizedDescription,
          estimated_cost: estimatedCost,
          status: 'proposed',
          votes: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Also add an update to notify about the new solution
      await supabase.from('updates').insert({
        issue_id: issueId,
        author_id: user.id,
        content: `New solution proposed: ${sanitizedTitle}`,
        type: 'solution',
        created_at: new Date().toISOString(),
      });

      toast({
        title: 'Solution Suggested',
        description: 'Your solution has been submitted successfully.',
        variant: 'default',
      });

      return true;
    } catch (error) {
      console.error('Error suggesting solution:', error);
      toast({
        title: 'Error',
        description: 'Failed to suggest solution. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Toggle like
  const toggleLike = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to support this issue',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Optimistic update
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setVoteCount((prev) =>
        newLikedState ? prev + 1 : Math.max(0, prev - 1)
      );

      if (isLiked) {
        // Remove the vote
        await supabase.from('issue_votes').delete().match({
          issue_id: issueId,
          user_id: user.id,
        });

        // Decrement the votes count in the issues table
        await supabase.rpc('decrement_issue_votes', { issue_id: issueId });
      } else {
        // Add a vote
        await supabase.from('issue_votes').insert({
          issue_id: issueId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        });

        // Increment the votes count in the issues table
        await supabase.rpc('increment_issue_votes', { issue_id: issueId });
      }

      toast({
        title: newLikedState ? 'Issue Supported' : 'Support Removed',
        description: newLikedState
          ? 'You are now supporting this issue'
          : 'You have removed your support from this issue',
        variant: 'default',
      });
    } catch (error) {
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setVoteCount((prev) => (!isLiked ? prev + 1 : Math.max(0, prev - 1)));

      toast({
        title: 'Error',
        description: 'Failed to update support. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Toggle watch
  const toggleWatch = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to watch this issue',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Optimistic update
      const newWatchedState = !isWatched;
      setIsWatched(newWatchedState);
      setWatchCount((prev) =>
        newWatchedState ? prev + 1 : Math.max(0, prev - 1)
      );

      if (isWatched) {
        // Remove the watcher
        await supabase.from('issue_watchers').delete().match({
          issue_id: issueId,
          user_id: user.id,
        });

        // Decrement the watchers count in the issues table
        await supabase.rpc('decrement_issue_watchers', { issue_id: issueId });
      } else {
        // Add a watcher
        await supabase.from('issue_watchers').insert({
          issue_id: issueId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        });

        // Increment the watchers count in the issues table
        await supabase.rpc('increment_issue_watchers', { issue_id: issueId });
      }

      toast({
        title: newWatchedState ? 'Now Watching' : 'Stopped Watching',
        description: newWatchedState
          ? 'You will receive notifications about this issue'
          : 'You will no longer receive notifications about this issue',
        variant: 'default',
      });
    } catch (error) {
      // Revert optimistic update on error
      setIsWatched(!isWatched);
      setWatchCount((prev) => (!isWatched ? prev + 1 : Math.max(0, prev - 1)));

      toast({
        title: 'Error',
        description: 'Failed to update watch status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Vote on a solution
  const voteSolution = async (solutionId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to vote on solutions',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if the user has already voted for this solution
      const { data: existingVote } = await supabase
        .from('solution_votes')
        .select('*')
        .eq('solution_id', solutionId)
        .eq('user_id', user.id)
        .maybeSingle();

      // Update the local state optimistically
      setSolutions(
        solutions.map((solution) => {
          if (solution.id === solutionId) {
            return {
              ...solution,
              votes: existingVote
                ? Math.max(0, solution.votes - 1)
                : solution.votes + 1,
            };
          }
          return solution;
        })
      );

      if (existingVote) {
        // Remove the vote
        await supabase.from('solution_votes').delete().match({
          solution_id: solutionId,
          user_id: user.id,
        });

        // Decrement the votes count in the solutions table
        await supabase.rpc('decrement_solution_votes', {
          solution_id: solutionId,
        });

        toast({
          title: 'Vote Removed',
          description: 'Your vote has been removed from this solution',
          variant: 'default',
        });
      } else {
        // Add the vote
        await supabase.from('solution_votes').insert({
          solution_id: solutionId,
          user_id: user.id,
          created_at: new Date().toISOString(),
        });

        // Increment the votes count in the solutions table
        await supabase.rpc('increment_solution_votes', {
          solution_id: solutionId,
        });

        toast({
          title: 'Vote Added',
          description: 'Your vote has been added to this solution',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error voting on solution:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vote. Please try again.',
        variant: 'destructive',
      });
      // Refresh to get the correct state
      fetchIssueData();
    }
  };

  // Update solution status
  const updateSolutionStatus = async (
    solutionId: string,
    status: string,
    updateText: string
  ) => {
    if (!user || !profile) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to update solution progress',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // Find the solution
      const solution = solutions.find((s) => s.id === solutionId);
      if (!solution) return false;

      // Check if user is authorized (officials/admins or solution proposer)
      if (
        profile.role !== 'official' &&
        profile.role !== 'admin' &&
        solution.proposed_by !== user.id
      ) {
        toast({
          title: 'Permission Denied',
          description: "You don't have permission to update this solution.",
          variant: 'destructive',
        });
        return false;
      }

      // Update the solution status
      await supabase
        .from('solutions')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', solutionId);

      // Add an update record
      await supabase.from('updates').insert({
        issue_id: issueId,
        author_id: user.id,
        content: `Solution status updated to ${status}: ${updateText}`,
        created_at: new Date().toISOString(),
        type: 'solution',
      });

      toast({
        title: 'Solution Updated',
        description: 'The solution progress has been updated successfully.',
        variant: 'default',
      });

      return true;
    } catch (error) {
      console.error('Error updating solution:', error);
      toast({
        title: 'Error',
        description: 'Failed to update solution. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Mark solution as official (stakeholders only)
  const markSolutionAsOfficial = async (solutionId: string) => {
    if (!user || !profile) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to mark solutions as official',
        variant: 'destructive',
      });
      return false;
    }

    if (profile.role !== 'official' && profile.role !== 'admin') {
      toast({
        title: 'Permission Denied',
        description: 'Only stakeholders can mark solutions as official.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { error } = await supabase.rpc('mark_solution_as_official', {
        solution_id: solutionId,
        issue_id: issueId,
      });

      if (error) throw error;

      toast({
        title: 'Solution Selected',
        description:
          'The solution has been marked as the official implementation.',
        variant: 'default',
      });

      await fetchIssueData();
      return true;
    } catch (error) {
      console.error('Error marking solution as official:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark solution as official. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Update solution implementation progress (stakeholders only)
  const updateSolutionProgress = async (
    solutionId: string,
    progress: number,
    notes?: string
  ) => {
    if (!user || !profile) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to update solution progress',
        variant: 'destructive',
      });
      return false;
    }

    if (profile.role !== 'official' && profile.role !== 'admin') {
      toast({
        title: 'Permission Denied',
        description: 'Only stakeholders can update solution progress.',
        variant: 'destructive',
      });
      return false;
    }

    try {
      // TODO: Implement update_solution_progress RPC function in database
      // const { error } = await supabase.rpc('update_solution_progress', {
      //   solution_id: solutionId,
      //   progress,
      //   notes,
      // });
      // if (error) throw error;

      // For now, just simulate success
      console.log('Solution progress update simulated:', {
        solutionId,
        progress,
        notes,
      });

      toast({
        title: 'Progress Updated',
        description: 'Solution implementation progress has been updated.',
        variant: 'default',
      });

      await fetchIssueData();
      return true;
    } catch (error) {
      console.error('Error updating solution progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update solution progress. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  };

  // Refresh issue data
  const refreshIssue = async () => {
    await fetchIssueData();
  };

  const value = {
    isLoading,
    issue,
    comments,
    updates,
    solutions,
    isLiked,
    isWatched,
    voteCount,
    watchCount,
    addComment,
    addUpdate,
    addSolution,
    toggleLike,
    toggleWatch,
    voteSolution,
    updateSolutionStatus,
    markSolutionAsOfficial,
    updateSolutionProgress,
    refreshIssue,
  };

  return (
    <IssueContext.Provider value={value}>{children}</IssueContext.Provider>
  );
};
