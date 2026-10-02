export const portfolioImages: string[] = [
  '/images/2301434b-9540-429b-b183-c3f01e585450.webp',
  '/images/fbeb876e-8eb3-40e4-8481-eb136e709b02.webp',
  '/images/e846a586-047a-4535-9d2e-ab304f4ba711.webp',
  '/images/IMG_7707.webp',
  '/images/ae423683-fce8-4398-9f0a-df01c3ff0e83.webp',
  '/images/IMG_7671.webp',
  '/images/IMG_7664.webp',
  '/images/IMG_7670.webp',
  '/images/IMG_7713.webp',
  '/images/bbc35ce3-6021-4e29-832e-1360f0ed92c6.webp',
  '/images/IMG_7757.webp',
  '/images/7c359110-2bfb-48e5-bcac-877116347f1a.webp',
  '/images/IMG_7771.webp',
  '/images/c1af06d9-0cd3-4ce8-a226-ceb40a0401b6.webp',
  '/images/IMG_7792.webp',
  '/images/1dac84ed-b80a-479f-937c-1beab4e1f12e.webp',
  '/images/IMG_7794.webp',
  '/images/b4c42681-bbee-4882-8cb7-d652bb854191.webp',
  '/images/IMG_7700.webp',
  '/images/7cdb389a-0507-4d05-8782-18edd5afe814.webp',
  '/images/IMG_7653.webp',
  '/images/cd3eb066-6ffe-4e1e-9613-a1b067806092.webp',
  '/images/IMG_7658.webp',
  '/images/060e27c9-b2d8-4f33-b575-794287894fd6.webp',
  '/images/IMG_7659.webp',
  '/images/1bb36c8a-ad7c-469a-bc03-92b007c271c3.webp',
  '/images/IMG_7668.webp',
  '/images/5f1a4833-8606-47d0-8677-805cd81b2558.webp',
  '/images/IMG_7673.webp',
  '/images/c345b4c2-442d-4dc1-bf20-2c1856ad9e11.webp',
  '/images/IMG_7721.webp',
  '/images/0987daa0-e6fd-4914-b820-b8b235e70983.webp',
  '/images/IMG_7834.webp',
  '/images/f36a817e-cd75-4d0b-a900-ce69f01e6afb.webp',
  '/images/IMG_7652.webp',
  '/images/1290de24-fbc4-4577-a048-fea0e3630a36.webp',
  '/images/IMG_7655.webp',
  '/images/bcbe9d80-3fd0-494c-a9e9-a4d5ab099c02.webp',
  '/images/IMG_7662.webp',
  '/images/13e3124a-ebf5-4084-94fa-5b85aacda039.webp',
];

export interface HeroImage {
  src: string;
  srcSet: string;
  mobileSrcSet: string;
  alt: string;
}

const HERO_IMAGE_ALTS: Record<string, string> = {
  '/images/2301434b-9540-429b-b183-c3f01e585450.webp': 'Fashion editorial photograph by Jeff Honforloco',
  '/images/fbeb876e-8eb3-40e4-8481-eb136e709b02.webp': 'Beauty portrait by Providence photographer Jeff Honforloco',
  '/images/e846a586-047a-4535-9d2e-ab304f4ba711.webp': 'Model portfolio photograph by Jeff Honforloco',
  '/images/IMG_7707.webp': 'Curly Hair Pink Background Portrait by Jeff Honforloco',
  '/images/ae423683-fce8-4398-9f0a-df01c3ff0e83.webp': 'Editorial portrait session by Jeff Honforloco',
  '/images/IMG_7671.webp': 'Blue Liner Beauty by Jeff Honforloco',
  '/images/IMG_7664.webp': 'Red Hat Beauty Glamour by Jeff Honforloco',
  '/images/IMG_7670.webp': 'Gold Eyeshadow Beauty by Jeff Honforloco',
  '/images/IMG_7713.webp': 'Sunset Beach Lifestyle by Jeff Honforloco',
  '/images/bbc35ce3-6021-4e29-832e-1360f0ed92c6.webp': 'Studio fashion photograph by Jeff Honforloco',
  '/images/IMG_7757.webp': 'Headshot Portrait White Blazer by Jeff Honforloco',
  '/images/7c359110-2bfb-48e5-bcac-877116347f1a.webp': 'Creative portrait photography by Jeff Honforloco',
  '/images/IMG_7771.webp': 'Neon Yellow Fashion Editorial by Jeff Honforloco',
  '/images/c1af06d9-0cd3-4ce8-a226-ceb40a0401b6.webp': 'Fashion editorial photograph by Jeff Honforloco',
  '/images/IMG_7792.webp': 'Creative Male Portrait with Hat by Jeff Honforloco',
  '/images/1dac84ed-b80a-479f-937c-1beab4e1f12e.webp': 'Beauty portrait by Providence photographer Jeff Honforloco',
  '/images/IMG_7794.webp': 'Male Headshot Portrait by Jeff Honforloco',
  '/images/b4c42681-bbee-4882-8cb7-d652bb854191.webp': 'Model portfolio photograph by Jeff Honforloco',
  '/images/IMG_7700.webp': 'Dark Portrait Natural Hair by Jeff Honforloco',
  '/images/7cdb389a-0507-4d05-8782-18edd5afe814.webp': 'Editorial portrait session by Jeff Honforloco',
  '/images/IMG_7653.webp': 'Red Glove Beauty Editorial by Jeff Honforloco',
  '/images/cd3eb066-6ffe-4e1e-9613-a1b067806092.webp': 'Studio fashion photograph by Jeff Honforloco',
  '/images/IMG_7658.webp': 'Creative portrait photography by Jeff Honforloco',
  '/images/060e27c9-b2d8-4f33-b575-794287894fd6.webp': 'Fashion editorial photograph by Jeff Honforloco',
  '/images/IMG_7659.webp': 'Beauty portrait by Providence photographer Jeff Honforloco',
  '/images/1bb36c8a-ad7c-469a-bc03-92b007c271c3.webp': 'Model portfolio photograph by Jeff Honforloco',
  '/images/IMG_7668.webp': 'Red Ruffle Dress Editorial by Jeff Honforloco',
  '/images/5f1a4833-8606-47d0-8677-805cd81b2558.webp': 'Editorial portrait session by Jeff Honforloco',
  '/images/IMG_7673.webp': 'Red Lip Smoky Eye by Jeff Honforloco',
  '/images/c345b4c2-442d-4dc1-bf20-2c1856ad9e11.webp': 'Studio fashion photograph by Jeff Honforloco',
  '/images/IMG_7721.webp': 'Moody Lamp Editorial Glamour by Jeff Honforloco',
  '/images/0987daa0-e6fd-4914-b820-b8b235e70983.webp': 'Creative portrait photography by Jeff Honforloco',
  '/images/IMG_7834.webp': 'Black and White Sparkle Glamour by Jeff Honforloco',
  '/images/f36a817e-cd75-4d0b-a900-ce69f01e6afb.webp': 'Fashion editorial photograph by Jeff Honforloco',
  '/images/IMG_7652.webp': 'Red Sequin Gown Full Length by Jeff Honforloco',
  '/images/1290de24-fbc4-4577-a048-fea0e3630a36.webp': 'Beauty portrait by Providence photographer Jeff Honforloco',
  '/images/IMG_7655.webp': 'Black Sequin Mini Red Light by Jeff Honforloco',
  '/images/bcbe9d80-3fd0-494c-a9e9-a4d5ab099c02.webp': 'Model portfolio photograph by Jeff Honforloco',
  '/images/IMG_7662.webp': 'Red Sequin Portrait Close-up by Jeff Honforloco',
  '/images/13e3124a-ebf5-4084-94fa-5b85aacda039.webp': 'Editorial portrait session by Jeff Honforloco',
};

const HERO_IMAGE_VERSION = '20260901';

// Preserve the complete original hero collection while serving only compact,
// responsive WebP derivatives. This keeps the visual variety without sending
// the 119 MB source-image payload to homepage visitors.
export const optimizedHeroImages: HeroImage[] = portfolioImages.map((original) => {
  const filename = original.split('/').pop() ?? '';
  const stem = filename.replace(/\.[^.]+$/, '');
  const optimizedBase = `/images/optimized/${stem}`;

  return {
    src: `${optimizedBase}-640.webp?v=${HERO_IMAGE_VERSION}`,
    srcSet: `${optimizedBase}-320.webp?v=${HERO_IMAGE_VERSION} 320w, ${optimizedBase}-640.webp?v=${HERO_IMAGE_VERSION} 640w, ${optimizedBase}-960.webp?v=${HERO_IMAGE_VERSION} 960w`,
    mobileSrcSet: `${optimizedBase}-320.webp?v=${HERO_IMAGE_VERSION} 320w, ${optimizedBase}-480.webp?v=${HERO_IMAGE_VERSION} 480w`,
    alt: HERO_IMAGE_ALTS[original] ?? `Photography by Jeff Honforloco`,
  };
});
