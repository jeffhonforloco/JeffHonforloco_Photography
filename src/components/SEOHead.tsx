import { Helmet } from 'react-helmet-async';

export default function SEOHead() {
  return (
    <Helmet>
      {/* Meta Tags */}
      <title>Jeff Honforloco | Premier Fashion & Beauty Photographer NYC | Luxury Brand Photography</title>
      <meta
        name="description"
        content="Award-winning luxury fashion, beauty, wedding, and corporate photographer Jeff Honforloco. Professional photography services for brands, events, real estate, and editorial shoots across NYC, LA, Miami. Book your premium photoshoot today."
      />
      <meta 
        name="keywords" 
        content="photographer, photography, fashion photographer, beauty photographer, wedding photographer, event photographer, brand photographer, luxury photographer, editorial photographer, corporate photographer, real estate photographer, NYC photographer, Los Angeles photographer, Miami photographer, professional photographer, commercial photographer, portrait photographer, lifestyle photographer, product photographer, headshot photographer, celebrity photographer, model photographer, photoshoot, brand photoshoot, fashion photoshoot, beauty photoshoot, wedding photography, event photography, corporate photography, real estate photography, luxury brand photography, editorial photography, commercial photography, professional photography services" 
      />
      
      {/* Open Graph */}
      <meta property="og:title" content="Jeff Honforloco | Premier Fashion & Beauty Photographer NYC | Luxury Brand Photography" />
      <meta property="og:description" content="Award-winning luxury fashion, beauty, wedding, and corporate photographer. Professional photography services for brands, events, and editorial shoots across NYC, LA, Miami." />
      <meta property="og:url" content="https://www.jeffhonforlocophotos.com" />
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://www.jeffhonforlocophotos.com/og-image.jpg" />
      <meta property="og:site_name" content="Jeff Honforloco Photography" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Jeff Honforloco | Premier Fashion & Beauty Photographer" />
      <meta name="twitter:description" content="Award-winning luxury fashion, beauty, wedding, and corporate photographer serving NYC, LA, Miami and international clients." />
      <meta name="twitter:image" content="https://www.jeffhonforlocophotos.com/og-image.jpg" />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="author" content="Jeff Honforloco" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#000000" />
      
      {/* Local Business Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ProfessionalService",
            "name": "Jeff Honforloco Photography",
            "alternateName": "Jeff Honforloco",
            "description": "Premier luxury fashion, beauty, wedding, corporate, and real estate photographer serving NYC, Los Angeles, Miami, and international clients. Specializing in editorial photography, brand campaigns, and high-end commercial photography.",
            "url": "https://www.jeffhonforlocophotos.com",
            "telephone": "+1-555-PHOTOS",
            "email": "hello@jeffhonforlocophotos.com",
            "image": "https://www.jeffhonforlocophotos.com/jeff-honforloco-headshot.jpg",
            "logo": "https://www.jeffhonforlocophotos.com/logo.png",
            "priceRange": "$$$",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "New York",
              "addressRegion": "NY",
              "addressCountry": "US",
              "streetAddress": "Manhattan, NYC"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "40.7128",
              "longitude": "-74.0060"
            },
            "areaServed": [
              {
                "@type": "City",
                "name": "New York City"
              },
              {
                "@type": "City", 
                "name": "Los Angeles"
              },
              {
                "@type": "City",
                "name": "Miami"
              },
              {
                "@type": "Country",
                "name": "United States"
              }
            ],
            "serviceType": [
              "Fashion Photography",
              "Beauty Photography", 
              "Wedding Photography",
              "Event Photography",
              "Corporate Photography",
              "Real Estate Photography",
              "Brand Photography",
              "Editorial Photography",
              "Commercial Photography",
              "Portrait Photography",
              "Lifestyle Photography",
              "Product Photography"
            ],
            "sameAs": [
              "https://instagram.com/jeffhonforloco",
              "https://www.linkedin.com/in/jeffhonforloco",
              "https://www.facebook.com/jeffhonforlocophotography"
            ],
            "openingHours": "Mo-Su 09:00-18:00",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5.0",
              "reviewCount": "127"
            }
          })
        }}
      />

      {/* Person Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Jeff Honforloco",
            "jobTitle": "Professional Photographer",
            "description": "Award-winning luxury fashion, beauty, wedding, and commercial photographer with over 10 years of experience creating stunning visuals for top brands, celebrities, and discerning clients worldwide.",
            "url": "https://www.jeffhonforlocophotos.com",
            "image": "https://www.jeffhonforlocophotos.com/jeff-honforloco-headshot.jpg",
            "sameAs": [
              "https://instagram.com/jeffhonforloco",
              "https://www.linkedin.com/in/jeffhonforloco"
            ],
            "knowsAbout": [
              "Fashion Photography",
              "Beauty Photography",
              "Wedding Photography", 
              "Corporate Photography",
              "Real Estate Photography",
              "Editorial Photography",
              "Commercial Photography",
              "Brand Photography",
              "Luxury Photography",
              "Celebrity Photography"
            ],
            "hasOccupation": {
              "@type": "Occupation",
              "name": "Professional Photographer",
              "occupationLocation": {
                "@type": "City",
                "name": "New York City"
              }
            }
          })
        }}
      />

      {/* Enhanced FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "What types of photography does Jeff Honforloco specialize in?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Jeff Honforloco specializes in luxury fashion photography, beauty photography, wedding photography, corporate photography, real estate photography, editorial photography, brand photography, event photography, and commercial photography. He serves clients in NYC, Los Angeles, Miami, and internationally."
                }
              },
              {
                "@type": "Question",
                "name": "Where does Jeff Honforloco provide photography services?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Jeff Honforloco is based in New York City and provides professional photography services across NYC, Los Angeles, Miami, and travels internationally for luxury clients. He offers on-location and studio photography sessions."
                }
              },
              {
                "@type": "Question",
                "name": "How can I book a photography session with Jeff Honforloco?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You can book a photography session by visiting the contact page at jeffhonforlocophotos.com/contact or calling directly. Jeff offers consultations for fashion, beauty, wedding, corporate, and brand photography projects."
                }
              },
              {
                "@type": "Question",
                "name": "Does Jeff Honforloco offer wedding photography services?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, Jeff Honforloco offers luxury wedding photography services with a focus on editorial-style wedding photography, capturing candid moments and creating artistic wedding portraits for discerning couples."
                }
              },
              {
                "@type": "Question",
                "name": "What makes Jeff Honforloco different from other photographers?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Jeff Honforloco combines technical expertise with artistic vision, specializing in luxury photography with over 10 years of experience. He provides full creative direction, works with top brands and celebrities, and delivers magazine-quality results for every client."
                }
              },
              {
                "@type": "Question",
                "name": "Does Jeff provide corporate photography and headshot services?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, Jeff offers professional corporate photography services including executive headshots, team photography, corporate events, and brand photography for businesses looking for high-quality commercial photography."
                }
              },
              {
                "@type": "Question",
                "name": "What is included in a real estate photography session?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Jeff's real estate photography services include high-end property photography, architectural photography, luxury home photography, and commercial real estate photography with professional lighting and post-processing for maximum impact."
                }
              },
              {
                "@type": "Question",
                "name": "How much does a photography session with Jeff Honforloco cost?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Photography session pricing varies based on the type of shoot, location, and requirements. Jeff offers competitive rates for fashion, beauty, wedding, corporate, and real estate photography. Contact for a custom quote based on your specific needs."
                }
              }
            ]
          })
        }}
      />

      {/* Organization Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Jeff Honforloco Photography",
            "url": "https://www.jeffhonforlocophotos.com",
            "logo": "https://www.jeffhonforlocophotos.com/logo.png",
            "description": "Premier luxury photography studio specializing in fashion, beauty, wedding, corporate, and real estate photography services across New York City, Los Angeles, Miami, and international locations.",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+1-555-PHOTOS",
              "contactType": "customer service",
              "availableLanguage": "English"
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "New York",
              "addressRegion": "NY", 
              "addressCountry": "US"
            },
            "founder": {
              "@type": "Person",
              "name": "Jeff Honforloco"
            }
          })
        }}
      />
    </Helmet>
  );
}