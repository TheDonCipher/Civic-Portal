/**
 * @fileoverview Enhanced Accessibility Hook
 * @description Provides comprehensive accessibility features for WCAG 2.1 AA compliance
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { announceToScreenReader, generateAriaId, colorContrast } from '@/lib/utils/accessibilityUtils';

interface AccessibilityOptions {
  announceChanges?: boolean;
  manageFocus?: boolean;
  trackColorContrast?: boolean;
  enableKeyboardNavigation?: boolean;
}

interface AccessibilityState {
  isHighContrast: boolean;
  isReducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'extra-large';
  announcements: string[];
}

/**
 * Enhanced accessibility hook for WCAG 2.1 AA compliance
 */
export function useAccessibility(options: AccessibilityOptions = {}) {
  const {
    announceChanges = true,
    manageFocus = true,
    trackColorContrast = true,
    enableKeyboardNavigation = true,
  } = options;

  const [state, setState] = useState<AccessibilityState>({
    isHighContrast: false,
    isReducedMotion: false,
    fontSize: 'normal',
    announcements: [],
  });

  const focusHistoryRef = useRef<HTMLElement[]>([]);
  const announcementTimeoutRef = useRef<NodeJS.Timeout>();

  // Detect user preferences
  useEffect(() => {
    const checkPreferences = () => {
      const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
      const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      setState(prev => ({
        ...prev,
        isHighContrast,
        isReducedMotion,
      }));
    };

    checkPreferences();

    // Listen for preference changes
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    contrastQuery.addEventListener('change', checkPreferences);
    motionQuery.addEventListener('change', checkPreferences);

    return () => {
      contrastQuery.removeEventListener('change', checkPreferences);
      motionQuery.removeEventListener('change', checkPreferences);
    };
  }, []);

  // Announce changes to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceChanges) return;

    announceToScreenReader(message, priority);
    
    setState(prev => ({
      ...prev,
      announcements: [...prev.announcements.slice(-4), message], // Keep last 5 announcements
    }));

    // Clear announcement after 5 seconds
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }
    
    announcementTimeoutRef.current = setTimeout(() => {
      setState(prev => ({
        ...prev,
        announcements: prev.announcements.filter(a => a !== message),
      }));
    }, 5000);
  }, [announceChanges]);

  // Focus management utilities
  const focusUtils = {
    // Save current focus for restoration
    saveFocus: useCallback(() => {
      if (!manageFocus) return;
      
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && activeElement !== document.body) {
        focusHistoryRef.current.push(activeElement);
      }
    }, [manageFocus]),

    // Restore previous focus
    restoreFocus: useCallback(() => {
      if (!manageFocus) return;
      
      const lastFocused = focusHistoryRef.current.pop();
      if (lastFocused && document.contains(lastFocused)) {
        lastFocused.focus();
      }
    }, [manageFocus]),

    // Focus first focusable element in container
    focusFirst: useCallback((container: HTMLElement) => {
      if (!manageFocus) return;
      
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      if (firstElement) {
        firstElement.focus();
      }
    }, [manageFocus]),

    // Focus last focusable element in container
    focusLast: useCallback((container: HTMLElement) => {
      if (!manageFocus) return;
      
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
      if (lastElement) {
        lastElement.focus();
      }
    }, [manageFocus]),
  };

  // Keyboard navigation utilities
  const keyboardUtils = {
    // Handle arrow key navigation
    handleArrowNavigation: useCallback((
      event: KeyboardEvent,
      items: HTMLElement[],
      currentIndex: number,
      orientation: 'horizontal' | 'vertical' | 'both' = 'vertical'
    ) => {
      if (!enableKeyboardNavigation) return currentIndex;

      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault();
            newIndex = (currentIndex + 1) % items.length;
          }
          break;
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            event.preventDefault();
            newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault();
            newIndex = (currentIndex + 1) % items.length;
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            event.preventDefault();
            newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
          }
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
    }, [enableKeyboardNavigation]),

    // Handle escape key
    handleEscape: useCallback((callback: () => void) => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          callback();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, []),
  };

  // Color contrast utilities
  const contrastUtils = {
    // Check if colors meet WCAG standards
    checkContrast: useCallback((foreground: string, background: string) => {
      if (!trackColorContrast) return { isValid: true, ratio: 0 };
      
      return colorContrast.validateAndSuggest(foreground, background);
    }, [trackColorContrast]),

    // Get high contrast alternative
    getHighContrastColor: useCallback((color: string) => {
      return state.isHighContrast ? colorContrast.getHighContrast(color) : color;
    }, [state.isHighContrast]),
  };

  // ARIA utilities
  const ariaUtils = {
    // Generate unique ARIA IDs
    generateId: useCallback((prefix: string, suffix?: string) => {
      return generateAriaId(prefix, suffix);
    }, []),

    // Create ARIA attributes for form fields
    createFieldAttributes: useCallback((
      id: string,
      label?: string,
      description?: string,
      error?: string,
      required?: boolean
    ) => {
      const attributes: Record<string, any> = {
        id,
        'aria-required': required || false,
      };

      if (label) {
        attributes['aria-label'] = label;
      }

      if (description) {
        const descriptionId = `${id}-description`;
        attributes['aria-describedby'] = descriptionId;
      }

      if (error) {
        const errorId = `${id}-error`;
        attributes['aria-describedby'] = attributes['aria-describedby'] 
          ? `${attributes['aria-describedby']} ${errorId}`
          : errorId;
        attributes['aria-invalid'] = true;
      }

      return attributes;
    }, []),

    // Create ARIA attributes for buttons
    createButtonAttributes: useCallback((
      label: string,
      pressed?: boolean,
      expanded?: boolean,
      controls?: string
    ) => {
      const attributes: Record<string, any> = {
        'aria-label': label,
      };

      if (typeof pressed === 'boolean') {
        attributes['aria-pressed'] = pressed;
      }

      if (typeof expanded === 'boolean') {
        attributes['aria-expanded'] = expanded;
      }

      if (controls) {
        attributes['aria-controls'] = controls;
      }

      return attributes;
    }, []),
  };

  // Font size management
  const fontSizeUtils = {
    increase: useCallback(() => {
      setState(prev => ({
        ...prev,
        fontSize: prev.fontSize === 'normal' ? 'large' : 'extra-large',
      }));
      announce('Font size increased');
    }, [announce]),

    decrease: useCallback(() => {
      setState(prev => ({
        ...prev,
        fontSize: prev.fontSize === 'extra-large' ? 'large' : 'normal',
      }));
      announce('Font size decreased');
    }, [announce]),

    reset: useCallback(() => {
      setState(prev => ({ ...prev, fontSize: 'normal' }));
      announce('Font size reset to normal');
    }, [announce]),
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    announce,
    focusUtils,
    keyboardUtils,
    contrastUtils,
    ariaUtils,
    fontSizeUtils,
  };
}

export default useAccessibility;
