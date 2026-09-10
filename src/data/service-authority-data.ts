import metadata from './service-authority-meta.json';
import { ACQUISITION_SERVICE_PAGES, type AcquisitionGalleryImage } from './acquisition-service-data';

export type ServiceAuthorityPage = {
  path: string;
  title: string;
  description: string;
  image: string;
  eyebrow: string;
  h1: string;
  introduction: string;
  audienceTitle: string;
  audiences: string[];
  processTitle: string;
  process: Array<{ title: string; text: string }>;
  deliverablesTitle: string;
  deliverables: string[];
  pricingCopy: string;
  pricingService: string;
  portfolioPath: string;
  portfolioLabel: string;
  secondaryTitle: string;
  secondaryCopy: string[];
  faqs: Array<{ question: string; answer: string }>;
  imageAlt: string;
  galleryTitle?: string;
  gallery?: readonly AcquisitionGalleryImage[];
};

const metaByPath = Object.fromEntries(metadata.map((item) => [item.path, item]));
const meta = (path: string) => {
  const item = metaByPath[path];
  if (!item) throw new Error(`Missing service authority metadata for ${path}`);
  return item;
};

export const SERVICE_AUTHORITY_PAGES: ServiceAuthorityPage[] = [
  {
    ...meta('/providence-headshot-photographer'),
    eyebrow: 'Providence, Rhode Island',
    h1: 'Providence Headshot Photographer',
    introduction: 'Professional headshots should make it easy for people to recognize your role, your confidence and your personality. Jeff Honforloco creates individual and team headshots for executives, founders, LinkedIn profiles, company websites and creative professionals. Sessions can be produced in studio or on location in Providence and across Rhode Island, with direction throughout so you never have to guess what to do in front of the camera.',
    audienceTitle: 'Headshots built for where they will be used',
    audiences: [
      'Executives and founders updating leadership profiles',
      'Professionals who need a current LinkedIn image',
      'Corporate teams requiring a consistent visual standard',
      'Actors, artists and creative professionals who need personality as well as polish',
      'Individuals building a personal brand or professional website',
    ],
    processTitle: 'A clear, directed headshot process',
    process: [
      { title: 'Plan the use', text: 'We start with where the photographs will appear, the visual tone you need, the number of people and whether studio or on-location production fits best.' },
      { title: 'Prepare the look', text: 'Wardrobe, background and multiple-look needs are aligned before the session. The site prep guide offers practical wardrobe and styling guidance.' },
      { title: 'Photograph with direction', text: 'Jeff provides professional posing and expression coaching, with lighting selected to keep the result polished and recognizably yours.' },
      { title: 'Select and receive', text: 'Depending on the package, final images are professionally edited or individually retouched and delivered through a private or online gallery.' },
    ],
    deliverablesTitle: 'Individual and corporate options',
    deliverables: [
      'Studio or on-location sessions for individuals',
      'Multiple looks and a LinkedIn-optimized crop in the Professional package',
      'On-location team coordination for an efficient company workflow',
      'Multiple background and lighting options for corporate teams',
      'High-resolution retouched files and commercial usage licensing for team projects',
    ],
    pricingCopy: 'Published individual headshot sessions begin at $499. The Professional package begins at $1,100 and includes multiple looks, 12 edited images and a LinkedIn-optimized crop. Corporate team headshots start at $3,500 and are tailored to team size, location, scheduling, image requirements and production complexity.',
    pricingService: 'headshots',
    portfolioPath: '/portfolios/headshots',
    portfolioLabel: 'View the headshot portfolio',
    secondaryTitle: 'Serving professionals and teams in Providence',
    secondaryCopy: [
      'Providence is the studio home base, making the city a practical starting point for individual sessions and coordinated team photography. On-location production can bring a consistent headshot setup to an office, while studio sessions give individuals room to explore multiple looks.',
      'For a faster proposal, include the intended use, preferred date, number of people, location and any background requirements in your booking request. If you are still comparing options, review the published packages before you inquire.',
    ],
    faqs: [
      { question: 'Do you offer professional headshots in Providence?', answer: 'Yes. Jeff Honforloco Photography is based in Providence and offers professional individual and corporate team headshots in studio or on location.' },
      { question: 'Can you photograph a corporate team at our office?', answer: 'Yes. The corporate team option includes on-location photography, team coordination, posing and expression coaching, and multiple background and lighting options.' },
      { question: 'Are LinkedIn headshots available?', answer: 'Yes. The Professional headshot package includes a LinkedIn-optimized crop, and the session can be planned around your wider professional profile needs.' },
      { question: 'How much does a Providence headshot session cost?', answer: 'Published individual packages begin at $499. The Professional package begins at $1,100, while corporate team work starts at $3,500 and is customized to project scope.' },
    ],
    imageAlt: 'Professional executive headshot by Providence photographer Jeff Honforloco',
  },
  {
    ...meta('/providence-fashion-photographer'),
    eyebrow: 'Providence & New England',
    h1: 'Providence Fashion Photographer',
    introduction: 'Jeff Honforloco creates fashion photography for models, designers, influencers and creative brands in Providence, throughout Rhode Island and across New England. The work can support a model portfolio, designer collection, editorial story or full campaign. Each production begins with the intended audience and visual direction, then brings together lighting, location, styling and movement around that goal.',
    audienceTitle: 'Fashion work for talent, designers and brands',
    audiences: [
      'Models building or updating a focused portfolio',
      'Designers presenting a collection or signature look',
      'Creative brands producing campaign and social assets',
      'Influencers who need editorial-quality content',
      'Stylists and creative teams developing a visual story',
    ],
    processTitle: 'From concept to campaign assets',
    process: [
      { title: 'Define the objective', text: 'Portfolio, collection and campaign shoots have different needs. The first step is clarifying the audience, format and final use.' },
      { title: 'Build the visual direction', text: 'Depending on package scope, planning may include moodboard alignment, styling direction, location scouting and a production team.' },
      { title: 'Direct the set', text: 'Jeff directs pose, movement and lighting so every look supports the same creative language while still giving the final gallery range.' },
      { title: 'Deliver for the channel', text: 'Published packages range from concise edited galleries to full campaign production with multi-platform asset delivery.' },
    ],
    deliverablesTitle: 'Scalable fashion production',
    deliverables: [
      'Starter portfolio sessions with one look and six edited images',
      'Multiple-look sessions with location scouting and styling direction',
      'Full-day campaign production with creative direction and a production team',
      'Edited galleries suited to portfolio, campaign and multi-platform use',
      'Travel availability across Rhode Island, Massachusetts, Connecticut and Maine',
    ],
    pricingCopy: 'Fashion sessions begin at $499. The Standard package begins at $1,800 and includes multiple looks, location scouting and styling direction. Full Campaign work is custom scoped around the production, team and asset requirements.',
    pricingService: 'fashion',
    portfolioPath: '/portfolios/fashion',
    portfolioLabel: 'Explore the fashion portfolio',
    secondaryTitle: 'One Providence page for the wider New England market',
    secondaryCopy: [
      'Providence is the home base, with published availability across Rhode Island, Massachusetts, Connecticut and Maine. Keeping regional fashion information here gives visitors one authoritative place to understand the service without creating duplicate city pages that compete for the same search intent.',
      'Share your collection, moodboard, number of looks, intended usage and preferred location when you inquire. Those details help determine whether a focused session or a larger campaign production is the right fit.',
    ],
    faqs: [
      { question: 'Do you photograph fashion campaigns in Providence?', answer: 'Yes. Fashion services range from individual portfolio sessions to full-day campaign productions for designers and creative brands.' },
      { question: 'Can you travel for a New England fashion shoot?', answer: 'Yes. Jeff is based in Providence and publishes availability across Rhode Island, Massachusetts, Connecticut and Maine, subject to scheduling and project scope.' },
      { question: 'Can you help with creative direction?', answer: 'Yes. Creative direction, moodboards, location scouting and styling direction are included at different published package levels.' },
      { question: 'What does fashion photography cost?', answer: 'Published fashion sessions begin at $499, the Standard package begins at $1,800, and full campaign productions are custom quoted.' },
    ],
    imageAlt: 'Red gown fashion editorial photographed in Providence by Jeff Honforloco',
  },
  {
    ...meta('/providence-beauty-photographer'),
    eyebrow: 'Providence, Rhode Island',
    h1: 'Providence Beauty Photographer',
    introduction: 'Beauty photography is about detail: expression, skin, makeup, texture, color and the way light defines them. Jeff Honforloco produces beauty portraits in Providence for personal brands, cosmetics and skincare work, makeup artists and editorial concepts. Sessions are planned around a clear look, then photographed and retouched to feel polished while preserving the character of the subject.',
    audienceTitle: 'Beauty images with a defined purpose',
    audiences: [
      'Personal brands seeking polished, recognizable portraits',
      'Cosmetics and skincare teams creating product-led imagery',
      'Makeup artists documenting technique and creative concepts',
      'Actors, artists and entertainers developing promotional work',
      'Editorial teams building a beauty story around color, texture or styling',
    ],
    processTitle: 'Detail-led planning and production',
    process: [
      { title: 'Choose the concept', text: 'The intended use, number of looks and visual references establish whether the session should feel natural, graphic, commercial or editorial.' },
      { title: 'Coordinate preparation', text: 'Jeff provides hair and makeup coordination guidance in the published Standard package and aligns the lighting and background with the concept.' },
      { title: 'Refine on set', text: 'Close attention to pose, hands, expression, makeup and reflected light keeps every frame intentional at beauty-photography distance.' },
      { title: 'Retouch with purpose', text: 'Published packages include professionally retouched images, with high-resolution or magazine-ready output at the relevant package levels.' },
    ],
    deliverablesTitle: 'Beauty packages for one look or a full story',
    deliverables: [
      'One-concept starter sessions with six retouched images',
      'Two-look sessions with hair and makeup coordination guidance',
      'Full editorial sessions with multiple looks and moodboard direction',
      'High-resolution files or magazine-ready output by package',
      'Online gallery delivery for reviewing the finished work',
    ],
    pricingCopy: 'Beauty photography begins at $499 for a one-hour, one-concept session. The Standard package begins at $1,400 with two looks and 10 retouched images. Full Editorial beauty work begins at $3,200 and includes multiple concepts, moodboard direction and magazine-ready output.',
    pricingService: 'beauty',
    portfolioPath: '/portfolios/beauty',
    portfolioLabel: 'View the beauty portfolio',
    secondaryTitle: 'Planning a Providence beauty session',
    secondaryCopy: [
      'A useful inquiry explains what the images need to accomplish, how many looks you have in mind and whether a product, makeup design or personal brand is driving the concept. Reference images are helpful when they communicate light, color or mood rather than asking to duplicate another creator’s work.',
      'The portfolio shows a range from natural beauty to graphic editorial concepts. Review it alongside pricing, then use the booking form to share the preferred date and production details.',
    ],
    faqs: [
      { question: 'Who books beauty photography in Providence?', answer: 'Beauty sessions are designed for personal brands, cosmetics and skincare work, makeup artists, entertainers and editorial concepts.' },
      { question: 'Is professional retouching included?', answer: 'Yes. Every published beauty package includes professionally retouched images, with the number and output format depending on the selected package.' },
      { question: 'Can you help coordinate hair and makeup?', answer: 'The Standard package includes hair and makeup coordination guidance. Share your concept and team needs when requesting a session.' },
      { question: 'How much is a beauty photography session?', answer: 'Published beauty packages begin at $499. Standard begins at $1,400, and Full Editorial begins at $3,200.' },
    ],
    imageAlt: 'Editorial beauty portrait with blue liner by Providence photographer Jeff Honforloco',
  },
  {
    ...meta('/providence-commercial-photographer'),
    eyebrow: 'Brand & Organization Photography',
    h1: 'Providence Commercial Photographer',
    introduction: 'Commercial photography should begin with the business use, not just the shoot day. Jeff Honforloco works with brands and organizations in Providence on campaign imagery, brand photography, executive portraits and coordinated visual productions. The exact scope is built from the audience, channels, number of assets, people, locations and usage requirements.',
    audienceTitle: 'Commercial imagery aligned to the brief',
    audiences: [
      'Brands planning a fashion, beauty or editorial campaign',
      'Companies updating leadership and team photography',
      'Creative directors assembling a coordinated production',
      'Founders building a consistent personal and company presence',
      'Organizations that need assets across several platforms',
    ],
    processTitle: 'A scope-first commercial workflow',
    process: [
      { title: 'Clarify the business goal', text: 'The inquiry should identify the audience, channels, required assets, timing and the role the photography plays in the wider campaign.' },
      { title: 'Define production scope', text: 'Locations, talent, looks, backgrounds, creative direction and team coordination are matched to the selected service and package.' },
      { title: 'Produce consistently', text: 'Lighting, direction and review on set keep individual images connected to the same visual standard across a campaign or team.' },
      { title: 'Deliver to requirements', text: 'Final output can include high-resolution retouched images, multi-platform campaign assets or commercial usage licensing where published in the selected package.' },
    ],
    deliverablesTitle: 'Commercial work can combine proven services',
    deliverables: [
      'Fashion campaign photography with multi-platform asset delivery',
      'Beauty and editorial concepts with moodboard and creative direction',
      'Executive and corporate team headshots produced on location',
      'Consistent lighting and backgrounds for organization-wide portraits',
      'Custom scoping based on the production and usage requirements',
    ],
    pricingCopy: 'Commercial projects are scoped through the relevant published service. Fashion campaigns, full editorial productions and organization-wide headshots are custom quoted; individual and smaller-session starting prices remain visible on the pricing page. Your proposal will depend on the chosen service, team, locations, scheduling, assets and usage needs.',
    pricingService: 'fashion',
    portfolioPath: '/portfolios/editorial',
    portfolioLabel: 'Review campaign and editorial work',
    secondaryTitle: 'What to include in a commercial inquiry',
    secondaryCopy: [
      'Share the brand or organization, intended audience, where the images will run, preferred date, location, number of people or looks and the deliverables you already know you need. If the creative direction is still open, explain the business outcome and the references that feel relevant.',
      'Jeff can then connect the request to the appropriate fashion, beauty, editorial or corporate headshot workflow. This page does not invent a generic commercial package; it makes the underlying production choices and conversion path clear.',
    ],
    faqs: [
      { question: 'What commercial photography do you offer in Providence?', answer: 'Commercial work can include fashion and beauty campaigns, editorial brand imagery, executive portraits and coordinated corporate team headshots.' },
      { question: 'Are commercial projects custom quoted?', answer: 'Larger campaigns and corporate productions are custom quoted according to service, team, location, schedule, asset and usage requirements.' },
      { question: 'Can one production create assets for several platforms?', answer: 'Yes. The published Full Campaign fashion package includes multi-platform asset delivery, with final scope confirmed in the proposal.' },
      { question: 'How do I request a commercial proposal?', answer: 'Use the booking form and include the audience, channels, date, location, people or looks, deliverables and usage needs.' },
    ],
    imageAlt: 'Fashion campaign image for commercial photography clients in Providence',
  },
  {
    ...meta('/rhode-island-editorial-photographer'),
    eyebrow: 'Providence & Rhode Island',
    h1: 'Rhode Island Editorial Photographer',
    introduction: 'Editorial photography turns a concept into a connected visual story. From a Providence home base, Jeff Honforloco works with publications, brands, creative teams and models on editorial productions across Rhode Island. The process can include a concept brief, moodboard, location scouting, creative direction and a final set of print-ready images, depending on the selected package.',
    audienceTitle: 'Editorial work for stories, portfolios and campaigns',
    audiences: [
      'Publications developing a visual feature',
      'Brands using editorial storytelling within a campaign',
      'Creative directors and stylists building a concept-led series',
      'Models adding a cohesive story to an established portfolio',
      'Artists and personal brands who need more than a conventional portrait',
    ],
    processTitle: 'Concept first, then every production choice',
    process: [
      { title: 'Write the brief', text: 'The starting point is the story: subject, audience, intended use, mood and the final number or type of images required.' },
      { title: 'Develop the world', text: 'Published package options can include moodboard direction, location scouting, multiple locations and coordination with a full creative team.' },
      { title: 'Photograph the sequence', text: 'Direction on set keeps wardrobe, pose, light, location and expression serving the same narrative rather than producing disconnected frames.' },
      { title: 'Finish for publication', text: 'The final gallery ranges from editorial-grade selects to 20 or more images with print-ready output for a full-day production.' },
    ],
    deliverablesTitle: 'Editorial scope from brief to full production',
    deliverables: [
      'Focused sessions with a concept brief and five editorial-grade images',
      'Moodboard direction and location scouting in the Standard package',
      'Full-day, multi-location options with a creative team',
      'High-resolution and print-ready delivery by package',
      'Providence-based availability across Rhode Island',
    ],
    pricingCopy: 'Editorial sessions begin at $499. The Standard package begins at $2,200 and includes moodboard direction, location scouting and 10 editorial images. Full Editorial production is custom quoted for a full day, creative team, multiple locations and 20 or more final images.',
    pricingService: 'editorial',
    portfolioPath: '/portfolios/editorial',
    portfolioLabel: 'Explore the editorial portfolio',
    secondaryTitle: 'Editorial photography across Rhode Island',
    secondaryCopy: [
      'A Providence base makes it possible to plan studio and location-led work across the state while keeping one clear editorial service page. The location should strengthen the concept, whether the story calls for an urban, coastal, interior or controlled studio setting.',
      'Start with the concept and final use, then share any publication requirements, deadlines, team members and location ideas. Jeff can help determine which published package matches the scale of the story.',
    ],
    faqs: [
      { question: 'Do you photograph editorial projects across Rhode Island?', answer: 'Yes. Jeff is based in Providence and offers editorial photography across Rhode Island, subject to location and scheduling.' },
      { question: 'Can you help develop an editorial concept?', answer: 'Yes. Published editorial packages can include a concept brief, moodboard direction, location scouting, creative direction and a full creative team.' },
      { question: 'Is editorial photography available for brands?', answer: 'Yes. Editorial services are intended for publications, brands, campaigns, creative teams and established model portfolios.' },
      { question: 'What does an editorial session cost?', answer: 'Published editorial sessions begin at $499. Standard begins at $2,200, while full-day editorial production is custom quoted.' },
    ],
    imageAlt: 'Moody editorial portrait photographed in Rhode Island by Jeff Honforloco',
  },
  ...ACQUISITION_SERVICE_PAGES,
];

export const SERVICE_AUTHORITY_BY_PATH = Object.fromEntries(
  SERVICE_AUTHORITY_PAGES.map((page) => [page.path, page]),
) as Record<string, ServiceAuthorityPage>;

export const SERVICE_AUTHORITY_LINKS = SERVICE_AUTHORITY_PAGES.map(({ path, h1 }) => ({
  path,
  label: h1.replace(' Photographer', ''),
}));
