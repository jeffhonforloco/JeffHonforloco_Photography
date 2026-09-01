
const FeaturedWork = () => {
  const featuredWork = [
    {
      image: '/images/optimized/IMG_7671-480.webp?v=20260901',
      srcSet: '/images/optimized/IMG_7671-480.webp?v=20260901 480w, /images/optimized/IMG_7671-640.webp?v=20260901 640w, /images/optimized/IMG_7671-960.webp?v=20260901 960w',
      category: 'High-End Editorial',
      title: 'Editorial Beauty',
      description: 'Editorial beauty photography for campaigns and publications'
    },
    {
      image: '/images/optimized/IMG_7707-480.webp?v=20260901',
      srcSet: '/images/optimized/IMG_7707-480.webp?v=20260901 480w, /images/optimized/IMG_7707-640.webp?v=20260901 640w, /images/optimized/IMG_7707-960.webp?v=20260901 960w',
      category: 'Fashion',
      title: 'Fashion Campaign',
      description: 'High-end fashion photography for brands and models'
    },
    {
      image: '/images/optimized/IMG_7664-480.webp?v=20260901',
      srcSet: '/images/optimized/IMG_7664-480.webp?v=20260901 480w, /images/optimized/IMG_7664-640.webp?v=20260901 640w, /images/optimized/IMG_7664-960.webp?v=20260901 960w',
      category: 'Beauty Editorial',
      title: 'Beauty Portrait',
      description: 'Premium beauty photography for cosmetic brands and artists'
    }
  ];

  return (
    <section className="py-40 md:py-48 bg-photo-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-photo-gray-900/50 to-photo-black"></div>
      
      <div className="relative max-w-8xl mx-auto px-8 md:px-16">
        <div className="text-center mb-32">
          <h2 className="font-playfair text-6xl md:text-7xl lg:text-8xl font-extralight tracking-wide text-white mb-12 leading-[0.9]">
            Featured Work
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-photo-red to-transparent mx-auto mb-12"></div>
          <p className="font-light text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed tracking-wide">
            Fashion, beauty and editorial photography for brands, creators and models in New England and across the United States
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 md:gap-16">
          {featuredWork.map((work, index) => (
            <div 
              key={index}
              className="group cursor-pointer"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden mb-10">
                <picture>
                  <source media="(max-width: 767px)" srcSet={work.image} />
                  <img
                    src={work.image}
                    srcSet={work.srcSet}
                    sizes="(max-width: 1023px) 100vw, 33vw"
                    alt={work.title}
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-110"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    width="800"
                    height="1000"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <div className="absolute bottom-10 left-10 right-10 transform translate-y-8 group-hover:translate-y-0 transition-all duration-700 opacity-0 group-hover:opacity-100">
                  <p className="text-photo-red font-medium text-sm tracking-[0.25em] uppercase mb-3">
                    {work.category}
                  </p>
                  <h3 className="font-playfair text-2xl md:text-3xl font-light text-white leading-tight">
                    {work.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedWork;
