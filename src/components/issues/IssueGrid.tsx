import React, { useMemo } from 'react';
import IssueCard from './IssueCard';
import FilterBar from './FilterBar';
import IssueGridPagination from './IssueGridPagination';
import { usePagination, UsePaginationReturn } from '@/hooks/usePagination';
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
}: IssueGridProps) => {
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
  return (
    <div
      className="w-full flex flex-col component-spacing"
      data-testid="issue-grid"
    >
      {/* Filter Section */}
      <div className="w-full">
        <FilterBar onFilterChange={onFilterChange} onSearch={onSearch} />
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
          <div className="bg-background border border-border/50 rounded-xl content-container shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
              {displayIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => onIssueClick(issue)}
                  className="cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  data-testid="issue-card-container"
                >
                  <IssueCard
                    {...issue}
                    {...(onDelete && { onDelete })}
                    showDeleteButton={showDeleteButton}
                  />
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
