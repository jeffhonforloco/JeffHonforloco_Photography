import { optimizedHeroImages } from '../../../data/hero-images';

const HeroImageGrid = () => {
  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 px-2 md:px-3 -translate-y-12 md:-translate-y-36">
        {optimizedHeroImages.map((image, index) => {
          const isPriority = index === 3;
          return (
            <div
              key={image.src}
              className="relative aspect-[4/5] overflow-hidden bg-photo-gray-900"
            >
              <picture>
                <source
                  media="(max-width: 767px)"
                  srcSet={image.srcSet.split(',')[0].trim()}
                />
                <img
                  src={image.src}
                  srcSet={image.srcSet}
                  sizes="33vw"
                  alt={image.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={isPriority ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority="auto"
                  width="480"
                  height="600"
                />
              </picture>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/15" aria-hidden="true" />
    </div>
  );
};

export default HeroImageGrid;
