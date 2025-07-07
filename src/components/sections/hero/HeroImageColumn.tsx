interface HeroImageColumnProps {
  images: string[];
  animationDelay?: string;
  gap: string;
  priority?: boolean;
}

const HeroImageColumn = ({ images, animationDelay = '0s', gap, priority = false }: HeroImageColumnProps) => {
  return (
    <div 
      className={`flex flex-col ${gap} animate-slide-seamless`}
      style={{ animationDelay }}
    >
      {images.map((image, index) => (
        <div key={`col-${index}`} className="relative overflow-hidden flex-shrink-0">
          <img 
            src={image} 
            alt={`Jeff Honforloco Portfolio ${index + 1} - Fashion Beauty Photography`} 
            className="w-full h-auto object-cover" 
            loading={priority && index < 3 ? "eager" : "lazy"}
            decoding="async"
            width="400"
            height="600"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      ))}
    </div>
  );
};

export default HeroImageColumn;