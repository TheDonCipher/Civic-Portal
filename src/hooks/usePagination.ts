import { useState, useMemo } from 'react';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

export interface UsePaginationReturn extends PaginationState, PaginationActions {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}

/**
 * Custom hook for managing pagination state and actions
 * 
 * @param options - Configuration options for pagination
 * @returns Pagination state and actions
 * 
 * @example
 * ```typescript
 * const pagination = usePagination({
 *   initialPage: 1,
 *   initialPageSize: 20,
 *   totalItems: 100
 * });
 * 
 * // Use pagination state
 * console.log(pagination.currentPage); // 1
 * console.log(pagination.totalPages); // 5
 * 
 * // Use pagination actions
 * pagination.goToNextPage();
 * pagination.setPageSize(10);
 * ```
 */
export function usePagination({
  initialPage = 1,
  initialPageSize = 20,
  totalItems = 0,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItemsState, setTotalItemsState] = useState(totalItems);

  // Calculate derived values
  const totalPages = useMemo(() => {
    return Math.ceil(totalItemsState / pageSize);
  }, [totalItemsState, pageSize]);

  const hasNextPage = useMemo(() => {
    return currentPage < totalPages;
  }, [currentPage, totalPages]);

  const hasPreviousPage = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize - 1, totalItemsState - 1);
  }, [startIndex, pageSize, totalItemsState]);

  const isFirstPage = useMemo(() => {
    return currentPage === 1;
  }, [currentPage]);

  const isLastPage = useMemo(() => {
    return currentPage === totalPages;
  }, [currentPage, totalPages]);

  // Actions
  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToFirstPage = () => {
    setCurrentPage(1);
  };

  const goToLastPage = () => {
    setCurrentPage(totalPages);
  };

  const handleSetPageSize = (size: number) => {
    const newPageSize = Math.max(1, size);
    setPageSize(newPageSize);
    
    // Adjust current page if necessary to maintain position
    const newTotalPages = Math.ceil(totalItemsState / newPageSize);
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(1, newTotalPages));
    }
  };

  const setTotalItems = (total: number) => {
    const newTotal = Math.max(0, total);
    setTotalItemsState(newTotal);
    
    // Adjust current page if necessary
    const newTotalPages = Math.ceil(newTotal / pageSize);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  return {
    // State
    currentPage,
    pageSize,
    totalItems: totalItemsState,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    startIndex,
    endIndex,
    isFirstPage,
    isLastPage,
    
    // Actions
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    setPageSize: handleSetPageSize,
    setTotalItems,
  };
}

export default usePagination;
