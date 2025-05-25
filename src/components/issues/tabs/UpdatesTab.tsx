import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Send, Loader2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemoMode } from '@/providers/DemoProvider';
import { demoUpdates } from '@/lib/demoData';

interface Update {
  id: string;
  content: string;
  type: string;
  created_at: string;
  author_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
  } | null;
}

interface UpdatesTabProps {
  issueId: string;
  highlightedUpdateId?: string;
  onCountChange?: (count: number) => void;
}

export const UpdatesTab: React.FC<UpdatesTabProps> = ({
  issueId,
  highlightedUpdateId,
  onCountChange,
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOfficial = profile?.role === 'official' || profile?.role === 'admin';

  // Fetch updates
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        if (isDemoMode) {
          // Use demo data
          const issueUpdates = demoUpdates
            .filter((update) => update.issue_id === issueId)
            .map((update) => ({
              id: update.id,
              content: update.content,
              type: update.type,
              created_at: update.created_at,
              author_id: update.author_id,
              profiles: {
                full_name: update.author_name,
                avatar_url: update.author_avatar,
                role: 'official', // Updates are always from officials
              },
            }))
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );

          setUpdates(issueUpdates);
          setIsLoading(false);
          return;
        }

        // Regular database fetch for non-demo mode
        let { data, error } = await supabase
          .from('updates')
          .select(
            `
            id,
            content,
            type,
            created_at,
            author_id
          `
          )
          .eq('issue_id', issueId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Then fetch profile data separately for each update
        const updatesWithProfiles = await Promise.all(
          (data || []).map(async (update) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url, role')
              .eq('id', update.author_id)
              .single();

            return {
              ...update,
              profiles: profile,
            };
          })
        );

        setUpdates(updatesWithProfiles || []);
      } catch (error) {
        console.error('Error fetching updates:', error);
        if (!isDemoMode) {
          toast({
            title: 'Error',
            description: 'Failed to load updates',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();

    // Subscribe to real-time updates only in non-demo mode
    if (!isDemoMode) {
      const subscription = supabase
        .channel(`updates-${issueId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'updates',
            filter: `issue_id=eq.${issueId}`,
          },
          () => {
            fetchUpdates();
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
      onCountChange(updates.length);
    }
  }, [updates.length, onCountChange]);

  const handleSubmitUpdate = async () => {
    if (!user || !newUpdate.trim() || !isOfficial) return;

    setIsSubmitting(true);
    try {
      if (isDemoMode) {
        // In demo mode, just simulate adding an update
        const newDemoUpdate = {
          id: `update-demo-${Date.now()}`,
          content: newUpdate.trim(),
          type: 'status',
          created_at: new Date().toISOString(),
          author_id: user.id || 'demo-official',
          profiles: {
            full_name: profile?.full_name || 'Demo Official',
            avatar_url: profile?.avatar_url || null,
            role: 'official',
          },
        };

        setUpdates((prev) => [newDemoUpdate, ...prev]);
        setNewUpdate('');
        toast({
          title: 'Success',
          description: 'Update posted successfully (Demo Mode)',
        });
        return;
      }

      // Regular database insert for non-demo mode
      const { error } = await supabase.from('updates').insert({
        issue_id: issueId,
        author_id: user.id,
        content: newUpdate.trim(),
        type: 'status',
      });

      if (error) throw error;

      setNewUpdate('');
      toast({
        title: 'Success',
        description: 'Update posted successfully',
      });
    } catch (error) {
      console.error('Error adding update:', error);
      toast({
        title: 'Error',
        description: 'Failed to post update',
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
        <span className="ml-2">Loading updates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Updates List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {updates.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-muted-foreground"
            >
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No official updates yet.</p>
            </motion.div>
          ) : (
            updates.map((update, index) => (
              <motion.div
                key={update.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex space-x-3 p-4 rounded-lg border transition-all duration-300 ${
                  highlightedUpdateId === update.id
                    ? 'bg-primary/10 border-primary/40 shadow-md'
                    : 'bg-primary/5 border-primary/20'
                }`}
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage
                    src={update.profiles?.avatar_url || undefined}
                    alt={update.profiles?.full_name || 'Official'}
                  />
                  <AvatarFallback className="bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">
                      {update.profiles?.full_name || 'Government Official'}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      Official Update
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(update.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {update.content}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Update Form - Only for Officials */}
      {user && isOfficial ? (
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Post Official Update
            </span>
          </div>
          <div className="flex space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage
                src={profile?.avatar_url || undefined}
                alt={profile?.full_name || 'You'}
              />
              <AvatarFallback className="bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Provide an official update on this issue..."
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                className="min-h-[80px] resize-none"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmitUpdate}
                  disabled={!newUpdate.trim() || isSubmitting}
                  size="sm"
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Post Update
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : user ? (
        <div className="border-t pt-4 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2">
            <Shield className="h-4 w-4" />
            <p>Only government officials can post updates</p>
          </div>
        </div>
      ) : (
        <div className="border-t pt-4 text-center text-muted-foreground">
          <p>Please sign in to view posting options</p>
        </div>
      )}
    </div>
  );
};
