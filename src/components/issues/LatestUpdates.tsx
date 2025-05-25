import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDemoMode } from '@/providers/DemoProvider';
import { supabase } from '@/lib/supabase';
import { demoUpdates } from '@/lib/demoData';

interface Update {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  date: string;
  type: string;
  issueTitle: string;
  issueId: string;
}

interface LatestUpdatesProps {
  onIssueClick?: (issueId: string) => void;
}

const LatestUpdates = ({ onIssueClick = () => {} }: LatestUpdatesProps) => {
  const { isDemoMode, getDemoIssues } = useDemoMode();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch updates data
  useEffect(() => {
    const fetchUpdates = async () => {
      setIsLoading(true);
      try {
        if (isDemoMode) {
          // Use demo data - get all demo issues and extract their updates
          const demoIssues = getDemoIssues();
          const allUpdates: Update[] = [];

          // Get updates from demo data (only official updates, not comments or solutions)
          demoUpdates.forEach((update) => {
            const issue = demoIssues.find((i) => i.id === update.issue_id);
            if (issue) {
              allUpdates.push({
                id: update.id,
                author: {
                  name: update.author_name,
                  avatar:
                    update.author_avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${update.author_id}`,
                },
                content: update.content,
                date: update.created_at,
                type: update.type,
                issueTitle: issue.title,
                issueId: issue.id,
              });
            }
          });

          // Sort by date (newest first) and take the latest 10
          const sortedUpdates = allUpdates
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 10);

          setUpdates(sortedUpdates);
        } else {
          // Fetch real updates from database
          const { data: updatesData, error } = await supabase
            .from('updates')
            .select(
              `
              id,
              content,
              type,
              created_at,
              author_id,
              issue_id,
              issues!inner(title)
            `
            )
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) throw error;

          // Fetch profile data for each update
          const updatesWithProfiles = await Promise.all(
            (updatesData || []).map(async (update) => {
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', update.author_id)
                .single();

              return {
                id: update.id,
                author: {
                  name: profile?.full_name || 'Official',
                  avatar:
                    profile?.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${update.author_id}`,
                },
                content: update.content,
                date: update.created_at,
                type: update.type,
                issueTitle: update.issues?.title || 'Unknown Issue',
                issueId: update.issue_id,
              };
            })
          );

          setUpdates(updatesWithProfiles);
        }
      } catch (error) {
        console.error('Error fetching updates:', error);
        setUpdates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();

    // Set up real-time subscriptions for updates (only when not in demo mode)
    if (!isDemoMode) {
      const subscription = supabase
        .channel('latest-updates-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'updates',
          },
          (payload) => {
            console.log('New update detected in LatestUpdates:', payload);
            // Refresh updates when new ones are added
            fetchUpdates();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [isDemoMode, getDemoIssues]);

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'status':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'solution':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'comment':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 7) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <Card className="bg-background border-border shadow-lg h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0 px-6 py-4 border-b border-border/50 bg-muted/20">
        <CardTitle className="text-lg font-bold text-foreground">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <span>Latest Updates</span>
            <Badge variant="secondary" className="ml-auto text-xs">
              {updates.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-muted/50 rounded-full mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground animate-pulse" />
                </div>
                <p className="text-muted-foreground font-medium">
                  Loading updates...
                </p>
              </div>
            ) : updates.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-muted/50 rounded-full mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">
                  No updates yet
                </p>
                <p className="text-sm text-muted-foreground/70">
                  Updates will appear here from officials
                </p>
              </div>
            ) : (
              updates.map((update: Update) => (
                <div
                  key={update.id}
                  className="group relative p-4 border border-border/50 rounded-xl bg-card hover:bg-accent/30 hover:border-primary/20 cursor-pointer transition-all duration-300 hover:shadow-md"
                  onClick={() => onIssueClick(update.issueId)}
                >
                  {/* Left accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 to-primary/5 group-hover:from-primary/40 group-hover:to-primary/10 rounded-l-xl transition-all duration-300" />

                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background shadow-sm">
                      <AvatarImage
                        src={update.author.avatar}
                        alt={update.author.name}
                      />
                      <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                        {update.author.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Header with author and time */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {update.author.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(update.date)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs font-medium shrink-0',
                            getUpdateTypeColor(update.type)
                          )}
                        >
                          {update.type.charAt(0).toUpperCase() +
                            update.type.slice(1)}
                        </Badge>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {update.content}
                      </p>

                      {/* Issue reference */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                        <span className="text-xs text-muted-foreground/80 truncate">
                          on "{update.issueTitle}"
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="h-2 w-2 rounded-full bg-primary/60" />
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LatestUpdates;
