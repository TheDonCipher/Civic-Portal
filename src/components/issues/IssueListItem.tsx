import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  ThumbsUp,
  MessageCircle,
  Eye,
  Calendar,
  MapPin,
  Trash2,
  Star,
  Coins,
  LandPlot,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useDemoMode } from '@/providers/DemoProvider';
import {
  getUserAvatarUrl,
  getUserDisplayName,
  getUserInitials,
} from '@/lib/utils/userUtils';
import ThusangContributionWidget from '@/components/subscription/ThusangContributionWidget';
import type { UIIssue } from '@/types/enhanced';

interface IssueListItemProps extends UIIssue {
  isLiked?: boolean;
  isWatched?: boolean;
  onDelete?: (issueId: string) => void;
  showDeleteButton?: boolean;
  layout?: 'grid' | 'list' | 'masonry';
}

const IssueListItem: React.FC<IssueListItemProps> = ({
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
  date,
  author,
  author_id,
  thumbnail,
  constituency,
  department,
  tags,
  isLiked = false,
  isWatched = false,
  watchers = 0,
  watchers_count,
  onDelete,
  showDeleteButton = false,
  layout = 'list',
}) => {
  const { user } = useAuth();
  const { isDemoMode } = useDemoMode();
  const [liked, setLiked] = useState(isLiked);
  const [watched, setWatched] = useState(isWatched);
  const [localVotes, setLocalVotes] = useState(vote_count || votes || 0);
  const [localWatchers, setLocalWatchers] = useState(
    watchers_count || watchers || 0
  );

  // Enhanced funding data for Mmogo integration
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

  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const commentsCount = comment_count || 0;
  const canDelete = showDeleteButton && author_id === user?.id;

  // Status colors
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    open: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    resolved: 'bg-green-100 text-green-800 border-green-200',
    closed: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLocalVotes((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleWatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWatched(!watched);
    setLocalWatchers((prev) => (watched ? prev - 1 : prev + 1));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
  };

  return (
    <Card
      className={cn(
        'w-full transition-all duration-500 ease-out hover:shadow-xl border-border/40 hover:border-primary/40',
        'bg-gradient-to-r from-background via-background to-muted/5',
        'hover:scale-[1.01] hover:-translate-y-0.5',
        hasThusangFunding &&
          isWellFunded &&
          'ring-2 ring-green-400/50 shadow-green-100/20',
        hasThusangFunding &&
          !isWellFunded &&
          'ring-2 ring-blue-400/50 shadow-blue-100/20',
        priority === 'high' && 'border-l-4 border-l-red-500 shadow-red-200/30',
        priority === 'urgent' &&
          'border-l-4 border-l-red-600 shadow-red-300/40 animate-pulse',
        priority === 'low' &&
          'border-l-4 border-l-green-500 shadow-green-200/30'
      )}
    >
      <CardContent className="p-5">
        <div className="flex gap-5">
          {/* Enhanced Thumbnail */}
          <div className="flex-shrink-0">
            <motion.div
              className="w-24 h-24 rounded-xl overflow-hidden bg-muted relative group/thumb shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt={title}
                  className="w-full h-full object-cover transition-all duration-500 group-hover/thumb:brightness-110 group-hover/thumb:contrast-105"
                />
              )}

              {/* Enhanced overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

              {hasThusangFunding && (
                <div className="absolute top-2 right-2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Badge className="text-xs px-2 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg backdrop-blur-sm">
                      <Coins className="w-3 h-3 mr-1" />
                    </Badge>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header with badges */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex gap-2 items-center flex-wrap">
                <Badge
                  variant="secondary"
                  className={cn('text-xs font-medium', statusColors[status])}
                >
                  {status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {category}
                </Badge>
                {constituency && (
                  <Badge variant="secondary" className="text-xs bg-muted/60">
                    <LandPlot className="w-3 h-3 mr-1" />
                    {constituency}
                  </Badge>
                )}
                {priority && priority !== 'medium' && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs font-semibold',
                      priority === 'high' && 'bg-red-100 text-red-700',
                      priority === 'urgent' &&
                        'bg-red-200 text-red-800 animate-pulse',
                      priority === 'low' && 'bg-green-100 text-green-700'
                    )}
                  >
                    {priority}
                  </Badge>
                )}
              </div>

              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Title and Description */}
            <div className="space-y-1">
              <h3 className="font-semibold text-lg leading-tight line-clamp-1">
                {title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {description || 'No description available'}
              </p>
            </div>

            {/* Author and Date */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
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
                  <AvatarFallback className="text-xs">
                    {getUserInitials({ full_name: author?.name })}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {getUserDisplayName(
                    { full_name: author?.name },
                    null,
                    'Anonymous'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </div>
            </div>

            {/* Actions and Funding */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 px-2 gap-1.5 rounded-full',
                    liked && 'text-primary bg-primary/10'
                  )}
                  onClick={handleLike}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{localVotes}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 gap-1.5 rounded-full"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{commentsCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 px-2 gap-1.5 rounded-full',
                    watched && 'text-primary bg-primary/10'
                  )}
                  onClick={handleWatch}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">{localWatchers}</span>
                </Button>
              </div>

              {hasThusangFunding && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-blue-600">
                    <Star className="h-3 w-3" />
                    <span className="font-medium">
                      {Math.round(fundingProgress)}% funded
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    BWP {(fundingAmount / 1000).toFixed(1)}k
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thusang Funding Widget for List View */}
        {hasThusangFunding && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <ThusangContributionWidget
              issueId={id}
              issueTitle={title}
              issueLocation={constituency}
              currentFunding={fundingAmount}
              goalAmount={goalAmount}
              contributorsCount={
                isDemoMode ? Math.floor(Math.random() * 50) + 5 : 0
              }
              daysLeft={isDemoMode ? Math.floor(Math.random() * 30) + 10 : 30}
              variant="inline"
              showProgress={true}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IssueListItem;
