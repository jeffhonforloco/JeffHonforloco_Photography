import { useHeroImages } from '../../../hooks/useHeroImages';

const HeroImageGrid = () => {
  const { col1Images, col2Images, col3Images } = useHeroImages();

  const renderImage = (image: string, index: number, columnPrefix: string) => {
    return (
      <div 
        key={`${columnPrefix}-${index}`} 
        className="relative overflow-hidden flex-shrink-0 hero-image-container"
      >
        <img 
          src={image}
          alt={`Portfolio ${index + 1}`} 
          className="hero-image w-full h-auto object-cover"
          loading={index < 6 ? "eager" : "lazy"}
          decoding="async"
          width="400"
          height="600"
          style={{
            contentVisibility: 'auto',
            containIntrinsicSize: '400px 600px'
          }}
        />
      </div>
    );
  };

  return (
    <div className="absolute inset-0 p-2 md:p-3">
      {/* Mobile: 2 columns */}
      <div className="md:hidden grid grid-cols-2 gap-3 h-full">
        <div className="flex flex-col gap-3 animate-slide-optimized">
          {col1Images.map((image, index) => 
            renderImage(image, index, 'mobile-col1')
          )}
        </div>
        
        <div className="flex flex-col gap-3 animate-slide-optimized" style={{ animationDelay: '-13s' }}>
          {col2Images.map((image, index) => 
            renderImage(image, index, 'mobile-col2')
          )}
        </div>
      </div>

      {/* Desktop: 3 columns */}
      <div className="hidden md:grid grid-cols-3 gap-4 h-full">
        <div className="flex flex-col gap-4 animate-slide-optimized">
          {col1Images.map((image, index) => 
            renderImage(image, index, 'desktop-col1')
          )}
        </div>
        
        <div className="flex flex-col gap-4 animate-slide-optimized" style={{ animationDelay: '-13s' }}>
          {col2Images.map((image, index) => 
            renderImage(image, index, 'desktop-col2')
          )}
        </div>
        
        <div className="flex flex-col gap-4 animate-slide-optimized" style={{ animationDelay: '-27s' }}>
          {col3Images.map((image, index) => 
            renderImage(image, index, 'desktop-col3')
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroImageGrid;