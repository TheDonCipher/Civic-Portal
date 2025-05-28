import React, { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  ThumbsUp,
  MessageCircle,
  Calendar,
  Eye,
  LandPlot,
  Trash2,
  Star,
  Coins,
  ArrowRight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../ui/use-toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { getCategoryDefaultImage } from '@/lib/utils/imageUpload';
import { handleApiError } from '@/lib/utils/errorHandler';
import { ariaLabels, generateAriaId } from '@/lib/utils/accessibilityUtils';
import { useConsentGuard } from '@/hooks/useConsentStatus';
import {
  getUserDisplayName,
  getUserAvatarUrl,
  getUserInitials,
} from '@/lib/utils/userUtils';
import type { UIIssue } from '@/types/enhanced';
import ThusangContributionWidget from '@/components/subscription/ThusangContributionWidget';
import { useDemoMode } from '@/providers/DemoProvider';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface IssueCardProps extends UIIssue {
  isLiked?: boolean;
  isWatched?: boolean;
  onDelete?: (issueId: string) => void;
  showDeleteButton?: boolean;
  layout?: 'grid' | 'list' | 'masonry';
  onClick?: () => void;
}

const IssueCard = memo<IssueCardProps>(
  ({
    id,
    title,
    description,
    category,
    status,
    priority,
    votes,
    vote_count,
    comment_count,
    view_count,
    comments,
    date,
    author,
    author_id,
    thumbnail = 'https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg',
    constituency,
    department,
    department_id,
    tags,
    isLiked = false,
    isWatched = false,
    watchers = 0,
    watchers_count,
    onDelete,
    showDeleteButton = false,
    layout = 'grid',
    onClick,
  }: IssueCardProps) => {
    const { toast } = useToast();
    const { isDemoMode } = useDemoMode();
    const [liked, setLiked] = useState(isLiked);
    const [watched, setWatched] = useState(isWatched);
    const [localVotes, setLocalVotes] = useState(vote_count || votes || 0);
    const [localWatchers, setLocalWatchers] = useState(
      watchers_count || watchers || 0
    );
    const [commentsCount, setCommentsCount] = useState(
      comment_count || comments.length || 0
    );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { user } = useAuth ? useAuth() : { user: null };
    const { requireConsent } = useConsentGuard();

    // Generate unique IDs for ARIA relationships
    const titleId = generateAriaId('issue-title', id);
    const descriptionId = generateAriaId('issue-description', id);
    const statusId = generateAriaId('issue-status', id);

    // Check if current user can delete this issue
    const canDelete =
      showDeleteButton && user && author_id && user.id === author_id;

    // Format the date to a more readable format
    const formattedDate = (() => {
      try {
        if (!date) return '';
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return date; // If invalid date, return as is

        // Format as Month Day, Year
        return dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      } catch (e) {
        return date;
      }
    })();

    // Check if user has liked or is watching this issue and get real-time counts
    useEffect(() => {
      const checkUserInteractions = async () => {
        if (!user) {
          // Still get counts for non-authenticated users using enhanced schema
          try {
            // Get current counts from the issues table (using cached counts from enhanced schema)
            const { data: issueData } = await supabase
              .from('issues')
              .select('vote_count, comment_count, view_count')
              .eq('id', id)
              .single();

            if (issueData) {
              setLocalVotes(issueData.vote_count || 0);
              setCommentsCount(issueData.comment_count || 0);
              // Update view count if needed
            }
          } catch (error) {
            console.error('Error getting counts:', error);
          }
          return;
        }

        try {
          // Check if user has voted on this issue using unified votes table
          const { data: voteData } = await supabase
            .from('votes')
            .select('*')
            .eq('issue_id', id)
            .eq('user_id', user.id)
            .single();

          setLiked(!!voteData);

          // Check if user is watching this issue using unified watchers table
          const { data: watchData } = await supabase
            .from('watchers')
            .select('*')
            .eq('issue_id', id)
            .eq('user_id', user.id)
            .single();

          setWatched(!!watchData);

          // Get current counts from the issues table (using enhanced schema cached counts)
          const { data: issueData } = await supabase
            .from('issues')
            .select('vote_count, comment_count, view_count')
            .eq('id', id)
            .single();

          if (issueData) {
            setLocalVotes(issueData.vote_count || 0);
            setCommentsCount(issueData.comment_count || 0);
            // Could also track view count here if needed
          }
        } catch (error) {
          console.error('Error checking user interactions:', error);
          handleApiError(error, 'IssueCard', 'checkUserInteractions');
        }
      };

      checkUserInteractions();

      // Set up real-time subscriptions for comments count using enhanced schema
      const commentsSubscription = supabase
        .channel(`comments-count-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `issue_id=eq.${id}`,
          },
          async () => {
            // Update the comment_count in the issues table when comments change
            try {
              const { count } = await supabase
                .from('comments')
                .select('*', { count: 'exact' })
                .eq('issue_id', id);

              if (count !== null) {
                // Update the cached count in the issues table
                await supabase
                  .from('issues')
                  .update({ comment_count: count })
                  .eq('id', id);

                setCommentsCount(count);
              }
            } catch (error) {
              console.error('Error updating comments count:', error);
            }
          }
        )
        .subscribe();

      // Set up real-time subscriptions for enhanced schema fields
      const issuesSubscription = supabase
        .channel(`issue-stats-${id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'issues',
            filter: `id=eq.${id}`,
          },
          (payload) => {
            if (payload.new) {
              setLocalVotes(payload.new['vote_count'] || 0);
              setCommentsCount(payload.new['comment_count'] || 0);
              // Could also update view_count if tracking views
            }
          }
        )
        .subscribe();

      // Set up real-time subscriptions for user votes using unified votes table
      const votesSubscription = supabase
        .channel(`votes-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'votes',
            filter: `issue_id=eq.${id}`,
          },
          async () => {
            if (user) {
              // Check if current user has voted
              try {
                const { data: voteData } = await supabase
                  .from('votes')
                  .select('*')
                  .eq('issue_id', id)
                  .eq('user_id', user.id)
                  .single();

                setLiked(!!voteData);
              } catch (error) {
                // User hasn't voted, which is fine
                setLiked(false);
              }
            }
          }
        )
        .subscribe();

      // Set up real-time subscriptions for user watchers using unified watchers table
      const watchersSubscription = supabase
        .channel(`watchers-${id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'watchers',
            filter: `issue_id=eq.${id}`,
          },
          async () => {
            if (user) {
              // Check if current user is watching
              try {
                const { data: watchData } = await supabase
                  .from('watchers')
                  .select('*')
                  .eq('issue_id', id)
                  .eq('user_id', user.id)
                  .single();

                setWatched(!!watchData);
              } catch (error) {
                // User isn't watching, which is fine
                setWatched(false);
              }
            }
          }
        )
        .subscribe();

      // Cleanup subscriptions
      return () => {
        commentsSubscription.unsubscribe();
        issuesSubscription.unsubscribe();
        votesSubscription.unsubscribe();
        watchersSubscription.unsubscribe();
      };
    }, [id, user]);

    const statusColors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
      open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      in_progress:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      // Legacy support
      'in-progress':
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      resolved:
        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      closed:
        'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300',
    };

    const handleLike = async (e: React.MouseEvent) => {
      e.stopPropagation();

      // If user is not authenticated, show a toast asking them to sign in
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to support this issue',
          action: (
            <a href="/?signin=true">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </a>
          ),
          variant: 'default',
          duration: 5000,
        });
        return;
      }

      // Check if user has required consent to vote
      if (!requireConsent('vote')) {
        return; // Consent dialog will be shown by the hook
      }

      const newLiked = !liked;
      setLiked(newLiked);

      // Update the database using unified votes table
      try {
        if (newLiked) {
          // Add a vote using unified votes table
          await supabase.from('votes').insert({
            issue_id: id,
            user_id: user.id,
            vote_type: 'up',
          });

          // Update the vote count in the issues table
          const { data: currentIssue } = await supabase
            .from('issues')
            .select('vote_count')
            .eq('id', id)
            .single();

          if (currentIssue) {
            await supabase
              .from('issues')
              .update({ vote_count: (currentIssue.vote_count || 0) + 1 })
              .eq('id', id);
          }
        } else {
          // Remove the vote
          await supabase.from('votes').delete().match({
            issue_id: id,
            user_id: user.id,
          });

          // Update the vote count in the issues table
          const { data: currentIssue } = await supabase
            .from('issues')
            .select('vote_count')
            .eq('id', id)
            .single();

          if (currentIssue) {
            await supabase
              .from('issues')
              .update({
                vote_count: Math.max(0, (currentIssue.vote_count || 0) - 1),
              })
              .eq('id', id);
          }
        }
      } catch (error) {
        console.error('Error updating vote:', error);
        handleApiError(error, 'IssueCard', 'handleLike');
      }

      toast({
        title: newLiked ? 'Added Support' : 'Removed Support',
        description: (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              {newLiked
                ? 'You are now supporting'
                : 'You have removed your support from'}
              <span className="font-medium"> {title}</span>
              <div className="text-sm text-muted-foreground mt-1">
                {category} • {constituency}
              </div>
            </div>
          </div>
        ),
        action: (
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4" />
            <span>{localVotes} supporters</span>
          </div>
        ),
        variant: 'default',
        duration: 3000,
      });
      setLocalVotes((prev) => (newLiked ? prev + 1 : prev - 1));
    };

    const handleWatch = async (e: React.MouseEvent) => {
      e.stopPropagation();

      // If user is not authenticated, show a toast asking them to sign in
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign in to watch this issue',
          action: (
            <a href="/?signin=true">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </a>
          ),
          variant: 'default',
          duration: 5000,
        });
        return;
      }

      // Check if user has required consent to watch
      if (!requireConsent('watch')) {
        return; // Consent dialog will be shown by the hook
      }

      const newWatched = !watched;
      setWatched(newWatched);

      // Update the database using unified watchers table
      try {
        if (newWatched) {
          // Add a watcher using unified watchers table
          await supabase.from('watchers').insert({
            issue_id: id,
            user_id: user.id,
          });

          setLocalWatchers((prev) => prev + 1);
        } else {
          // Remove the watcher
          await supabase.from('watchers').delete().match({
            issue_id: id,
            user_id: user.id,
          });

          setLocalWatchers((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error('Error updating watcher:', error);
        handleApiError(error, 'IssueCard', 'handleWatch');
      }

      toast({
        title: newWatched ? 'Now Watching' : 'Stopped Watching',
        description: (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              {newWatched
                ? 'You will receive notifications about'
                : 'You will no longer receive notifications about'}
              <span className="font-medium"> {title}</span>
              <div className="text-sm text-muted-foreground mt-1">
                {category} • {constituency}
              </div>
            </div>
          </div>
        ),
        action: (
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{newWatched ? 'Watching' : 'Not watching'}</span>
          </div>
        ),
        variant: 'default',
        duration: 3000,
      });
    };

    const handleDelete = async () => {
      if (!onDelete || !id || !user) return;

      try {
        // Check if user has permission to delete
        const { data: issueData, error: issueError } = await supabase
          .from('issues')
          .select('author_id')
          .eq('id', id)
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
          .eq('id', id);

        if (deleteError) throw deleteError;

        // Call the delete handler passed from parent to update local state
        await onDelete(id);

        toast({
          title: 'Issue Deleted',
          description: 'The issue has been successfully deleted.',
          variant: 'default',
        });
      } catch (error) {
        console.error('Error deleting issue:', error);
        handleApiError(error, 'IssueCard', 'handleDelete');
        toast({
          title: 'Error',
          description: `Failed to delete issue: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          variant: 'destructive',
        });
      } finally {
        setIsDeleteDialogOpen(false);
      }
    };

    // Enhanced card styling based on funding status and subscription tier
    const hasThusangFunding =
      isDemoMode && (status === 'open' || status === 'in-progress');
    const fundingAmount = hasThusangFunding
      ? Math.floor(Math.random() * 5000) + 1000
      : 0;
    const goalAmount = hasThusangFunding
      ? Math.floor(Math.random() * 10000) + 5000
      : 5000;
    const fundingProgress = hasThusangFunding
      ? (fundingAmount / goalAmount) * 100
      : 0;
    const isWellFunded = fundingProgress > 60;

    // Simplified layout-specific styling - cleaner and less crowded
    const getLayoutSpecificHeight = () => {
      switch (layout) {
        case 'masonry':
          return 'min-h-fit'; // Dynamic height for masonry
        case 'grid':
        default:
          return hasThusangFunding ? 'min-h-[380px]' : 'min-h-[320px]'; // Reduced height
      }
    };

    const getLayoutSpecificHover = () => {
      switch (layout) {
        case 'masonry':
          return 'hover:scale-[1.01] hover:z-10'; // Very subtle
        case 'grid':
        default:
          return 'hover:scale-[1.02] hover:z-10 hover:-translate-y-1'; // Clean hover
      }
    };

    const cardHeight = getLayoutSpecificHeight();
    const hoverEffect = getLayoutSpecificHover();

    // Enhanced card styling with modern design improvements
    const cardClassName = cn(
      'w-full bg-background transition-all duration-300 ease-out flex flex-col relative group overflow-hidden cursor-pointer',
      cardHeight,
      // Enhanced border and shadow styling
      'border border-border/60 hover:border-primary/40 shadow-sm hover:shadow-lg',
      hoverEffect,
      // Enhanced background with subtle gradient
      'bg-gradient-to-br from-background to-background/95',
      // Layout-specific adjustments with modern border radius
      layout === 'masonry' && 'rounded-xl mb-6',
      layout === 'grid' && 'rounded-xl',
      // Enhanced funding status styling with better contrast
      hasThusangFunding &&
        isWellFunded &&
        'ring-2 ring-green-400/20 border-green-200/50',
      hasThusangFunding &&
        !isWellFunded &&
        'ring-2 ring-blue-400/20 border-blue-200/50',
      // Enhanced priority styling with better visual hierarchy
      priority === 'high' && 'border-l-4 border-l-red-500 shadow-red-100/50',
      priority === 'urgent' &&
        'border-l-4 border-l-red-600 shadow-red-200/50 ring-1 ring-red-100',
      priority === 'medium' &&
        'border-l-4 border-l-yellow-500 shadow-yellow-100/50',
      priority === 'low' && 'border-l-4 border-l-green-500 shadow-green-100/50'
    );

    return (
      <Card
        className={cardClassName}
        data-testid="issue-card"
        role="article"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            console.log('Issue card activated via keyboard:', id);
          }
        }}
      >
        {/* Enhanced Thumbnail Section with modern styling */}
        <div className="relative overflow-hidden flex-shrink-0 rounded-t-xl">
          <div
            className={cn(
              'w-full bg-cover bg-center relative',
              // Enhanced layout-specific thumbnail heights
              layout === 'masonry' ? 'h-28' : 'h-36'
            )}
          >
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110 group-hover:scale-105"
              loading="lazy"
              data-testid="issue-thumbnail"
              onError={(e) => {
                const categoryLower =
                  category?.toLowerCase() || 'infrastructure';
                const fallbackImage = getCategoryDefaultImage(categoryLower);
                e.currentTarget.src = fallbackImage;
              }}
            />

            {/* Enhanced overlay with better gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Enhanced Status badge with better positioning */}
            <div className="absolute top-3 left-3">
              <Badge
                variant="secondary"
                className={cn(
                  statusColors[status],
                  'text-xs px-3 py-1.5 font-medium shadow-lg backdrop-blur-md border border-white/20',
                  'rounded-full' // More modern rounded badge
                )}
                data-testid="issue-status"
                id={statusId}
                aria-label={ariaLabels.issue.status(status)}
              >
                {status.charAt(0).toUpperCase() +
                  status.slice(1).replace('-', ' ')}
              </Badge>
            </div>

            {/* Enhanced funding indicator with better styling */}
            {hasThusangFunding && (
              <div className="absolute top-3 right-3">
                <Badge
                  className={cn(
                    'text-xs font-medium shadow-lg backdrop-blur-md border border-white/20',
                    'rounded-full px-3 py-1.5', // Consistent with status badge
                    isWellFunded
                      ? 'bg-green-600/90 text-white'
                      : 'bg-blue-600/90 text-white'
                  )}
                >
                  <Star className="h-3 w-3 mr-1" />
                  {Math.round(fundingProgress)}%
                </Badge>
              </div>
            )}

            {/* Clean delete button */}
            {canDelete && (
              <div className="absolute bottom-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-white hover:text-red-500 hover:bg-white/90 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeleteDialogOpen(true);
                  }}
                  title="Delete Issue"
                  aria-label={ariaLabels.button.delete('issue')}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Content Section with improved spacing */}
        <div
          className={cn(
            'flex-1 flex flex-col min-h-0',
            // Enhanced layout-specific padding and spacing
            layout === 'masonry'
              ? 'p-5 sm:p-6 space-y-4'
              : 'p-5 sm:p-6 space-y-4'
          )}
        >
          {/* Enhanced Category and location badges */}
          <div className="flex gap-2 items-center flex-wrap">
            <Badge
              variant="outline"
              data-testid="issue-category"
              className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 border-primary/20 bg-primary/5 text-primary"
            >
              {category}
            </Badge>
            {constituency && (
              <Badge
                variant="secondary"
                className="text-xs px-3 py-1.5 rounded-full bg-muted/80 text-muted-foreground border border-border/50"
                data-testid="issue-constituency"
              >
                <LandPlot className="h-3 w-3 mr-1.5" />
                <span className="hidden sm:inline">{constituency}</span>
                <span className="sm:hidden">{constituency.slice(0, 8)}...</span>
              </Badge>
            )}
            {priority && priority !== 'medium' && (
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs font-semibold px-3 py-1.5 rounded-full border',
                  priority === 'high' &&
                    'bg-red-50 text-red-700 border-red-200',
                  priority === 'urgent' &&
                    'bg-red-100 text-red-800 border-red-300 animate-pulse',
                  priority === 'low' &&
                    'bg-green-50 text-green-700 border-green-200'
                )}
              >
                {priority}
              </Badge>
            )}
          </div>

          {/* Enhanced Title and Description with better typography */}
          <div className="flex-1 min-h-0 space-y-3">
            <h3
              id={titleId}
              className={cn(
                'font-bold leading-tight text-foreground tracking-tight',
                // Enhanced layout-specific title sizing
                layout === 'masonry'
                  ? 'text-lg line-clamp-2'
                  : 'text-xl line-clamp-2'
              )}
              data-testid="issue-title"
            >
              {title}
            </h3>
            <p
              id={descriptionId}
              className={cn(
                'text-muted-foreground leading-relaxed tracking-wide',
                // Enhanced layout-specific description sizing
                layout === 'masonry'
                  ? 'text-sm line-clamp-3'
                  : 'text-sm line-clamp-3'
              )}
              data-testid="issue-description"
            >
              {description || 'No description available'}
            </p>
          </div>

          {/* Enhanced Author Information with better spacing */}
          <div className="flex items-center space-x-3 pt-3 border-t border-border/30">
            <Avatar className="h-9 w-9 ring-2 ring-border/20">
              <AvatarImage
                src={getUserAvatarUrl({
                  id: author_id,
                  avatar_url: author?.avatar,
                })}
                alt={getUserDisplayName(
                  { full_name: author?.name },
                  null,
                  'User'
                )}
              />
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {getUserInitials({ full_name: author?.name })}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-foreground truncate text-sm"
                data-testid="issue-author"
              >
                {getUserDisplayName(
                  { full_name: author?.name },
                  null,
                  'Anonymous User'
                )}
              </p>
              <div className="flex items-center text-muted-foreground text-xs mt-0.5">
                <Calendar className="h-3 w-3 mr-1.5" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Action Footer with better spacing */}
        <div className="flex-shrink-0 border-t border-border/30 bg-muted/20">
          <div className="flex justify-between items-center px-4 py-3">
            {/* Left side - Essential metrics with improved styling */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-7 px-3 rounded-full text-xs font-medium transition-all duration-200',
                  liked
                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                onClick={handleLike}
                data-testid="issue-like-button"
                aria-label={ariaLabels.issue.vote}
                aria-pressed={liked}
              >
                <ThumbsUp className="h-3 w-3" />
                <span className="ml-1.5">{localVotes}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-3 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                data-testid="issue-comments-button"
                aria-label={ariaLabels.issue.comments(commentsCount)}
              >
                <MessageCircle className="h-3 w-3" />
                <span className="ml-1.5">{commentsCount}</span>
              </Button>
            </div>

            {/* Right side - Watch button with enhanced styling */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 px-3 rounded-full text-xs font-medium transition-all duration-200',
                watched
                  ? 'text-primary bg-primary/10 hover:bg-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              onClick={handleWatch}
              data-testid="issue-watch-button"
              aria-label={
                watched ? ariaLabels.issue.unwatch : ariaLabels.issue.watch
              }
              aria-pressed={watched}
            >
              <Eye className="h-3 w-3" />
              <span className="ml-1.5">{localWatchers}</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Thusang Community Funding */}
        {hasThusangFunding && (
          <div className="border-t border-border/30 bg-gradient-to-r from-blue-50/50 to-green-50/50 dark:from-blue-950/20 dark:to-green-950/20">
            <div className="px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Coins className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                    Community Funding
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-3 text-xs gap-1.5 rounded-full border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                  onClick={() => {
                    // Handle fund button click - opens contribution dialog
                    console.log('Fund button clicked for issue:', id);
                  }}
                >
                  <ArrowRight className="w-3 h-3" />
                  Fund
                </Button>
              </div>
              <div className="text-xs text-muted-foreground font-medium">
                BWP {(fundingAmount / 1000).toFixed(1)}k of{' '}
                {(goalAmount / 1000).toFixed(1)}k •{' '}
                <span className="text-blue-600 font-semibold">
                  {isDemoMode ? Math.floor(Math.random() * 50) + 5 : 0}{' '}
                  contributors
                </span>
              </div>
            </div>
          </div>
        )}

        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Issue</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{title}"? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    // Only re-render if essential props have changed
    return (
      prevProps.id === nextProps.id &&
      prevProps.title === nextProps.title &&
      prevProps.description === nextProps.description &&
      prevProps.status === nextProps.status &&
      prevProps.votes === nextProps.votes &&
      prevProps.comments.length === nextProps.comments.length &&
      prevProps.watchers === nextProps.watchers &&
      prevProps.isLiked === nextProps.isLiked &&
      prevProps.isWatched === nextProps.isWatched &&
      prevProps.showDeleteButton === nextProps.showDeleteButton &&
      prevProps.author_id === nextProps.author_id &&
      // Compare date strings directly since they're formatted
      prevProps.date === nextProps.date
    );
  }
);

// Set display name for debugging
IssueCard.displayName = 'IssueCard';

export default IssueCard;
