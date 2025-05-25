import React, { useState, useEffect } from 'react';
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

interface IssueCardProps {
  id?: string;
  title?: string;
  description?: string;
  category?: string;
  status?: 'open' | 'in-progress' | 'resolved';
  votes?: number;
  comments?: Array<{
    id: number;
    author: {
      name: string;
      avatar: string;
    };
    content: string;
    date: string;
  }>;
  date?: string;
  author?: {
    name: string;
    avatar: string;
  };
  author_id?: string;
  thumbnail?: string;
  constituency?: string;
  isLiked?: boolean;
  isWatched?: boolean;
  watchers?: number;
  onDelete?: (issueId: string) => void;
  showDeleteButton?: boolean;
}

const IssueCard = ({
  id = '1',
  title = 'Road Maintenance Required',
  description = 'Multiple potholes need attention along Serowe-Palapye road',
  category = 'Infrastructure',
  status = 'open',
  votes = 42,
  comments = [],
  date = '2024-03-20',
  author = {
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
  },
  author_id,
  thumbnail = 'https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg',
  constituency = 'Gaborone central',
  isLiked = false,
  isWatched = false,
  watchers = 0,
  onDelete,
  showDeleteButton = false,
}: IssueCardProps) => {
  const { toast } = useToast();
  const [liked, setLiked] = useState(isLiked);
  const [watched, setWatched] = useState(isWatched);
  const [localVotes, setLocalVotes] = useState(votes);
  const [localWatchers, setLocalWatchers] = useState(watchers);
  const [commentsCount, setCommentsCount] = useState(comments.length);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { user } = useAuth ? useAuth() : { user: null };

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
        // Still get counts for non-authenticated users
        try {
          // Get comments count from the correct table
          const { count: commentsCount } = await supabase
            .from('comments')
            .select('*', { count: 'exact' })
            .eq('issue_id', id);

          if (commentsCount !== null) {
            setCommentsCount(commentsCount);
          }

          // Get current votes and watchers from the issues table
          const { data: issueData } = await supabase
            .from('issues')
            .select('votes, watchers_count')
            .eq('id', id)
            .single();

          if (issueData) {
            setLocalVotes(issueData.votes || 0);
            setLocalWatchers(issueData.watchers_count || 0);
          }
        } catch (error) {
          console.error('Error getting counts:', error);
        }
        return;
      }

      try {
        // Check if user has liked this issue
        const { data: likeData } = await supabase
          .from('issue_votes')
          .select('*')
          .eq('issue_id', id)
          .eq('user_id', user.id)
          .single();

        setLiked(!!likeData);

        // Check if user is watching this issue
        const { data: watchData } = await supabase
          .from('issue_watchers')
          .select('*')
          .eq('issue_id', id)
          .eq('user_id', user.id)
          .single();

        setWatched(!!watchData);

        // Get comments count from the correct table
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact' })
          .eq('issue_id', id);

        if (commentsCount !== null) {
          setCommentsCount(commentsCount);
        }

        // Get current votes and watchers from the issues table
        const { data: issueData } = await supabase
          .from('issues')
          .select('votes, watchers_count')
          .eq('id', id)
          .single();

        if (issueData) {
          setLocalVotes(issueData.votes || 0);
          setLocalWatchers(issueData.watchers_count || 0);
        }
      } catch (error) {
        console.error('Error checking user interactions:', error);
      }
    };

    checkUserInteractions();

    // Set up real-time subscriptions for comments count
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
          // Refetch comments count when comments change
          try {
            const { count } = await supabase
              .from('comments')
              .select('*', { count: 'exact' })
              .eq('issue_id', id);

            if (count !== null) {
              setCommentsCount(count);
            }
          } catch (error) {
            console.error('Error updating comments count:', error);
          }
        }
      )
      .subscribe();

    // Set up real-time subscriptions for votes and watchers
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
            setLocalVotes(payload.new.votes || 0);
            setLocalWatchers(payload.new.watchers_count || 0);
          }
        }
      )
      .subscribe();

    // Set up real-time subscriptions for user votes
    const votesSubscription = supabase
      .channel(`votes-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issue_votes',
          filter: `issue_id=eq.${id}`,
        },
        async () => {
          if (user) {
            // Check if current user has voted
            try {
              const { data: likeData } = await supabase
                .from('issue_votes')
                .select('*')
                .eq('issue_id', id)
                .eq('user_id', user.id)
                .single();

              setLiked(!!likeData);
            } catch (error) {
              // User hasn't voted, which is fine
              setLiked(false);
            }
          }
        }
      )
      .subscribe();

    // Set up real-time subscriptions for user watchers
    const watchersSubscription = supabase
      .channel(`watchers-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issue_watchers',
          filter: `issue_id=eq.${id}`,
        },
        async () => {
          if (user) {
            // Check if current user is watching
            try {
              const { data: watchData } = await supabase
                .from('issue_watchers')
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
    open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    'in-progress':
      'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    resolved:
      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
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

    const newLiked = !liked;
    setLiked(newLiked);

    // Update the database
    try {
      if (newLiked) {
        // Add a vote
        await supabase.from('issue_votes').insert({
          issue_id: id,
          user_id: user.id,
        });

        // Increment the votes count in the issues table
        await supabase.rpc('increment_issue_votes', { issue_id: id });
      } else {
        // Remove the vote
        await supabase.from('issue_votes').delete().match({
          issue_id: id,
          user_id: user.id,
        });

        // Decrement the votes count in the issues table
        await supabase.rpc('decrement_issue_votes', { issue_id: id });
      }
    } catch (error) {
      console.error('Error updating vote:', error);
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

    const newWatched = !watched;
    setWatched(newWatched);

    // Update the database
    try {
      if (newWatched) {
        // Add a watcher
        await supabase.from('issue_watchers').insert({
          issue_id: id,
          user_id: user.id,
        });

        // Increment the watchers count in the issues table
        await supabase.rpc('increment_issue_watchers', { issue_id: id });
        setLocalWatchers((prev) => prev + 1);
      } else {
        // Remove the watcher
        await supabase.from('issue_watchers').delete().match({
          issue_id: id,
          user_id: user.id,
        });

        // Decrement the watchers count in the issues table
        await supabase.rpc('decrement_issue_watchers', { issue_id: id });
        setLocalWatchers((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error updating watcher:', error);
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
      toast({
        title: 'Error',
        description: 'Failed to delete issue. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <Card
      className="w-full h-auto bg-background hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col relative group border-border/50 hover:border-primary/20 overflow-hidden"
      data-testid="issue-card"
    >
      {/* Thumbnail Section */}
      <div className="relative overflow-hidden">
        <motion.div
          className="h-48 sm:h-52 w-full bg-cover bg-center relative"
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
              const categoryLower = category?.toLowerCase() || 'infrastructure';
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Status badge overlay */}
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className={cn(statusColors[status], 'shadow-sm backdrop-blur-sm')}
              data-testid="issue-status"
            >
              {status.charAt(0).toUpperCase() +
                status.slice(1).replace('-', ' ')}
            </Badge>
          </div>

          {/* Delete button overlay */}
          {canDelete && (
            <div className="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 text-white hover:text-destructive hover:bg-white/90 backdrop-blur-sm touch-target shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
                title="Delete Issue"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Content Section */}
      <CardHeader className="p-4 sm:p-5 space-y-3 flex-none">
        {/* Category and Location badges */}
        <div className="flex gap-2 items-center flex-wrap">
          <Badge
            variant="outline"
            data-testid="issue-category"
            className="text-xs font-medium border-primary/20 text-primary/80"
          >
            {category}
          </Badge>
          {constituency && (
            <Badge
              variant="secondary"
              className="bg-muted/50 text-muted-foreground text-xs font-medium"
              data-testid="issue-constituency"
            >
              <LandPlot className="h-3 w-3 mr-1" />
              <span className="hidden xs:inline">{constituency}</span>
              <span className="xs:hidden">{constituency.slice(0, 8)}...</span>
            </Badge>
          )}
        </div>

        {/* Title and Description */}
        <div className="space-y-2">
          <h3
            className="font-bold text-lg sm:text-xl leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200"
            data-testid="issue-title"
          >
            {title}
          </h3>
          <p
            className="text-sm text-muted-foreground line-clamp-3 leading-relaxed"
            data-testid="issue-description"
          >
            {description || 'No description available'}
          </p>
        </div>

        {/* Author Information */}
        <div className="flex items-center space-x-3 pt-2">
          <Avatar className="h-9 w-9 ring-2 ring-background shadow-sm">
            <AvatarImage src={author.avatar} alt={author.name} />
            <AvatarFallback className="text-sm font-medium">
              {author.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium text-foreground truncate"
              data-testid="issue-author"
            >
              {author.name}
            </p>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              <span className="hidden xs:inline">{formattedDate}</span>
              <span className="xs:hidden">{formattedDate.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Action Footer */}
      <CardFooter className="p-4 sm:p-5 flex justify-between items-center border-t border-border/50 bg-muted/20">
        {/* Left side - Engagement metrics */}
        <div className="flex items-center space-x-1">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-9 px-3 space-x-2 rounded-full transition-all duration-200 hover:bg-primary/10',
                liked && 'text-primary bg-primary/5'
              )}
              onClick={handleLike}
              data-testid="issue-like-button"
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
                  <ThumbsUp className="h-4 w-4" />
                </motion.div>
              </AnimatePresence>
              <span className="font-medium text-sm" data-testid="issue-votes">
                {localVotes}
              </span>
            </Button>
          </motion.div>

          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-3 space-x-2 rounded-full transition-all duration-200 hover:bg-muted/50"
            data-testid="issue-comments-button"
          >
            <MessageCircle className="h-4 w-4" />
            <span
              className="font-medium text-sm"
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
              'h-9 px-3 space-x-2 rounded-full transition-all duration-200 hover:bg-primary/10',
              watched && 'text-primary bg-primary/5'
            )}
            onClick={handleWatch}
            title={`${localWatchers} people watching`}
            data-testid="issue-watch-button"
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
                      'h-4 w-4 transition-all duration-200',
                      watched
                        ? 'text-primary stroke-[2.5px]'
                        : 'text-muted-foreground'
                    )}
                  />
                  {watched && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
            <span
              className="font-medium text-sm"
              data-testid="issue-watchers-count"
            >
              {localWatchers}
            </span>
          </Button>
        </motion.div>
      </CardFooter>

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
};

export default IssueCard;
