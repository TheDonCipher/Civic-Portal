import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import {
  MessageCircle,
  ExternalLink,
  Bell,
  Zap,
  Settings,
  Megaphone,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDemoMode } from '@/providers/DemoProvider';
import { supabase } from '@/lib/supabase';
import { demoUpdates } from '@/lib/demoData';
import { safeDate, formatters } from '@/lib/utils/dateUtils';
import { handleApiError } from '@/lib/utils/errorHandler';

interface Update {
  id: string;
  title: string;
  content: string;
  type: string;
  author_name: string;
  author_role: string;
  author_avatar: string;
  created_at: string;
  issue_id?: string;
  issue_title?: string;
  platform_update_id?: string;
  is_official: boolean;
  source_type: 'issue' | 'platform';
}

interface LatestUpdatesProps {
  onIssueClick?: (issueId: string) => void;
}

const LatestUpdates = ({ onIssueClick = () => {} }: LatestUpdatesProps) => {
  const { isDemoMode, getDemoIssues } = useDemoMode();
  const navigate = useNavigate();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch updates data
  useEffect(() => {
    const fetchUpdates = async () => {
      setIsLoading(true);
      try {
        if (isDemoMode) {
          // Demo data combining issue updates and platform updates
          const demoIssues = getDemoIssues();
          const allUpdates: Update[] = [];

          // Add issue updates from demo data
          demoUpdates.forEach((update) => {
            const issue = demoIssues.find((i) => i.id === update.issue_id);
            if (issue) {
              allUpdates.push({
                id: update.id,
                title: update.title || `Update on ${issue.title}`,
                content: update.content,
                type: update.type,
                author_name: update.author_name,
                author_role: 'official',
                author_avatar:
                  update.author_avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${update.author_id}`,
                created_at: update.created_at,
                issue_id: issue.id,
                issue_title: issue.title,
                is_official: true,
                source_type: 'issue' as const,
              });
            }
          });

          // Add demo platform updates
          const demoPlatformUpdates: Update[] = [
            {
              id: 'platform-1',
              title: 'New Feature: Enhanced Issue Tracking',
              content:
                'We have launched an enhanced issue tracking system with real-time updates.',
              type: 'feature',
              author_name: 'System Administrator',
              author_role: 'admin',
              author_avatar:
                'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
              created_at: new Date(
                Date.now() - 1 * 24 * 60 * 60 * 1000
              ).toISOString(),
              is_official: true,
              source_type: 'platform' as const,
              platform_update_id: 'platform-1',
            },
            {
              id: 'platform-2',
              title: 'Scheduled Maintenance Notice',
              content:
                'The platform will undergo scheduled maintenance on Sunday, 3 AM - 6 AM.',
              type: 'maintenance',
              author_name: 'Technical Team',
              author_role: 'admin',
              author_avatar:
                'https://api.dicebear.com/7.x/avataaars/svg?seed=tech',
              created_at: new Date(
                Date.now() - 3 * 24 * 60 * 60 * 1000
              ).toISOString(),
              is_official: true,
              source_type: 'platform' as const,
              platform_update_id: 'platform-2',
            },
          ];

          allUpdates.push(...demoPlatformUpdates);

          // Sort by date (newest first) and take the latest 8
          const sortedUpdates = allUpdates
            .sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            )
            .slice(0, 8);

          setUpdates(sortedUpdates);
        } else {
          // Use the new combined updates function
          const { data: updatesData, error } = await supabase.rpc(
            'get_latest_combined_updates',
            {
              p_limit: 8,
            }
          );

          if (error) throw error;
          setUpdates(updatesData || []);
        }
      } catch (error) {
        console.error('Error fetching updates:', error);
        handleApiError(error, 'LatestUpdates', 'fetchUpdates');
        setUpdates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpdates();

    // Set up real-time subscriptions for updates (only when not in demo mode)
    if (!isDemoMode) {
      const updatesSubscription = supabase
        .channel('latest-updates-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'updates',
          },
          () => fetchUpdates()
        )
        .subscribe();

      const platformUpdatesSubscription = supabase
        .channel('latest-platform-updates-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'platform_updates',
          },
          () => fetchUpdates()
        )
        .subscribe();

      return () => {
        updatesSubscription.unsubscribe();
        platformUpdatesSubscription.unsubscribe();
      };
    }

    return () => {};
  }, [isDemoMode, getDemoIssues]);

  const getUpdateTypeIcon = (type: string, sourceType: string) => {
    if (sourceType === 'platform') {
      switch (type) {
        case 'feature':
          return <Zap className="h-4 w-4 text-blue-500" />;
        case 'maintenance':
          return <Settings className="h-4 w-4 text-orange-500" />;
        case 'announcement':
          return <Megaphone className="h-4 w-4 text-green-500" />;
        case 'policy':
          return <Info className="h-4 w-4 text-purple-500" />;
        default:
          return <Bell className="h-4 w-4 text-gray-500" />;
      }
    }
    return <MessageCircle className="h-4 w-4 text-blue-500" />;
  };

  const getUpdateTypeColor = (type: string, sourceType: string) => {
    if (sourceType === 'platform') {
      switch (type) {
        case 'feature':
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case 'maintenance':
          return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
        case 'announcement':
          return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        case 'policy':
          return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      }
    }

    switch (type) {
      case 'status':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      case 'official':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'update':
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

  const handleHeaderClick = () => {
    navigate('/platform-updates');
  };

  return (
    <Card className="bg-background border-border shadow-lg h-[calc(100vh-120px)] flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0 px-6 py-4 border-b border-border/50 bg-muted/20">
        <CardTitle className="text-lg font-bold text-foreground">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageCircle className="h-4 w-4 text-primary" />
            </div>
            <button
              onClick={handleHeaderClick}
              className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"
            >
              <span>Latest Updates</span>
              <ExternalLink className="h-4 w-4" />
            </button>
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
                  onClick={() => {
                    if (update.source_type === 'issue' && update.issue_id) {
                      onIssueClick(update.issue_id);
                    } else if (update.source_type === 'platform') {
                      navigate('/platform-updates');
                    }
                  }}
                >
                  {/* Left accent line */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 to-primary/5 group-hover:from-primary/40 group-hover:to-primary/10 rounded-l-xl transition-all duration-300" />

                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background shadow-sm">
                      <AvatarImage
                        src={update.author_avatar}
                        alt={update.author_name}
                      />
                      <AvatarFallback className="text-sm font-medium bg-primary/10 text-primary">
                        {update.author_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Header with author and time */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {update.author_name}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {update.author_role}
                            </Badge>
                            {update.source_type === 'platform' && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-purple-100 text-purple-800"
                              >
                                Platform
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(update.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getUpdateTypeIcon(update.type, update.source_type)}
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs font-medium shrink-0',
                              getUpdateTypeColor(
                                update.type,
                                update.source_type
                              )
                            )}
                          >
                            {update.type.charAt(0).toUpperCase() +
                              update.type.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      {/* Title (for platform updates) */}
                      {update.source_type === 'platform' && (
                        <h4 className="font-medium text-sm text-foreground line-clamp-1">
                          {update.title}
                        </h4>
                      )}

                      {/* Content */}
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {update.content}
                      </p>

                      {/* Issue reference or platform indicator */}
                      <div className="flex items-center gap-2 pt-1">
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                        <span className="text-xs text-muted-foreground/80 truncate">
                          {update.source_type === 'issue' && update.issue_title
                            ? `on "${update.issue_title}"`
                            : 'Platform Update'}
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
