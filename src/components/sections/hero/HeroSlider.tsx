import { useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

interface HeroSliderProps {
  images: string[];
}

const HeroSlider = ({ images }: HeroSliderProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: 'y',
    loop: true,
    dragFree: true,
    containScroll: false,
  });

  const autoScrollRef = useRef<NodeJS.Timeout>();

  const startAutoScroll = useCallback(() => {
    if (!emblaApi) return;
    
    autoScrollRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);
  }, [emblaApi]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    startAutoScroll();
    
    emblaApi.on('pointerDown', stopAutoScroll);
    emblaApi.on('pointerUp', startAutoScroll);

    return () => {
      stopAutoScroll();
    };
  }, [emblaApi, startAutoScroll, stopAutoScroll]);

  return (
    <div className="absolute inset-0">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex flex-col h-full">
          {[...images, ...images].map((image, index) => (
            <div key={`slider-${index}`} className="flex-[0_0_33.33%] min-h-0 relative">
              <img 
                src={image} 
                alt={`Jeff Honforloco Portfolio ${index + 1} - Fashion Beauty Photography`} 
                className="w-full h-full object-cover" 
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;