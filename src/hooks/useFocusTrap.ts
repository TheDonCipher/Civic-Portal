/**
 * Focus management hook for accessibility
 * Provides focus trapping for modals and proper focus management
 */

import { useRef, useEffect, useCallback } from 'react';

interface FocusTrapOptions {
  isActive: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  includeContainer?: boolean;
}

interface FocusTrapResult {
  containerRef: React.RefObject<HTMLDivElement>;
  focusFirst: () => void;
  focusLast: () => void;
  focusNext: () => void;
  focusPrevious: () => void;
}

/**
 * Hook for managing focus within a container (focus trap)
 * Useful for modals, dialogs, and other overlay components
 */
export function useFocusTrap(options: FocusTrapOptions): FocusTrapResult {
  const { isActive, restoreFocus = true, autoFocus = true, includeContainer = false } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Selector for focusable elements
  const focusableSelector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'details > summary:first-of-type',
  ].join(', ');

  /**
   * Get all focusable elements within the container
   */
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelector)
    ) as HTMLElement[];

    // Include container if it's focusable and option is enabled
    if (includeContainer && containerRef.current.tabIndex >= 0) {
      elements.unshift(containerRef.current);
    }

    // Filter out elements that are not visible or have display: none
    return elements.filter(element => {
      const style = window.getComputedStyle(element);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0
      );
    });
  }, [includeContainer, focusableSelector]);

  /**
   * Focus the first focusable element
   */
  const focusFirst = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0]?.focus();
    }
  }, [getFocusableElements]);

  /**
   * Focus the last focusable element
   */
  const focusLast = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1]?.focus();
    }
  }, [getFocusableElements]);

  /**
   * Focus the next focusable element
   */
  const focusNext = useCallback(() => {
    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    if (currentIndex === -1) {
      focusFirst();
    } else {
      const nextIndex = (currentIndex + 1) % focusableElements.length;
      focusableElements[nextIndex]?.focus();
    }
  }, [getFocusableElements, focusFirst]);

  /**
   * Focus the previous focusable element
   */
  const focusPrevious = useCallback(() => {
    const focusableElements = getFocusableElements();
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    if (currentIndex === -1) {
      focusLast();
    } else {
      const previousIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
      focusableElements[previousIndex]?.focus();
    }
  }, [getFocusableElements, focusLast]);

  /**
   * Handle keydown events for focus management
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;

    // Handle Tab key for focus trapping
    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements();

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      // If no element is focused or focus is outside the container, focus first element
      if (!activeElement || !containerRef.current.contains(activeElement)) {
        event.preventDefault();
        firstElement?.focus();
        return;
      }

      // Shift + Tab (backward)
      if (event.shiftKey) {
        if (activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      }
      // Tab (forward)
      else {
        if (activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }

    // Handle Escape key
    if (event.key === 'Escape') {
      // Allow parent components to handle escape
      // This is just for focus management
      if (restoreFocus && previousActiveElement.current) {
        (previousActiveElement.current as HTMLElement).focus?.();
      }
    }

    // Handle Arrow keys for additional navigation (optional)
    if (event.key === 'ArrowDown' && event.ctrlKey) {
      event.preventDefault();
      focusNext();
    }

    if (event.key === 'ArrowUp' && event.ctrlKey) {
      event.preventDefault();
      focusPrevious();
    }
  }, [isActive, getFocusableElements, focusNext, focusPrevious, restoreFocus]);

  // Set up focus trap when active
  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement;

    // Auto-focus first element if enabled
    if (autoFocus) {
      // Use setTimeout to ensure the container is rendered
      const timeoutId = setTimeout(() => {
        focusFirst();
      }, 0);

      return () => clearTimeout(timeoutId);
    }

    // Return undefined for consistency
    return undefined;
  }, [isActive, autoFocus, focusFirst]);

  // Set up keyboard event listeners
  useEffect(() => {
    if (!isActive) return;

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus when deactivating
      if (restoreFocus && previousActiveElement.current) {
        // Use setTimeout to avoid conflicts with other focus management
        setTimeout(() => {
          (previousActiveElement.current as HTMLElement).focus?.();
        }, 0);
      }
    };
  }, [isActive, handleKeyDown, restoreFocus]);

  return {
    containerRef,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
  };
}

/**
 * Hook for managing focus on route changes
 * Announces page changes to screen readers
 */
export function useFocusOnRouteChange(routeKey: string, skipLinks = true) {
  const announcementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus management for route changes
    const handleRouteChange = () => {
      // Create or update announcement for screen readers
      if (announcementRef.current) {
        announcementRef.current.textContent = `Navigated to ${document.title}`;
      }

      // Focus the main content or skip link
      if (skipLinks) {
        const skipLink = document.querySelector('[data-skip-link]') as HTMLElement;
        const mainContent = document.querySelector('main, [role="main"], #main-content') as HTMLElement;

        if (skipLink) {
          skipLink.focus();
        } else if (mainContent) {
          mainContent.focus();
        }
      }
    };

    // Trigger on route key change
    handleRouteChange();
  }, [routeKey, skipLinks]);

  return announcementRef;
}

/**
 * Hook for managing focus indicators
 * Helps distinguish between mouse and keyboard focus
 */
export function useFocusVisible() {
  const hadKeyboardEvent = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
          e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        hadKeyboardEvent.current = true;
      }
    };

    const handleMouseDown = () => {
      hadKeyboardEvent.current = false;
    };

    const handleFocus = (e: FocusEvent) => {
      if (hadKeyboardEvent.current) {
        (e.target as HTMLElement).classList.add('focus-visible');
      }
    };

    const handleBlur = (e: FocusEvent) => {
      (e.target as HTMLElement).classList.remove('focus-visible');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
    };
  }, []);

  return hadKeyboardEvent;
}
