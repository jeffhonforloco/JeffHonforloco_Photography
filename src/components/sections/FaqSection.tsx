import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How much does a fashion photoshoot cost in Providence, RI?',
    answer:
      'Fashion sessions start from $499, and every package price is published up front on the pricing page — no hidden fees and no "contact for rates." Compare packages and book directly online.',
  },
  {
    question: 'Do you travel outside Providence for shoots?',
    answer:
      'Yes. Providence is home base, and Jeff regularly shoots across New England — including Boston — plus New York City and Miami. Travel arrangements are handled when you book.',
  },
  {
    question: 'What kind of photography do you specialize in?',
    answer:
      'Fashion, beauty, and editorial photography for brands, designers, models, and creators — plus headshots, events, and commercial work. The portfolio spans runway, campaign, and magazine-style imagery.',
  },
  {
    question: 'Where do photoshoots take place?',
    answer:
      'In the Providence studio or on location. For headshots and portraits, Jeff also comes to you. The right location is planned around your concept during booking.',
  },
  {
    question: 'How do I book a photoshoot?',
    answer:
      'Pick your service and package on the booking page, request your date, and send your project details. You\u2019ll get a response with next steps and a clear delivery timeline.',
  },
  {
    question: 'How should I prepare for my session?',
    answer:
      'There is a full prep guide covering wardrobe, styling, and shoot-day details. If your concept needs hair and makeup, that can be arranged with trusted collaborators.',
  },
];

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <section id="faq" className="py-32 md:py-40 bg-photo-black relative overflow-hidden scroll-mt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="relative max-w-5xl mx-auto px-8 md:px-16">
        <div className="text-center mb-16">
          <p className="font-inter text-xs tracking-[0.4em] text-photo-red uppercase mb-4">
            Common Questions
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl font-extralight tracking-wide text-white mb-8 leading-tight">
            Before You Book
          </h2>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-photo-red to-transparent mx-auto" />
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="bg-photo-gray-900 border border-photo-gray-700 hover:border-photo-red/40 rounded-2xl transition-colors duration-300 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-6 text-left px-8 py-6"
                  aria-expanded={isOpen}
                >
                  <span className="font-playfair text-xl md:text-2xl font-light text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    size={22}
                    className={`flex-shrink-0 text-photo-red transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="font-inter font-light text-gray-300 leading-relaxed px-8 pb-7">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
