import { useEffect, useRef, useState } from 'react';
import HeroImageColumn from './HeroImageColumn';

interface HeroImageGridProps {
  col1Images: string[];
  col2Images: string[];
  col3Images: string[];
}

const HeroImageGrid = ({ col1Images, col2Images, col3Images }: HeroImageGridProps) => {
  const [direction, setDirection] = useState<'up' | 'down'>('up');
  const mobileCol1Ref = useRef<HTMLDivElement>(null);
  const mobileCol2Ref = useRef<HTMLDivElement>(null);
  const desktopCol1Ref = useRef<HTMLDivElement>(null);
  const desktopCol2Ref = useRef<HTMLDivElement>(null);
  const desktopCol3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mobileRefs = [mobileCol1Ref, mobileCol2Ref];
    const desktopRefs = [desktopCol1Ref, desktopCol2Ref, desktopCol3Ref];
    let animationId: number;
    let currentPosition = 0;
    const speed = 0.4; // pixels per frame
    
    const animate = () => {
      if (direction === 'up') {
        currentPosition += speed;
        if (currentPosition >= 200) { // Adjust based on your content height
          setDirection('down');
        }
      } else {
        currentPosition -= speed;
        if (currentPosition <= 0) {
          setDirection('up');
        }
      }

      // Apply transform to mobile columns
      mobileRefs.forEach((ref, index) => {
        if (ref.current) {
          const offset = index * 50; // Stagger the animation
          ref.current.style.transform = `translateY(-${(currentPosition + offset) % 400}px)`;
        }
      });

      // Apply transform to desktop columns
      desktopRefs.forEach((ref, index) => {
        if (ref.current) {
          const offset = index * 30; // Stagger the animation
          ref.current.style.transform = `translateY(-${(currentPosition + offset) % 300}px)`;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [direction]);

  return (
    <div className="absolute inset-0 p-1 md:p-2">
      {/* Mobile: 2 columns - Static grid like Lindsay Adler with sliding */}
      <div className="md:hidden grid grid-cols-2 gap-1 h-full overflow-hidden">
        <div className="overflow-hidden">
          <div ref={mobileCol1Ref} className="flex flex-col gap-1" style={{ willChange: 'transform' }}>
            {[...col1Images, ...col1Images].map((image, index) => (
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
        </div>
        
        <div className="overflow-hidden">
          <div ref={mobileCol2Ref} className="flex flex-col gap-1" style={{ willChange: 'transform' }}>
            {[...col2Images, ...col2Images].map((image, index) => (
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
      </div>

      {/* Desktop: 3 columns - Optimized mosaic grid with sliding */}
      <div className="hidden md:grid grid-cols-3 gap-2 h-full overflow-hidden">
        <div className="overflow-hidden">
          <div ref={desktopCol1Ref} className="flex flex-col gap-2" style={{ willChange: 'transform' }}>
            {[...col1Images, ...col1Images].map((image, index) => (
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
        </div>
        
        <div className="overflow-hidden">
          <div ref={desktopCol2Ref} className="flex flex-col gap-2" style={{ willChange: 'transform' }}>
            {[...col2Images, ...col2Images].map((image, index) => (
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
        </div>
        
        <div className="overflow-hidden">
          <div ref={desktopCol3Ref} className="flex flex-col gap-2" style={{ willChange: 'transform' }}>
            {[...col3Images, ...col3Images].map((image, index) => (
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
    </div>
  );
};

export default HeroImageGrid;