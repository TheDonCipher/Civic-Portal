import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import {
  Lightbulb,
  ThumbsUp,
  DollarSign,
  Plus,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDemoMode } from '@/providers/DemoProvider';
import { demoSolutions } from '@/lib/demoData';
import { safeDate } from '@/lib/utils/dateUtils';
import { handleApiError } from '@/lib/utils/errorHandler';
import type { UISolution } from '@/types/enhanced';

// ✅ Use the centralized UISolution type
type Solution = UISolution;

interface SolutionsTabProps {
  issueId: string;
  onCountChange?: (count: number) => void;
}

export const SolutionsTab: React.FC<SolutionsTabProps> = ({
  issueId,
  onCountChange,
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSolution, setNewSolution] = useState({
    title: '',
    description: '',
    estimated_cost: '',
  });

  // Fetch solutions
  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        // Check if we should use demo mode - either explicitly in demo mode or if issue ID looks like demo data
        const shouldUseDemoMode =
          isDemoMode ||
          (typeof issueId === 'string' && issueId.startsWith('issue-'));

        if (shouldUseDemoMode) {
          // Use demo data
          const issueSolutions = demoSolutions
            .filter((solution) => solution.issue_id === issueId)
            .map((solution) => ({
              id: solution.id,
              title: solution.title,
              description: solution.description,
              estimated_cost: solution.estimated_cost,
              votes: solution.votes,
              status: solution.status,
              created_at: safeDate.toString(solution.created_at),
              proposed_by: solution.proposed_by,
              issue_id: solution.issue_id,
              profiles: {
                full_name: solution.proposer_name,
                avatar_url: solution.proposer_avatar,
                role: solution.proposed_by.includes('official')
                  ? 'official'
                  : 'citizen',
              },
              user_voted: false, // In demo mode, user hasn't voted
            }))
            .sort((a, b) => b.votes - a.votes);

          setSolutions(issueSolutions);
          setIsLoading(false);
          return;
        }

        // Validate issue ID format for database queries
        if (!issueId || typeof issueId !== 'string') {
          throw new Error('Invalid issue ID provided');
        }

        // Check if issue ID looks like a UUID (basic validation)
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(issueId)) {
          console.warn('Issue ID does not appear to be a valid UUID:', issueId);
          // If it's not a UUID and not demo mode, show empty state instead of erroring
          setSolutions([]);
          setIsLoading(false);
          return;
        }

        // Regular database fetch for non-demo mode
        let { data, error } = await supabase
          .from('solutions')
          .select(
            `
            id,
            title,
            description,
            estimated_cost,
            votes,
            status,
            created_at,
            proposed_by,
            issue_id
          `
          )
          .eq('issue_id', issueId)
          .order('votes', { ascending: false });

        if (error) throw error;

        // Then fetch profile data separately for each solution
        const solutionsWithProfiles = await Promise.all(
          (data || []).map(async (solution) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url, role')
              .eq('id', solution.proposed_by)
              .single();

            return {
              ...solution,
              profiles: profile,
            };
          })
        );

        // Check if user has voted on each solution
        if (user && solutionsWithProfiles) {
          const solutionIds = solutionsWithProfiles.map((s) => s.id);
          const { data: votes } = await supabase
            .from('solution_votes')
            .select('solution_id')
            .eq('user_id', user.id)
            .in('solution_id', solutionIds);

          const votedSolutionIds = new Set(
            votes?.map((v) => v.solution_id) || []
          );

          const solutionsWithVotes = solutionsWithProfiles.map((solution) => ({
            ...solution,
            created_at: safeDate.toString(solution.created_at),
            user_voted: votedSolutionIds.has(solution.id),
          }));

          setSolutions(solutionsWithVotes);
        } else {
          // Transform database results to UI-safe format
          const transformedSolutions = (solutionsWithProfiles || []).map(
            (solution) => ({
              ...solution,
              created_at: safeDate.toString(solution.created_at),
            })
          );
          setSolutions(transformedSolutions);
        }
      } catch (error) {
        console.error('Error fetching solutions:', error);
        handleApiError(error, 'SolutionsTab', 'fetchSolutions');

        // Only show error toast for real database errors, not demo mode issues
        const shouldUseDemoMode =
          isDemoMode ||
          (typeof issueId === 'string' && issueId.startsWith('issue-'));
        if (!shouldUseDemoMode) {
          toast({
            title: 'Error',
            description: `Failed to load solutions: ${
              error instanceof Error ? error.message : 'Unknown error'
            }`,
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolutions();

    // Subscribe to real-time updates only for valid database mode
    const shouldUseDemoMode =
      isDemoMode ||
      (typeof issueId === 'string' && issueId.startsWith('issue-'));
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!shouldUseDemoMode && issueId && uuidRegex.test(issueId)) {
      const solutionsSubscription = supabase
        .channel(`solutions-${issueId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'solutions',
            filter: `issue_id=eq.${issueId}`,
          },
          () => {
            fetchSolutions();
          }
        )
        .subscribe();

      // Subscribe to real-time updates for solution votes
      const votesSubscription = supabase
        .channel(`solution-votes-${issueId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'solution_votes',
          },
          () => {
            fetchSolutions();
          }
        )
        .subscribe();

      return () => {
        solutionsSubscription.unsubscribe();
        votesSubscription.unsubscribe();
      };
    }

    // Return empty cleanup function for demo mode or invalid IDs
    return () => {};
  }, [issueId, user, toast, isDemoMode]);

  // Report count changes to parent component
  useEffect(() => {
    if (onCountChange) {
      onCountChange(solutions.length);
    }
  }, [solutions.length, onCountChange]);

  const handleSubmitSolution = async () => {
    if (!user || !newSolution.title.trim() || !newSolution.description.trim())
      return;

    setIsSubmitting(true);
    try {
      // Check if we should use demo mode
      const shouldUseDemoMode =
        isDemoMode ||
        (typeof issueId === 'string' && issueId.startsWith('issue-'));

      if (shouldUseDemoMode) {
        // In demo mode, just simulate adding a solution
        const newDemoSolution = {
          id: `solution-demo-${Date.now()}`,
          title: newSolution.title.trim(),
          description: newSolution.description.trim(),
          estimated_cost: parseInt(newSolution.estimated_cost) || 0,
          votes: 0,
          status: 'proposed',
          created_at: new Date().toISOString(),
          proposed_by: user.id || 'demo-user',
          issue_id: issueId,
          profiles: {
            full_name: profile?.full_name || 'Demo User',
            avatar_url: profile?.avatar_url || null,
            role: profile?.role || 'citizen',
          },
          user_voted: false,
        };

        setSolutions((prev) => [newDemoSolution, ...prev]);
        setNewSolution({ title: '', description: '', estimated_cost: '' });
        setShowAddForm(false);
        toast({
          title: 'Success',
          description: 'Solution proposed successfully (Demo Mode)',
        });
        return;
      }

      // Validate issue ID for database operations
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!issueId || !uuidRegex.test(issueId)) {
        toast({
          title: 'Error',
          description: 'Invalid issue ID. Cannot propose solution.',
          variant: 'destructive',
        });
        return;
      }

      // Regular database insert for non-demo mode
      const { error } = await supabase.from('solutions').insert({
        issue_id: issueId,
        proposed_by: user.id,
        title: newSolution.title.trim(),
        description: newSolution.description.trim(),
        estimated_cost: parseInt(newSolution.estimated_cost) || 0,
        status: 'proposed',
      });

      if (error) throw error;

      setNewSolution({ title: '', description: '', estimated_cost: '' });
      setShowAddForm(false);
      toast({
        title: 'Success',
        description: 'Solution proposed successfully',
      });
    } catch (error) {
      console.error('Error adding solution:', error);
      handleApiError(error, 'SolutionsTab', 'handleSubmitSolution');
      toast({
        title: 'Error',
        description: `Failed to propose solution: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteSolution = async (
    solutionId: string,
    currentVotes: number,
    userVoted: boolean
  ) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to vote on solutions',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isDemoMode) {
        // In demo mode, just update local state
        setSolutions((prev) =>
          prev.map((solution) =>
            solution.id === solutionId
              ? {
                  ...solution,
                  votes: userVoted ? currentVotes - 1 : currentVotes + 1,
                  user_voted: !userVoted,
                }
              : solution
          )
        );

        toast({
          title: userVoted ? 'Vote removed' : 'Vote added',
          description: `Solution ${
            userVoted ? 'unvoted' : 'voted'
          } successfully (Demo Mode)`,
        });
        return;
      }

      // Regular database operations for non-demo mode
      if (userVoted) {
        // Remove vote
        await supabase
          .from('solution_votes')
          .delete()
          .eq('solution_id', solutionId)
          .eq('user_id', user.id);

        // Use RPC function to decrement votes
        await supabase.rpc('decrement_solution_votes', {
          solution_id: solutionId,
        });
      } else {
        // Add vote
        await supabase
          .from('solution_votes')
          .insert({ solution_id: solutionId, user_id: user.id });

        // Use RPC function to increment votes
        await supabase.rpc('increment_solution_votes', {
          solution_id: solutionId,
        });
      }

      // Update local state
      setSolutions((prev) =>
        prev.map((solution) =>
          solution.id === solutionId
            ? {
                ...solution,
                votes: userVoted ? currentVotes - 1 : currentVotes + 1,
                user_voted: !userVoted,
              }
            : solution
        )
      );
    } catch (error) {
      console.error('Error voting on solution:', error);
      toast({
        title: 'Error',
        description: 'Failed to vote on solution',
        variant: 'destructive',
      });
    }
  };

  // Handle selecting official solution (stakeholders only)
  const handleSelectOfficialSolution = async (solutionId: string) => {
    if (!user || !profile) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to select solutions',
        variant: 'destructive',
      });
      return;
    }

    // Check if user is stakeholder
    if (profile.role !== 'official' && profile.role !== 'admin') {
      toast({
        title: 'Permission Denied',
        description: 'Only government officials can select official solutions',
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isDemoMode) {
        // In demo mode, just update local state
        setSolutions((prev) =>
          prev.map((solution) =>
            solution.id === solutionId
              ? { ...solution, status: 'approved' }
              : solution
          )
        );

        toast({
          title: 'Solution Selected',
          description: 'Solution marked as official implementation (Demo Mode)',
          variant: 'default',
        });
        return;
      }

      // Regular database operations for non-demo mode
      const { error } = await supabase.rpc('mark_solution_as_official', {
        solution_id: solutionId,
        issue_id: issueId,
      });

      if (error) throw error;

      // Update local state
      setSolutions((prev) =>
        prev.map((solution) =>
          solution.id === solutionId
            ? { ...solution, status: 'approved' }
            : solution
        )
      );

      toast({
        title: 'Solution Selected',
        description:
          'The solution has been marked as the official implementation.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error selecting official solution:', error);
      toast({
        title: 'Error',
        description: 'Failed to select solution. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading solutions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Solution Button */}
      {user && !showAddForm && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowAddForm(true)}
            size="sm"
            variant="outline"
          >
            <Plus className="h-4 w-4 mr-2" />
            Propose Solution
          </Button>
        </div>
      )}

      {/* Add Solution Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border rounded-lg p-4 space-y-4 bg-muted/50"
        >
          <h4 className="font-medium flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Propose a Solution
          </h4>
          <div className="space-y-3">
            <Input
              placeholder="Solution title..."
              value={newSolution.title}
              onChange={(e) =>
                setNewSolution((prev) => ({ ...prev, title: e.target.value }))
              }
            />
            <Textarea
              placeholder="Describe your solution in detail..."
              value={newSolution.description}
              onChange={(e) =>
                setNewSolution((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="min-h-[100px]"
            />
            <Input
              type="number"
              placeholder="Estimated cost (BWP)"
              value={newSolution.estimated_cost}
              onChange={(e) =>
                setNewSolution((prev) => ({
                  ...prev,
                  estimated_cost: e.target.value,
                }))
              }
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitSolution}
                disabled={
                  !newSolution.title.trim() ||
                  !newSolution.description.trim() ||
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Lightbulb className="h-4 w-4 mr-2" />
                )}
                Propose
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Solutions List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {solutions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <Lightbulb className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No solutions proposed yet.</p>
              {user && (
                <p className="text-sm mt-1">
                  Be the first to propose a solution!
                </p>
              )}
            </motion.div>
          ) : (
            solutions.map((solution, index) => (
              <motion.div
                key={solution.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 space-y-3 bg-background"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{solution.title}</h4>
                      <Badge className={getStatusColor(solution.status)}>
                        {solution.status.charAt(0).toUpperCase() +
                          solution.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {solution.description}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={solution.profiles?.avatar_url || undefined}
                            alt={solution.profiles?.full_name || 'User'}
                          />
                          <AvatarFallback>
                            {solution.profiles?.full_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          {solution.profiles?.full_name || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          BWP {solution.estimated_cost.toLocaleString()}
                        </span>
                      </div>
                      <span>
                        {formatDistanceToNow(new Date(solution.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    {/* Vote button */}
                    <div className="flex flex-col items-center space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'h-8 w-8 p-0',
                          solution.user_voted && 'text-primary bg-primary/10'
                        )}
                        onClick={() =>
                          handleVoteSolution(
                            solution.id,
                            solution.votes,
                            solution.user_voted || false
                          )
                        }
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="text-xs font-medium">
                        {solution.votes}
                      </span>
                    </div>

                    {/* Official selection button for stakeholders */}
                    {user &&
                      (profile?.role === 'official' ||
                        profile?.role === 'admin') &&
                      solution.status === 'proposed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2 text-xs bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                          onClick={() =>
                            handleSelectOfficialSolution(solution.id)
                          }
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Select
                        </Button>
                      )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Sign in prompt */}
      {!user && (
        <div className="border-t pt-4 text-center text-muted-foreground">
          <p>Please sign in to propose solutions and vote</p>
        </div>
      )}
    </div>
  );
};
