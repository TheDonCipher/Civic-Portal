import React from 'react';
import { getAppInfo } from '@/lib/utils/info';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: Record<string, any>;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

const SEOHead = ({
  title,
  description = 'A platform for citizens to report and track civic issues while engaging with government stakeholders.',
  keywords = 'civic issues, government, citizen engagement, issue tracking, community',
  ogImage = '/og-image.jpg',
  ogUrl,
  canonical,
  noindex = false,
  nofollow = false,
  structuredData,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
}: SEOHeadProps) => {
  const info = getAppInfo();
  const fullTitle = title ? `${title} | ${info.name}` : info.name;
  const currentUrl =
    ogUrl || typeof window !== 'undefined' ? window.location.href : '';

  // Enhanced SEO implementation with comprehensive meta tags
  React.useEffect(() => {
    // Update title
    document.title = fullTitle;

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Robots meta tags
    const robotsContent = [
      noindex ? 'noindex' : 'index',
      nofollow ? 'nofollow' : 'follow',
    ].join(', ');
    updateMetaTag('robots', robotsContent);

    // Canonical URL
    if (canonical) {
      updateLinkTag('canonical', canonical);
    }

    // Author information
    if (author) {
      updateMetaTag('author', author);
    }

    // Article meta tags
    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime, 'property');
    }
    if (modifiedTime) {
      updateMetaTag('article:modified_time', modifiedTime, 'property');
    }
    if (section) {
      updateMetaTag('article:section', section, 'property');
    }
    if (author) {
      updateMetaTag('article:author', author, 'property');
    }

    // Article tags
    tags.forEach((tag, index) => {
      updateMetaTag(`article:tag:${index}`, tag, 'property');
    });

    // Open Graph tags
    updateMetaTag('og:type', section ? 'article' : 'website', 'property');
    updateMetaTag('og:url', currentUrl, 'property');
    updateMetaTag('og:title', fullTitle, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:site_name', info.name, 'property');
    updateMetaTag('og:locale', 'en_BW', 'property'); // Botswana locale

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:url', currentUrl, 'name');
    updateMetaTag('twitter:title', fullTitle, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', ogImage, 'name');
    updateMetaTag('twitter:site', '@CivicPortalBW', 'name');

    // Structured data (JSON-LD)
    if (structuredData) {
      updateStructuredData(structuredData);
    } else {
      // Default structured data for the website
      const defaultStructuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: info.name,
        description: description,
        url: currentUrl,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${currentUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };
      updateStructuredData(defaultStructuredData);
    }

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = info.name;
      // Clean up article tags
      tags.forEach((_, index) => {
        removeMetaTag(`article:tag:${index}`, 'property');
      });
    };
  }, [
    title,
    description,
    keywords,
    ogImage,
    ogUrl,
    canonical,
    noindex,
    nofollow,
    structuredData,
    author,
    publishedTime,
    modifiedTime,
    section,
    tags,
    info.name,
    fullTitle,
    currentUrl,
  ]);

  // Helper function to update meta tags
  function updateMetaTag(
    name: string,
    content: string,
    attributeName: 'name' | 'property' = 'name'
  ) {
    let element = document.querySelector(`meta[${attributeName}="${name}"]`);

    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attributeName, name);
      document.head.appendChild(element);
    }

    element.setAttribute('content', content);
  }

  // Helper function to update link tags
  function updateLinkTag(rel: string, href: string) {
    let element = document.querySelector(`link[rel="${rel}"]`);

    if (!element) {
      element = document.createElement('link');
      element.setAttribute('rel', rel);
      document.head.appendChild(element);
    }

    element.setAttribute('href', href);
  }

  // Helper function to remove meta tags
  function removeMetaTag(
    name: string,
    attributeName: 'name' | 'property' = 'name'
  ) {
    const element = document.querySelector(`meta[${attributeName}="${name}"]`);
    if (element) {
      element.remove();
    }
  }

  // Helper function to update structured data
  function updateStructuredData(data: Record<string, any>) {
    // Remove existing structured data
    const existingScript = document.querySelector(
      'script[type="application/ld+json"]'
    );
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  // This component doesn't render anything visible
  return null;
};

export default SEOHead;
