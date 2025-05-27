/**
 * Date utility functions for the Civic Portal
 * Handles safe conversion between database dates (string | null) and UI dates (string)
 * Provides consistent date formatting and validation
 */

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

// ✅ Safe date conversion functions
export const safeDate = {
  /**
   * Converts a potentially null date string to a guaranteed string
   * @param date - Date string from database (can be null)
   * @param fallback - Fallback date string (defaults to current date)
   * @returns Always returns a valid date string
   */
  toString: (date: string | null | undefined, fallback?: string): string => {
    if (!date) {
      return fallback || new Date().toISOString();
    }
    
    // Validate the date string
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
      console.warn(`Invalid date string: ${date}, using fallback`);
      return fallback || new Date().toISOString();
    }
    
    return date;
  },

  /**
   * Converts a potentially null date to a Date object
   * @param date - Date string from database (can be null)
   * @param fallback - Fallback Date object
   * @returns Always returns a valid Date object
   */
  toDate: (date: string | null | undefined, fallback?: Date): Date => {
    if (!date) {
      return fallback || new Date();
    }
    
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
      console.warn(`Invalid date string: ${date}, using fallback`);
      return fallback || new Date();
    }
    
    return parsedDate;
  },

  /**
   * Formats a potentially null date for display
   * @param date - Date string from database (can be null)
   * @param formatStr - Format string (defaults to 'MMM d, yyyy')
   * @param fallback - Fallback text for null dates
   * @returns Formatted date string or fallback
   */
  format: (
    date: string | null | undefined, 
    formatStr: string = 'MMM d, yyyy',
    fallback: string = 'Unknown date'
  ): string => {
    if (!date) {
      return fallback;
    }
    
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
      console.warn(`Invalid date string: ${date}, using fallback`);
      return fallback;
    }
    
    return format(parsedDate, formatStr);
  },

  /**
   * Gets relative time from a potentially null date
   * @param date - Date string from database (can be null)
   * @param fallback - Fallback text for null dates
   * @returns Relative time string or fallback
   */
  relative: (
    date: string | null | undefined,
    fallback: string = 'Unknown time'
  ): string => {
    if (!date) {
      return fallback;
    }
    
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) {
      console.warn(`Invalid date string: ${date}, using fallback`);
      return fallback;
    }
    
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  },

  /**
   * Checks if a date string is valid
   * @param date - Date string to validate
   * @returns True if date is valid, false otherwise
   */
  isValid: (date: string | null | undefined): boolean => {
    if (!date) return false;
    const parsedDate = parseISO(date);
    return isValid(parsedDate);
  },

  /**
   * Gets the current date as ISO string
   * @returns Current date as ISO string
   */
  now: (): string => {
    return new Date().toISOString();
  },

  /**
   * Compares two potentially null dates
   * @param date1 - First date
   * @param date2 - Second date
   * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
   */
  compare: (
    date1: string | null | undefined,
    date2: string | null | undefined
  ): number => {
    const d1 = safeDate.toDate(date1);
    const d2 = safeDate.toDate(date2);
    
    if (d1.getTime() < d2.getTime()) return -1;
    if (d1.getTime() > d2.getTime()) return 1;
    return 0;
  }
};

// ✅ Specific formatting functions for common use cases
export const formatters = {
  /**
   * Formats date for issue cards and lists
   */
  issueDate: (date: string | null | undefined): string => {
    return safeDate.format(date, 'MMM d, yyyy', 'No date');
  },

  /**
   * Formats date for comments and updates
   */
  commentDate: (date: string | null | undefined): string => {
    return safeDate.relative(date, 'Unknown time');
  },

  /**
   * Formats date for detailed views
   */
  detailDate: (date: string | null | undefined): string => {
    return safeDate.format(date, 'MMMM d, yyyy \'at\' h:mm a', 'No date available');
  },

  /**
   * Formats date for dashboard statistics
   */
  statsDate: (date: string | null | undefined): string => {
    return safeDate.format(date, 'MMM d', 'N/A');
  },

  /**
   * Formats date for form inputs (YYYY-MM-DD)
   */
  inputDate: (date: string | null | undefined): string => {
    if (!date) return '';
    const parsedDate = safeDate.toDate(date);
    return format(parsedDate, 'yyyy-MM-dd');
  },

  /**
   * Formats date for API requests (ISO string)
   */
  apiDate: (date: Date | string | null | undefined): string => {
    if (!date) return new Date().toISOString();
    
    if (date instanceof Date) {
      return date.toISOString();
    }
    
    return safeDate.toString(date);
  }
};

// ✅ Date validation helpers
export const validators = {
  /**
   * Validates if a date is not in the future
   */
  isNotFuture: (date: string | null | undefined): boolean => {
    if (!date) return true;
    const parsedDate = safeDate.toDate(date);
    return parsedDate <= new Date();
  },

  /**
   * Validates if a date is within a reasonable range (not too old)
   */
  isReasonable: (date: string | null | undefined, maxYearsOld: number = 10): boolean => {
    if (!date) return true;
    const parsedDate = safeDate.toDate(date);
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - maxYearsOld);
    return parsedDate >= maxDate;
  },

  /**
   * Validates if a date is within business hours (for created_at validation)
   */
  isBusinessHours: (date: string | null | undefined): boolean => {
    if (!date) return true;
    const parsedDate = safeDate.toDate(date);
    const hour = parsedDate.getHours();
    return hour >= 6 && hour <= 22; // 6 AM to 10 PM
  }
};

// ✅ Type-safe date conversion for UI components
export const uiDateConverter = {
  /**
   * Converts database issue data to UI-safe format
   */
  convertIssueDate: (issue: any): string => {
    return safeDate.toString(issue.created_at || issue.date);
  },

  /**
   * Converts database comment data to UI-safe format
   */
  convertCommentDate: (comment: any): string => {
    return safeDate.toString(comment.created_at);
  },

  /**
   * Converts database update data to UI-safe format
   */
  convertUpdateDate: (update: any): string => {
    return safeDate.toString(update.created_at);
  },

  /**
   * Converts database solution data to UI-safe format
   */
  convertSolutionDate: (solution: any): string => {
    return safeDate.toString(solution.created_at);
  },

  /**
   * Batch converts an array of items with date fields
   */
  convertBatch: <T extends Record<string, any>>(
    items: T[],
    dateFields: (keyof T)[]
  ): T[] => {
    return items.map(item => {
      const converted = { ...item };
      dateFields.forEach(field => {
        if (converted[field]) {
          converted[field] = safeDate.toString(converted[field] as string);
        }
      });
      return converted;
    });
  }
};

// ✅ Export default safe date utilities
export default safeDate;
