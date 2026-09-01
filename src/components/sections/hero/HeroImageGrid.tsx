import { optimizedHeroImages, type HeroImage } from '../../../data/hero-images';

const HeroImageGrid = () => {
  const renderImage = (image: HeroImage, key: string, isPriority = false) => (
    <div key={key} className="relative aspect-[4/5] overflow-hidden bg-photo-gray-900 flex-shrink-0">
      <picture>
        <source
          media="(max-width: 767px)"
          srcSet={image.srcSet.split(',').slice(0, 2).join(',')}
          sizes="50vw"
        />
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes="(max-width: 767px) 50vw, 33vw"
          alt=""
          aria-hidden="true"
          className="hero-image absolute inset-0 h-full w-full object-cover"
          loading={isPriority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={isPriority ? 'high' : 'low'}
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
    <div className="absolute inset-0 bg-black overflow-hidden">
      <div className="md:hidden grid grid-cols-2 gap-2 h-full px-2">
        {mobileImages.map((images, columnIndex) => (
          <div key={`mobile-column-${columnIndex}`} className={`flex flex-col gap-2 hero-col-${columnIndex + 1}`}>
            {images.map((image, index) => renderImage(image, `mobile-${columnIndex}-${index}`, index === 0))}
          </div>
        ))}
      </div>

      <div className="hidden md:grid grid-cols-3 gap-3 h-full px-3">
        {[0, 1, 2].map((columnIndex) => (
          <div key={`desktop-column-${columnIndex}`} className={`flex flex-col gap-3 hero-col-${columnIndex + 1}`}>
            {createColumn(columnIndex).map((image, index) => renderImage(image, `desktop-${columnIndex}-${index}`, index === 0))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/15" aria-hidden="true" />
    </div>
  );
};

export default HeroImageGrid;
