
import { HeroImageGrid, HeroContent } from './hero';

const HeroSection = () => {
  const portfolioImages = [
    '/lovable-uploads/cd3eb066-6ffe-4e1e-9613-a1b067806092.png',
    '/lovable-uploads/060e27c9-b2d8-4f33-b575-794287894fd6.png',
    '/lovable-uploads/1bb36c8a-ad7c-469a-bc03-92b007c271c3.png',
    '/lovable-uploads/5f1a4833-8606-47d0-8677-805cd81b2558.png',
    '/lovable-uploads/c345b4c2-442d-4dc1-bf20-2c1856ad9e11.png',
    '/lovable-uploads/0987daa0-e6fd-4914-b820-b8b235e70983.png',
    '/lovable-uploads/f36a817e-cd75-4d0b-a900-ce69f01e6afb.png',
    '/lovable-uploads/1290de24-fbc4-4577-a048-fea0e3630a36.png',
    '/lovable-uploads/bcbe9d80-3fd0-494c-a9e9-a4d5ab099c02.png',
    '/lovable-uploads/13e3124a-ebf5-4084-94fa-5b85aacda039.png',
    '/lovable-uploads/04f6a5f8-91e9-4568-84ae-63cac4830a52.png',
    '/lovable-uploads/2523c649-4617-43c2-9e9e-ebf4ee328067.png',
    '/lovable-uploads/b573482f-31ab-49e5-af48-586d9aeb6909.png',
    '/lovable-uploads/be107293-394e-46fd-9fcd-d1eb5781ff56.png',
    '/lovable-uploads/7c28c520-783d-4733-ad48-9683204ef054.png',
    '/lovable-uploads/c279306c-86cb-49fe-a393-c5330888db34.png',
    '/lovable-uploads/06e1e583-fc89-475d-bf22-b6d815ab75f0.png',
    '/lovable-uploads/099f5b67-8ba8-4e5f-94a3-d2f14679b248.png',
    '/lovable-uploads/09ac1697-3757-47bf-84fa-5d922e1f1779.png',
    '/lovable-uploads/1a35b5b2-6090-4718-9833-79a270346b20.png',
    '/lovable-uploads/2688f2e4-7158-4784-bdc4-2d84ff3a124d.png',
    '/lovable-uploads/28ccb7e7-ed7f-4185-ad8b-8bacc6443c8f.png',
    '/lovable-uploads/3566a61b-2d58-4e4a-920f-b2f011f69289.png',
    '/lovable-uploads/3773cab4-5d54-45b9-befe-7e8b70874496.png',
    '/lovable-uploads/37f4ae80-0bd4-4eae-8c84-a252aa263a64.png',
    '/lovable-uploads/3b2350e8-72d9-4325-bd13-a5b6ceec335f.png',
    '/lovable-uploads/3d46d1ef-3d6f-4cf4-b3e4-f62aa6b7323d.png',
    '/lovable-uploads/3d6135c5-bcb6-4b62-b41e-d24c20e4c726.png',
    '/lovable-uploads/3ffed44f-cebf-4d6d-ba06-86e21b470903.png',
    '/lovable-uploads/47c04841-2b95-4229-8bea-7e1c4925bafb.png',
    '/lovable-uploads/4a4d1d70-8ce9-4c45-b96c-f46b3bb46863.png',
    '/lovable-uploads/62b49f7c-4f73-4d92-881f-45f2809087b1.png',
    '/lovable-uploads/69f2a872-9dde-4972-bb6a-e11577de7fec.png',
    '/lovable-uploads/6a95f17f-c979-43f4-9323-c4f01731a191.png',
    '/lovable-uploads/73dc6884-f3c8-4a35-b5f5-4b36c8cc8c36.png',
    '/lovable-uploads/86a54898-0663-4d33-9cc9-a793f168d0ab.png',
    '/lovable-uploads/91b16668-debd-4e7b-9fab-e6200abfaa53.png',
    '/lovable-uploads/9bed3b4d-3641-4170-91ba-2765ea59db49.png',
    '/lovable-uploads/a1c7a9f7-09e2-44b4-9dbb-d807b674060c.png',
    '/lovable-uploads/bbbddcaa-c94f-4035-9aa8-16a225d5b527.png',
    '/lovable-uploads/be7f5d35-71c0-4752-8fbe-46cd1a9e1fdd.png',
    '/lovable-uploads/c2476d8c-8e52-43a0-ac77-33d818c3fa2d.png',
    '/lovable-uploads/cc3dde2a-3f8c-4c40-b4b7-33cc0fd118e0.png',
    '/lovable-uploads/d0aa1656-0697-40c8-aad3-a3756945228a.png',
    '/lovable-uploads/d0c57cf0-4228-4e1e-8c62-5cf93ca380a5.png',
    '/lovable-uploads/d1ac41f4-eab2-40c7-8c53-61d619ab77c3.png',
    '/lovable-uploads/db51011f-18fe-4e40-8977-b0b6a211a396.png',
    '/lovable-uploads/e06927fa-9c52-4746-895c-f21667b0197e.png',
    '/lovable-uploads/e302a6bd-9a35-4c62-924e-5f14e4e2d241.png',
    '/lovable-uploads/e30bcff1-8487-49cd-89f3-464e539e26c3.png',
    '/lovable-uploads/e8cb69bc-d69a-44f0-9d6d-54cff80fa950.png',
    '/lovable-uploads/f17266df-16a1-4edd-8581-23b10bdb2eda.png',
    '/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png'
  ];

  // Distribute all 52 images across 3 columns evenly
  const imagesPerColumn = Math.ceil(portfolioImages.length / 3);
  const col1Images = portfolioImages.slice(0, imagesPerColumn);
  const col2Images = portfolioImages.slice(imagesPerColumn, imagesPerColumn * 2);
  const col3Images = portfolioImages.slice(imagesPerColumn * 2);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Hidden SEO content */}
      <h1 className="sr-only">Jeff Honforloco Photography - Luxury Fashion & Beauty Photographer | Nationwide Bookings NYC, LA, Miami, Chicago</h1>
      
      <HeroImageGrid 
        col1Images={col1Images}
        col2Images={col2Images}
        col3Images={col3Images}
      />

      {/* Hero Content Overlay */}
      <HeroContent />
    </section>
  );
};

export default HeroSection;
