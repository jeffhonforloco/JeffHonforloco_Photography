import { Link } from 'react-router-dom';
import Layout from '../Layout';

interface DefaultPortfolioProps {
  title: string;
  description: string;
  images: Array<{ src: string; alt: string; caption: string }>;
}

const DefaultPortfolio = ({ title, description, images }: DefaultPortfolioProps) => {
  // Fashion page specific images - all uploaded images
  const fashionImages = [
    { src: '/lovable-uploads/8353fa23-da0a-4cdd-afad-c33e3622e179.png', alt: 'Fashion Photography', caption: 'FESTIVE ELEGANCE' },
    { src: '/lovable-uploads/3fc5d0bd-a575-4ac9-bab5-50b03bdf22c7.png', alt: 'Fashion Photography', caption: 'MODERN LUXURY' },
    { src: '/lovable-uploads/062059e1-5ef4-498c-b407-a160cca11bde.png', alt: 'Fashion Photography', caption: 'VINTAGE GLAMOUR' },
    { src: '/lovable-uploads/c1ee520a-9a4a-4911-9dfa-d722a9ff9f13.png', alt: 'Fashion Photography', caption: 'CLASSIC RED' },
    { src: '/lovable-uploads/9f62e7cd-99d7-45e0-9d5f-a98cd8354f01.png', alt: 'Fashion Photography', caption: 'SEQUIN GLAMOUR' },
    { src: '/lovable-uploads/5d3e488e-ff11-4efd-8d64-044581b14e19.png', alt: 'Fashion Photography', caption: 'BOLD STATEMENT' },
    { src: '/lovable-uploads/42c6c903-6fe9-4f85-8990-92ed8fd4b8c1.png', alt: 'Fashion Photography', caption: 'RED ELEGANCE' },
    { src: '/lovable-uploads/fa05c636-4d55-4c2f-b703-54c585db6b63.png', alt: 'Fashion Photography', caption: 'GOLDEN GLAMOUR' },
    { src: '/lovable-uploads/ee980b4e-6191-4a5e-9154-a0570d5a5cf7.png', alt: 'Fashion Photography', caption: 'VIBRANT STYLE' },
    { src: '/lovable-uploads/fa096df6-9e5b-4c94-b2eb-fcd21afd9464.png', alt: 'Fashion Photography', caption: 'WHITE ELEGANCE' },
    { src: '/lovable-uploads/2c5c9feb-d64a-4aef-8a8f-befaa483c3b9.png', alt: 'Fashion Photography', caption: 'LUXURY FASHION' },
    { src: '/lovable-uploads/b8d7af04-86fd-40a8-b960-3797187fa27c.png', alt: 'Fashion Photography', caption: 'EVENING WEAR' },
    { src: '/lovable-uploads/378e6920-c0d7-4bf9-85b7-6094238a8a9e.png', alt: 'Fashion Photography', caption: 'GLAMOUR COLLECTION' },
    { src: '/lovable-uploads/8fba258d-35bd-4852-9e00-2f58fa836046.png', alt: 'Fashion Photography', caption: 'DESIGNER COLLECTION' },
    { src: '/lovable-uploads/3e678cfc-4a4a-49e7-b36d-922d97afa616.png', alt: 'Fashion Photography', caption: 'HAUTE COUTURE' },
    { src: '/lovable-uploads/239d878c-3190-41aa-8c43-e21ba98f8ac0.png', alt: 'Fashion Photography', caption: 'EDITORIAL STYLE' },
    { src: '/lovable-uploads/240d3762-7b5f-4cef-bec9-82ae136256b7.png', alt: 'Fashion Photography', caption: 'MONOCHROME ELEGANCE' },
    { src: '/lovable-uploads/f3678f5a-0d65-447d-a666-681414ba5683.png', alt: 'Fashion Photography', caption: 'SOPHISTICATED GLAMOUR' },
    { src: '/lovable-uploads/1b3d1966-a116-4938-9368-5094259e1fe6.png', alt: 'Fashion Photography', caption: 'FORMAL COUTURE' },
    { src: '/lovable-uploads/fe3059c7-202d-4437-8785-42cc1fc2cab4.png', alt: 'Fashion Photography', caption: 'CONTEMPORARY STYLE' },
    { src: '/lovable-uploads/03af1821-c1af-4197-9608-871ea5be3ab6.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/04f6a5f8-91e9-4568-84ae-63cac4830a52.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/060e27c9-b2d8-4f33-b575-794287894fd6.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/06e1e583-fc89-475d-bf22-b6d815ab75f0.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/0794cdb6-bc9e-4ebb-929f-5b25f66e2510.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/08c64276-3665-4346-a637-ca41acc6c602.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/0987daa0-e6fd-4914-b820-b8b235e70983.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/099f5b67-8ba8-4e5f-94a3-d2f14679b248.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/09ac1697-3757-47bf-84fa-5d922e1f1779.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/0b0fd9d9-1247-4010-835f-0e3030a64d12.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/1290de24-fbc4-4577-a048-fea0e3630a36.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/13e3124a-ebf5-4084-94fa-5b85aacda039.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/143c8aee-30ba-4159-9310-6003979f180d.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/1a35b5b2-6090-4718-9833-79a270346b20.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/1bb36c8a-ad7c-469a-bc03-92b007c271c3.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/1dac84ed-b80a-479f-937c-1beab4e1f12e.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/221ec5df-4792-4bc0-a0e4-a5d59ba23319.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/2301434b-9540-429b-b183-c3f01e585450.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/2523c649-4617-43c2-9e9e-ebf4ee328067.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/2688f2e4-7158-4784-bdc4-2d84ff3a124d.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/270d66ab-2bac-4d01-9396-368e98145c5a.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/28ccb7e7-ed7f-4185-ad8b-8bacc6443c8f.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/2ab4a1c7-225f-4632-ad1d-9183c8fb9f94.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/2b69e269-a0e1-4cd8-924c-4bd94a20fce5.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/3136d671-154b-44c1-9aff-065d21662ecc.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/3566a61b-2d58-4e4a-920f-b2f011f69289.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/35e9a46e-e427-4bac-a68b-dbbd510572a3.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/3773cab4-5d54-45b9-befe-7e8b70874496.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/37f4ae80-0bd4-4eae-8c84-a252aa263a64.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/3b2350e8-72d9-4325-bd13-a5b6ceec335f.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/3d46d1ef-3d6f-4cf4-b3e4-f62aa6b7323d.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/3d6135c5-bcb6-4b62-b41e-d24c20e4c726.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/3ffed44f-cebf-4d6d-ba06-86e21b470903.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/47c04841-2b95-4229-8bea-7e1c4925bafb.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/4a4d1d70-8ce9-4c45-b96c-f46b3bb46863.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/57f92a91-0c49-47d2-bfd9-47b19acdd8fa.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/5f1a4833-8606-47d0-8677-805cd81b2558.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/62b49f7c-4f73-4d92-881f-45f2809087b1.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/67b5c2bf-d1a3-44e4-af56-212f23e37262.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/69f2a872-9dde-4972-bb6a-e11577de7fec.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/6a95f17f-c979-43f4-9323-c4f01731a191.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/6e182ae2-52c2-4a1f-8a6a-0b1c3b9668ea.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/6eca5484-b022-4c34-8f5e-3f72e00faa0e.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/73dc6884-f3c8-4a35-b5f5-4b36c8cc8c36.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/7b8ac23d-ae24-49f1-ac75-35c074df73a9.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/7c28c520-783d-4733-ad48-9683204ef054.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/7c359110-2bfb-48e5-bcac-877116347f1a.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/7c6c25d5-48ef-4f79-8369-b5edab7ddc85.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/7cdb389a-0507-4d05-8782-18edd5afe814.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/7e6f1795-a59e-4783-851a-d0ee4db01887.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/7e96a5a9-0352-46e9-bac7-99e043ff36fe.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/7fc7338e-58f3-461a-aa6a-a7592f9ce82c.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/7fd459ed-d811-4770-a453-b6a7a36b0d43.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/80de2833-dbec-48e6-a25a-c8779bd528cd.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/8495ca3f-5792-435a-864c-99c380bd088c.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/866a8725-5cf5-417a-bd5f-acce3532066a.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/86a54898-0663-4d33-9cc9-a793f168d0ab.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/8bd9d861-1309-4142-9b59-3824b91eae8d.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/912d6d9c-e13f-42fe-8c9a-d5856be2a415.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/91897e71-3ba4-4556-8ea2-90b283f282a1.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/91b16668-debd-4e7b-9fab-e6200abfaa53.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/9bed3b4d-3641-4170-91ba-2765ea59db49.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/9cac59de-27c1-4b0a-8c2b-1d8333486e54.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/9da2302c-328a-4b71-a77c-3bab8685cdc3.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/a1c7a9f7-09e2-44b4-9dbb-d807b674060c.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/a279f373-675a-45d0-8695-6c986446600f.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/ae423683-fce8-4398-9f0a-df01c3ff0e83.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/b01a2064-f107-4a38-8c8f-d0e3c680f783.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/b4c42681-bbee-4882-8cb7-d652bb854191.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/b52c08e6-debc-40d4-90b8-8d7041c9f90d.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/b573482f-31ab-49e5-af48-586d9aeb6909.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/b580c5bf-f009-493f-b7a9-929c0c5d451d.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/b9fb39b5-808d-4840-9c78-6c58bf494129.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/bae52328-6f04-45a1-9c6a-a6508c6aa58c.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/bbbddcaa-c94f-4035-9aa8-16a225d5b527.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/bbc35ce3-6021-4e29-832e-1360f0ed92c6.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/bcbe9d80-3fd0-494c-a9e9-a4d5ab099c02.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/bcd80ca3-d60c-4596-9a71-4b8602583ff7.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/be107293-394e-46fd-9fcd-d1eb5781ff56.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/be7f5d35-71c0-4752-8fbe-46cd1a9e1fdd.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/c1af06d9-0cd3-4ce8-a226-ceb40a0401b6.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/c2476d8c-8e52-43a0-ac77-33d818c3fa2d.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/c279306c-86cb-49fe-a393-c5330888db34.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/c345b4c2-442d-4dc1-bf20-2c1856ad9e11.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/cb8752d5-fe3f-42d7-9622-18e35c9246ac.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/cc3dde2a-3f8c-4c40-b4b7-33cc0fd118e0.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/cd3eb066-6ffe-4e1e-9613-a1b067806092.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/cf3441c8-89ce-4867-bb10-e470db92db34.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/d0aa1656-0697-40c8-aad3-a3756945228a.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/d0c57cf0-4228-4e1e-8c62-5cf93ca380a5.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/d1ac41f4-eab2-40c7-8c53-61d619ab77c3.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/db51011f-18fe-4e40-8977-b0b6a211a396.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/e06927fa-9c52-4746-895c-f21667b0197e.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/e302a6bd-9a35-4c62-924e-5f14e4e2d241.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/e30bcff1-8487-49cd-89f3-464e539e26c3.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/e389849f-bd51-4a3e-9216-8caae91b3918.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/e77a133d-1646-4526-b10a-5569563b698e.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/e846a586-047a-4535-9d2e-ab304f4ba711.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/e8cb69bc-d69a-44f0-9d6d-54cff80fa950.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/ecbcbd53-9cdd-4cf2-8b68-7ff06c3d41fe.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/efc5e7d1-a1bd-4aae-8d8e-a080b6534e21.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/f095547d-4221-4aca-8d70-0ecae5119552.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/f17266df-16a1-4edd-8581-23b10bdb2eda.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/f36a817e-cd75-4d0b-a900-ce69f01e6afb.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/fbeb876e-8eb3-40e4-8481-eb136e709b02.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/fc28b095-8088-4cce-a86f-541d6febaf86.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png', alt: 'Fashion Photography', caption: 'FASHION' },
    { src: '/lovable-uploads/ffaad10e-ef84-4236-bc74-370ddacc394b.png', alt: 'Fashion Photography', caption: 'FASHION' }
  ];

  const displayImages = (title === 'FASHION' || window.location.pathname.includes('luxury-fashion-photography-nyc') || window.location.pathname.includes('/portfolio/fashion')) ? fashionImages : images;
  return (
    <Layout>
      <div className="min-h-screen bg-black">
        {/* Back to Portfolios Link - Fixed position */}
        <div className="fixed top-24 left-4 z-10">
          <Link 
            to="/portfolio" 
            className="inline-flex items-center text-photo-red hover:text-white transition-colors duration-300 text-lg bg-black/80 backdrop-blur px-3 py-1 rounded"
          >
            <span className="mr-2">←</span>
            Back to Portfolios
          </Link>
        </div>

        {/* Title - Fixed position */}
        <div className="fixed top-0 left-0 right-0 z-10 bg-black/90 backdrop-blur pt-16 pb-4">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-wide text-center">
            {title}
          </h1>
        </div>

        {/* Full-width simple 4-column grid - original image ratios */}
        <div className="pt-32 grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2">
          {displayImages.map((image, index) => (
            <div key={index} className="relative group overflow-hidden cursor-pointer">
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {/* Copyright Notice - Fixed at bottom */}
        <div className="fixed bottom-4 left-0 right-0 text-center z-10">
          <p className="text-white/60 text-sm tracking-wide bg-black/80 backdrop-blur inline-block px-4 py-2 rounded">
            © 2025 Jeff Honforloco Photography. All rights reserved.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default DefaultPortfolio;