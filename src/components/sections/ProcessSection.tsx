import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    title: 'Inquire',
    description:
      'Tell us about your project — the vision, the vibe, the goal. No forms with 30 fields. Just a conversation.',
  },
  {
    number: '02',
    title: 'Creative Consult',
    description:
      'Jeff connects with you personally to align on concept, location, wardrobe, and creative direction before a single shot is taken.',
  },
  {
    number: '03',
    title: 'Your Images Delivered',
    description:
      'Gallery-ready, fully retouched images delivered to your inbox. Ready for campaigns, portfolios, or anything you create next.',
  },
];

const ProcessSection = () => {
  return (
    <section className="py-32 md:py-40 bg-photo-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-photo-black/60 to-photo-gray-900" />

      <div className="relative max-w-7xl mx-auto px-8 md:px-16">
        <div className="text-center mb-24">
          <p className="font-inter text-xs tracking-[0.4em] text-photo-red uppercase mb-4">
            How It Works
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-extralight tracking-wide text-white leading-tight">
            Three Steps to Your Session
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-photo-red to-transparent mx-auto mt-10" />
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8 lg:gap-16 mb-20">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col items-start">
              {/* Connector line between steps (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-full w-full h-px bg-photo-red/20 z-0" style={{ width: 'calc(100% - 3rem)', left: '3rem' }} />
              )}

              <span className="font-playfair text-7xl md:text-8xl font-extralight text-photo-red/20 leading-none mb-6 select-none">
                {step.number}
              </span>
              <div className="w-8 h-px bg-photo-red mb-6" />
              <h3 className="font-playfair text-2xl md:text-3xl font-light text-white mb-4 tracking-wide">
                {step.title}
              </h3>
              <p className="font-inter font-light text-gray-400 leading-relaxed text-base">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/book"
            className="inline-block bg-photo-red hover:bg-photo-red-hover text-white px-12 py-4 font-inter font-medium tracking-[0.2em] uppercase text-sm transition-all duration-300 hover:scale-105"
          >
            Start Your Session
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
