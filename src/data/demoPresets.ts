import { FoodAnalysisRequest } from '../types';

export interface DemoPreset {
  id: string;
  title: string;
  subtitle: string;
  categoryBadge: string;
  expectedStatus: string;
  accentColor: string;
  request: FoodAnalysisRequest;
  sampleImageSvg: string;
}

// Crisp inline SVGs for demo presets so they look gorgeous and load instantaneously without external dependencies
export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: 'demo_apple',
    title: 'Fresh Honeycrisp Apple',
    subtitle: 'Refrigerated crisper, 2 days stored',
    categoryBadge: 'Fruits',
    expectedStatus: 'Fresh (Score ~90)',
    accentColor: 'emerald',
    sampleImageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="%23f7fee7"/><circle cx="200" cy="165" r="90" fill="%23dc2626"/><circle cx="225" cy="145" r="70" fill="%23ef4444"/><ellipse cx="170" cy="130" rx="30" ry="15" fill="%23fca5a5" opacity="0.6"/><path d="M200,80 Q205,50 220,40" stroke="%2378350f" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M210,55 Q240,45 250,65 Q230,75 210,55 Z" fill="%2316a34a"/></svg>`,
    request: {
      food_name: 'Honeycrisp Apple',
      food_category: 'Fruits',
      storage_temperature: 4,
      storage_duration: 2,
      storage_method: 'Refrigerator',
      purchase_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      observations: {
        unusual_smell: false,
        slimy_texture: false,
        visible_mold: false,
        color_change: false,
      },
      is_demo: true,
    }
  },
  {
    id: 'demo_banana',
    title: 'Aging Cavendish Banana',
    subtitle: 'Room temperature, 6 days stored',
    categoryBadge: 'Fruits',
    expectedStatus: 'Aging / Use Soon (Score ~52)',
    accentColor: 'amber',
    sampleImageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="%23fffbeb"/><path d="M110,210 Q190,260 290,160 Q240,110 110,210 Z" fill="%23eab308"/><circle cx="160" cy="200" r="7" fill="%23713f12" opacity="0.75"/><circle cx="210" cy="185" r="10" fill="%23713f12" opacity="0.75"/><circle cx="240" cy="160" r="8" fill="%23713f12" opacity="0.75"/><circle cx="185" cy="195" r="5" fill="%23713f12" opacity="0.6"/><path d="M110,210 L95,225" stroke="%23713f12" stroke-width="8" stroke-linecap="round"/><path d="M290,160 L310,145" stroke="%2315803d" stroke-width="8" stroke-linecap="round"/></svg>`,
    request: {
      food_name: 'Cavendish Banana',
      food_category: 'Fruits',
      storage_temperature: 21,
      storage_duration: 6,
      storage_method: 'Room Temperature',
      purchase_date: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
      observations: {
        unusual_smell: false,
        slimy_texture: false,
        visible_mold: false,
        color_change: true,
      },
      is_demo: true,
    }
  },
  {
    id: 'demo_chicken',
    title: 'Raw Chicken Breast',
    subtitle: 'Chilled at 3°C, 2 days stored',
    categoryBadge: 'Meat',
    expectedStatus: 'Mostly Fresh (Score ~74)',
    accentColor: 'sky',
    sampleImageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="%23f0f9ff"/><ellipse cx="200" cy="150" rx="100" ry="60" fill="%23fbcfe8" transform="rotate(-10 200 150)"/><ellipse cx="190" cy="145" rx="80" ry="45" fill="%23fda4af" opacity="0.8" transform="rotate(-10 200 150)"/><path d="M150,130 Q190,150 230,135" stroke="%23fff" stroke-width="3" fill="none" opacity="0.7"/></svg>`,
    request: {
      food_name: 'Chicken Breast Cutlet',
      food_category: 'Meat',
      storage_temperature: 3,
      storage_duration: 2,
      storage_method: 'Refrigerator',
      purchase_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      observations: {
        unusual_smell: false,
        slimy_texture: false,
        visible_mold: false,
        color_change: false,
      },
      is_demo: true,
    }
  },
  {
    id: 'demo_bread',
    title: 'Spoiled Artisan Bread',
    subtitle: 'Room temp 23°C, 8 days, green mold',
    categoryBadge: 'Bakery',
    expectedStatus: 'Likely Spoiled (Score ~19)',
    accentColor: 'rose',
    sampleImageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="%23fff1f2"/><path d="M120,190 C110,120 290,120 280,190 Z" fill="%23d97706"/><rect x="110" y="190" width="180" height="40" rx="6" fill="%23b45309"/><circle cx="160" cy="155" r="14" fill="%23065f46"/><circle cx="163" cy="157" r="10" fill="%23047857"/><circle cx="210" cy="140" r="16" fill="%23065f46"/><circle cx="212" cy="142" r="12" fill="%2310b981"/><circle cx="245" cy="170" r="10" fill="%23065f46"/><circle cx="185" cy="175" r="8" fill="%23047857"/></svg>`,
    request: {
      food_name: 'Artisan Sourdough Loaf',
      food_category: 'Bakery',
      storage_temperature: 23,
      storage_duration: 8,
      storage_method: 'Room Temperature',
      purchase_date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
      observations: {
        unusual_smell: true,
        slimy_texture: false,
        visible_mold: true,
        color_change: true,
      },
      is_demo: true,
    }
  },
  {
    id: 'demo_rice',
    title: 'Warm Leftover Cooked Rice',
    subtitle: 'Danger zone 25°C, 1.5 days stored',
    categoryBadge: 'Cooked Food',
    expectedStatus: 'High Spoilage Risk (Score ~22)',
    accentColor: 'orange',
    sampleImageSvg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300"><rect width="400" height="300" fill="%23fff7ed"/><ellipse cx="200" cy="190" rx="90" ry="35" fill="%23d6d3d1"/><path d="M120,180 C120,110 280,110 280,180 Z" fill="%23e7e5e4"/><ellipse cx="195" cy="140" rx="40" ry="20" fill="%23f5f5f4"/><circle cx="170" cy="135" r="4" fill="%23a8a29e"/><circle cx="210" cy="150" r="5" fill="%23a8a29e"/><path d="M180,90 Q170,70 185,55" stroke="%23f97316" stroke-width="3" fill="none" opacity="0.6"/><path d="M210,95 Q225,75 215,60" stroke="%23f97316" stroke-width="3" fill="none" opacity="0.6"/></svg>`,
    request: {
      food_name: 'Steamed Jasmine Rice',
      food_category: 'Cooked Food',
      storage_temperature: 25,
      storage_duration: 2,
      storage_method: 'Room Temperature',
      purchase_date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      observations: {
        unusual_smell: true,
        slimy_texture: true,
        visible_mold: false,
        color_change: false,
      },
      is_demo: true,
    }
  }
];
