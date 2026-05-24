import { useHeroImages } from '../../../hooks/useHeroImages';

const HeroImageGrid = () => {
  const { col1Images, col2Images, col3Images } = useHeroImages();

  const renderImage = (src: string, index: number, key: string) => (
    <div key={key} className="relative overflow-hidden flex-shrink-0">
      <img
        src={src}
        alt={`Jeff Honforloco Photography — portfolio ${index + 1}`}
        className="hero-image w-full h-auto object-cover"
        loading="eager"
        decoding="async"
        fetchPriority={index < 6 ? 'high' : 'auto'}
        width="400"
        height="600"
      />
    </div>
  );

  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {/* Mobile: 2 columns */}
      <div className="md:hidden grid grid-cols-2 gap-2 h-full px-2">
        <div className="flex flex-col gap-2 hero-col-1">
          {col1Images.map((src, i) => renderImage(src, i, `mob-c1-${i}`))}
        </div>
        <div className="flex flex-col gap-2 hero-col-2">
          {col2Images.map((src, i) => renderImage(src, i, `mob-c2-${i}`))}
        </div>
      </div>

      {/* Desktop: 3 columns */}
      <div className="hidden md:grid grid-cols-3 gap-3 h-full px-3">
        <div className="flex flex-col gap-3 hero-col-1">
          {col1Images.map((src, i) => renderImage(src, i, `dsk-c1-${i}`))}
        </div>
        <div className="flex flex-col gap-3 hero-col-2">
          {col2Images.map((src, i) => renderImage(src, i, `dsk-c2-${i}`))}
        </div>
        <div className="flex flex-col gap-3 hero-col-3">
          {col3Images.map((src, i) => renderImage(src, i, `dsk-c3-${i}`))}
        </div>
      </div>
    </div>
  );
};

export default HeroImageGrid;
