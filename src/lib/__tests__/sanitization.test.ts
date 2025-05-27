/**
 * Sanitization Utilities Tests
 * Comprehensive tests for input sanitization functions
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  sanitizeEmail,
  sanitizeUrl,
  sanitizeFormData,
  sanitizeHtml,
  validateAndSanitizeInput,
} from '../sanitization';

describe('sanitizeText', () => {
  it('should remove script tags', () => {
    const input = 'Hello <script>alert("xss")</script> World';
    const result = sanitizeText(input);
    expect(result).toBe('Hello  World');
    expect(result).not.toContain('<script>');
  });

  it('should remove dangerous HTML tags', () => {
    const input = 'Hello <iframe src="evil.com"></iframe> World';
    const result = sanitizeText(input);
    expect(result).toBe('Hello  World');
  });

  it('should preserve safe content', () => {
    const input = 'Hello World! This is a normal text.';
    const result = sanitizeText(input);
    expect(result).toBe(input);
  });

  it('should respect max length', () => {
    const input = 'This is a very long text that should be truncated';
    const result = sanitizeText(input, 10);
    expect(result).toHaveLength(10);
    expect(result).toBe('This is a ');
  });

  it('should handle empty input', () => {
    expect(sanitizeText('')).toBe('');
    expect(sanitizeText(null as any)).toBe('');
    expect(sanitizeText(undefined as any)).toBe('');
  });

  it('should remove SQL injection attempts', () => {
    const input = "'; DROP TABLE users; --";
    const result = sanitizeText(input);
    expect(result).not.toContain('DROP TABLE');
  });

  it('should handle unicode characters properly', () => {
    const input = 'Hello 世界 🌍 café';
    const result = sanitizeText(input);
    expect(result).toBe(input);
  });
});

describe('sanitizeEmail', () => {
  it('should validate and return valid emails', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
    ];

    validEmails.forEach(email => {
      expect(sanitizeEmail(email)).toBe(email);
    });
  });

  it('should reject invalid emails', () => {
    const invalidEmails = [
      'invalid-email',
      '@domain.com',
      'user@',
      'user..name@domain.com',
      'user@domain',
      '<script>alert("xss")</script>@domain.com',
    ];

    invalidEmails.forEach(email => {
      expect(sanitizeEmail(email)).toBeNull();
    });
  });

  it('should handle empty input', () => {
    expect(sanitizeEmail('')).toBeNull();
    expect(sanitizeEmail(null as any)).toBeNull();
    expect(sanitizeEmail(undefined as any)).toBeNull();
  });

  it('should normalize email case', () => {
    expect(sanitizeEmail('TEST@EXAMPLE.COM')).toBe('test@example.com');
  });
});

describe('sanitizeUrl', () => {
  it('should allow safe URLs', () => {
    const safeUrls = [
      'https://example.com',
      'http://localhost:3000',
      'https://sub.domain.com/path?query=value',
    ];

    safeUrls.forEach(url => {
      expect(sanitizeUrl(url)).toBe(url);
    });
  });

  it('should reject dangerous URLs', () => {
    const dangerousUrls = [
      'javascript:alert("xss")',
      'data:text/html,<script>alert("xss")</script>',
      'vbscript:msgbox("xss")',
      'file:///etc/passwd',
    ];

    dangerousUrls.forEach(url => {
      expect(sanitizeUrl(url)).toBeNull();
    });
  });

  it('should handle malformed URLs', () => {
    const malformedUrls = [
      'not-a-url',
      'http://',
      'https://',
      '',
    ];

    malformedUrls.forEach(url => {
      expect(sanitizeUrl(url)).toBeNull();
    });
  });
});

describe('sanitizeFormData', () => {
  it('should sanitize all string fields in form data', () => {
    const formData = {
      title: 'Hello <script>alert("xss")</script> World',
      description: 'Normal description',
      category: 'infrastructure',
      email: 'test@example.com',
      number: 42,
      boolean: true,
    };

    const result = sanitizeFormData(formData);

    expect(result.title).toBe('Hello  World');
    expect(result.description).toBe('Normal description');
    expect(result.category).toBe('infrastructure');
    expect(result.email).toBe('test@example.com');
    expect(result.number).toBe(42);
    expect(result.boolean).toBe(true);
  });

  it('should handle nested objects', () => {
    const formData = {
      user: {
        name: 'John <script>alert("xss")</script> Doe',
        email: 'john@example.com',
      },
      settings: {
        theme: 'dark',
        notifications: true,
      },
    };

    const result = sanitizeFormData(formData);

    expect(result.user.name).toBe('John  Doe');
    expect(result.user.email).toBe('john@example.com');
    expect(result.settings.theme).toBe('dark');
    expect(result.settings.notifications).toBe(true);
  });

  it('should handle arrays', () => {
    const formData = {
      tags: ['tag1', 'tag2 <script>alert("xss")</script>', 'tag3'],
      numbers: [1, 2, 3],
    };

    const result = sanitizeFormData(formData);

    expect(result.tags).toEqual(['tag1', 'tag2 ', 'tag3']);
    expect(result.numbers).toEqual([1, 2, 3]);
  });
});

describe('sanitizeHtml', () => {
  it('should allow safe HTML tags', () => {
    const input = '<p>Hello <strong>world</strong>!</p>';
    const result = sanitizeHtml(input);
    expect(result).toBe(input);
  });

  it('should remove dangerous HTML tags', () => {
    const input = '<p>Hello</p><script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    expect(result).toBe('<p>Hello</p>');
  });

  it('should remove dangerous attributes', () => {
    const input = '<p onclick="alert(\'xss\')">Hello</p>';
    const result = sanitizeHtml(input);
    expect(result).toBe('<p>Hello</p>');
  });

  it('should preserve safe attributes', () => {
    const input = '<a href="https://example.com" title="Example">Link</a>';
    const result = sanitizeHtml(input);
    expect(result).toBe(input);
  });
});

describe('validateAndSanitizeInput', () => {
  it('should validate and sanitize text input', () => {
    const result = validateAndSanitizeInput(
      'Hello <script>alert("xss")</script> World',
      'text',
      { maxLength: 50 }
    );

    expect(result.isValid).toBe(true);
    expect(result.sanitizedValue).toBe('Hello  World');
    expect(result.errors).toEqual([]);
  });

  it('should validate email input', () => {
    const validResult = validateAndSanitizeInput(
      'test@example.com',
      'email'
    );

    expect(validResult.isValid).toBe(true);
    expect(validResult.sanitizedValue).toBe('test@example.com');

    const invalidResult = validateAndSanitizeInput(
      'invalid-email',
      'email'
    );

    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toContain('Invalid email format');
  });

  it('should validate URL input', () => {
    const validResult = validateAndSanitizeInput(
      'https://example.com',
      'url'
    );

    expect(validResult.isValid).toBe(true);
    expect(validResult.sanitizedValue).toBe('https://example.com');

    const invalidResult = validateAndSanitizeInput(
      'javascript:alert("xss")',
      'url'
    );

    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toContain('Invalid or unsafe URL');
  });

  it('should enforce max length', () => {
    const result = validateAndSanitizeInput(
      'This is a very long text',
      'text',
      { maxLength: 10 }
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Text exceeds maximum length of 10 characters');
  });

  it('should enforce required validation', () => {
    const result = validateAndSanitizeInput(
      '',
      'text',
      { required: true }
    );

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('This field is required');
  });
});
