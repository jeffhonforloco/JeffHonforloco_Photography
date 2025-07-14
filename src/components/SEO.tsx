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
    </Helmet>
  );
};

export default SEO;