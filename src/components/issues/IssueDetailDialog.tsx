import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { getUserAvatarUrl, getUserInitials } from '@/lib/utils/userUtils';
import type { UIIssue } from '@/types/enhanced';
import { CommentsTab } from './tabs/CommentsTab';
import { UpdatesTab } from './tabs/UpdatesTab';
import { SolutionsTab } from './tabs/SolutionsTab';
import ThusangContributionWidget from '@/components/subscription/ThusangContributionWidget';
import TirisanoPartnershipDisplay from '@/components/subscription/TirisanoPartnershipDisplay';
import { SubscriptionFeatureGate } from '@/components/subscription/SubscriptionStatusIndicator';
import { useDemoMode } from '@/providers/DemoProvider';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  ThumbsUp,
  MessageCircle,
  Eye,
  Calendar,
  MapPin,
  Building,
  Users,
  Lightbulb,
  MessageSquare,
  Settings,
  X,
  Share2,
  Bookmark,
  Flag,
  AlertCircle,
  Clock,
  CheckCircle,
  Circle,
  Star,
  Coins,
  Crown,
  TrendingUp,
  Network,
  Heart,
} from 'lucide-react';

interface IssueDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: UIIssue;
  onDelete?: (issueId: string) => void;
  highlightedUpdateId?: string; // For navigation from LatestUpdates
  isStakeholderMode?: boolean; // For stakeholder management features
  initialTab?: string; // For opening specific tab
  onStatusUpdate?: (issueId: string, newStatus: string) => void; // For status updates
}

const IssueDetailDialog = ({
  open,
  onOpenChange,
  issue,
  onDelete,
  highlightedUpdateId,
  isStakeholderMode = false,
  initialTab = 'comments',
  onStatusUpdate,
}: IssueDetailDialogProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { isDemoMode } = useDemoMode();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [localVotes, setLocalVotes] = useState(issue?.votes || 0);
  const [localWatchers, setLocalWatchers] = useState(issue?.watchers || 0);

  // Enhanced funding data for Mmogo integration
  const hasThusangFunding =
    isDemoMode && (issue?.status === 'open' || issue?.status === 'in-progress');
  const fundingAmount = hasThusangFunding
    ? Math.floor(Math.random() * 15000) + 5000
    : 0;
  const goalAmount = hasThusangFunding
    ? Math.floor(Math.random() * 25000) + 15000
    : 20000;
  const fundingProgress = hasThusangFunding
    ? (fundingAmount / goalAmount) * 100
    : 0;
  const isWellFunded = fundingProgress > 60;

  // Track actual counts from tab components
  const [actualCounts, setActualCounts] = useState({
    comments: issue?.comments?.length || 0,
    updates: 0, // Will be updated by UpdatesTab component
    solutions: 0, // Will be updated by SolutionsTab component
  });

  // Auto-navigate to updates tab if highlighted update is provided
  useEffect(() => {
    if (highlightedUpdateId && open) {
      setActiveTab('updates');
    }
  }, [highlightedUpdateId, open]);

  // Callback functions for tab components to report their counts
  const updateCommentsCount = (count: number) => {
    setActualCounts((prev) => ({ ...prev, comments: count }));
  };

  const updateUpdatesCount = (count: number) => {
    setActualCounts((prev) => ({ ...prev, updates: count }));
  };

  const updateSolutionsCount = (count: number) => {
    setActualCounts((prev) => ({ ...prev, solutions: count }));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Unknown date';
    }
  };

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return {
          color:
            'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/70',
          icon: AlertCircle,
        };
      case 'in-progress':
        return {
          color:
            'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/70',
          icon: Clock,
        };
      case 'resolved':
        return {
          color:
            'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-950/50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-950/70',
          icon: CheckCircle,
        };
      case 'closed':
        return {
          color:
            'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700',
          icon: Circle,
        };
      default:
        return {
          color:
            'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700',
          icon: Circle,
        };
    }
  };

  // Handle like/vote action
  const handleLike = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to vote on issues',
        variant: 'default',
      });
      return;
    }
    setIsLiked(!isLiked);
    setLocalVotes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  // Handle watch action
  const handleWatch = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to watch issues',
        variant: 'default',
      });
      return;
    }
    setIsWatching(!isWatching);
    setLocalWatchers((prev) => (isWatching ? prev - 1 : prev + 1));
  };

  // Handle bookmark action
  const handleBookmark = () => {
    if (!user) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to bookmark issues',
        variant: 'default',
      });
      return;
    }
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? 'Bookmark removed' : 'Issue bookmarked',
      description: isBookmarked
        ? 'Issue removed from bookmarks'
        : 'Issue added to your bookmarks',
      variant: 'default',
    });
  };

  // Handle share action
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: issue.title,
        text: issue.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied',
        description: 'Issue link copied to clipboard',
        variant: 'default',
      });
    }
  };

  // Handle status update for stakeholders
  const handleStatusUpdate = async (newStatus: string) => {
    if (!user || !issue) {
      toast({
        title: 'Error',
        description: 'Unable to update status',
        variant: 'destructive',
      });
      return;
    }

    if (onStatusUpdate) {
      onStatusUpdate(issue.id, newStatus);
    } else {
      // Fallback to direct database update if no callback provided
      try {
        const updateData: any = {
          status: newStatus,
          updated_at: new Date().toISOString(),
        };

        if (newStatus === 'resolved' || newStatus === 'closed') {
          updateData.resolved_at = new Date().toISOString();
          updateData.resolved_by = user.id;
        }

        const { error } = await supabase
          .from('issues')
          .update(updateData)
          .eq('id', issue.id);

        if (error) throw error;

        // Add an update record
        await supabase.from('updates').insert({
          issue_id: issue.id,
          author_id: user.id,
          content: `Issue status updated to ${newStatus}`,
          type: 'status',
          created_at: new Date().toISOString(),
        });

        toast({
          title: 'Success',
          description: 'Issue status updated successfully.',
          variant: 'default',
        });
      } catch (error) {
        console.error('Error updating status:', error);
        toast({
          title: 'Error',
          description: 'Failed to update issue status.',
          variant: 'destructive',
        });
      }
    }
  };

  // Check if user is stakeholder
  const isStakeholder =
    profile?.role === 'official' || profile?.role === 'admin';

  // Placeholder for actual implementation
  const handleDelete = async () => {
    if (!user || !issue) {
      toast({
        title: 'Error',
        description: !user
          ? 'You must be signed in to delete an issue'
          : 'Issue data is not available',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Check if user has permission to delete
      const { data: issueData, error: issueError } = await supabase
        .from('issues')
        .select('author_id')
        .eq('id', issue.id)
        .single();

      if (issueError) throw issueError;

      if (issueData.author_id !== user.id && profile?.role !== 'admin') {
        toast({
          title: 'Permission Denied',
          description: 'You do not have permission to delete this issue',
          variant: 'destructive',
        });
        return;
      }

      // Delete the issue
      const { error: deleteError } = await supabase
        .from('issues')
        .delete()
        .eq('id', issue.id);

      if (deleteError) throw deleteError;

      toast({
        title: 'Issue Deleted',
        description: 'The issue has been successfully deleted',
        variant: 'default',
      });

      // Close dialogs and notify parent
      setIsDeleteDialogOpen(false);
      onOpenChange(false);
      if (onDelete) onDelete(issue.id);
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete issue. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get status info including icon
  const statusInfo = getStatusInfo(issue?.status || '');
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {/* Hidden accessibility elements for screen readers */}
        <DialogTitle className="sr-only">
          {issue?.title || 'Issue Details'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {issue?.description ||
            'View and interact with issue details, comments, updates, and solutions.'}
        </DialogDescription>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col h-full max-h-[90vh]"
        >
          {/* Compact Header */}
          <div className="relative bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-b border-border/50">
            <div className="p-6 pb-4">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 h-8 w-8 hover:bg-background/80"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Status and Title */}
              <div className="pr-12 space-y-3">
                <div className="flex items-center gap-3">
                  {isStakeholderMode && isStakeholder ? (
                    <Select
                      value={issue?.status || 'open'}
                      onValueChange={handleStatusUpdate}
                    >
                      <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent">
                        <Badge
                          className={`${statusInfo.color} cursor-pointer transition-colors px-3 py-1.5 font-medium`}
                        >
                          <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                          {issue?.status?.charAt(0).toUpperCase() +
                            issue?.status?.slice(1).replace('-', ' ') ||
                            'Unknown'}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            Open
                          </div>
                        </SelectItem>
                        <SelectItem value="in-progress">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            In Progress
                          </div>
                        </SelectItem>
                        <SelectItem value="resolved">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Resolved
                          </div>
                        </SelectItem>
                        <SelectItem value="closed">
                          <div className="flex items-center gap-2">
                            <Circle className="h-4 w-4 text-gray-500" />
                            Closed
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      className={`${statusInfo.color} px-3 py-1.5 font-medium`}
                    >
                      <StatusIcon className="h-3.5 w-3.5 mr-1.5" />
                      {issue?.status?.charAt(0).toUpperCase() +
                        issue?.status?.slice(1).replace('-', ' ') || 'Unknown'}
                    </Badge>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(issue?.date || issue?.created_at || '')}
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-foreground leading-tight">
                  {issue?.title || 'Issue Details'}
                </h1>

                {/* Author info */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 ring-2 ring-background">
                    <AvatarImage
                      src={getUserAvatarUrl({
                        id: issue?.author_id,
                        avatar_url: issue?.author?.avatar,
                      })}
                      alt={issue?.author?.name || 'User'}
                    />
                    <AvatarFallback className="text-sm">
                      {getUserInitials({ full_name: issue?.author?.name })}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">
                      {issue?.author?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Issue Author
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Bar */}
            <div className="px-6 py-3 bg-background/50 dark:bg-background/80 backdrop-blur-sm border-t border-border/30">
              <div className="flex items-center justify-between">
                {/* Left side - Engagement metrics */}
                <div className="flex items-center gap-1">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 h-9 px-3 rounded-full transition-all ${
                        isLiked
                          ? 'text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-950/50 dark:hover:bg-red-950/70'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      onClick={handleLike}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="font-medium">{localVotes}</span>
                    </Button>
                  </motion.div>

                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-2 h-9 px-3 rounded-full transition-all ${
                        isWatching
                          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-950/50 dark:hover:bg-blue-950/70'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                      onClick={handleWatch}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="font-medium">{localWatchers}</span>
                    </Button>
                  </motion.div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 h-9 px-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="font-medium">{actualCounts.comments}</span>
                  </Button>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-9 w-9 rounded-full transition-all ${
                      isBookmarked
                        ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950/50 dark:hover:bg-yellow-950/70'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={handleBookmark}
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>

                  {user &&
                    issue &&
                    (user.id === (issue.author as any)?.id ||
                      profile?.role === 'admin') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        onClick={() => setIsDeleteDialogOpen(true)}
                      >
                        <Flag className="h-4 w-4" />
                      </Button>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-h-0 flex">
            {/* Left Panel - Issue Details */}
            <div className="w-80 flex-shrink-0 border-r border-border/50 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="p-6 space-y-6 h-full overflow-y-auto">
                {/* Issue Image */}
                {issue?.thumbnail && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Image
                    </h3>
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                      <img
                        src={issue.thumbnail}
                        alt={issue.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Description
                  </h3>
                  <div className="bg-background rounded-lg p-4 border border-border/50">
                    <p className="text-sm text-foreground leading-relaxed">
                      {issue?.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                {/* Key Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border/50">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Location
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {issue?.location || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border/50">
                      <Building className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Category
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {issue?.category || 'Uncategorized'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-background rounded-lg border border-border/50">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Constituency
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {issue?.constituency || 'Not specified'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Funding Information */}
                {hasThusangFunding && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Community Funding
                    </h3>
                    <div className="space-y-3">
                      <div
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all duration-300',
                          isWellFunded
                            ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
                            : 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Star
                            className={cn(
                              'h-4 w-4',
                              isWellFunded ? 'text-green-600' : 'text-blue-600'
                            )}
                          />
                          <p className="text-xs font-medium text-muted-foreground">
                            Thusang Project Status
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              Progress
                            </span>
                            <span
                              className={cn(
                                'text-sm font-bold',
                                isWellFunded
                                  ? 'text-green-600'
                                  : 'text-blue-600'
                              )}
                            >
                              {Math.round(fundingProgress)}%
                            </span>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={cn(
                                'h-2 rounded-full transition-all duration-500',
                                isWellFunded ? 'bg-green-500' : 'bg-blue-500'
                              )}
                              style={{
                                width: `${Math.min(fundingProgress, 100)}%`,
                              }}
                            />
                          </div>

                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>BWP {fundingAmount.toLocaleString()}</span>
                            <span>BWP {goalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-background rounded-lg border border-border/50">
                          <div className="flex items-center gap-2 mb-1">
                            <Heart className="h-3 w-3 text-red-500" />
                            <p className="text-xs font-medium text-muted-foreground">
                              Contributors
                            </p>
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            {isDemoMode
                              ? Math.floor(Math.random() * 100) + 20
                              : 0}
                          </p>
                        </div>

                        <div className="p-3 bg-background rounded-lg border border-border/50">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-3 w-3 text-orange-500" />
                            <p className="text-xs font-medium text-muted-foreground">
                              Days Left
                            </p>
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            {isDemoMode
                              ? Math.floor(Math.random() * 45) + 15
                              : 30}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Tabs Content */}
            <div className="flex-1 min-h-0 flex flex-col">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col min-h-0"
              >
                {/* Enhanced Tab Navigation */}
                <div className="flex-shrink-0 px-6 pt-6 pb-4 bg-background">
                  <TabsList
                    className={cn(
                      'grid w-full bg-muted/30 h-12 p-1',
                      hasThusangFunding ? 'grid-cols-5' : 'grid-cols-3'
                    )}
                  >
                    <TabsTrigger
                      value="comments"
                      className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded-md font-medium"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Comments</span>
                      <Badge
                        variant="secondary"
                        className="ml-1 text-xs bg-muted-foreground/10 text-muted-foreground"
                      >
                        {actualCounts.comments}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="updates"
                      className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded-md font-medium"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">Updates</span>
                      <Badge
                        variant="secondary"
                        className="ml-1 text-xs bg-muted-foreground/10 text-muted-foreground"
                      >
                        {actualCounts.updates}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                      value="solutions"
                      className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded-md font-medium"
                    >
                      <Lightbulb className="h-4 w-4" />
                      <span className="hidden sm:inline">Solutions</span>
                      <Badge
                        variant="secondary"
                        className="ml-1 text-xs bg-muted-foreground/10 text-muted-foreground"
                      >
                        {actualCounts.solutions}
                      </Badge>
                    </TabsTrigger>

                    {/* Enhanced Mmogo Ecosystem Tabs */}
                    {hasThusangFunding && (
                      <>
                        <TabsTrigger
                          value="funding"
                          className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded-md font-medium"
                        >
                          <Star className="h-4 w-4" />
                          <span className="hidden sm:inline">Thusang</span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              'ml-1 text-xs',
                              isWellFunded
                                ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400'
                            )}
                          >
                            {Math.round(fundingProgress)}%
                          </Badge>
                        </TabsTrigger>

                        <TabsTrigger
                          value="partnerships"
                          className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200 rounded-md font-medium"
                        >
                          <Network className="h-4 w-4" />
                          <span className="hidden sm:inline">Tirisano</span>
                          <Badge
                            variant="secondary"
                            className="ml-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400"
                          >
                            {isDemoMode ? '3' : '0'}
                          </Badge>
                        </TabsTrigger>
                      </>
                    )}
                  </TabsList>
                </div>

                {/* Scrollable Tab Content */}
                <div className="flex-1 overflow-y-auto min-h-0 scroll-smooth">
                  <TabsContent
                    value="comments"
                    className="px-6 pb-6 m-0 data-[state=inactive]:hidden"
                  >
                    <AnimatePresence mode="wait">
                      {activeTab === 'comments' && (
                        <motion.div
                          key="comments"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {issue && (
                            <CommentsTab
                              issueId={issue.id}
                              onCountChange={updateCommentsCount}
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent
                    value="updates"
                    className="px-6 pb-6 m-0 data-[state=inactive]:hidden"
                  >
                    <AnimatePresence mode="wait">
                      {activeTab === 'updates' && (
                        <motion.div
                          key="updates"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {issue && (
                            <UpdatesTab
                              issueId={issue.id}
                              {...(highlightedUpdateId && {
                                highlightedUpdateId,
                              })}
                              onCountChange={updateUpdatesCount}
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent
                    value="solutions"
                    className="px-6 pb-6 m-0 data-[state=inactive]:hidden"
                  >
                    <AnimatePresence mode="wait">
                      {activeTab === 'solutions' && (
                        <motion.div
                          key="solutions"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {issue && (
                            <SolutionsTab
                              issueId={issue.id}
                              onCountChange={updateSolutionsCount}
                            />
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </TabsContent>

                  {/* Enhanced Community Funding Tab */}
                  {hasThusangFunding && (
                    <TabsContent
                      value="funding"
                      className="px-6 pb-6 m-0 data-[state=inactive]:hidden"
                    >
                      <AnimatePresence mode="wait">
                        {activeTab === 'funding' && (
                          <motion.div
                            key="funding"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                          >
                            {/* Enhanced Thusang Community Action Fund */}
                            <div>
                              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Star className="h-5 w-5 text-blue-600" />
                                Thusang Community Action Fund
                              </h3>
                              <ThusangContributionWidget
                                issueId={issue.id}
                                issueTitle={issue.title}
                                issueLocation={issue.constituency}
                                currentFunding={fundingAmount}
                                goalAmount={goalAmount}
                                contributorsCount={
                                  isDemoMode
                                    ? Math.floor(Math.random() * 100) + 20
                                    : 0
                                }
                                daysLeft={
                                  isDemoMode
                                    ? Math.floor(Math.random() * 45) + 15
                                    : 30
                                }
                                variant="detailed"
                                showProgress={true}
                              />
                            </div>

                            {/* Community Impact Metrics */}
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Heart className="h-5 w-5 text-blue-600" />
                                Community Impact
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-blue-600">
                                    {isDemoMode
                                      ? Math.floor(Math.random() * 50) + 20
                                      : 0}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Contributors
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-600">
                                    BWP{' '}
                                    {isDemoMode
                                      ? (fundingAmount / 1000).toFixed(1)
                                      : '0'}
                                    k
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Raised So Far
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {isDemoMode
                                      ? Math.floor(Math.random() * 10) + 5
                                      : 0}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Days Remaining
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Subscription Feature Gate for Advanced Analytics */}
                            <SubscriptionFeatureGate
                              requiredTier={['kgotla', 'tlhaloso']}
                              userTier={
                                profile?.role === 'official'
                                  ? 'kgotla'
                                  : 'motse'
                              }
                              userStatus="active"
                              fallbackMessage="Advanced funding analytics and cross-project insights are available with Kgotla+ or Tlhaloso subscriptions."
                              featureName="Advanced Funding Analytics"
                              variant="banner"
                              onUpgradeClick={() =>
                                (window.location.href = '/pricing')
                              }
                            >
                              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                  <TrendingUp className="h-5 w-5 text-blue-600" />
                                  Funding Analytics Dashboard
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                      BWP 45,000
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Total Raised This Month
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                      12
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Projects Funded
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                      340
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Community Contributors
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </SubscriptionFeatureGate>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </TabsContent>
                  )}

                  {/* Enhanced Tirisano Business Partnerships Tab */}
                  {hasThusangFunding && (
                    <TabsContent
                      value="partnerships"
                      className="px-6 pb-6 m-0 data-[state=inactive]:hidden"
                    >
                      <AnimatePresence mode="wait">
                        {activeTab === 'partnerships' && (
                          <motion.div
                            key="partnerships"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                          >
                            {/* Business Partnership Section */}
                            <div>
                              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Building className="h-5 w-5 text-purple-600" />
                                Tirisano Mmogo Business Partners
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Demo business partners */}
                                <TirisanoPartnershipDisplay
                                  partner={{
                                    id: 'demo-partner-1',
                                    name: 'Botswana Craft Centre',
                                    tier: 'champion',
                                    description:
                                      'Supporting local artisans and promoting Botswana culture.',
                                    location: 'Gaborone, Botswana',
                                    joinedDate: '2023-06-15',
                                    sponsoredProjects: 8,
                                    communityImpact: '500+ artisans supported',
                                    currentOffers: [
                                      '15% discount for community members on traditional crafts',
                                      'Free craft workshops for youth during school holidays',
                                    ],
                                    featuredPlacement: true,
                                  }}
                                  variant="card"
                                  showContactInfo={false}
                                  showMetrics={true}
                                />

                                <TirisanoPartnershipDisplay
                                  partner={{
                                    id: 'demo-partner-2',
                                    name: 'Gaborone Motors',
                                    tier: 'impact_partner',
                                    description:
                                      'Leading automotive dealer supporting community transportation.',
                                    location: 'Gaborone, Botswana',
                                    joinedDate: '2023-03-20',
                                    sponsoredProjects: 12,
                                    communityImpact: '1000+ families helped',
                                    currentOffers: [
                                      'Free vehicle safety inspections for community members',
                                    ],
                                    featuredPlacement: false,
                                  }}
                                  variant="card"
                                  showContactInfo={false}
                                  showMetrics={true}
                                />

                                <TirisanoPartnershipDisplay
                                  partner={{
                                    id: 'demo-partner-3',
                                    name: 'Botswana Beef',
                                    tier: 'supporter',
                                    description:
                                      'Supporting local food security and nutrition programs.',
                                    location: 'Francistown, Botswana',
                                    joinedDate: '2023-08-10',
                                    sponsoredProjects: 5,
                                    communityImpact: '200+ meals provided',
                                    currentOffers: [
                                      'Discounted meat packages for community events',
                                    ],
                                    featuredPlacement: false,
                                  }}
                                  variant="card"
                                  showContactInfo={false}
                                  showMetrics={true}
                                />
                              </div>
                            </div>

                            {/* Partnership Benefits */}
                            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Network className="h-5 w-5 text-purple-600" />
                                Partnership Benefits
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <h5 className="font-medium text-purple-700 dark:text-purple-300">
                                    For Community
                                  </h5>
                                  <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      Exclusive discounts and offers
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      Priority support for local issues
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      Skills development workshops
                                    </li>
                                  </ul>
                                </div>
                                <div className="space-y-3">
                                  <h5 className="font-medium text-purple-700 dark:text-purple-300">
                                    For Businesses
                                  </h5>
                                  <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      Enhanced brand visibility
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      Community engagement metrics
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                      CSR impact documentation
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>

                            {/* Subscription Feature Gate for Business Analytics */}
                            <SubscriptionFeatureGate
                              requiredTier={['tirisano', 'tlhaloso']}
                              userTier="motse"
                              userStatus="active"
                              fallbackMessage="Advanced partnership analytics and business insights are available with Tirisano Mmogo Business Solutions or Tlhaloso subscriptions."
                              featureName="Business Partnership Analytics"
                              variant="banner"
                              onUpgradeClick={() =>
                                (window.location.href = '/pricing')
                              }
                            >
                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                  <TrendingUp className="h-5 w-5 text-purple-600" />
                                  Partnership Analytics Dashboard
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">
                                      BWP 25,000
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Business Investment
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                      8
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Active Partners
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                      95%
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      Community Satisfaction
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </SubscriptionFeatureGate>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </TabsContent>
                  )}
                </div>
              </Tabs>
            </div>
          </div>
        </motion.div>
      </DialogContent>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              issue and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default IssueDetailDialog;
