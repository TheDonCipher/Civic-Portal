/**
 * @fileoverview Optimized Image Component
 * @description Provides lazy loading, WebP support, and performance optimization for images
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  placeholder?: string;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

/**
 * Optimized image component with lazy loading and WebP support
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  placeholder,
  quality = 75,
  priority = false,
  onLoad,
  onError,
  sizes,
  objectFit = 'cover',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Generate optimized image URLs
  const generateImageUrls = useCallback((originalSrc: string) => {
    // For external images or if no optimization service is available
    if (originalSrc.startsWith('http') || originalSrc.startsWith('data:')) {
      return {
        webp: originalSrc,
        fallback: originalSrc,
      };
    }

    // For local images, you could integrate with an image optimization service
    // For now, return the original src
    return {
      webp: originalSrc,
      fallback: originalSrc,
    };
  }, []);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image enters viewport
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isInView]);

  // Load image when in view
  useEffect(() => {
    if (!isInView) return;

    const { webp, fallback } = generateImageUrls(src);
    
    // Try to load WebP first, fallback to original format
    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(img.src);
      setIsLoaded(true);
      onLoad?.();
    };
    
    img.onerror = () => {
      // If WebP fails and we haven't tried the fallback yet
      if (img.src === webp && webp !== fallback) {
        img.src = fallback;
      } else {
        setIsError(true);
        onError?.();
      }
    };

    // Check WebP support
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    img.src = supportsWebP ? webp : fallback;
  }, [isInView, src, generateImageUrls, onLoad, onError]);

  // Generate responsive sizes if not provided
  const responsiveSizes = sizes || (width ? `${width}px` : '100vw');

  // Placeholder component
  const PlaceholderComponent = () => (
    <div
      className={cn(
        'bg-gray-200 animate-pulse flex items-center justify-center',
        className
      )}
      style={{
        width: width || '100%',
        height: height || 'auto',
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    >
      {placeholder ? (
        <span className="text-gray-400 text-sm">{placeholder}</span>
      ) : (
        <svg
          className="w-8 h-8 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </div>
  );

  // Error component
  const ErrorComponent = () => (
    <div
      className={cn(
        'bg-red-50 border border-red-200 flex items-center justify-center',
        className
      )}
      style={{
        width: width || '100%',
        height: height || 'auto',
        aspectRatio: width && height ? `${width}/${height}` : undefined,
      }}
    >
      <div className="text-center p-4">
        <svg
          className="w-8 h-8 text-red-400 mx-auto mb-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-red-600 text-sm">Failed to load image</span>
      </div>
    </div>
  );

  if (isError) {
    return <ErrorComponent />;
  }

  if (!isInView || !isLoaded) {
    return (
      <div ref={imgRef}>
        <PlaceholderComponent />
      </div>
    );
  }

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      sizes={responsiveSizes}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        objectFit,
      }}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
    />
  );
};

/**
 * Hook for preloading images
 */
export const useImagePreloader = () => {
  const preloadedImages = useRef<Set<string>>(new Set());

  const preloadImage = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (preloadedImages.current.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        preloadedImages.current.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const preloadImages = useCallback((sources: string[]): Promise<void[]> => {
    return Promise.all(sources.map(preloadImage));
  }, [preloadImage]);

  return { preloadImage, preloadImages };
};

export default OptimizedImage;
