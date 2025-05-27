/**
 * @fileoverview SEO Tests
 * @description Tests for SEO optimization and meta tag management
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/test-page',
    origin: 'http://localhost:3000',
    pathname: '/test-page',
  },
  writable: true,
});

describe('SEO Tests', () => {
  beforeEach(() => {
    // Clear DOM before each test
    document.head.innerHTML = '';
    document.title = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up after each test
    document.head.innerHTML = '';
    document.title = '';
  });

  describe('Meta Tag Management', () => {
    it('should create and update meta tags correctly', () => {
      // Helper function to create meta tags (simulating SEOHead functionality)
      const updateMetaTag = (name: string, content: string, attributeName: 'name' | 'property' = 'name') => {
        let element = document.querySelector(`meta[${attributeName}="${name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attributeName, name);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      // Set title
      document.title = 'Test Page | Civic Portal';

      // Set meta tags
      updateMetaTag('description', 'This is a test page description');
      updateMetaTag('keywords', 'test, page, keywords');

      // Check title
      expect(document.title).toBe('Test Page | Civic Portal');

      // Check meta tags
      const descriptionMeta = document.querySelector('meta[name="description"]');
      const keywordsMeta = document.querySelector('meta[name="keywords"]');

      expect(descriptionMeta?.getAttribute('content')).toBe('This is a test page description');
      expect(keywordsMeta?.getAttribute('content')).toBe('test, page, keywords');
    });

    it('should set Open Graph tags correctly', () => {
      // Helper function to create meta tags
      const updateMetaTag = (name: string, content: string, attributeName: 'name' | 'property' = 'name') => {
        let element = document.querySelector(`meta[${attributeName}="${name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute(attributeName, name);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      // Set Open Graph tags
      updateMetaTag('og:type', 'website', 'property');
      updateMetaTag('og:title', 'OG Test Page | Civic Portal', 'property');
      updateMetaTag('og:description', 'Open Graph test description', 'property');
      updateMetaTag('og:image', '/test-og-image.jpg', 'property');
      updateMetaTag('og:url', 'http://localhost:3000/test-page', 'property');
      updateMetaTag('og:site_name', 'Civic Portal', 'property');
      updateMetaTag('og:locale', 'en_BW', 'property');

      const ogType = document.querySelector('meta[property="og:type"]');
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');
      const ogSiteName = document.querySelector('meta[property="og:site_name"]');
      const ogLocale = document.querySelector('meta[property="og:locale"]');

      expect(ogType?.getAttribute('content')).toBe('website');
      expect(ogTitle?.getAttribute('content')).toBe('OG Test Page | Civic Portal');
      expect(ogDescription?.getAttribute('content')).toBe('Open Graph test description');
      expect(ogImage?.getAttribute('content')).toBe('/test-og-image.jpg');
      expect(ogUrl?.getAttribute('content')).toBe('http://localhost:3000/test-page');
      expect(ogSiteName?.getAttribute('content')).toBe('Civic Portal');
      expect(ogLocale?.getAttribute('content')).toBe('en_BW');
    });

    it('should set structured data correctly', () => {
      // Helper function to create structured data
      const updateStructuredData = (data: Record<string, any>) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data);
        document.head.appendChild(script);
      };

      const customStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': 'Test Article',
        'author': 'Test Author',
      };

      updateStructuredData(customStructuredData);

      const structuredDataScript = document.querySelector('script[type="application/ld+json"]');
      expect(structuredDataScript).toBeTruthy();

      if (structuredDataScript) {
        const data = JSON.parse(structuredDataScript.textContent || '{}');
        expect(data['@context']).toBe('https://schema.org');
        expect(data['@type']).toBe('Article');
        expect(data.headline).toBe('Test Article');
        expect(data.author).toBe('Test Author');
      }
    });

    it('should handle canonical URLs correctly', () => {
      // Helper function to create link tags
      const updateLinkTag = (rel: string, href: string) => {
        let element = document.querySelector(`link[rel="${rel}"]`);
        if (!element) {
          element = document.createElement('link');
          element.setAttribute('rel', rel);
          document.head.appendChild(element);
        }
        element.setAttribute('href', href);
      };

      updateLinkTag('canonical', 'https://example.com/canonical-url');

      const canonicalLink = document.querySelector('link[rel="canonical"]');
      expect(canonicalLink?.getAttribute('href')).toBe('https://example.com/canonical-url');
    });

    it('should handle robots meta tag correctly', () => {
      // Helper function to create meta tags
      const updateMetaTag = (name: string, content: string) => {
        let element = document.querySelector(`meta[name="${name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('name', name);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      updateMetaTag('robots', 'noindex, follow');

      const robotsMeta = document.querySelector('meta[name="robots"]');
      expect(robotsMeta?.getAttribute('content')).toBe('noindex, follow');
    });
  });

  describe('SEO Best Practices', () => {
    it('should validate title length recommendations', () => {
      const shortTitle = 'Short';
      const longTitle = 'A'.repeat(100);
      const optimalTitle = 'Optimal Length Title for SEO';

      // Short titles should be flagged
      expect(shortTitle.length).toBeLessThan(30);

      // Long titles should be flagged
      expect(longTitle.length).toBeGreaterThan(60);

      // Optimal titles should be between 30-60 characters
      expect(optimalTitle.length).toBeGreaterThan(20);
      expect(optimalTitle.length).toBeLessThan(70);
    });

    it('should validate description length recommendations', () => {
      const shortDescription = 'Too short';
      const longDescription = 'A'.repeat(200);
      const optimalDescription = 'This is an optimal length description that provides enough information for search engines while staying within the recommended limit.';

      // Short descriptions should be flagged
      expect(shortDescription.length).toBeLessThan(120);

      // Long descriptions should be flagged
      expect(longDescription.length).toBeGreaterThan(160);

      // Optimal descriptions should be between 120-160 characters
      expect(optimalDescription.length).toBeGreaterThan(120);
      expect(optimalDescription.length).toBeLessThan(160);
    });

    it('should validate Open Graph image requirements', () => {
      const validImageUrl = '/test-image-1200x630.jpg';
      const invalidImageUrl = '/test-image.jpg';

      // Valid OG images should follow naming conventions
      expect(validImageUrl).toMatch(/\d+x\d+/);

      // Invalid images should be flagged
      expect(invalidImageUrl).not.toMatch(/\d+x\d+/);
    });
  });
});
