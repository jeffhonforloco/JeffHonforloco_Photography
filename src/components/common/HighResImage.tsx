import React, { useState, useRef, useEffect } from 'react';
import { generateOptimizedUrl, generateSrcSet } from '@/utils/imageOptimization';

interface HighResImageProps {
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
  enable4K?: boolean;
  enable8K?: boolean;
}

/**
 * High-resolution image component with 4K/8K support
 * Features:
 * - Progressive loading with blur-up effect
 * - Responsive srcset with high-resolution options
 * - WebP/AVIF format support
 * - Lazy loading with intersection observer
 * - Smooth fade-in animation
 */
const HighResImage: React.FC<HighResImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 90,
  priority = false,
  sizes,
  style,
  onLoad,
  onError,
  enable4K = true,
  enable8K = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate high-resolution srcset
  const generateHighResSrcSet = (baseSrc: string): string => {
    const breakpoints = [320, 640, 768, 1024, 1280, 1536, 1920];
    
    // Add 4K breakpoints (3840px)
    if (enable4K) {
      breakpoints.push(2560, 3840);
    }
    
    // Add 8K breakpoints (7680px)
    if (enable8K) {
      breakpoints.push(5120, 7680);
    }

    return breakpoints
      .map(size => {
        const optimizedUrl = generateOptimizedUrl(baseSrc, size, quality);
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');
  };

  // Generate sizes attribute for responsive images
  const generateSizes = (): string => {
    if (sizes) return sizes;
    
    // Default responsive sizes with high-res support
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1920px) 33vw, (max-width: 3840px) 25vw, 20vw';
  };

  useEffect(() => {
    const imgElement = imgRef.current;
    if (!imgElement) return;

    // For priority images, load immediately
    if (priority) {
      const optimizedSrc = generateOptimizedUrl(src, width, quality);
      setCurrentSrc(optimizedSrc);
      return;
    }

    // Lazy load with intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const optimizedSrc = generateOptimizedUrl(src, width, quality);
            setCurrentSrc(optimizedSrc);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.01,
        rootMargin: '100px' // Start loading before image enters viewport
      }
    );

    observer.observe(imgElement);

    return () => {
      observer.disconnect();
    };
  }, [src, width, quality, priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  // Generate low-quality placeholder (blur-up technique)
  const placeholderSrc = generateOptimizedUrl(src, 20, 20);

  const srcSet = generateHighResSrcSet(src);
  const sizesAttr = generateSizes();
  const optimizedSrc = currentSrc || generateOptimizedUrl(src, width, quality);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={style}
    >
      {/* Low-quality placeholder for blur-up effect */}
      {!isLoaded && !hasError && (
        <img
          src={placeholderSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-50"
          aria-hidden="true"
          loading="eager"
        />
      )}

      {/* Main high-resolution image */}
      <picture>
        {/* AVIF source (best compression) */}
        <source
          srcSet={srcSet.replace(/f=webp/g, 'f=avif')}
          sizes={sizesAttr}
          type="image/avif"
        />
        
        {/* WebP source */}
        <source
          srcSet={srcSet}
          sizes={sizesAttr}
          type="image/webp"
        />
        
        {/* Fallback image */}
        <img
          ref={imgRef}
          src={optimizedSrc}
          srcSet={srcSet}
          sizes={sizesAttr}
          alt={alt}
          width={width}
          height={height}
          className={`
            relative w-full h-full object-cover
            transition-opacity duration-700 ease-out
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
            ${hasError ? 'opacity-0' : ''}
          `}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          {...props}
        />
      </picture>

      {/* Loading skeleton */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black animate-pulse" />
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-gray-500 text-sm">Failed to load image</div>
        </div>
      )}
    </div>
  );
};

export default HighResImage;
