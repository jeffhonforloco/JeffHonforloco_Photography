import { useEffect, useRef } from 'react';
import { optimizedHeroImages, type HeroImage } from '../../../data/hero-images';

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

const HeroImageGrid = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const pendingImages = new Set(grid.querySelectorAll<HTMLImageElement>('img[data-hero-src]'));
    const loadImage = (image: HTMLImageElement) => {
      const source = image.dataset.heroSrc;
      const pictureSource = image.parentElement?.querySelector('source');
      const sourceSet = pictureSource?.dataset.heroSrcset;

      if (pictureSource && sourceSet) pictureSource.srcset = sourceSet;
      if (source) image.src = source;
      delete image.dataset.heroSrc;
      if (pictureSource) delete pictureSource.dataset.heroSrcset;
      pendingImages.delete(image);
    };

    // IntersectionObserver does not consistently emit new entries when only a
    // parent transform moves the columns. Sample the pending tiles in one read
    // batch instead, then update their sources in a separate write batch.
    const loadUpcomingImages = () => {
      if (document.hidden) return;

      const preloadMargin = Math.max(240, window.innerHeight * 0.75);
      const upcoming: HTMLImageElement[] = [];

      pendingImages.forEach((image) => {
        const rect = image.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        if (rect.bottom >= -preloadMargin && rect.top <= window.innerHeight + preloadMargin) {
          upcoming.push(image);
        }
      });

      upcoming.forEach(loadImage);
    };

    // The server-rendered initial ranges cover the viewport plus several
    // upcoming tiles. Let those priority decisions settle before sampling the
    // animated columns; an immediate full-grid layout read competes with LCP.
    let interval: number | undefined;
    const samplingDelay = window.setTimeout(() => {
      loadUpcomingImages();
      interval = window.setInterval(loadUpcomingImages, 1500);
    }, 4000);
    window.addEventListener('resize', loadUpcomingImages, { passive: true });
    document.addEventListener('visibilitychange', loadUpcomingImages);

    return () => {
      window.clearTimeout(samplingDelay);
      if (interval !== undefined) window.clearInterval(interval);
      window.removeEventListener('resize', loadUpcomingImages);
      document.removeEventListener('visibilitychange', loadUpcomingImages);
    };
  }, []);

  const renderImage = (
    image: HeroImage,
    key: string,
    media: string,
    responsiveSrcSet: string,
    isInitiallyVisible: boolean,
    isPriority: boolean,
  ) => (
    <div
      key={key}
      className="relative aspect-[4/5] overflow-hidden bg-photo-gray-900 flex-shrink-0 ring-1 ring-inset ring-white/10 shadow-[0_18px_44px_rgba(0,0,0,0.32)]"
    >
      <picture>
        <source
          media={media}
          srcSet={isInitiallyVisible ? responsiveSrcSet : undefined}
          data-hero-srcset={responsiveSrcSet}
          sizes={media.includes('max-width') ? '50vw' : '33vw'}
        />
        <img
          src={isInitiallyVisible ? image.src : TRANSPARENT_PIXEL}
          data-hero-src={isInitiallyVisible ? undefined : image.src}
          alt=""
          aria-hidden="true"
          className="hero-image absolute inset-0 h-full w-full object-cover scale-[1.01]"
          loading={isPriority ? 'eager' : 'lazy'}
          decoding="async"
          {...{ fetchpriority: isPriority ? 'high' : 'low' }}
          width="480"
          height="600"
        />
      </picture>
    </div>
  );

  const createColumn = (columnIndex: number) => {
    const images = optimizedHeroImages.filter((_, index) => index % 3 === columnIndex);
    return [...images, ...images];
  };

  const mobileImages = [
    optimizedHeroImages.filter((_, index) => index % 2 === 0),
    optimizedHeroImages.filter((_, index) => index % 2 === 1),
  ].map((images) => [...images, ...images]);

  return (
    <div ref={gridRef} className="absolute inset-0 bg-black overflow-hidden">
      <div className="md:hidden grid grid-cols-2 gap-2 h-full px-2">
        {mobileImages.map((images, columnIndex) => (
          <div key={`mobile-column-${columnIndex}`} className={`flex flex-col gap-2 hero-col-${columnIndex + 1}`}>
            {images.map((image, index) => {
              const isInitiallyVisible = columnIndex === 0
                ? index <= 5
                : index >= 4 && index <= 10;
              return renderImage(
                image,
                `mobile-${columnIndex}-${index}`,
                '(max-width: 767px)',
                image.mobileSrcSet,
                isInitiallyVisible,
                columnIndex === 0 && index === 0,
              );
            })}
          </div>
        ))}
      </div>

      <div className="hidden md:grid grid-cols-3 gap-3 h-full px-3">
        {[0, 1, 2].map((columnIndex) => (
          <div key={`desktop-column-${columnIndex}`} className={`flex flex-col gap-3 hero-col-${columnIndex + 1}`}>
            {createColumn(columnIndex).map((image, index) => {
              const initialRanges = [[0, 4], [2, 7], [5, 10]];
              const [start, end] = initialRanges[columnIndex];
              return renderImage(
                image,
                `desktop-${columnIndex}-${index}`,
                '(min-width: 768px)',
                image.srcSet,
                index >= start && index <= end,
                columnIndex === 0 && index === 1,
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroImageGrid;
