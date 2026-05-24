const HeroContent = () => {
  return (
    <>
      {/* Mobile hero content — text sits at bottom, clear of the chatbot FAB */}
      <div className="md:hidden absolute inset-0 flex flex-col items-center justify-end z-20 pointer-events-none px-6 pb-28">
        <div className="flex flex-col items-center w-full pt-16">
          <img
            src="/images/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png"
            alt="Jeff Honforloco Photography"
            className="w-64 sm:w-72 max-w-[75vw] h-auto mx-auto mb-3 drop-shadow-2xl brightness-125 contrast-110"
            fetchPriority="high"
          />
          <p className="font-inter text-[10px] tracking-[0.35em] text-white/80 uppercase mb-1 text-center">
            Luxury Fashion &amp; Beauty
          </p>
          <p className="font-inter text-[9px] tracking-[0.22em] text-white/55 uppercase mb-6 text-center">
            NYC · LA · Miami · Chicago · Global
          </p>
          <div className="flex flex-row gap-3 pointer-events-auto mb-2">
            <a
              href="/book"
              className="bg-photo-red hover:bg-photo-red-hover text-white px-5 py-2.5 font-inter font-medium tracking-[0.18em] uppercase text-[10px] transition-colors duration-300"
            >
              Book Session
            </a>
            <a
              href="/portfolios"
              className="border border-white/70 hover:border-white text-white/90 hover:text-white px-5 py-2.5 font-inter font-light tracking-[0.18em] uppercase text-[10px] transition-colors duration-300"
            >
              View Work
            </a>
          </div>
        </div>
      </div>

      {/* Desktop — text block bottom-left, local gradient only under the text */}
      <div className="hidden md:flex absolute inset-0 items-end z-20 pointer-events-none pb-12 lg:pb-16 pl-10 lg:pl-16 xl:pl-24">
        <div className="max-w-xl pr-16 pt-16">
          <img
            src="/images/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png"
            alt="Jeff Honforloco Photography"
            className="w-80 lg:w-96 xl:w-[28rem] h-auto mb-5 drop-shadow-2xl brightness-125 contrast-110"
            fetchPriority="high"
          />
          <div className="w-10 h-px bg-photo-red mb-4" aria-hidden="true" />
          <p className="font-inter text-xs tracking-[0.4em] text-white/80 uppercase mb-1">
            Luxury Fashion &amp; Beauty Photography
          </p>
          <p className="font-inter text-[11px] tracking-[0.28em] text-white/55 uppercase mb-6">
            NYC &middot; Los Angeles &middot; Miami &middot; Chicago &middot; Global
          </p>
          <div className="flex flex-row gap-4 pointer-events-auto">
            <a
              href="/book"
              className="bg-photo-red hover:bg-photo-red-hover text-white px-7 py-3 font-inter font-medium tracking-[0.2em] uppercase text-xs transition-colors duration-300"
            >
              Book a Session
            </a>
            <a
              href="/portfolios"
              className="border border-white/65 hover:border-white text-white/85 hover:text-white px-7 py-3 font-inter font-light tracking-[0.2em] uppercase text-xs transition-colors duration-300"
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
