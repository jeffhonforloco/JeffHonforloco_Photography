
import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import HighResImage from './common/HighResImage';

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
  enable4K?: boolean;
  enable8K?: boolean;
}

const ImageGallery = ({ images, className = "", enable4K = true, enable8K = false }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  // Handle body overflow when lightbox opens/closes
  useEffect(() => {
    if (selectedImage !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  const nextImage = useCallback(() => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  }, [selectedImage, images.length]);

  const prevImage = useCallback(() => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  }, [selectedImage, images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedImage === null) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, nextImage, prevImage]);

  return (
    <>
      <div className={`portfolio-grid ${className}`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="portfolio-item group relative overflow-hidden cursor-pointer animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => openLightbox(index)}
          >
            <HighResImage
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              enable4K={enable4K}
              enable8K={enable8K}
              priority={index < 4} // Prioritize first 4 images
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 border-2 border-white rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Lightbox with High-Res Images */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-sm flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-8 right-8 text-white hover:text-photo-red z-20 transition-colors duration-300 p-2 hover:bg-white/10 rounded-full"
            aria-label="Close lightbox"
          >
            <X size={32} />
          </button>
          
          {/* Navigation buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            className="absolute left-8 top-1/2 -translate-y-1/2 text-white hover:text-photo-red z-20 transition-colors duration-300 p-3 hover:bg-white/10 rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeft size={48} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-white hover:text-photo-red z-20 transition-colors duration-300 p-3 hover:bg-white/10 rounded-full"
            aria-label="Next image"
          >
            <ChevronRight size={48} />
          </button>

          {/* High-resolution image container */}
          <div 
            className="w-full h-full flex items-center justify-center p-8 md:p-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-w-[95vw] max-h-[95vh]">
              <HighResImage
                src={images[selectedImage].src}
                alt={images[selectedImage].alt}
                className="max-w-full max-h-[95vh] object-contain"
                enable4K={enable4K}
                enable8K={enable8K}
                priority={true}
                quality={95}
              />
            </div>
          </div>

          {/* Caption */}
          {images[selectedImage].caption && (
            <div className="absolute bottom-8 left-8 right-8 text-center z-20">
              <p className="text-white font-light text-lg tracking-wide max-w-2xl mx-auto bg-black/50 backdrop-blur-sm px-6 py-3 rounded-lg">
                {images[selectedImage].caption}
              </p>
            </div>
          )}

          {/* Image counter */}
          <div className="absolute top-8 left-8 text-white font-light tracking-wider z-20 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg">
            <span className="text-photo-red font-semibold">{selectedImage + 1}</span> / {images.length}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
