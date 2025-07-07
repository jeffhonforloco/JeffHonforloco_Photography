import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSliderProps {
  images: string[];
}

const HeroSlider = ({ images }: HeroSliderProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true,
    startIndex: 0 
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    
    // Auto-advance slides
    const autoPlay = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => {
      clearInterval(autoPlay);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative w-full h-full">
      {/* Main Slider */}
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {images.slice(0, 6).map((image, index) => (
            <div key={index} className="flex-[0_0_100%] h-full relative">
              <img
                src={image}
                alt={`Jeff Honforloco Portfolio ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Previous image"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Next image"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {images.slice(0, 6).map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex 
                ? 'bg-white' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;