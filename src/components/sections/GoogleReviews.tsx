import { Star } from 'lucide-react';

const reviews = [
  {
    name: 'Emely Adames',
    initials: 'EA',
    color: 'bg-orange-500',
    service: 'Makeup Artist · Collaborator',
    quote:
      "I've worked with him as a makeup artist, and honestly, I've never seen such meticulous work. His photos are high quality, he's very professional, and above all, punctual. I recommend him 100%. If you're reading this, stop reading and book your appointment now!",
  },
  {
    name: 'ArnitaSimone Official',
    initials: 'AS',
    color: 'bg-purple-600',
    service: 'Portrait Session',
    quote:
      'Jeff is an extremely creative and talented photographer who exceeded my expectations. His love and passion for his art and work are awesome!',
  },
  {
    name: 'Kimberly Curvelo',
    initials: 'KC',
    color: 'bg-green-600',
    service: 'Beauty Photography',
    quote:
      'You have the ability to capture ones beauty like no other. You are Amazing.',
  },
  {
    name: 'Sarah Wessel',
    initials: 'SW',
    color: 'bg-blue-600',
    service: 'STYLEWEEK Bridal Event',
    quote:
      'Jeff took amazing pictures for our event, STYLEWEEK Bridal! Captured every moment on the runway. Would definitely recommend!',
  },
  {
    name: 'Donahue Models & Talent',
    initials: 'DM',
    color: 'bg-red-700',
    service: 'Talent Agency',
    quote:
      'Jeff is a great photographer, he is reliable and delivers on time!',
  },
  {
    name: 'Mfon Essien',
    initials: 'ME',
    color: 'bg-yellow-600',
    service: 'Photography Session',
    quote:
      'Very professional, extremely courteous and impeccable quality of work!!!',
  },
  {
    name: 'Libra Infinity',
    initials: 'LI',
    color: 'bg-indigo-600',
    service: 'Photography Session',
    quote: 'Pictures are very elegant and captures the beauty of the people.',
  },
  {
    name: 'Marie Michaelle',
    initials: 'MM',
    color: 'bg-pink-600',
    service: 'Repeat Client',
    quote: 'Great photographer!',
  },
];

const Stars = () => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
    ))}
  </div>
);

const GoogleReviews = () => {
  return (
    <section className="py-32 md:py-40 bg-photo-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-photo-gray-900/40 to-photo-black" />

      <div className="relative max-w-7xl mx-auto px-8 md:px-16">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="font-inter text-xs tracking-[0.4em] text-photo-red uppercase mb-4">
            Client Reviews
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-extralight tracking-wide text-white mb-8 leading-tight">
            What Clients Say
          </h2>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="font-playfair text-4xl font-light text-white">5.0</span>
            <Stars />
            <a
              href="https://share.google/2iHZYVNyEeWltUqBA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              · 12 reviews on Google
            </a>
          </div>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-photo-red to-transparent mx-auto" />
        </div>

        {/* Review cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.name}
              className="bg-photo-gray-900 border border-photo-gray-700 hover:border-photo-red/40 rounded-2xl p-8 flex flex-col gap-5 transition-colors duration-300"
            >
              <Stars />
              <p className="font-inter font-light text-gray-300 leading-relaxed text-base flex-1">
                "{review.quote}"
              </p>
              <div className="flex items-center gap-4 pt-2 border-t border-photo-gray-700">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${review.color}`}
                >
                  <span className="text-white text-xs font-semibold">{review.initials}</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{review.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{review.service}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16">
          <a
            href="https://share.google/2iHZYVNyEeWltUqBA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm tracking-widest uppercase transition-colors duration-300"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Read all reviews on Google
          </a>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
