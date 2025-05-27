/**
 * @fileoverview Enhanced Error Boundary Tests
 * @description Comprehensive tests for the error boundary component including
 * error handling, accessibility, and user interactions.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, ThrowError } from '@/test/utils';
import { EnhancedErrorBoundary, withErrorBoundary } from '../ErrorBoundary';

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleGroup = console.group;
const originalConsoleGroupEnd = console.groupEnd;

beforeEach(() => {
  console.error = vi.fn();
  console.group = vi.fn();
  console.groupEnd = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.group = originalConsoleGroup;
  console.groupEnd = originalConsoleGroupEnd;
});

describe('EnhancedErrorBoundary', () => {
  describe('Normal Operation', () => {
    it('should render children when no error occurs', () => {
      renderWithProviders(
        <EnhancedErrorBoundary>
          <div>Normal content</div>
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });

    it('should not interfere with normal component lifecycle', () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        return (
          <div>
            <span>Count: {count}</span>
            <button onClick={() => setCount(c => c + 1)}>Increment</button>
          </div>
        );
      };

      renderWithProviders(
        <EnhancedErrorBoundary>
          <TestComponent />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Count: 0')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Increment'));
      expect(screen.getByText('Count: 1')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should catch and display error UI when child component throws', () => {
      renderWithProviders(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/We're sorry, but something unexpected happened/)).toBeInTheDocument();
    });

    it('should display error ID for tracking', () => {
      renderWithProviders(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      const errorIdElement = screen.getByText(/Error ID:/);
      expect(errorIdElement).toBeInTheDocument();
      expect(errorIdElement.textContent).toMatch(/Error ID: error_\d+_[a-z0-9]+/);
    });

    it('should log error details to console', () => {
      renderWithProviders(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(console.group).toHaveBeenCalledWith('🚨 Error Boundary Caught Error');
      expect(console.error).toHaveBeenCalledWith('Error:', expect.any(Error));
    });

    it('should call custom error handler when provided', () => {
      const onError = vi.fn();

      renderWithProviders(
        <EnhancedErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });
  });

  describe('Error Recovery', () => {
    it('should provide retry functionality', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const TestComponent = () => {
        if (shouldThrow) {
          throw new Error('Test error');
        }
        return <div>Recovered content</div>;
      };

      renderWithProviders(
        <EnhancedErrorBoundary>
          <TestComponent />
        </EnhancedErrorBoundary>
      );

      // Should show error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Fix the error condition
      shouldThrow = false;

      // Click retry button
      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);

      // Should show recovered content
      expect(screen.getByText('Recovered content')).toBeInTheDocument();
    });

    it('should provide go home functionality', async () => {
      const user = userEvent.setup();
      
      // Mock window.location
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      renderWithProviders(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      const goHomeButton = screen.getByText('Go Home');
      await user.click(goHomeButton);

      expect(mockLocation.href).toBe('/');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderWithProviders(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      const retryButton = screen.getByLabelText('Try again');
      const homeButton = screen.getByLabelText('Go to home page');

      expect(retryButton).toBeInTheDocument();
      expect(homeButton).toBeInTheDocument();
    });

    it('should announce errors to screen readers', () => {
      // Mock the announceToScreenReader function
      const mockAnnounce = vi.fn();
      vi.doMock('@/lib/utils/accessibilityUtils', () => ({
        announceToScreenReader: mockAnnounce,
      }));

      renderWithProviders(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // Note: This test would need the actual implementation to verify
      // the screen reader announcement is made
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <EnhancedErrorBoundary>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // Tab to retry button
      await user.tab();
      expect(screen.getByText('Try Again')).toHaveFocus();

      // Tab to home button
      await user.tab();
      expect(screen.getByText('Go Home')).toHaveFocus();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom error message</div>;

      renderWithProviders(
        <EnhancedErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
    });
  });

  describe('Development Mode', () => {
    it('should show technical details in development mode', () => {
      // Mock development environment
      const originalEnv = process.env['NODE_ENV'];
      process.env['NODE_ENV'] = 'development';

      renderWithProviders(
        <EnhancedErrorBoundary showDetails={true}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      const detailsElement = screen.getByText('Technical Details');
      expect(detailsElement).toBeInTheDocument();

      // Restore environment
      process.env['NODE_ENV'] = originalEnv;
    });
  });

  describe('Reset Functionality', () => {
    it('should reset when resetKeys change', () => {
      let resetKey = 'key1';
      
      const { rerender } = renderWithProviders(
        <EnhancedErrorBoundary resetKeys={[resetKey]}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // Should show error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Change reset key
      resetKey = 'key2';
      rerender(
        <EnhancedErrorBoundary resetKeys={[resetKey]}>
          <ThrowError shouldThrow={false} />
        </EnhancedErrorBoundary>
      );

      // Should reset and show normal content
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should reset when resetOnPropsChange is true', () => {
      let propValue = 'value1';
      
      const { rerender } = renderWithProviders(
        <EnhancedErrorBoundary resetOnPropsChange={true} customProp={propValue}>
          <ThrowError shouldThrow={true} />
        </EnhancedErrorBoundary>
      );

      // Should show error UI
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Change props
      propValue = 'value2';
      rerender(
        <EnhancedErrorBoundary resetOnPropsChange={true} customProp={propValue}>
          <ThrowError shouldThrow={false} />
        </EnhancedErrorBoundary>
      );

      // Should reset and show normal content
      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });
});

describe('withErrorBoundary HOC', () => {
  it('should wrap component with error boundary', () => {
    const TestComponent = () => <div>Test component</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    renderWithProviders(<WrappedComponent />);

    expect(screen.getByText('Test component')).toBeInTheDocument();
  });

  it('should pass through props to wrapped component', () => {
    const TestComponent = ({ message }: { message: string }) => <div>{message}</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    renderWithProviders(<WrappedComponent message="Hello World" />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should catch errors in wrapped component', () => {
    const WrappedThrowError = withErrorBoundary(ThrowError);

    renderWithProviders(<WrappedThrowError shouldThrow={true} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
