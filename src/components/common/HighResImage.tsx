import React, { useState, useRef, useEffect, useMemo } from 'react';
import { generateOptimizedUrl } from '@/utils/imageOptimization';

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

const BASE_BREAKPOINTS = [400, 800, 1200, 1600, 1920];
const BREAKPOINTS_4K = [...BASE_BREAKPOINTS, 2560, 3840];

const HighResImage: React.FC<HighResImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 80,
  priority = false,
  sizes,
  style,
  onLoad,
  onError,
  enable4K = false,
  enable8K = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(
    () => priority || typeof IntersectionObserver === 'undefined'
  );
  const imgRef = useRef<HTMLImageElement>(null);

  // Priority images: compute src synchronously — skip IntersectionObserver
  const prioritySrc = useMemo(
    () => (priority ? generateOptimizedUrl(src, width, quality) : null),
    [priority, src, width, quality]
  );

  useEffect(() => {
    if (priority || typeof IntersectionObserver === 'undefined') return;

    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01, rootMargin: '400px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [priority]);

  const breakpoints = enable4K || enable8K ? BREAKPOINTS_4K : BASE_BREAKPOINTS;

  const buildSrcSet = (baseSrc: string): string =>
    breakpoints
      .map(size => `${generateOptimizedUrl(baseSrc, size, quality)} ${size}w`)
      .join(', ');

  const sizesAttr =
    sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  const activeSrc = prioritySrc ?? (isInView ? generateOptimizedUrl(src, width, quality) : undefined);
  const activeSrcSet = isInView ? buildSrcSet(src) : undefined;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        containIntrinsicSize: width && height ? `${width}px ${height}px` : '400px 500px',
        ...style,
      }}
    >
      {/* Skeleton shown until image loads */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black animate-pulse" />
      )}

      <picture>
        {/* AVIF — best compression, picked by modern browsers first */}
        {activeSrcSet && (
          <source
            srcSet={activeSrcSet.replace(/f=webp/g, 'f=avif')}
            sizes={sizesAttr}
            type="image/avif"
          />
        )}
        {/* WebP fallback */}
        {activeSrcSet && (
          <source
            srcSet={activeSrcSet}
            sizes={sizesAttr}
            type="image/webp"
          />
        )}

        <img
          ref={imgRef}
          src={activeSrc}
          srcSet={activeSrcSet}
          sizes={activeSrcSet ? sizesAttr : undefined}
          alt={alt}
          width={width}
          height={height}
          className={`relative w-full h-full object-cover transition-opacity duration-700 ease-out ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => { setIsLoaded(true); onLoad?.(); }}
          onError={() => { setHasError(true); onError?.(); }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
        />
      </picture>

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <span className="text-gray-500 text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default HighResImage;
