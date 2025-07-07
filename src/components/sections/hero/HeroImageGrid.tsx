import HeroImageColumn from './HeroImageColumn';

interface HeroImageGridProps {
  col1Images: string[];
  col2Images: string[];
  col3Images: string[];
}

const HeroImageGrid = ({ col1Images, col2Images, col3Images }: HeroImageGridProps) => {
  return (
    <div className="absolute inset-0 p-2 md:p-3">
      {/* Mobile: 2 columns */}
      <div className="md:hidden grid grid-cols-2 gap-3 h-full">
        <HeroImageColumn 
          images={col1Images} 
          gap="gap-3" 
          priority={true}
        />
        <HeroImageColumn 
          images={col2Images} 
          gap="gap-3" 
          animationDelay="-20s"
          priority={true}
        />
      </div>

      {/* Desktop: 3 columns */}
      <div className="hidden md:grid grid-cols-3 gap-4 h-full">
        <HeroImageColumn 
          images={col1Images} 
          gap="gap-4" 
          priority={true}
        />
        <HeroImageColumn 
          images={col2Images} 
          gap="gap-4" 
          animationDelay="-27s"
          priority={true}
        />
        <HeroImageColumn 
          images={col3Images} 
          gap="gap-4" 
          animationDelay="-13s"
        />
      </div>
    </div>
  );
};

export default HeroImageGrid;