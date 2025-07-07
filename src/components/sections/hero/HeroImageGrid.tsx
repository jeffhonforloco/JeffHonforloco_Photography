import HeroImageColumn from './HeroImageColumn';

interface HeroImageGridProps {
  col1Images: string[];
  col2Images: string[];
  col3Images: string[];
}

const HeroImageGrid = ({ col1Images, col2Images, col3Images }: HeroImageGridProps) => {
  return (
    <div className="absolute inset-0 p-1 md:p-2">
      {/* Mobile: 2 columns - Static grid like Lindsay Adler */}
      <div className="md:hidden grid grid-cols-2 gap-1 h-full overflow-hidden">
        <div className="flex flex-col gap-1">
          {col1Images.slice(0, 8).map((image, index) => (
            <div key={`mobile-col1-${index}`} className="relative overflow-hidden aspect-[3/4] flex-shrink-0">
              <img 
                src={image} 
                alt={`Jeff Honforloco Portfolio ${index + 1} - Fashion Beauty Photography`} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                width="400"
                height="533"
              />
              <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-500"></div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col gap-1">
          {col2Images.slice(0, 8).map((image, index) => (
            <div key={`mobile-col2-${index}`} className="relative overflow-hidden aspect-[3/4] flex-shrink-0">
              <img 
                src={image} 
                alt={`Jeff Honforloco Portfolio ${index + 1} - Fashion Beauty Photography`} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                width="400"
                height="533"
              />
              <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: 3 columns - Optimized mosaic grid */}
      <div className="hidden md:grid grid-cols-3 gap-2 h-full overflow-hidden">
        <div className="flex flex-col gap-2">
          {col1Images.slice(0, 6).map((image, index) => (
            <div key={`desktop-col1-${index}`} className={`relative overflow-hidden flex-shrink-0 ${index % 3 === 0 ? 'aspect-[3/5]' : index % 3 === 1 ? 'aspect-[3/4]' : 'aspect-[3/3]'}`}>
              <img 
                src={image} 
                alt={`Jeff Honforloco Portfolio ${index + 1} - Fashion Beauty Photography`} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
                width="400"
                height="600"
              />
              <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-500"></div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col gap-2">
          {col2Images.slice(0, 6).map((image, index) => (
            <div key={`desktop-col2-${index}`} className={`relative overflow-hidden flex-shrink-0 ${index % 3 === 0 ? 'aspect-[3/4]' : index % 3 === 1 ? 'aspect-[3/5]' : 'aspect-[3/3]'}`}>
              <img 
                src={image} 
                alt={`Jeff Honforloco Portfolio ${index + 1} - Fashion Beauty Photography`} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
                width="400"
                height="600"
              />
              <div className="absolute inset-0 bg-black/15 hover:bg-black/25 transition-all duration-500"></div>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col gap-2">
          {col3Images.slice(0, 6).map((image, index) => (
            <div key={`desktop-col3-${index}`} className={`relative overflow-hidden flex-shrink-0 ${index % 3 === 0 ? 'aspect-[3/3]' : index % 3 === 1 ? 'aspect-[3/4]' : 'aspect-[3/5]'}`}>
              <img 
                src={image} 
                alt={`Jeff Honforloco Portfolio ${index + 1} - Fashion Beauty Photography`} 
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
                width="400"
                height="600"
              />
              <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroImageGrid;