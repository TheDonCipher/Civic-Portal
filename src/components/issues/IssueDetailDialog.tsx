import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { Issue } from './IssueGrid';
import { CommentsTab } from './tabs/CommentsTab';
import { UpdatesTab } from './tabs/UpdatesTab';
import { SolutionsTab } from './tabs/SolutionsTab';
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
  ChevronDown,
} from 'lucide-react';

interface IssueDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issue: Issue;
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
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [localVotes, setLocalVotes] = useState(issue?.votes || 0);
  const [localWatchers, setLocalWatchers] = useState(issue?.watchers || 0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track actual counts from tab components
  const [actualCounts, setActualCounts] = useState({
    comments: issue?.comments?.length || 0,
    updates: issue?.updates?.length || 0,
    solutions: issue?.solutions?.length || 0,
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

  // Handle scroll detection for visual feedback
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    setIsScrolled(scrollTop > 20);
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

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      await onStatusUpdate(issue.id, newStatus);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] p-0 flex flex-col">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col h-full max-h-[95vh]"
        >
          {/* Header Section */}
          <div className="relative">
            {/* Hero Image */}
            <div className="h-48 sm:h-64 overflow-hidden">
              <img
                src={
                  issue?.thumbnail ||
                  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80'
                }
                alt={issue?.title || 'Issue'}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Title and Status Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {isStakeholderMode && isStakeholder ? (
                    <div className="mb-3">
                      <Select
                        value={issue?.status || 'open'}
                        onValueChange={handleStatusUpdate}
                      >
                        <SelectTrigger className="w-auto h-auto p-0 border-none bg-transparent hover:bg-white/10 transition-colors">
                          <Badge
                            className={`${getStatusColor(
                              issue?.status || ''
                            )} cursor-pointer hover:opacity-80 transition-opacity`}
                          >
                            {issue?.status?.charAt(0).toUpperCase() +
                              issue?.status?.slice(1).replace('-', ' ') ||
                              'Unknown'}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in-progress">
                            In Progress
                          </SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <Badge
                      className={`mb-3 ${getStatusColor(issue?.status || '')}`}
                    >
                      {issue?.status?.charAt(0).toUpperCase() +
                        issue?.status?.slice(1).replace('-', ' ') || 'Unknown'}
                    </Badge>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-2">
                    {issue?.title || 'Issue Details'}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-white/90">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6 ring-2 ring-white/20">
                        <AvatarImage
                          src={issue?.author?.avatar}
                          alt={issue?.author?.name}
                        />
                        <AvatarFallback className="text-xs">
                          {issue?.author?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span>{issue?.author?.name || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(issue?.date || issue?.created_at || '')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="px-6 py-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              {/* Left side - Engagement */}
              <div className="flex items-center gap-2">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-2 ${
                      isLiked
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground'
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
                    className={`gap-2 ${
                      isWatching
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground'
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
                  className="gap-2 text-muted-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="font-medium">
                    {issue?.comments?.length || 0}
                  </span>
                </Button>
              </div>

              {/* Right side - Actions */}
              <div className="flex items-center gap-2">
                {/* Stakeholder Status Management */}
                {isStakeholderMode && isStakeholder && (
                  <div className="flex items-center gap-2 mr-2">
                    <span className="text-sm text-muted-foreground">
                      Status:
                    </span>
                    <Select
                      value={issue?.status || 'open'}
                      onValueChange={handleStatusUpdate}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  className={`${
                    isBookmarked ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={handleBookmark}
                >
                  <Bookmark className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
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
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                  )}
              </div>
            </div>
          </div>

          {/* Content Section - Scrollable */}
          <div className="flex-1 min-h-0 flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col min-h-0"
            >
              {/* Tab Navigation - Fixed */}
              <div
                className={`flex-shrink-0 px-6 pt-4 pb-2 border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-10 transition-all duration-200 ${
                  isScrolled ? 'shadow-md' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    {activeTab === 'comments' && 'Comments & Discussion'}
                    {activeTab === 'updates' && 'Official Updates'}
                    {activeTab === 'solutions' && 'Proposed Solutions'}
                  </h2>
                  {isScrolled && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center text-xs text-muted-foreground"
                    >
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Scroll for more
                    </motion.div>
                  )}
                </div>
                <TabsList className="grid w-full grid-cols-3 bg-muted/50 h-12">
                  <TabsTrigger
                    value="comments"
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-300 relative"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">
                      Comments
                    </span>
                    <Badge
                      variant="secondary"
                      className={`ml-1 text-xs transition-colors duration-300 ${
                        activeTab === 'comments'
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {actualCounts.comments}
                    </Badge>
                    {activeTab === 'comments' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary rounded-md -z-10"
                        transition={{
                          type: 'spring',
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="updates"
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-300 relative"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">
                      Updates
                    </span>
                    <Badge
                      variant="secondary"
                      className={`ml-1 text-xs transition-colors duration-300 ${
                        activeTab === 'updates'
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {actualCounts.updates}
                    </Badge>
                    {activeTab === 'updates' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary rounded-md -z-10"
                        transition={{
                          type: 'spring',
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="solutions"
                    className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-300 relative"
                  >
                    <Lightbulb className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">
                      Solutions
                    </span>
                    <Badge
                      variant="secondary"
                      className={`ml-1 text-xs transition-colors duration-300 ${
                        activeTab === 'solutions'
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {actualCounts.solutions}
                    </Badge>
                    {activeTab === 'solutions' && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-primary rounded-md -z-10"
                        transition={{
                          type: 'spring',
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Scrollable Content Area */}
              <div
                className="flex-1 overflow-y-auto min-h-0 scroll-smooth"
                onScroll={handleScroll}
              >
                {/* Issue Details Card - Always Visible */}
                <div className="px-6 py-4 border-b border-border/50">
                  <Card className="border-border/50">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* Description */}
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">
                            Description
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {issue?.description || 'No description provided.'}
                          </p>
                        </div>

                        {/* Location and Category Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Location
                              </p>
                              <p className="text-sm font-medium">
                                {issue?.location || 'Not specified'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Category
                              </p>
                              <p className="text-sm font-medium">
                                {issue?.category || 'Uncategorized'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Constituency
                              </p>
                              <p className="text-sm font-medium">
                                {issue?.constituency || 'Not specified'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tab Content - Scrollable */}
                <AnimatePresence mode="wait">
                  <TabsContent
                    value="comments"
                    className="px-6 py-4 m-0 data-[state=inactive]:hidden"
                  >
                    <motion.div
                      key="comments"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">
                          Comments & Discussion
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {actualCounts.comments} comments
                        </Badge>
                      </div>
                      {issue && (
                        <CommentsTab
                          issueId={issue.id}
                          onCountChange={updateCommentsCount}
                        />
                      )}
                    </motion.div>
                  </TabsContent>

                  <TabsContent
                    value="updates"
                    className="px-6 py-4 m-0 data-[state=inactive]:hidden"
                  >
                    <motion.div
                      key="updates"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">
                          Official Updates
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {actualCounts.updates} updates
                        </Badge>
                      </div>
                      {issue && (
                        <UpdatesTab
                          issueId={issue.id}
                          highlightedUpdateId={highlightedUpdateId}
                          onCountChange={updateUpdatesCount}
                        />
                      )}
                    </motion.div>
                  </TabsContent>

                  <TabsContent
                    value="solutions"
                    className="px-6 py-4 m-0 data-[state=inactive]:hidden"
                  >
                    <motion.div
                      key="solutions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-foreground">
                          Proposed Solutions
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {actualCounts.solutions} solutions
                        </Badge>
                      </div>
                      {issue && (
                        <SolutionsTab
                          issueId={issue.id}
                          onCountChange={updateSolutionsCount}
                        />
                      )}
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>

                {/* Bottom padding for better scrolling */}
                <div className="h-6" />
              </div>
            </Tabs>
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
