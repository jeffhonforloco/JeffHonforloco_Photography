import { useEffect, useRef } from 'react';
import { optimizedHeroImages, type HeroImage } from '../../../data/hero-images';

const TRANSPARENT_PIXEL = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

const HeroImageGrid = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const pendingImages = Array.from(grid.querySelectorAll<HTMLImageElement>('img[data-hero-src]'));
    const loadImage = (image: HTMLImageElement) => {
      const source = image.dataset.heroSrc;
      const pictureSource = image.parentElement?.querySelector('source');
      const sourceSet = pictureSource?.dataset.heroSrcset;

      if (pictureSource && sourceSet) pictureSource.srcset = sourceSet;
      if (source) image.src = source;
      delete image.dataset.heroSrc;
      if (pictureSource) delete pictureSource.dataset.heroSrcset;
    };

    if (!('IntersectionObserver' in window)) {
      pendingImages.forEach(loadImage);
      return;
    }

    // Native lazy loading uses a very large look-ahead window. On an animated
    // gallery that caused dozens of off-screen photographs to download during
    // the initial mobile audit. Observe the actual hero viewport instead so
    // images arrive shortly before they scroll into view.
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadImage(entry.target as HTMLImageElement);
          observer.unobserve(entry.target);
        });
      },
      { root: grid, rootMargin: '600px 0px' },
    );

    pendingImages.forEach((image) => observer.observe(image));
    return () => observer.disconnect();
  }, []);

  const renderImage = (
    image: HeroImage,
    key: string,
    media: string,
    responsiveSrcSet: string,
    isInitiallyVisible: boolean,
  ) => (
    <div key={key} className="relative aspect-[4/5] overflow-hidden bg-photo-gray-900 flex-shrink-0">
      <picture>
        <source
          media={media}
          srcSet={isInitiallyVisible ? responsiveSrcSet : undefined}
          data-hero-srcset={responsiveSrcSet}
          sizes={media.includes('max-width') ? '50vw' : '33vw'}
        />
        <img
          src={TRANSPARENT_PIXEL}
          data-hero-src={image.src}
          alt=""
          aria-hidden="true"
          className="hero-image absolute inset-0 h-full w-full object-cover"
          loading={isInitiallyVisible ? 'eager' : 'lazy'}
          decoding="async"
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
              );
            })}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/15" aria-hidden="true" />
    </div>
  );
};

export default HeroImageGrid;
