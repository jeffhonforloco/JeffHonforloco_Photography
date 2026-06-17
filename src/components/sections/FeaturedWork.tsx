
const FeaturedWork = () => {
  const featuredWork = [
    {
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      category: 'High-End Editorial',
      title: 'NYC Fashion Week Editorial',
      description: 'Editorial photography for fashion week campaigns'
    },
    {
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      category: 'Celebrity Fashion',
      title: 'LA Celebrity Campaign',
      description: 'High-end fashion photography for celebrity brand partnerships'
    },
    {
      image: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      category: 'Beauty Editorial',
      title: 'Miami Beauty Campaign',
      description: 'Premium beauty photography for leading cosmetic brands'
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
            Award-winning fashion, beauty and editorial photography for high-end brands, celebrities and models across NYC, LA, Miami, Chicago and worldwide
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
                <img
                  src={work.image}
                  alt={work.title}
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-110"
                />
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
