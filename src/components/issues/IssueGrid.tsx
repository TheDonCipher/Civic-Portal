import React, { useMemo, useState } from 'react';
import IssueCard from './IssueCard';
import IssueCardMasonry from './IssueCardMasonry';
import FilterBar from './FilterBar';
import IssueGridPagination from './IssueGridPagination';
import IssueGridLayoutSwitcher, {
  IssueGridLayout,
} from './IssueGridLayoutSwitcher';
import IssueListItem from './IssueListItem';
import { usePagination, UsePaginationReturn } from '@/hooks/usePagination';
import { cn } from '@/lib/utils';
import type { UIIssue } from '@/types/enhanced';

// ✅ Use the centralized UIIssue type instead of local Issue interface
export type { UIIssue as Issue };

interface IssueGridProps {
  issues?: UIIssue[];
  onFilterChange?: (filters: any) => void;
  onSearch?: (searchTerm: string) => void;
  onIssueClick: (issue: UIIssue) => void;
  onDelete?: (issueId: string) => void;
  showDeleteButton?: boolean;
  compact?: boolean;
  enablePagination?: boolean;
  initialPageSize?: number;
  pagination?: UsePaginationReturn;
  defaultLayout?: IssueGridLayout;
  showLayoutSwitcher?: boolean;
}

const IssueGrid = ({
  issues = [],
  onFilterChange = () => {},
  onSearch = () => {},
  onIssueClick,
  onDelete,
  showDeleteButton = false,
  enablePagination = false,
  initialPageSize = 20,
  pagination: externalPagination,
  defaultLayout = 'grid',
  showLayoutSwitcher = true,
}: IssueGridProps) => {
  // Layout state management
  const [currentLayout, setCurrentLayout] =
    useState<IssueGridLayout>(defaultLayout);

  // Use external pagination if provided, otherwise create internal pagination
  const internalPagination = usePagination({
    initialPageSize,
    totalItems: issues.length,
  });

  const pagination = externalPagination || internalPagination;

  // Calculate paginated issues when pagination is enabled
  const paginatedIssues = useMemo(() => {
    if (!enablePagination) {
      return issues;
    }

    const { startIndex, endIndex } = pagination;
    return issues.slice(startIndex, endIndex + 1);
  }, [issues, enablePagination, pagination.startIndex, pagination.endIndex]);

  // Update total items when issues change (for internal pagination)
  React.useEffect(() => {
    if (!externalPagination && enablePagination) {
      internalPagination.setTotalItems(issues.length);
    }
  }, [issues.length, externalPagination, enablePagination, internalPagination]);

  const displayIssues = enablePagination ? paginatedIssues : issues;

  // Enhanced layout-specific grid classes with improved spacing and responsive behavior
  const getLayoutClasses = (layout: IssueGridLayout) => {
    switch (layout) {
      case 'grid':
        // Optimized grid with better column distribution and spacing
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10';
      case 'masonry':
        // Enhanced masonry with optimized column widths and improved spacing
        return 'columns-1 sm:columns-2 lg:columns-3 xl:columns-3 2xl:columns-4 gap-8 sm:gap-10 lg:gap-12';
      case 'list':
        return 'space-y-6'; // Increased spacing for better visual separation
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6 sm:gap-8 lg:gap-10';
    }
  };

  return (
    <div
      className="w-full flex flex-col component-spacing"
      data-testid="issue-grid"
    >
      {/* Enhanced Filter Section with Layout Switcher */}
      <div className="w-full flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <FilterBar onFilterChange={onFilterChange} onSearch={onSearch} />
        </div>
        {showLayoutSwitcher && (
          <IssueGridLayoutSwitcher
            currentLayout={currentLayout}
            onLayoutChange={setCurrentLayout}
            className="w-full sm:w-auto"
          />
        )}
      </div>

      {/* Issues Content Section */}
      <div className="w-full">
        {displayIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center bg-background border border-border/50 rounded-xl shadow-sm">
            <div className="p-4 bg-muted/50 rounded-full mb-6">
              <svg
                className="h-12 w-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No issues found
            </h3>
            <p className="text-muted-foreground max-w-md">
              There are no issues to display at the moment. Try adjusting your
              filters or check back later.
            </p>
          </div>
        ) : (
          <div className="bg-background border border-border/50 rounded-xl content-container shadow-sm overflow-hidden">
            {/* Enhanced dynamic layout with improved container styling */}
            <div
              className={cn(
                // Base padding with layout-specific adjustments
                currentLayout === 'masonry'
                  ? 'p-6 sm:p-8 lg:p-10'
                  : 'p-4 sm:p-6 lg:p-8',
                getLayoutClasses(currentLayout)
              )}
            >
              {displayIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={cn(
                    'transition-all duration-300 relative',
                    // Enhanced layout-specific container styling
                    currentLayout === 'grid' && 'hover:z-10',
                    currentLayout === 'masonry' && 'break-inside-avoid', // Removed mb-4 as it's now handled in card
                    currentLayout === 'list' &&
                      'cursor-pointer hover:bg-muted/30 rounded-xl p-2 -m-2' // Enhanced list hover area
                  )}
                  data-testid="issue-card-container"
                  {...(currentLayout === 'list' && {
                    onClick: () => onIssueClick(issue),
                  })}
                >
                  {/* Render appropriate card component based on layout */}
                  {(() => {
                    const commonProps = {
                      ...issue,
                      ...(onDelete && { onDelete }),
                      showDeleteButton,
                      onClick: () => onIssueClick(issue),
                    };

                    switch (currentLayout) {
                      case 'list':
                        return (
                          <IssueListItem
                            {...commonProps}
                            layout={currentLayout}
                          />
                        );
                      case 'masonry':
                        return <IssueCardMasonry {...commonProps} />;
                      case 'grid':
                      default:
                        return (
                          <IssueCard {...commonProps} layout={currentLayout} />
                        );
                    }
                  })()}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination Section */}
      {enablePagination && (
        <div className="w-full pt-4 sm:pt-6 pagination-spacing">
          <IssueGridPagination pagination={pagination} />
        </div>
      )}
    </div>
  );
};

export default IssueGrid;
