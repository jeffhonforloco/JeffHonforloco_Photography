
import { useState } from 'react';

interface ImageGalleryProps {
  images: Array<{
    src: string;
    alt: string;
    caption?: string;
  }>;
  className?: string;
}

const ImageGallery = ({ images, className = "" }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedImage(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1);
    }
  };

  return (
    <>
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {images.map((image, index) => (
          <div
            key={index}
            className="group cursor-pointer overflow-hidden bg-gray-900 aspect-[4/5]"
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white text-3xl hover:text-photo-red z-10"
          >
            ×
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-photo-red z-10"
          >
            ‹
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-white text-3xl hover:text-photo-red z-10"
          >
            ›
          </button>

          <div className="w-full h-full flex items-center justify-center p-8">
            <img
              src={images[selectedImage].src}
              alt={images[selectedImage].alt}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {images[selectedImage].caption && (
            <div className="absolute bottom-6 left-6 right-6 text-center text-white">
              <p className="text-lg">{images[selectedImage].caption}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery;
