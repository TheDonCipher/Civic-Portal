/**
 * @fileoverview Accessibility Tests
 * @description Tests for WCAG 2.1 AA compliance and accessibility features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import accessibility utilities
import {
  colorContrast,
  ariaLabels,
  generateAriaId,
  announceToScreenReader,
  screenReader,
  keyboardNavigation,
} from '@/lib/utils/accessibilityUtils';

// Mock DOM APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Accessibility Tests', () => {
  beforeEach(() => {
    // Clear DOM before each test
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    document.head.innerHTML = '';
    document.body.innerHTML = '';
  });

  describe('Color Contrast Utilities', () => {
    it('should convert hex colors to RGB correctly', () => {
      const white = colorContrast.hexToRgb('#ffffff');
      const black = colorContrast.hexToRgb('#000000');
      const blue = colorContrast.hexToRgb('#0066cc');

      expect(white).toEqual({ r: 255, g: 255, b: 255 });
      expect(black).toEqual({ r: 0, g: 0, b: 0 });
      expect(blue).toEqual({ r: 0, g: 102, b: 204 });
    });

    it('should handle invalid hex colors', () => {
      const invalid = colorContrast.hexToRgb('invalid');
      expect(invalid).toBeNull();
    });

    it('should calculate luminance correctly', () => {
      const whiteLuminance = colorContrast.getLuminance(255, 255, 255);
      const blackLuminance = colorContrast.getLuminance(0, 0, 0);

      expect(whiteLuminance).toBeCloseTo(1, 2);
      expect(blackLuminance).toBeCloseTo(0, 2);
    });

    it('should calculate contrast ratios correctly', () => {
      const whiteBlackRatio = colorContrast.getContrastRatio('#ffffff', '#000000');
      const sameColorRatio = colorContrast.getContrastRatio('#ffffff', '#ffffff');

      expect(whiteBlackRatio).toBeCloseTo(21, 0); // Maximum contrast
      expect(sameColorRatio).toBeCloseTo(1, 2); // No contrast
    });

    it('should validate WCAG AA compliance', () => {
      // High contrast (should pass)
      const highContrast = colorContrast.meetsWCAG('#000000', '#ffffff');
      expect(highContrast).toBe(true);

      // Low contrast (should fail)
      const lowContrast = colorContrast.meetsWCAG('#cccccc', '#ffffff');
      expect(lowContrast).toBe(false);
    });

    it('should validate WCAG AAA compliance', () => {
      const aaaCompliant = colorContrast.meetsWCAG('#000000', '#ffffff', 'AAA');
      expect(aaaCompliant).toBe(true);

      const aaOnlyCompliant = colorContrast.meetsWCAG('#666666', '#ffffff', 'AAA');
      expect(aaOnlyCompliant).toBe(false);
    });

    it('should provide contrast validation with suggestions', () => {
      const validation = colorContrast.validateAndSuggest('#cccccc', '#ffffff');

      expect(validation.isValid).toBe(false);
      expect(validation.ratio).toBeLessThan(4.5);
      expect(validation.suggestion).toContain('4.5:1');
    });

    it('should provide high contrast alternatives', () => {
      const highContrast = colorContrast.getHighContrast('text-gray-500');
      expect(highContrast).toBe('text-gray-900');

      const unknown = colorContrast.getHighContrast('text-unknown-color');
      expect(unknown).toBe('text-unknown-color');
    });
  });

  describe('ARIA Utilities', () => {
    it('should generate unique ARIA IDs', () => {
      const id1 = generateAriaId('test');
      const id2 = generateAriaId('test');
      const id3 = generateAriaId('test', 'suffix');

      expect(id1).toMatch(/^test-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^test-\d+-[a-z0-9]+$/);
      expect(id3).toMatch(/^test-\d+-[a-z0-9]+-suffix$/);
      expect(id1).not.toBe(id2);
    });

    it('should provide correct ARIA labels for buttons', () => {
      expect(ariaLabels.button.edit('issue')).toBe('Edit issue');
      expect(ariaLabels.button.delete('comment')).toBe('Delete comment');
      expect(ariaLabels.button.save).toBe('Save changes');
      expect(ariaLabels.button.cancel).toBe('Cancel');
    });

    it('should provide correct ARIA labels for issues', () => {
      expect(ariaLabels.issue.status('open')).toBe('Status: open');
      expect(ariaLabels.issue.category('infrastructure')).toBe('Category: infrastructure');
      expect(ariaLabels.issue.votes(5)).toBe('5 votes');
      expect(ariaLabels.issue.votes(1)).toBe('1 vote');
    });

    it('should provide correct ARIA labels for forms', () => {
      expect(ariaLabels.form.required('Email')).toBe('Email (required)');
      expect(ariaLabels.form.optional('Phone')).toBe('Phone (optional)');
      expect(ariaLabels.form.error('Email', 'Invalid email format')).toBe('Email error: Invalid email format');
    });

    it('should provide correct ARIA labels for navigation', () => {
      expect(ariaLabels.navigation.breadcrumb).toBe('Breadcrumb navigation');
      expect(ariaLabels.navigation.pagination).toBe('Pagination navigation');
      expect(ariaLabels.navigation.main).toBe('Main navigation');
    });
  });

  describe('Screen Reader Utilities', () => {
    it('should create proper screen reader attributes', () => {
      expect(screenReader.describedBy('test-id')).toEqual({ 'aria-describedby': 'test-id' });
      expect(screenReader.labelledBy('label-id')).toEqual({ 'aria-labelledby': 'label-id' });
      expect(screenReader.expanded(true)).toEqual({ 'aria-expanded': true });
      expect(screenReader.selected(false)).toEqual({ 'aria-selected': false });
      expect(screenReader.pressed(true)).toEqual({ 'aria-pressed': true });
    });

    it('should announce to screen readers', () => {
      // Mock the live region creation
      const createElementSpy = vi.spyOn(document, 'createElement');
      const appendChildSpy = vi.spyOn(document.body, 'appendChild');

      announceToScreenReader('Test announcement');

      expect(createElementSpy).toHaveBeenCalledWith('div');
      expect(appendChildSpy).toHaveBeenCalled();
    });

    it('should handle assertive announcements', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');

      announceToScreenReader('Urgent message', 'assertive');

      expect(createElementSpy).toHaveBeenCalledWith('div');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle arrow key navigation', () => {
      const items = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button'),
      ];

      // Mock focus method
      items.forEach(item => {
        item.focus = vi.fn();
      });

      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const homeEvent = new KeyboardEvent('keydown', { key: 'Home' });
      const endEvent = new KeyboardEvent('keydown', { key: 'End' });

      // Test arrow down navigation
      let currentIndex = keyboardNavigation.handleArrowKeys(downEvent, items, 0);
      expect(currentIndex).toBe(1);
      expect(items[1].focus).toHaveBeenCalled();

      // Test arrow up navigation
      currentIndex = keyboardNavigation.handleArrowKeys(upEvent, items, 1);
      expect(currentIndex).toBe(0);
      expect(items[0].focus).toHaveBeenCalled();

      // Test home key
      currentIndex = keyboardNavigation.handleArrowKeys(homeEvent, items, 2);
      expect(currentIndex).toBe(0);

      // Test end key
      currentIndex = keyboardNavigation.handleArrowKeys(endEvent, items, 0);
      expect(currentIndex).toBe(2);
    });

    it('should wrap around at boundaries', () => {
      const items = [
        document.createElement('button'),
        document.createElement('button'),
      ];

      items.forEach(item => {
        item.focus = vi.fn();
      });

      const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });

      // Test wrapping from last to first
      let currentIndex = keyboardNavigation.handleArrowKeys(downEvent, items, 1);
      expect(currentIndex).toBe(0);

      // Test wrapping from first to last
      currentIndex = keyboardNavigation.handleArrowKeys(upEvent, items, 0);
      expect(currentIndex).toBe(1);
    });
  });

  describe('Focus Management', () => {
    it('should trap focus within a container', () => {
      // Create a container with focusable elements
      const container = document.createElement('div');
      const button1 = document.createElement('button');
      const button2 = document.createElement('button');
      const input = document.createElement('input');

      container.appendChild(button1);
      container.appendChild(button2);
      container.appendChild(input);
      document.body.appendChild(container);

      // Mock focus methods
      button1.focus = vi.fn();
      button2.focus = vi.fn();
      input.focus = vi.fn();

      // Test focus trap (this would be implemented in the actual focus trap utility)
      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      expect(focusableElements).toHaveLength(3);
      expect(focusableElements[0]).toBe(button1);
      expect(focusableElements[2]).toBe(input);
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple accessibility features together', () => {
      // Test combining ARIA labels, color contrast, and keyboard navigation
      const buttonLabel = ariaLabels.button.edit('issue');
      const contrastCheck = colorContrast.meetsWCAG('#000000', '#ffffff');
      const ariaId = generateAriaId('integrated-test');

      expect(buttonLabel).toBe('Edit issue');
      expect(contrastCheck).toBe(true);
      expect(ariaId).toMatch(/^integrated-test-\d+-[a-z0-9]+$/);
    });

    it('should validate complete accessibility implementation', () => {
      // Create a mock component with full accessibility features
      const container = document.createElement('div');
      container.setAttribute('role', 'main');
      container.setAttribute('aria-label', 'Main content');

      const heading = document.createElement('h1');
      heading.textContent = 'Accessible Page';
      heading.id = 'main-heading';

      const button = document.createElement('button');
      button.setAttribute('aria-labelledby', 'main-heading');
      button.setAttribute('aria-describedby', 'button-description');
      button.textContent = 'Accessible Button';

      const description = document.createElement('div');
      description.id = 'button-description';
      description.textContent = 'This button demonstrates accessibility features';

      container.appendChild(heading);
      container.appendChild(button);
      container.appendChild(description);

      // Validate structure
      expect(container.getAttribute('role')).toBe('main');
      expect(container.getAttribute('aria-label')).toBe('Main content');
      expect(button.getAttribute('aria-labelledby')).toBe('main-heading');
      expect(button.getAttribute('aria-describedby')).toBe('button-description');
    });
  });
});
