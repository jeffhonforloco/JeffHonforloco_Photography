const HeroContent = () => {
  return (
    <>
      {/*
        Desktop: gradient rises from bottom-left (where text lives) and fades
        to transparent at top-right — images remain vivid everywhere else.
        Mobile: gradient rises from bottom center only.
        No full-screen overlay — that was killing image vibrancy.
      */}
      <div
        className="absolute inset-0 z-10 pointer-events-none hidden md:block"
        style={{
          background:
            'linear-gradient(to top right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 30%, rgba(0,0,0,0.08) 60%, transparent 80%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-10 pointer-events-none md:hidden"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.40) 40%, rgba(0,0,0,0.10) 70%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Mobile hero content */}
      <div className="md:hidden absolute inset-0 flex flex-col items-center justify-end z-20 pointer-events-none px-6 pb-14">
        <img
          src="/images/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png"
          alt="Jeff Honforloco Photography"
          className="w-64 sm:w-72 max-w-[75vw] h-auto mx-auto mb-4 drop-shadow-2xl brightness-125 contrast-110"
          fetchPriority="high"
        />
        <p className="font-inter text-[10px] tracking-[0.35em] text-white/70 uppercase mb-1 text-center">
          Luxury Fashion &amp; Beauty
        </p>
        <p className="font-inter text-[9px] tracking-[0.22em] text-white/50 uppercase mb-7 text-center">
          NYC · LA · Miami · Chicago · Global
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
            className="border border-white/70 hover:border-white text-white/90 hover:text-white px-5 py-2.5 font-inter font-light tracking-[0.18em] uppercase text-[10px] transition-colors duration-300"
          >
            View Work
          </a>
        </div>
      </div>

      {/* Desktop hero content — bottom-left anchored */}
      <div className="hidden md:flex absolute inset-0 items-end z-20 pointer-events-none pb-14 lg:pb-18 xl:pb-20 pl-12 lg:pl-20 xl:pl-28">
        <div className="max-w-xl">
          <img
            src="/images/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png"
            alt="Jeff Honforloco Photography"
            className="w-80 lg:w-96 xl:w-[28rem] h-auto mb-5 drop-shadow-2xl brightness-125 contrast-110"
            fetchPriority="high"
          />

          {/* Thin accent rule */}
          <div className="w-10 h-px bg-photo-red mb-4" aria-hidden="true" />

          <p className="font-inter text-xs tracking-[0.4em] text-white/70 uppercase mb-1">
            Luxury Fashion &amp; Beauty Photography
          </p>
          <p className="font-inter text-[11px] tracking-[0.28em] text-white/50 uppercase mb-7">
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
