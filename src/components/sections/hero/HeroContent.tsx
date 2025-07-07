const HeroContent = () => {
  return (
    <>
      {/* Mobile Logo & Hero Text - Centered overlay */}
      <div className="md:hidden absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="text-center px-4">
          <img 
            src="/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png" 
            alt="Jeff Honforloco Photography Logo" 
            className="w-80 sm:w-96 max-w-[85vw] h-auto filter drop-shadow-2xl brightness-150 contrast-125 mx-auto mb-6"
          />
          <div className="max-w-sm mx-auto">
            <h2 className="font-playfair text-xl sm:text-2xl font-light text-white mb-4 tracking-wide leading-tight">
              LUXURY FASHION & BEAUTY PHOTOGRAPHY
            </h2>
            <p className="font-inter text-xs sm:text-sm text-gray-200 mb-6 leading-relaxed">
              Nationwide bookings for high-end brands, celebrities & models
            </p>
            <div className="flex flex-row gap-2 justify-center pointer-events-auto">
              <a 
                href="/contact" 
                className="bg-photo-red hover:bg-photo-red-hover text-white px-4 py-2 font-medium tracking-wide uppercase text-xs transition-all duration-300 hover:scale-105 rounded-md shadow-xl"
              >
                Book Session
              </a>
              <a 
                href="/portfolio" 
                className="border border-white/80 text-white hover:bg-white/10 px-4 py-2 font-medium tracking-wide uppercase text-xs transition-all duration-300 hover:scale-105 rounded-md backdrop-blur-sm"
              >
                View Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Logo & Hero Text - Static centered overlay */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center z-20 pointer-events-none">
        <div className="text-center">
          <img 
            src="/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png" 
            alt="Jeff Honforloco Photography Logo" 
            className="w-[28rem] lg:w-[32rem] xl:w-[36rem] 2xl:w-[40rem] filter drop-shadow-2xl brightness-150 contrast-125 mx-auto mb-8"
          />
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="font-playfair text-3xl lg:text-4xl xl:text-5xl font-light text-white mb-6 tracking-wider leading-tight">
              LUXURY FASHION & BEAUTY PHOTOGRAPHY
            </h2>
            <p className="font-inter text-lg lg:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Nationwide bookings for high-end brands, celebrities & models
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
              <a 
                href="/contact" 
                className="bg-photo-red hover:bg-photo-red-hover text-white px-8 py-4 font-semibold tracking-wider uppercase text-sm transition-all duration-300 hover:scale-105 rounded-lg shadow-2xl"
              >
                Book Your Session
              </a>
              <a 
                href="/portfolio" 
                className="border-2 border-white/80 text-white hover:bg-white/10 px-8 py-4 font-semibold tracking-wider uppercase text-sm transition-all duration-300 hover:scale-105 rounded-lg backdrop-blur-sm"
              >
                View Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroContent;