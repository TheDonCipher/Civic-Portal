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
  }: IssueCardProps) => {
    const { toast } = useToast();
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

    return (
      <Card
        className="w-full h-[420px] sm:h-[440px] bg-background hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col relative group border-border/50 hover:border-primary/20 overflow-hidden"
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
        {/* Compact Thumbnail Section */}
        <div className="relative overflow-hidden flex-shrink-0">
          <motion.div
            className="h-28 sm:h-32 w-full bg-cover bg-center relative"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover"
              loading="eager"
              data-testid="issue-thumbnail"
              onError={(e) => {
                console.log('Image failed to load:', thumbnail);
                const categoryLower =
                  category?.toLowerCase() || 'infrastructure';
                const fallbackImage = getCategoryDefaultImage(categoryLower);
                e.currentTarget.src = fallbackImage;
                console.log(
                  'Using fallback image for category:',
                  categoryLower,
                  fallbackImage
                );
              }}
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            {/* Status badge overlay */}
            <div className="absolute top-2 left-2">
              <Badge
                variant="secondary"
                className={cn(
                  statusColors[status],
                  'shadow-sm backdrop-blur-sm text-xs px-2 py-1'
                )}
                data-testid="issue-status"
                id={statusId}
                aria-label={ariaLabels.issue.status(status)}
              >
                {status.charAt(0).toUpperCase() +
                  status.slice(1).replace('-', ' ')}
              </Badge>
            </div>

            {/* Delete button overlay */}
            {canDelete && (
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 text-white hover:text-destructive hover:bg-white/90 backdrop-blur-sm touch-target shadow-sm"
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
          </motion.div>
        </div>

        {/* Compact Content Section */}
        <div className="flex-1 flex flex-col p-3 sm:p-4 space-y-2.5 min-h-0">
          {/* Category and Location badges */}
          <div className="flex gap-1.5 items-center flex-wrap">
            <Badge
              variant="outline"
              data-testid="issue-category"
              className="text-xs font-medium border-primary/20 text-primary/80 px-2 py-0.5"
            >
              {category}
            </Badge>
            {constituency && (
              <Badge
                variant="secondary"
                className="bg-muted/50 text-muted-foreground text-xs font-medium px-2 py-0.5"
                data-testid="issue-constituency"
              >
                <LandPlot className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">{constituency}</span>
                <span className="xs:hidden">{constituency.slice(0, 6)}...</span>
              </Badge>
            )}
          </div>

          {/* Title and Description */}
          <div className="flex-1 space-y-1.5 min-h-0">
            <h3
              id={titleId}
              className="font-bold text-base leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200"
              data-testid="issue-title"
            >
              {title}
            </h3>
            <p
              id={descriptionId}
              className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1"
              data-testid="issue-description"
            >
              {description || 'No description available'}
            </p>
          </div>

          {/* Compact Author Information */}
          <div className="flex items-center space-x-2 pt-1">
            <Avatar className="h-7 w-7 ring-1 ring-background shadow-sm">
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
              <AvatarFallback className="text-xs font-medium">
                {getUserInitials({ full_name: author?.name })}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-medium text-foreground truncate"
                data-testid="issue-author"
              >
                {getUserDisplayName(
                  { full_name: author?.name },
                  null,
                  'Anonymous User'
                )}
              </p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">{formattedDate}</span>
                <span className="xs:hidden">{formattedDate.split(' ')[0]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Action Footer */}
        <div className="flex-shrink-0 px-3 sm:px-4 py-2.5 flex justify-between items-center border-t border-border/50 bg-muted/10">
          {/* Left side - Engagement metrics */}
          <div className="flex items-center space-x-0.5">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 px-2.5 space-x-1.5 rounded-full transition-all duration-200 hover:bg-primary/10',
                  liked && 'text-primary bg-primary/5'
                )}
                onClick={handleLike}
                data-testid="issue-like-button"
                aria-label={ariaLabels.issue.vote}
                aria-pressed={liked}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={liked ? 'liked' : 'unliked'}
                    initial={{ scale: 0.8, opacity: 0, rotate: -180 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      rotate: 0,
                    }}
                    exit={{ scale: 0.8, opacity: 0, rotate: 180 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                    }}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                  </motion.div>
                </AnimatePresence>
                <span className="font-medium text-xs" data-testid="issue-votes">
                  {localVotes}
                </span>
              </Button>
            </motion.div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 space-x-1.5 rounded-full transition-all duration-200 hover:bg-muted/50"
              data-testid="issue-comments-button"
              aria-label={ariaLabels.issue.comments(commentsCount)}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span
                className="font-medium text-xs"
                data-testid="issue-comments-count"
              >
                {commentsCount}
              </span>
            </Button>
          </div>

          {/* Right side - Watch button */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 px-2.5 space-x-1.5 rounded-full transition-all duration-200 hover:bg-primary/10',
                watched && 'text-primary bg-primary/5'
              )}
              onClick={handleWatch}
              title={`${localWatchers} people watching`}
              data-testid="issue-watch-button"
              aria-label={
                watched ? ariaLabels.issue.unwatch : ariaLabels.issue.watch
              }
              aria-pressed={watched}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={watched ? 'watched' : 'unwatched'}
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{ scale: 0.8, opacity: 0, y: -10 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  }}
                >
                  <div className="relative">
                    <Eye
                      className={cn(
                        'h-3.5 w-3.5 transition-all duration-200',
                        watched
                          ? 'text-primary stroke-[2.5px]'
                          : 'text-muted-foreground'
                      )}
                    />
                    {watched && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
              <span
                className="font-medium text-xs"
                data-testid="issue-watchers-count"
              >
                {localWatchers}
              </span>
            </Button>
          </motion.div>
        </div>

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
