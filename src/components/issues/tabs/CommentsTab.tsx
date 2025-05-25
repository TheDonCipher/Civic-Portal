import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoMode } from '@/providers/DemoProvider';
import { demoComments } from '@/lib/demoData';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
}

interface CommentsTabProps {
  issueId: string;
  onCountChange?: (count: number) => void;
}

export const CommentsTab: React.FC<CommentsTabProps> = ({
  issueId,
  onCountChange,
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (isDemoMode) {
          // Use demo data
          const issueComments = demoComments
            .filter((comment) => comment.issue_id === issueId)
            .map((comment) => ({
              id: comment.id,
              content: comment.content,
              created_at: comment.created_at,
              author_id: comment.author_id,
              profiles: {
                full_name: comment.author_name,
                avatar_url: comment.author_avatar,
                role: comment.author_id.includes('official')
                  ? 'official'
                  : 'citizen',
              },
            }));

          setComments(issueComments);
          setIsLoading(false);
          return;
        }

        // Regular database fetch for non-demo mode
        let { data, error } = await supabase
          .from('comments')
          .select(
            `
            id,
            content,
            created_at,
            author_id
          `
          )
          .eq('issue_id', issueId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Then fetch profile data separately for each comment
        const commentsWithProfiles = await Promise.all(
          (data || []).map(async (comment) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url, role')
              .eq('id', comment.author_id)
              .single();

            return {
              ...comment,
              profiles: profile,
            };
          })
        );

        setComments(commentsWithProfiles || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        if (!isDemoMode) {
          toast({
            title: 'Error',
            description: `Failed to load comments: ${
              error.message || 'Unknown error'
            }`,
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();

    // Subscribe to real-time updates only in non-demo mode
    if (!isDemoMode) {
      const subscription = supabase
        .channel(`comments-${issueId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `issue_id=eq.${issueId}`,
          },
          () => {
            fetchComments();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [issueId, toast, isDemoMode]);

  // Report count changes to parent component
  useEffect(() => {
    if (onCountChange) {
      onCountChange(comments.length);
    }
  }, [comments.length, onCountChange]);

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        // In demo mode, just simulate adding a comment
        const newDemoComment = {
          id: `comment-demo-${Date.now()}`,
          content: newComment.trim(),
          created_at: new Date().toISOString(),
          author_id: user.id || 'demo-user',
          profiles: {
            full_name: profile?.full_name || 'Demo User',
            avatar_url: profile?.avatar_url || null,
            role: profile?.role || 'citizen',
          },
        };

        setComments((prev) => [...prev, newDemoComment]);
        setNewComment('');
        toast({
          title: 'Success',
          description: 'Comment added successfully (Demo Mode)',
        });
        return;
      }

      // Regular database insert for non-demo mode
      const { error } = await supabase.from('comments').insert({
        issue_id: issueId,
        author_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment('');
      toast({
        title: 'Success',
        description: 'Comment added successfully',
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: 'Error',
        description: `Failed to add comment: ${
          error.message || 'Unknown error'
        }`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading comments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {comments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No comments yet. Be the first to comment!</p>
            </motion.div>
          ) : (
            comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex space-x-3 p-3 rounded-lg bg-muted/50"
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage
                    src={comment.profiles?.avatar_url || undefined}
                    alt={comment.profiles?.full_name || 'User'}
                  />
                  <AvatarFallback>
                    {comment.profiles?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {comment.profiles?.full_name || 'Anonymous User'}
                    </span>
                    {comment.profiles?.role === 'official' && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Official
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{comment.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Comment Form */}
      {user ? (
        <div className="border-t pt-4 space-y-3">
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage
                src={profile?.avatar_url || undefined}
                alt={profile?.full_name || 'You'}
              />
              <AvatarFallback>
                {profile?.full_name?.charAt(0) || 'Y'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t pt-4 text-center text-muted-foreground">
          <p>Please sign in to add comments</p>
        </div>
      )}
    </div>
  );
};
