import { Helmet } from 'react-helmet-async';

export default function SEOHead() {
  return (
    <Helmet>
      {/* Meta Tags */}
      <title>Jeff Honforloco | Fashion & Beauty Photographer</title>
      <meta
        name="description"
        content="Explore Jeff Honforloco's photography portfolio focused on fashion, beauty, and lifestyle shoots. Book creative direction and custom photoshoots online."
      />
      <meta property="og:title" content="Jeff Honforloco | Fashion & Beauty Photographer" />
      <meta property="og:description" content="Explore Jeff Honforloco's photography portfolio focused on fashion, beauty, and lifestyle shoots." />
      <meta property="og:url" content="https://www.jeffhonforlocophotos.com" />
      <meta property="og:type" content="website" />
      <meta name="robots" content="index, follow" />

      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Jeff Honforloco | Fashion & Beauty Photographer",
            "url": "https://www.jeffhonforlocophotos.com",
            "description":
              "Explore Jeff Honforloco's photography portfolio focused on fashion, beauty, and lifestyle shoots. Book creative direction and custom photoshoots online.",
            "mainEntity": {
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What kind of photography does Jeff Honforloco specialize in?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Jeff focuses on fashion, beauty, editorial, and lifestyle photography."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Where is Jeff Honforloco based?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Jeff operates primarily in the U.S. and works with international clients."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I book a session with Jeff Honforloco?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, booking inquiries are available through the website's contact page."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does Jeff offer creative direction or art direction services?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Jeff provides full creative direction for each photoshoot."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Are digital and print licensing options available?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, clients can request both digital delivery and usage rights for commercial or editorial purposes."
                  }
                }
              ]
            }
          })
        }}
      />
    </Helmet>
  );
}