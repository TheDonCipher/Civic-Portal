import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UsePaginationReturn } from '@/hooks/usePagination';

interface IssueGridPaginationProps {
  pagination: UsePaginationReturn;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  className?: string;
}

/**
 * Pagination component specifically designed for IssueGrid
 * Provides navigation controls and optional page size selector
 */
const IssueGridPagination: React.FC<IssueGridPaginationProps> = ({
  pagination,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}) => {
  const {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setPageSize,
    startIndex,
    endIndex,
  } = pagination;

  // Don't render if there's only one page and no items
  if (totalPages <= 1 && totalItems === 0) {
    return null;
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('ellipsis');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis');
      }

      // Show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn('w-full', className)}>
      {/* Clean, modern pagination container */}
      <div className="pagination-container flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left section - Results info and page size */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Results info with clean styling */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              {totalItems > 0 ? (
                <>
                  Showing{' '}
                  <span className="font-medium text-foreground">
                    {startIndex + 1}–{endIndex + 1}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-foreground">
                    {totalItems.toLocaleString()}
                  </span>{' '}
                  issues
                </>
              ) : (
                'No results found'
              )}
            </div>
          </div>

          {/* Clean page size selector */}
          {showPageSizeSelector && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Show
              </span>
              <Select
                value={pageSize.toString()}
                onValueChange={(value) => setPageSize(parseInt(value))}
              >
                <SelectTrigger className="w-20 h-9 border-border bg-background hover:bg-accent transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
          )}
        </div>

        {/* Right section - Navigation controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            {/* First page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0 disabled:opacity-50 transition-colors"
              aria-label="Go to first page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>

            {/* Previous page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousPage}
              disabled={!hasPreviousPage}
              className="h-9 px-3 gap-1.5 disabled:opacity-50 transition-colors"
              aria-label="Go to previous page"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline text-sm font-medium">
                Previous
              </span>
            </Button>

            {/* Page numbers */}
            <div className="flex items-center gap-1 mx-2">
              {pageNumbers.map((page, index) => (
                <React.Fragment key={index}>
                  {page === 'ellipsis' ? (
                    <div className="flex h-9 w-9 items-center justify-center">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ) : (
                    <Button
                      variant={page === currentPage ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className={cn(
                        'h-9 w-9 p-0 transition-colors font-medium',
                        page === currentPage
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'hover:bg-accent text-foreground'
                      )}
                      aria-label={`Go to page ${page}`}
                      aria-current={page === currentPage ? 'page' : undefined}
                    >
                      {page}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextPage}
              disabled={!hasNextPage}
              className="h-9 px-3 gap-1.5 disabled:opacity-50 transition-colors"
              aria-label="Go to next page"
            >
              <span className="hidden sm:inline text-sm font-medium">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Last page button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0 disabled:opacity-50 transition-colors"
              aria-label="Go to last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Mobile-only simplified pagination */}
      {totalPages > 1 && (
        <div className="lg:hidden mt-4 flex items-center justify-between p-4 bg-card border border-border rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={!hasPreviousPage}
            className="gap-2 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Page</span>
            <span className="text-sm font-medium text-foreground">
              {currentPage} of {totalPages}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={!hasNextPage}
            className="gap-2 disabled:opacity-50 transition-colors"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default IssueGridPagination;
