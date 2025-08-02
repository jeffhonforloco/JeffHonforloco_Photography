import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({
  title = "Jeff Honforloco Photography - Luxury Beauty & Fashion Photography",
  description = "Professional beauty, fashion, and editorial photography for brands, creators, and models worldwide. Elevate your vision with Jeff Honforloco's artistic expertise.",
  image = "/og-default.jpg",
  url = "https://www.jeffhonforlocophotos.com",
  type = "website"
}: SEOProps) => {
  const fullTitle = title.includes("Jeff Honforloco") ? title : `${title} | Jeff Honforloco Photography`;
  const fullUrl = url.startsWith('http') ? url : `https://www.jeffhonforlocophotos.com${url}`;
  const fullImage = image.startsWith('http') ? image : `https://www.jeffhonforlocophotos.com${image}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Photographer",
    "name": "Jeff Honforloco",
    "description": description,
    "url": fullUrl,
    "image": fullImage,
    "sameAs": [
      "https://instagram.com/jeffhonforloco",
      "https://www.linkedin.com/in/jeffhonforloco"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "business",
      "url": `${fullUrl}/contact`
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "New York",
      "addressCountry": "US"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What kind of photography does Jeff Honforloco specialize in?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Jeff focuses on fashion, beauty, editorial, and lifestyle photography with luxury brand campaigns and celebrity shoots."
        }
      },
      {
        "@type": "Question", 
        "name": "Where is Jeff Honforloco based?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Jeff operates primarily in NYC, LA, Miami, and travels internationally for luxury fashion and beauty shoots."
        }
      },
      {
        "@type": "Question",
        "name": "Can I book a session with Jeff Honforloco?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, booking inquiries for fashion, beauty, and editorial shoots are available through the website's contact page."
        }
      },
      {
        "@type": "Question",
        "name": "Does Jeff offer creative direction services?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, Jeff provides full creative direction, styling consultation, and art direction for luxury fashion and beauty campaigns."
        }
      },
      {
        "@type": "Question",
        "name": "Are digital and print licensing options available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, clients can request both digital delivery and usage rights for commercial, editorial, and social media purposes."
        }
      }
    ]
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="photography, beauty photography, fashion photography, editorial photography, luxury photography, professional photographer, NYC photographer" />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Jeff Honforloco Photography" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* FAQ Schema for AI Overview */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
};

export default SEO;