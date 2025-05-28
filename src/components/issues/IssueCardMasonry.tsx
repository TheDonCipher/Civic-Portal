import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ThumbsUp,
  MessageCircle,
  Eye,
  Calendar,
  LandPlot,
  Coins,
  Star,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  getUserDisplayName,
  getUserAvatarUrl,
  getUserInitials,
} from '@/lib/utils/userUtils';
import type { UIIssue } from '@/types/enhanced';
import ThusangContributionWidget from '@/components/subscription/ThusangContributionWidget';
import { useDemoMode } from '@/providers/DemoProvider';

interface IssueCardMasonryProps extends UIIssue {
  isLiked?: boolean;
  isWatched?: boolean;
  onDelete?: (issueId: string) => void;
  showDeleteButton?: boolean;
  onClick?: () => void;
}

/**
 * Masonry variant of IssueCard with dynamic height based on content length
 * Optimized for CSS columns or JavaScript masonry layouts
 * Ensures cards break cleanly without cutting off content
 */
const IssueCardMasonry = memo<IssueCardMasonryProps>(
  ({
    id,
    title,
    description,
    category,
    status,
    priority,
    vote_count = 0,
    comment_count = 0,
    date,
    author,
    author_id,
    thumbnail = 'https://cdn.pixabay.com/photo/2018/01/10/18/49/city-3073958_1280.jpg',
    constituency,
    isLiked = false,
    isWatched = false,
    watchers_count = 0,
    onClick,
  }: IssueCardMasonryProps) => {
    const { isDemoMode } = useDemoMode();

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

    const statusColors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300',
      open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      in_progress:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      'in-progress':
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      resolved:
        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      closed:
        'bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300',
    };

    // Calculate dynamic content height for masonry layout
    const getContentLines = () => {
      const descriptionLength = description?.length || 0;
      if (descriptionLength > 200) return 'line-clamp-4';
      if (descriptionLength > 100) return 'line-clamp-3';
      return 'line-clamp-2';
    };

    return (
      <Card
        className={cn(
          // Enhanced card foundation with modern styling
          'w-full bg-background transition-all duration-300 ease-out flex flex-col relative group overflow-hidden cursor-pointer',
          // Masonry-specific layout properties
          'break-inside-avoid mb-6', // Increased bottom margin for better spacing
          'min-h-fit', // Dynamic height for masonry
          // Enhanced border and shadow styling
          'border border-border/60 hover:border-primary/40 shadow-sm hover:shadow-lg',
          // Modern border radius for contemporary look
          'rounded-xl', // Increased from default rounded-lg
          // Improved hover effects with subtle scale and elevation
          'hover:scale-[1.02] hover:z-10 hover:-translate-y-1',
          // Enhanced background with subtle gradient
          'bg-gradient-to-br from-background to-background/95',
          // Improved funding status styling with better contrast
          hasThusangFunding &&
            isWellFunded &&
            'ring-2 ring-green-400/20 border-green-200/50',
          hasThusangFunding &&
            !isWellFunded &&
            'ring-2 ring-blue-400/20 border-blue-200/50',
          // Enhanced priority styling with better visual hierarchy
          priority === 'high' &&
            'border-l-4 border-l-red-500 shadow-red-100/50',
          priority === 'urgent' &&
            'border-l-4 border-l-red-600 shadow-red-200/50 ring-1 ring-red-100',
          priority === 'low' &&
            'border-l-4 border-l-green-500 shadow-green-100/50'
        )}
        onClick={onClick}
      >
        {/* Enhanced Masonry Thumbnail Section */}
        <div className="relative overflow-hidden flex-shrink-0 rounded-t-xl">
          <div className="h-28 w-full bg-cover bg-center relative">
            <img
              src={thumbnail}
              alt={title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-110 group-hover:scale-105"
              loading="lazy"
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
          </div>
        </div>

        {/* Enhanced Masonry Content Section with improved spacing */}
        <div className="flex-1 flex flex-col p-5 sm:p-6 space-y-4 min-h-0">
          {/* Enhanced Category and location badges with better spacing */}
          <div className="flex gap-2 items-center flex-wrap">
            <Badge
              variant="outline"
              className="text-xs font-semibold px-3 py-1.5 rounded-full border-2 border-primary/20 bg-primary/5 text-primary"
            >
              {category}
            </Badge>
            {constituency && (
              <Badge
                variant="secondary"
                className="text-xs px-3 py-1.5 rounded-full bg-muted/80 text-muted-foreground border border-border/50"
              >
                <LandPlot className="h-3 w-3 mr-1.5" />
                {constituency}
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
          <div className="flex-1 space-y-3 min-h-0">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground tracking-tight">
              {title}
            </h3>
            <p
              className={cn(
                'text-sm text-muted-foreground leading-relaxed tracking-wide',
                getContentLines()
              )}
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
              <p className="text-sm font-semibold text-foreground truncate">
                {getUserDisplayName(
                  { full_name: author?.name },
                  null,
                  'Anonymous'
                )}
              </p>
              <div className="flex items-center text-xs text-muted-foreground mt-0.5">
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
                  isLiked
                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
                data-testid="issue-like-button"
              >
                <ThumbsUp className="h-3 w-3" />
                <span className="ml-1.5">{vote_count}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-3 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200"
                data-testid="issue-comments-button"
              >
                <MessageCircle className="h-3 w-3" />
                <span className="ml-1.5">{comment_count}</span>
              </Button>
            </div>

            {/* Right side - Watch button with enhanced styling */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-7 px-3 rounded-full text-xs font-medium transition-all duration-200',
                isWatched
                  ? 'text-primary bg-primary/10 hover:bg-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
              data-testid="issue-watch-button"
            >
              <Eye className="h-3 w-3" />
              <span className="ml-1.5">{watchers_count}</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Minimal Thusang Widget for Masonry */}
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
      </Card>
    );
  }
);

IssueCardMasonry.displayName = 'IssueCardMasonry';

export default IssueCardMasonry;
