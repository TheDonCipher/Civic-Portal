/**
 * @fileoverview Accessible Button Component
 * @description WCAG 2.1 AA compliant button with enhanced accessibility features
 */

import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAccessibility } from '@/hooks/useAccessibility';

interface AccessibleButtonProps extends ButtonProps {
  // ARIA attributes
  ariaLabel?: string;
  ariaDescribedBy?: string;
  ariaControls?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  ariaHaspopup?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  
  // Loading state
  isLoading?: boolean;
  loadingText?: string;
  
  // Confirmation
  requiresConfirmation?: boolean;
  confirmationText?: string;
  
  // Keyboard shortcuts
  shortcut?: string;
  
  // Accessibility options
  announceOnClick?: boolean;
  clickAnnouncement?: string;
  
  // Focus management
  autoFocus?: boolean;
  focusOnMount?: boolean;
  
  // High contrast support
  highContrastMode?: boolean;
}

export interface AccessibleButtonRef {
  focus: () => void;
  blur: () => void;
  click: () => void;
}

/**
 * Accessible button component with WCAG 2.1 AA compliance
 */
export const AccessibleButton = forwardRef<AccessibleButtonRef, AccessibleButtonProps>(
  ({
    ariaLabel,
    ariaDescribedBy,
    ariaControls,
    ariaExpanded,
    ariaPressed,
    ariaHaspopup,
    isLoading = false,
    loadingText = 'Loading...',
    requiresConfirmation = false,
    confirmationText = 'Are you sure?',
    shortcut,
    announceOnClick = false,
    clickAnnouncement,
    autoFocus = false,
    focusOnMount = false,
    highContrastMode = false,
    className,
    children,
    onClick,
    disabled,
    ...props
  }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { announce, state, contrastUtils } = useAccessibility();
    const [isConfirming, setIsConfirming] = React.useState(false);

    // Expose button methods through ref
    useImperativeHandle(ref, () => ({
      focus: () => buttonRef.current?.focus(),
      blur: () => buttonRef.current?.blur(),
      click: () => buttonRef.current?.click(),
    }));

    // Auto focus on mount if requested
    React.useEffect(() => {
      if ((autoFocus || focusOnMount) && buttonRef.current) {
        buttonRef.current.focus();
      }
    }, [autoFocus, focusOnMount]);

    // Keyboard shortcut handling
    React.useEffect(() => {
      if (!shortcut) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        const keys = shortcut.toLowerCase().split('+');
        const isCtrlOrCmd = keys.includes('ctrl') || keys.includes('cmd');
        const isShift = keys.includes('shift');
        const isAlt = keys.includes('alt');
        const key = keys[keys.length - 1];

        const ctrlPressed = event.ctrlKey || event.metaKey;
        const shiftPressed = event.shiftKey;
        const altPressed = event.altKey;

        if (
          event.key.toLowerCase() === key &&
          (!isCtrlOrCmd || ctrlPressed) &&
          (!isShift || shiftPressed) &&
          (!isAlt || altPressed)
        ) {
          event.preventDefault();
          buttonRef.current?.click();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [shortcut]);

    // Handle click with confirmation and announcements
    const handleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) return;

      if (requiresConfirmation && !isConfirming) {
        setIsConfirming(true);
        announce(confirmationText, 'assertive');
        return;
      }

      // Reset confirmation state
      if (isConfirming) {
        setIsConfirming(false);
      }

      // Announce click if requested
      if (announceOnClick) {
        const message = clickAnnouncement || `${ariaLabel || 'Button'} activated`;
        announce(message);
      }

      onClick?.(event);
    }, [
      isLoading,
      disabled,
      requiresConfirmation,
      isConfirming,
      confirmationText,
      announceOnClick,
      clickAnnouncement,
      ariaLabel,
      onClick,
      announce,
    ]);

    // Handle escape key to cancel confirmation
    React.useEffect(() => {
      if (!isConfirming) return;

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsConfirming(false);
          announce('Action cancelled');
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isConfirming, announce]);

    // Determine button text
    const buttonText = React.useMemo(() => {
      if (isLoading) return loadingText;
      if (isConfirming) return 'Press again to confirm';
      return children;
    }, [isLoading, loadingText, isConfirming, children]);

    // Apply high contrast styles if needed
    const buttonClassName = React.useMemo(() => {
      let classes = className || '';
      
      if (highContrastMode || state.isHighContrast) {
        classes = cn(classes, 'border-2 border-current font-semibold');
      }
      
      if (isConfirming) {
        classes = cn(classes, 'bg-yellow-100 border-yellow-500 text-yellow-900 hover:bg-yellow-200');
      }
      
      return classes;
    }, [className, highContrastMode, state.isHighContrast, isConfirming]);

    // Build ARIA attributes
    const ariaAttributes = React.useMemo(() => {
      const attributes: Record<string, any> = {};

      if (ariaLabel) attributes['aria-label'] = ariaLabel;
      if (ariaDescribedBy) attributes['aria-describedby'] = ariaDescribedBy;
      if (ariaControls) attributes['aria-controls'] = ariaControls;
      if (typeof ariaExpanded === 'boolean') attributes['aria-expanded'] = ariaExpanded;
      if (typeof ariaPressed === 'boolean') attributes['aria-pressed'] = ariaPressed;
      if (ariaHaspopup) attributes['aria-haspopup'] = ariaHaspopup;

      // Loading state
      if (isLoading) {
        attributes['aria-busy'] = true;
        attributes['aria-live'] = 'polite';
      }

      // Confirmation state
      if (isConfirming) {
        attributes['aria-describedby'] = `${attributes['aria-describedby'] || ''} confirmation-message`.trim();
      }

      return attributes;
    }, [
      ariaLabel,
      ariaDescribedBy,
      ariaControls,
      ariaExpanded,
      ariaPressed,
      ariaHaspopup,
      isLoading,
      isConfirming,
    ]);

    return (
      <>
        <Button
          ref={buttonRef}
          className={buttonClassName}
          onClick={handleClick}
          disabled={disabled || isLoading}
          {...ariaAttributes}
          {...props}
        >
          {buttonText}
          {shortcut && (
            <span className="sr-only">
              {` (Keyboard shortcut: ${shortcut})`}
            </span>
          )}
        </Button>
        
        {/* Hidden confirmation message for screen readers */}
        {isConfirming && (
          <div
            id="confirmation-message"
            className="sr-only"
            aria-live="assertive"
          >
            {confirmationText} Press the button again to confirm, or press Escape to cancel.
          </div>
        )}
      </>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
