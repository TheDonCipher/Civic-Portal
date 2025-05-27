/**
 * @fileoverview Security Implementation Tests
 * @description Tests for the enhanced security features implemented in Phase 1
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeInput,
  sanitizeHtml,
  validatePasswordSecurity,
  validateFileUpload,
  generateCSPHeader,
  CSP_CONFIG
} from '../lib/security/enhancedSecurity';

describe('Enhanced Security Implementation', () => {
  describe('Input Sanitization with DOMPurify', () => {
    it('should sanitize basic XSS attempts', () => {
      const maliciousInput = '<script>alert("xss")</script>Hello World';
      const sanitized = sanitizeInput(maliciousInput);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('Hello World');
    });

    it('should allow safe HTML tags when specified', () => {
      const input = '<strong>Bold text</strong> and <em>italic text</em>';
      const sanitized = sanitizeInput(input, {
        allowedTags: ['strong', 'em'],
        allowedAttributes: []
      });

      expect(sanitized).toContain('<strong>Bold text</strong>');
      expect(sanitized).toContain('<em>italic text</em>');
    });

    it('should remove dangerous attributes', () => {
      const input = '<div onclick="alert(\'xss\')" class="safe">Content</div>';
      const sanitized = sanitizeInput(input, {
        allowedTags: ['div'],
        allowedAttributes: ['class']
      });

      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('alert');
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(20000);
      const sanitized = sanitizeInput(longInput, { maxLength: 100 });

      expect(sanitized.length).toBeLessThanOrEqual(100);
    });
  });

  describe('Rich Text HTML Sanitization', () => {
    it('should allow safe rich text elements', () => {
      const richText = '<p>Paragraph</p><strong>Bold</strong><em>Italic</em><ul><li>List item</li></ul>';
      const sanitized = sanitizeHtml(richText);

      expect(sanitized).toContain('<p>Paragraph</p>');
      expect(sanitized).toContain('<strong>Bold</strong>');
      expect(sanitized).toContain('<em>Italic</em>');
      expect(sanitized).toContain('<ul><li>List item</li></ul>');
    });

    it('should remove dangerous elements', () => {
      const dangerousHtml = '<script>alert("xss")</script><iframe src="evil.com"></iframe><p>Safe content</p>';
      const sanitized = sanitizeHtml(dangerousHtml);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('<iframe>');
      expect(sanitized).toContain('<p>Safe content</p>');
    });

    it('should remove event handlers', () => {
      const htmlWithEvents = '<p onclick="alert(\'xss\')" onmouseover="steal()">Content</p>';
      const sanitized = sanitizeHtml(htmlWithEvents);

      expect(sanitized).not.toContain('onclick');
      expect(sanitized).not.toContain('onmouseover');
      expect(sanitized).toContain('Content');
    });
  });

  describe('Password Security Validation', () => {
    it('should validate strong passwords', () => {
      const strongPassword = 'MyStr0ng!P@ssw0rd';
      const result = validatePasswordSecurity(strongPassword);

      expect(result.isValid).toBe(true);
      expect(result.score).toBeGreaterThan(80);
      expect(result.feedback).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const weakPassword = '123456';
      const result = validatePasswordSecurity(weakPassword);

      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(40);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should provide helpful feedback', () => {
      const password = 'password';
      const result = validatePasswordSecurity(password);

      expect(result.feedback).toContain('Add at least one uppercase letter');
      expect(result.feedback).toContain('Add at least one number');
      expect(result.feedback).toContain('Add at least one special character');
    });

    it('should detect common passwords', () => {
      const commonPassword = 'password123';
      const result = validatePasswordSecurity(commonPassword);

      expect(result.score).toBeLessThan(60);
      expect(result.feedback.some(f => f.includes('common'))).toBe(true);
    });
  });

  describe('File Upload Security', () => {
    it('should validate allowed file types', () => {
      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const result = validateFileUpload(validFile);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject dangerous file types', () => {
      const dangerousFile = new File(['content'], 'malware.exe', { type: 'application/x-executable' });
      const result = validateFileUpload(dangerousFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File type not allowed');
    });

    it('should validate file size limits', () => {
      const largeContent = new Array(11 * 1024 * 1024).fill('a').join(''); // 11MB
      const largeFile = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const result = validateFileUpload(largeFile);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size must be less than 10MB');
    });

    it('should validate file names', () => {
      const fileWithBadName = new File(['content'], '../../../etc/passwd', { type: 'image/jpeg' });
      const result = validateFileUpload(fileWithBadName);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File name contains invalid characters');
    });
  });

  describe('Content Security Policy', () => {
    it('should generate valid CSP header', () => {
      const cspHeader = generateCSPHeader();

      expect(cspHeader).toContain("default-src 'self'");
      expect(cspHeader).toContain("script-src 'self' 'unsafe-inline' https://api.dicebear.com");
      expect(cspHeader).toContain("object-src 'none'");
      expect(cspHeader).toContain("frame-ancestors 'none'");
    });

    it('should include all required CSP directives', () => {
      const cspHeader = generateCSPHeader();

      Object.keys(CSP_CONFIG).forEach(directive => {
        expect(cspHeader).toContain(directive);
      });
    });

    it('should properly format CSP directives', () => {
      const cspHeader = generateCSPHeader();

      // Should be semicolon-separated
      expect(cspHeader.split(';').length).toBeGreaterThan(1);

      // Should not have trailing semicolon
      expect(cspHeader.endsWith(';')).toBe(false);
    });
  });

  describe('Security Configuration', () => {
    it('should have secure default settings', () => {
      // Verify CSP blocks dangerous sources
      expect(CSP_CONFIG['object-src']).toContain("'none'");
      expect(CSP_CONFIG['frame-ancestors']).toContain("'none'");
      expect(CSP_CONFIG['base-uri']).toContain("'self'");

      // Verify upgrade-insecure-requests is enabled
      expect(CSP_CONFIG['upgrade-insecure-requests']).toBeDefined();
    });

    it('should allow necessary external resources', () => {
      // Should allow Supabase connections
      expect(CSP_CONFIG['connect-src']).toContain('https://*.supabase.co');
      expect(CSP_CONFIG['connect-src']).toContain('wss://*.supabase.co');

      // Should allow Google Fonts
      expect(CSP_CONFIG['style-src']).toContain('https://fonts.googleapis.com');
      expect(CSP_CONFIG['font-src']).toContain('https://fonts.gstatic.com');
    });
  });
});

describe('Security Integration Tests', () => {
  it('should handle multiple security validations together', () => {
    const userInput = '<script>alert("xss")</script><p>Valid content</p>';
    const password = 'MyStr0ng!Secur3#2024'; // Strong password without common patterns
    const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });

    const sanitizedInput = sanitizeInput(userInput);
    const passwordValidation = validatePasswordSecurity(password);
    const fileValidation = validateFileUpload(file);

    expect(sanitizedInput).not.toContain('<script>');
    expect(sanitizedInput).toContain('Valid content');
    expect(passwordValidation.isValid).toBe(true);
    expect(passwordValidation.score).toBeGreaterThanOrEqual(80);
    expect(fileValidation.isValid).toBe(true);
  });

  it('should maintain security under edge cases', () => {
    // Test empty inputs
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeHtml('')).toBe('');

    // Test null/undefined handling
    expect(sanitizeInput(null as any)).toBe('');
    expect(sanitizeHtml(undefined as any)).toBe('');
  });
});
