import { useEffect, useRef } from 'react';

interface HeroSliderProps {
  images: string[];
}

const HeroSlider = ({ images }: HeroSliderProps) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    // Start the continuous scroll animation
    slider.style.animation = 'slideUpContinuous 60s linear infinite';

    return () => {
      if (slider) {
        slider.style.animation = '';
      }
    };
  }, []);

  // Create enough duplicated images for seamless loop
  const duplicatedImages = [...images, ...images, ...images];

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div 
        ref={sliderRef}
        className="flex flex-col"
        style={{
          height: `${duplicatedImages.length * 100}vh`,
        }}
      >
        {duplicatedImages.map((image, index) => (
          <div 
            key={`slider-${index}`} 
            className="relative flex-shrink-0"
            style={{ height: '100vh' }}
          >
            <img 
              src={image} 
              alt={`Jeff Honforloco Portfolio ${(index % images.length) + 1} - Fashion Beauty Photography`} 
              className="w-full h-full object-cover" 
              loading={index < 4 ? "eager" : "lazy"}
              decoding="async"
            />
            <div className="absolute inset-0 bg-black/15"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;