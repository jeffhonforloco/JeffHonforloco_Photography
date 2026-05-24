import { useHeroImages } from '../../../hooks/useHeroImages';
import LazyImage from '../../common/LazyImage';

const HeroImageGrid = () => {
  const { col1Images, col2Images, col3Images } = useHeroImages();

  const renderImage = (image: string, index: number, columnPrefix: string) => (
    <div
      key={`${columnPrefix}-${index}`}
      className="relative overflow-hidden flex-shrink-0 hero-image-container"
    >
      <LazyImage
        src={image}
        alt={`Jeff Honforloco Photography — portfolio image ${index + 1}`}
        className="hero-image w-full h-auto object-cover"
        fetchPriority={index < 4 ? 'high' : 'low'}
        width="400"
        height="600"
        sizes="(max-width: 768px) 50vw, 33vw"
      />
    </div>
  );

  return (
    <div className="absolute inset-0 hero-grid-wrapper">
      {/* Gradient mask: fades top and bottom to black for editorial edge */}
      <div className="hero-grid-mask">
        {/* Mobile: 2 columns */}
        <div className="md:hidden grid grid-cols-2 gap-2 h-full px-2 pt-2">
          <div className="flex flex-col gap-2 hero-col-1">
            {col1Images.map((img, i) => renderImage(img, i, 'mob-c1'))}
          </div>
          <div className="flex flex-col gap-2 hero-col-2">
            {col2Images.map((img, i) => renderImage(img, i, 'mob-c2'))}
          </div>
        </div>

        {/* Desktop: 3 columns */}
        <div className="hidden md:grid grid-cols-3 gap-3 h-full px-3 pt-3">
          <div className="flex flex-col gap-3 hero-col-1">
            {col1Images.map((img, i) => renderImage(img, i, 'dsk-c1'))}
          </div>
          <div className="flex flex-col gap-3 hero-col-2">
            {col2Images.map((img, i) => renderImage(img, i, 'dsk-c2'))}
          </div>
          <div className="flex flex-col gap-3 hero-col-3">
            {col3Images.map((img, i) => renderImage(img, i, 'dsk-c3'))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroImageGrid;
