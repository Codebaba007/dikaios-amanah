/**
 * Category-mapped business imagery for the marketplace.
 *
 * The backend does not store images, so the frontend derives a
 * category-appropriate photo from the business industry / campaign text.
 * Every image ships with a graceful fallback and descriptive alt text.
 * No campaign records are invented — imagery is purely thematic.
 */

/* Stable, publicly accessible Unsplash photo CDN URLs. */
const IMAGES = {
  agriculture: {
    src: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=65',
    alt: 'Sunlit farmland with rows of crops ready for harvest'
  },
  food: {
    src: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&w=1200&q=65',
    alt: 'Fresh food being prepared in a commercial kitchen'
  },
  textile: {
    src: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=65',
    alt: 'Finished garments on hangers in a clothing workshop'
  },
  manufacturing: {
    src: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=65',
    alt: 'Industrial manufacturing floor with workers and machinery'
  },
  retail: {
    src: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=1200&q=65',
    alt: 'Warmly lit small retail shop interior'
  },
  logistics: {
    src: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=65',
    alt: 'Wide warehouse aisle with shelving and stacked goods'
  },
  technology: {
    src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=65',
    alt: 'Small technology team collaborating around laptops'
  },
  construction: {
    src: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=65',
    alt: 'Construction site with crew and scaffolded building'
  },
  beauty: {
    src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=65',
    alt: 'Beautician arranging tools in a salon workspace'
  },
  education: {
    src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=65',
    alt: 'Adult learners in a training classroom'
  },
  health: {
    src: 'https://images.unsplash.com/photo-1580281658223-9b93f18ae9ae?auto=format&fit=crop&w=1200&q=65',
    alt: 'Pharmacist selecting stock from a pharmacy shelf'
  },
  fisheries: {
    src: 'https://images.unsplash.com/photo-1510130387422-82bed34b37e9?auto=format&fit=crop&w=1200&q=65',
    alt: 'Fresh fish prepared for sale on a wooden table'
  },
  artisan: {
    src: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=65',
    alt: 'Craftsperson working with hand tools at a workbench'
  },
  hero: {
    src: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=65',
    alt: 'A business team reviewing plans together in a bright workspace'
  },
  heroAuth: {
    src: 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?auto=format&fit=crop&w=1200&q=65',
    alt: 'Professional working with financial documents'
  },
  trust: {
    src: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=65',
    alt: 'Financial documents and charts on a desk'
  },
  process: {
    src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=65',
    alt: 'Entrepreneur reviewing documents at a desk'
  },
  shariah: {
    src: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=1200&q=65',
    alt: 'Mosque with a geometric dome at sunset'
  }
};

/* Keyword matching so arbitrary text ("Rahman Garments Ltd.") still resolves. */
const MATCHERS = [
  [/agri|farm|crop|dairy|poultry|ranch|seed|fertiliz|harvest/, 'agriculture'],
  [/food|baker|restaurant|cafe|cater|kitchen|snack|spice|grocer/, 'food'],
  [/textile|garment|apparel|fashion|tailor|fabr|sewing|clothing|loom/, 'textile'],
  [/manufact|factory|industr|machine|metal|furniture|wood|furnish|plastic|engineer/, 'manufacturing'],
  [/retail|shop|store|market|super|wholesale|trading|e-?commerce/, 'retail'],
  [/logist|warehouse|transport|truck|shipping|cargo|freight|delivery|courier/, 'logistics'],
  [/tech|software|digital|data|it |it-|comput|app|web|cloud|startup/, 'technology'],
  [/construct|builder|contractor|cement|brick|real ?estate|housing/, 'construction'],
  [/beauty|salon|spa|cosmetic|parlor|grooming|barber/, 'beauty'],
  [/educat|school|academ|training|tuition|institut/, 'education'],
  [/health|clinic|pharma|medical|hospital|diagnostic|wellness/, 'health'],
  [/fish|shrimp|aquacultur|marine|hatchery/, 'fisheries'],
  [/craft|artisan|handicraft|pottery|weav|bamboo|jute/, 'artisan'],
  [/rice|mango|honey|tea|coffee|organic/, 'food'],
  [/tailor|woven|denim|knit/, 'textile']
];

const DEFAULT_IMAGE = IMAGES.artisan;

/** Direct access to a curated named image (hero, trust, process, shariah…). */
export function getImage(key) {
  return IMAGES[key] || DEFAULT_IMAGE;
}

/** Resolve an image descriptor for arbitrary industry / campaign text. */
export function resolveImage(...texts) {
  const text = texts.filter(Boolean).join(' ').toLowerCase();
  for (const [pattern, key] of MATCHERS) {
    if (pattern.test(text)) return IMAGES[key];
  }
  return DEFAULT_IMAGE;
}

/** Convenience wrapper: `{ src, alt, themeKey }` for a business + optional title. */
export function industryImage(industry, campaignTitle = '') {
  const image = resolveImage(industry, campaignTitle);
  const label = [industry, campaignTitle].filter(Boolean).join(' — ');
  return { ...image, label };
}
