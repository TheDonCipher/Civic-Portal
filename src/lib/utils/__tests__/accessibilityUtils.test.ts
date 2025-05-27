/**
 * Accessibility Utilities Tests
 * Tests for ARIA labels, focus management, and accessibility helpers
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ariaLabels,
  generateAriaId,
  announceToScreenReader,
  focusUtils,
  keyboardNavigation,
} from '../accessibilityUtils';

describe('ariaLabels', () => {
  it('should provide button labels', () => {
    expect(ariaLabels.button.close).toBe('Close');
    expect(ariaLabels.button.edit('issue')).toBe('Edit issue');
    expect(ariaLabels.button.delete('comment')).toBe('Delete comment');
  });

  it('should provide form labels', () => {
    expect(ariaLabels.form.required('Email')).toBe('Email (required)');
    expect(ariaLabels.form.optional('Phone')).toBe('Phone (optional)');
    expect(ariaLabels.form.error('Email', 'Invalid format')).toBe('Email error: Invalid format');
  });

  it('should provide issue-specific labels', () => {
    expect(ariaLabels.issue.card('Test Issue')).toBe('Issue: Test Issue');
    expect(ariaLabels.issue.status('open')).toBe('Status: open');
    expect(ariaLabels.issue.votes(5)).toBe('5 votes');
    expect(ariaLabels.issue.votes(1)).toBe('1 vote');
    expect(ariaLabels.issue.comments(3)).toBe('3 comments');
    expect(ariaLabels.issue.comments(1)).toBe('1 comment');
  });

  it('should provide dashboard labels', () => {
    expect(ariaLabels.dashboard.stat('Total Issues', 42)).toBe('Total Issues: 42');
    expect(ariaLabels.dashboard.chart('Bar', 'Monthly trends')).toBe('Bar chart: Monthly trends');
  });
});

describe('generateAriaId', () => {
  it('should generate unique IDs with prefix', () => {
    const id1 = generateAriaId('test');
    const id2 = generateAriaId('test');
    
    expect(id1).toMatch(/^test-\d+-[a-z0-9]+$/);
    expect(id2).toMatch(/^test-\d+-[a-z0-9]+$/);
    expect(id1).not.toBe(id2);
  });

  it('should include suffix when provided', () => {
    const id = generateAriaId('test', 'suffix');
    expect(id).toMatch(/^test-\d+-[a-z0-9]+-suffix$/);
  });
});

describe('announceToScreenReader', () => {
  beforeEach(() => {
    // Clear any existing announcer elements
    document.querySelectorAll('[aria-live]').forEach(el => el.remove());
  });

  afterEach(() => {
    // Clean up announcer elements
    document.querySelectorAll('[aria-live]').forEach(el => el.remove());
  });

  it('should create aria-live element with message', () => {
    announceToScreenReader('Test message');
    
    const announcer = document.querySelector('[aria-live="polite"]');
    expect(announcer).toBeTruthy();
    expect(announcer?.textContent).toBe('Test message');
    expect(announcer?.getAttribute('aria-atomic')).toBe('true');
  });

  it('should use assertive priority when specified', () => {
    announceToScreenReader('Urgent message', 'assertive');
    
    const announcer = document.querySelector('[aria-live="assertive"]');
    expect(announcer).toBeTruthy();
    expect(announcer?.textContent).toBe('Urgent message');
  });

  it('should remove announcer element after timeout', async () => {
    vi.useFakeTimers();
    
    announceToScreenReader('Test message');
    
    expect(document.querySelector('[aria-live]')).toBeTruthy();
    
    vi.advanceTimersByTime(1000);
    
    expect(document.querySelector('[aria-live]')).toBeFalsy();
    
    vi.useRealTimers();
  });
});

describe('focusUtils', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <button id="btn1">Button 1</button>
      <input id="input1" type="text" />
      <a id="link1" href="#">Link 1</a>
      <button id="btn2">Button 2</button>
      <div tabindex="-1">Not focusable</div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('focusFirst', () => {
    it('should focus the first focusable element', () => {
      focusUtils.focusFirst(container);
      expect(document.activeElement?.id).toBe('btn1');
    });

    it('should handle container with no focusable elements', () => {
      const emptyContainer = document.createElement('div');
      emptyContainer.innerHTML = '<div>No focusable elements</div>';
      document.body.appendChild(emptyContainer);
      
      focusUtils.focusFirst(emptyContainer);
      // Should not throw error
      
      document.body.removeChild(emptyContainer);
    });
  });

  describe('focusLast', () => {
    it('should focus the last focusable element', () => {
      focusUtils.focusLast(container);
      expect(document.activeElement?.id).toBe('btn2');
    });
  });

  describe('getFocusableElements', () => {
    it('should return all focusable elements', () => {
      const focusableElements = focusUtils.getFocusableElements(container);
      expect(focusableElements).toHaveLength(4);
      expect(focusableElements.map(el => el.id)).toEqual(['btn1', 'input1', 'link1', 'btn2']);
    });
  });
});

describe('keyboardNavigation', () => {
  let items: HTMLElement[];

  beforeEach(() => {
    const container = document.createElement('div');
    container.innerHTML = `
      <button id="item0">Item 0</button>
      <button id="item1">Item 1</button>
      <button id="item2">Item 2</button>
    `;
    document.body.appendChild(container);
    items = Array.from(container.querySelectorAll('button'));
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('handleArrowKeys', () => {
    it('should move focus down with ArrowDown', () => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      const spy = vi.spyOn(mockEvent, 'preventDefault');
      
      const newIndex = keyboardNavigation.handleArrowKeys(mockEvent, items, 0);
      
      expect(spy).toHaveBeenCalled();
      expect(newIndex).toBe(1);
      expect(document.activeElement?.id).toBe('item1');
    });

    it('should move focus up with ArrowUp', () => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      const spy = vi.spyOn(mockEvent, 'preventDefault');
      
      const newIndex = keyboardNavigation.handleArrowKeys(mockEvent, items, 1);
      
      expect(spy).toHaveBeenCalled();
      expect(newIndex).toBe(0);
      expect(document.activeElement?.id).toBe('item0');
    });

    it('should wrap to last item when going up from first', () => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
      
      const newIndex = keyboardNavigation.handleArrowKeys(mockEvent, items, 0);
      
      expect(newIndex).toBe(2);
      expect(document.activeElement?.id).toBe('item2');
    });

    it('should wrap to first item when going down from last', () => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
      
      const newIndex = keyboardNavigation.handleArrowKeys(mockEvent, items, 2);
      
      expect(newIndex).toBe(0);
      expect(document.activeElement?.id).toBe('item0');
    });

    it('should move to first item with Home key', () => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'Home' });
      const spy = vi.spyOn(mockEvent, 'preventDefault');
      
      const newIndex = keyboardNavigation.handleArrowKeys(mockEvent, items, 1);
      
      expect(spy).toHaveBeenCalled();
      expect(newIndex).toBe(0);
      expect(document.activeElement?.id).toBe('item0');
    });

    it('should move to last item with End key', () => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'End' });
      const spy = vi.spyOn(mockEvent, 'preventDefault');
      
      const newIndex = keyboardNavigation.handleArrowKeys(mockEvent, items, 0);
      
      expect(spy).toHaveBeenCalled();
      expect(newIndex).toBe(2);
      expect(document.activeElement?.id).toBe('item2');
    });

    it('should not change focus for other keys', () => {
      const mockEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const spy = vi.spyOn(mockEvent, 'preventDefault');
      
      const newIndex = keyboardNavigation.handleArrowKeys(mockEvent, items, 1);
      
      expect(spy).not.toHaveBeenCalled();
      expect(newIndex).toBe(1);
    });
  });
});
