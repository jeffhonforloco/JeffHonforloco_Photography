import React, { useEffect, useRef, useCallback } from 'react';
import { generateOptimizedUrl, generateSrcSet, generateSizes } from '../utils/imageOptimization';

interface ImageOptimizerProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageOptimizer: React.FC<ImageOptimizerProps> = ({
  src,
  alt,
  className,
  width,
  height,
  quality = 75,
  priority = false,
  sizes,
  style,
  onLoad,
  onError,
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement>(null);

  const loadOptimizedImage = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const optimizedSrc = generateOptimizedUrl(src, width, quality);
    const srcSet = generateSrcSet(src, quality);
    const sizesAttr = sizes || generateSizes();

    // Create picture element for WebP support
    const picture = document.createElement('picture');

    // WebP source
    const webpSource = document.createElement('source');
    webpSource.srcSet = srcSet;
    webpSource.sizes = sizesAttr;
    webpSource.type = 'image/webp';
    picture.appendChild(webpSource);

    // Fallback image
    const fallbackImg = document.createElement('img');
    fallbackImg.src = optimizedSrc;
    fallbackImg.srcSet = srcSet;
    fallbackImg.sizes = sizesAttr;
    fallbackImg.alt = alt;
    fallbackImg.className = className || '';
    fallbackImg.style.cssText = img.style.cssText;
    fallbackImg.onload = onLoad;
    fallbackImg.onerror = onError;

    // Copy all props
    Object.keys(props).forEach(key => {
      if (key in fallbackImg) {
        (fallbackImg as Record<string, unknown>)[key] = (props as Record<string, unknown>)[key];
      }
    });

    picture.appendChild(fallbackImg);

    // Replace the original img with optimized version
    if (img.parentNode) {
      img.parentNode.replaceChild(picture, img);
    }
  }, [src, width, quality, sizes, alt, className, onLoad, onError, props]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Set up intersection observer for lazy loading
    if (!priority) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            loadOptimizedImage();
            observer.disconnect();
          }
        },
        { rootMargin: '50px' }
      );

      observer.observe(img);
      return () => observer.disconnect();
    } else {
      // Load immediately for priority images
      loadOptimizedImage();
    }
  }, [priority, loadOptimizedImage]);

  return (
    <img
      ref={imgRef}
      src={priority ? generateOptimizedUrl(src, width, quality) : ''}
      alt={alt}
      className={className}
      width={width}
      height={height}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      {...props}
    />
  );
};

export default ImageOptimizer;
