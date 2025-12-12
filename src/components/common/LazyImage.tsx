import React, { useState, useRef, useEffect } from 'react';
import { generateOptimizedUrl, generateSrcSet } from '@/utils/imageOptimization';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  style?: React.CSSProperties;
  width?: string;
  height?: string;
  sizes?: string;
  fetchPriority?: "high" | "low" | "auto";
  enable4K?: boolean;
  quality?: number;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDQwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgo8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMWExYTFhO3N0b3Atb3BhY2l0eToxIiAvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMyZDJkMmQ7c3RvcC1vcGFjaXR5OjEiIC8+CjwvbGluZWFyR3JhZGllbnQ+CjwvZGVmcz4KPHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9InVybCgjZykiLz4KPHN2Zz4K',
  onLoad,
  onError,
  style,
  width,
  height,
  sizes,
  fetchPriority,
  enable4K = true,
  quality = 85
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const imgElement = imgRef.current;
    
    // For high priority images, load immediately
    if (fetchPriority === "high") {
      const optimizedSrc = generateOptimizedUrl(src, undefined, quality);
      setImageSrc(optimizedSrc);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const optimizedSrc = generateOptimizedUrl(src, undefined, quality);
            setImageSrc(optimizedSrc);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // Start loading earlier for smoother experience
      }
    );

    if (imgElement) {
      observer.observe(imgElement);
    }

    return () => {
      if (imgElement) {
        observer.unobserve(imgElement);
      }
    };
  }, [src, fetchPriority, quality]);

  const handleLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setHasError(true);
    if (onError) onError();
  };

  // Generate responsive srcset for high-res support
  const srcSet = generateSrcSet(src, quality, enable4K, false);
  const sizesAttr = sizes || '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  return (
    <picture>
      {/* WebP source for better compression */}
      <source srcSet={srcSet} sizes={sizesAttr} type="image/webp" />
      
      {/* Fallback image */}
      <img
        ref={imgRef}
        src={imageSrc}
        srcSet={srcSet}
        sizes={sizesAttr}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-70'} transition-opacity duration-700 ease-out`}
        style={{
          ...style,
          contentVisibility: 'auto',
          containIntrinsicSize: '400px 600px'
        }}
        onLoad={handleLoad}
        onError={handleError}
        loading={fetchPriority === "high" ? "eager" : "lazy"}
        decoding="async"
        width={width}
        height={height}
        {...(fetchPriority && { fetchpriority: fetchPriority })}
      />
    </picture>
  );
};

export default LazyImage;