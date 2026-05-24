const HeroContent = () => {
  return (
    <>
      {/* Darkening overlay for text legibility */}
      <div className="absolute inset-0 z-10 bg-black/55 pointer-events-none" aria-hidden="true" />

      {/* Mobile hero content */}
      <div className="md:hidden absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none px-6">
        <img
          src="/images/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png"
          alt="Jeff Honforloco Photography"
          className="w-72 sm:w-80 max-w-[80vw] h-auto mx-auto mb-5 drop-shadow-2xl"
          fetchPriority="high"
        />
        <p className="font-inter text-[10px] sm:text-xs tracking-[0.35em] text-white/60 uppercase mb-2 text-center">
          Luxury Fashion &amp; Beauty
        </p>
        <p className="font-inter text-[9px] tracking-[0.25em] text-white/45 uppercase mb-8 text-center">
          Nationwide · NYC · LA · Miami · Chicago
        </p>
        <div className="flex flex-row gap-3 pointer-events-auto">
          <a
            href="/contact"
            className="bg-photo-red hover:bg-photo-red-hover text-white px-5 py-2.5 font-inter font-medium tracking-[0.18em] uppercase text-[10px] transition-colors duration-300"
          >
            Book Session
          </a>
          <a
            href="/portfolios"
            className="border border-white/60 hover:border-white text-white/80 hover:text-white px-5 py-2.5 font-inter font-light tracking-[0.18em] uppercase text-[10px] transition-colors duration-300"
          >
            View Work
          </a>
        </div>
      </div>

      {/* Desktop hero content — left-anchored editorial layout */}
      <div className="hidden md:flex absolute inset-0 items-end z-20 pointer-events-none pb-16 lg:pb-20 pl-12 lg:pl-20 xl:pl-28">
        <div className="max-w-xl">
          <img
            src="/images/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png"
            alt="Jeff Honforloco Photography"
            className="w-80 lg:w-96 xl:w-[26rem] h-auto mb-6 drop-shadow-2xl"
            fetchPriority="high"
          />

          {/* Thin accent rule */}
          <div className="w-10 h-px bg-photo-red mb-5" aria-hidden="true" />

          <p className="font-inter text-xs tracking-[0.4em] text-white/55 uppercase mb-1">
            Luxury Fashion &amp; Beauty Photography
          </p>
          <p className="font-inter text-[11px] tracking-[0.28em] text-white/38 uppercase mb-8">
            NYC &middot; Los Angeles &middot; Miami &middot; Chicago &middot; Global
          </p>

          <div className="flex flex-row gap-4 pointer-events-auto">
            <a
              href="/contact"
              className="bg-photo-red hover:bg-photo-red-hover text-white px-7 py-3 font-inter font-medium tracking-[0.2em] uppercase text-xs transition-colors duration-300"
            >
              Book a Session
            </a>
            <a
              href="/portfolios"
              className="border border-white/55 hover:border-white text-white/75 hover:text-white px-7 py-3 font-inter font-light tracking-[0.2em] uppercase text-xs transition-colors duration-300"
            >
              View Portfolio
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroContent;
