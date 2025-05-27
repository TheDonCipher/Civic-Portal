/**
 * @fileoverview Accessibility Utilities for WCAG 2.1 AA Compliance
 * @description Comprehensive accessibility toolkit providing ARIA labels, focus management,
 * keyboard navigation, and screen reader support for the Civic Portal application.
 *
 * This module implements Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards
 * to ensure the application is usable by people with disabilities.
 *
 * @author Civic Portal Team
 * @version 1.1.0
 * @since 2024-01-01
 *
 * @example Basic ARIA Labels
 * ```typescript
 * import { ariaLabels, generateAriaId } from '@/lib/utils/accessibilityUtils';
 *
 * // Generate unique IDs for ARIA relationships
 * const titleId = generateAriaId('issue-title');
 * const descriptionId = generateAriaId('issue-description');
 *
 * // Use predefined ARIA labels
 * const buttonLabel = ariaLabels.button.edit('issue');
 * const statusLabel = ariaLabels.issue.status('open');
 * ```
 *
 * @example Focus Management
 * ```typescript
 * import { focusUtils, useFocusTrap } from '@/lib/utils/accessibilityUtils';
 *
 * // Focus management in modals
 * const containerRef = useFocusTrap(isModalOpen);
 *
 * // Manual focus control
 * focusUtils.focusFirst(containerElement);
 * focusUtils.focusLast(containerElement);
 * ```
 *
 * @example Screen Reader Support
 * ```typescript
 * import { announceToScreenReader } from '@/lib/utils/accessibilityUtils';
 *
 * // Announce important changes
 * announceToScreenReader('Form submitted successfully');
 * announceToScreenReader('Error occurred', 'assertive');
 * ```
 *
 * @see {@link https://www.w3.org/WAI/WCAG21/quickref/} WCAG 2.1 Quick Reference
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA} ARIA Documentation
 */

import { useEffect, useRef, useCallback } from 'react';

// ARIA label generators for common UI patterns
export const ariaLabels = {
  // Button labels
  button: {
    close: 'Close',
    menu: 'Open menu',
    settings: 'Open settings',
    profile: 'Open user profile',
    search: 'Search',
    filter: 'Filter options',
    sort: 'Sort options',
    edit: (item: string) => `Edit ${item}`,
    delete: (item: string) => `Delete ${item}`,
    view: (item: string) => `View ${item} details`,
    create: (item: string) => `Create new ${item}`,
    save: 'Save changes',
    cancel: 'Cancel',
    submit: 'Submit form',
    next: 'Next step',
    previous: 'Previous step',
    expand: 'Expand section',
    collapse: 'Collapse section',
  },

  // Form labels
  form: {
    required: (field: string) => `${field} (required)`,
    optional: (field: string) => `${field} (optional)`,
    error: (field: string, error: string) => `${field} error: ${error}`,
    help: (field: string, help: string) => `${field} help: ${help}`,
    loading: 'Form is submitting, please wait',
    success: 'Form submitted successfully',
  },

  // Navigation labels
  navigation: {
    main: 'Main navigation',
    breadcrumb: 'Breadcrumb navigation',
    pagination: 'Pagination navigation',
    tabs: 'Tab navigation',
    skipToContent: 'Skip to main content',
    skipToNavigation: 'Skip to navigation',
  },

  // Status labels
  status: {
    loading: 'Loading content',
    error: 'Error occurred',
    success: 'Operation successful',
    warning: 'Warning message',
    info: 'Information',
    empty: 'No items found',
    offline: 'You are currently offline',
  },

  // Issue-specific labels
  issue: {
    card: (title: string) => `Issue: ${title}`,
    status: (status: string) => `Status: ${status}`,
    category: (category: string) => `Category: ${category}`,
    votes: (count: number) => `${count} ${count === 1 ? 'vote' : 'votes'}`,
    comments: (count: number) => `${count} ${count === 1 ? 'comment' : 'comments'}`,
    watch: 'Watch this issue for updates',
    unwatch: 'Stop watching this issue',
    vote: 'Vote for this issue',
    unvote: 'Remove your vote',
  },

  // Dashboard labels
  dashboard: {
    stat: (title: string, value: string | number) => `${title}: ${value}`,
    chart: (type: string, description: string) => `${type} chart: ${description}`,
    filter: (type: string) => `Filter by ${type}`,
  },
};

// Generate unique IDs for ARIA relationships
export const generateAriaId = (prefix: string, suffix?: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return `${prefix}-${timestamp}-${random}${suffix ? `-${suffix}` : ''}`;
};

// ARIA live region announcer for dynamic content
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = message;

  document.body.appendChild(announcer);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
};

// Focus management utilities
export const focusUtils = {
  // Focus the first focusable element in a container
  focusFirst: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement | undefined;
    if (firstElement) {
      firstElement.focus();
    }
  },

  // Focus the last focusable element in a container
  focusLast: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement | undefined;
    if (lastElement) {
      lastElement.focus();
    }
  },

  // Get all focusable elements in a container
  getFocusableElements: (container: HTMLElement): HTMLElement[] => {
    return Array.from(
      container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];
  },
};

// Hook for focus trap in modals
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;

    if (event.key === 'Tab') {
      const focusableElements = focusUtils.getFocusableElements(containerRef.current);

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement && lastElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement && firstElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }

    if (event.key === 'Escape') {
      // Allow parent components to handle escape
      event.stopPropagation();
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);

      // Focus first element when trap becomes active
      if (containerRef.current) {
        focusUtils.focusFirst(containerRef.current);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, handleKeyDown]);

  return containerRef;
};

// Hook for managing focus on route changes
export const useFocusOnRouteChange = () => {
  useEffect(() => {
    // Focus the main content area when route changes
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
    }
  }, []);
};

// ✅ Enhanced color contrast utilities for WCAG 2.1 AA compliance
export const colorContrast = {
  // Convert hex color to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result && result[1] && result[2] && result[3] ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // Calculate relative luminance
  getLuminance: (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
  },

  // Calculate contrast ratio between two colors
  getContrastRatio: (color1: string, color2: string): number => {
    const rgb1 = colorContrast.hexToRgb(color1);
    const rgb2 = colorContrast.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 1;

    const lum1 = colorContrast.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = colorContrast.getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Check if color combination meets WCAG AA standards (4.5:1 ratio)
  meetsWCAG: (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = colorContrast.getContrastRatio(foreground, background);
    const threshold = level === 'AAA' ? 7 : 4.5;
    return ratio >= threshold;
  },

  // Check if large text meets WCAG AA standards (3:1 ratio)
  meetsWCAGLarge: (foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean => {
    const ratio = colorContrast.getContrastRatio(foreground, background);
    const threshold = level === 'AAA' ? 4.5 : 3;
    return ratio >= threshold;
  },

  // Get high contrast alternative
  getHighContrast: (color: string): string => {
    // Return high contrast alternatives for common colors
    const highContrastMap: Record<string, string> = {
      'text-gray-500': 'text-gray-900',
      'text-gray-400': 'text-gray-800',
      'text-blue-500': 'text-blue-700',
      'text-green-500': 'text-green-700',
      'text-red-500': 'text-red-700',
      'text-yellow-500': 'text-yellow-800',
      'text-purple-500': 'text-purple-700',
      'text-pink-500': 'text-pink-700',
    };

    return highContrastMap[color] || color;
  },

  // Validate color combinations and suggest improvements
  validateAndSuggest: (foreground: string, background: string): {
    isValid: boolean;
    ratio: number;
    suggestion?: string;
  } => {
    const ratio = colorContrast.getContrastRatio(foreground, background);
    const isValid = ratio >= 4.5;

    if (isValid) {
      return { isValid: true, ratio };
    }

    return {
      isValid: false,
      ratio,
      suggestion: `Current contrast ratio is ${ratio.toFixed(2)}:1. Minimum required is 4.5:1 for WCAG AA compliance.`
    };
  },
};

// Screen reader utilities
export const screenReader = {
  // Hide content from screen readers
  hide: 'aria-hidden="true"',

  // Show content only to screen readers
  only: 'sr-only',

  // Describe an element
  describedBy: (id: string) => ({ 'aria-describedby': id }),

  // Label an element
  labelledBy: (id: string) => ({ 'aria-labelledby': id }),

  // Set expanded state
  expanded: (isExpanded: boolean) => ({ 'aria-expanded': isExpanded }),

  // Set selected state
  selected: (isSelected: boolean) => ({ 'aria-selected': isSelected }),

  // Set pressed state for toggle buttons
  pressed: (isPressed: boolean) => ({ 'aria-pressed': isPressed }),

  // Set current state for navigation
  current: (type: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false') =>
    ({ 'aria-current': type }),
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  // Handle arrow key navigation in lists
  handleArrowKeys: (event: KeyboardEvent, items: HTMLElement[], currentIndex: number) => {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
    }

    if (newIndex !== currentIndex && items[newIndex]) {
      items[newIndex]?.focus();
      return newIndex;
    }

    return currentIndex;
  },
};
