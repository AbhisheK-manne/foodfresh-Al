import { FoodCategory, StorageMethod } from '../src/types';

export interface FoodProfile {
  idealTempMin: number; // °C
  idealTempMax: number; // °C
  idealMethod: StorageMethod;
  typicalFridgeShelfLifeDays: number;
  typicalRoomTempShelfLifeDays: number;
  typicalFreezerShelfLifeDays: number;
  temperatureSensitivity: 'low' | 'moderate' | 'high' | 'critical';
  primarySpoilageRisks: string[];
  categoryNotes: string;
}

export const CATEGORY_PROFILES: Record<FoodCategory, FoodProfile> = {
  'Fruits': {
    idealTempMin: 3,
    idealTempMax: 10,
    idealMethod: 'Refrigerator',
    typicalFridgeShelfLifeDays: 10,
    typicalRoomTempShelfLifeDays: 5,
    typicalFreezerShelfLifeDays: 180,
    temperatureSensitivity: 'moderate',
    primarySpoilageRisks: ['Browning & sugar breakdown', 'Surface mold colonies', 'Bruising & softening', 'Shriveling / moisture loss'],
    categoryNotes: 'Temperate fruits (apples, berries) thrive in cold refrigeration; some tropical fruits (bananas, mangoes) chill-injure below 10°C but soften quickly at room temperature.'
  },
  'Vegetables': {
    idealTempMin: 2,
    idealTempMax: 6,
    idealMethod: 'Refrigerator',
    typicalFridgeShelfLifeDays: 7,
    typicalRoomTempShelfLifeDays: 3,
    typicalFreezerShelfLifeDays: 240,
    temperatureSensitivity: 'high',
    primarySpoilageRisks: ['Leaf wilting', 'Bacterial soft rot', 'Mold growth', 'Yellowing / chlorophyll degradation'],
    categoryNotes: 'High moisture and humidity requirements; leafy greens deteriorate rapidly above 8°C. Tubers (potatoes, onions) prefer cool dark storage over cold humidity.'
  },
  'Meat': {
    idealTempMin: 0,
    idealTempMax: 4,
    idealMethod: 'Refrigerator',
    typicalFridgeShelfLifeDays: 3,
    typicalRoomTempShelfLifeDays: 0.5,
    typicalFreezerShelfLifeDays: 180,
    temperatureSensitivity: 'critical',
    primarySpoilageRisks: ['Myoglobin oxidation (gray/greenish tone)', 'Pseudomonas bacterial slime', 'Putrid off-odors', 'Pathogenic bacterial growth (Salmonella, E. coli) in danger zone'],
    categoryNotes: 'High-risk category. Must remain below 4°C at all times. Raw poultry and ground meat have a narrow 1–2 day fresh window after purchase.'
  },
  'Fish': {
    idealTempMin: -1,
    idealTempMax: 3,
    idealMethod: 'Refrigerator',
    typicalFridgeShelfLifeDays: 2,
    typicalRoomTempShelfLifeDays: 0.25,
    typicalFreezerShelfLifeDays: 120,
    temperatureSensitivity: 'critical',
    primarySpoilageRisks: ['Flesh softening & discoloration', 'Trimethylamine volatile fishy odor', 'Surface stickiness', 'Histamine formation in scombroid species'],
    categoryNotes: 'Extreme perishable profile. Highly sensitive to psychrophilic bacteria and enzymatic autodigestion. Best kept on shaved ice or cold zone of refrigerator.'
  },
  'Dairy': {
    idealTempMin: 1,
    idealTempMax: 4,
    idealMethod: 'Refrigerator',
    typicalFridgeShelfLifeDays: 7,
    typicalRoomTempShelfLifeDays: 0.5,
    typicalFreezerShelfLifeDays: 90,
    temperatureSensitivity: 'critical',
    primarySpoilageRisks: ['Lactic curdling & whey separation', 'Sour odor & acidic flavor', 'Surface mold (cheeses)', 'Bacterial proliferation'],
    categoryNotes: 'Milk and soft cheeses degrade exponentially when left in room temperature. Hard cheeses tolerate longer aging but susceptible to surface fungal contamination.'
  },
  'Bakery': {
    idealTempMin: 18,
    idealTempMax: 22,
    idealMethod: 'Room Temperature',
    typicalFridgeShelfLifeDays: 5,
    typicalRoomTempShelfLifeDays: 4,
    typicalFreezerShelfLifeDays: 90,
    temperatureSensitivity: 'low',
    primarySpoilageRisks: ['Mold spots (Penicillium, Rhizopus)', 'Starch retrogradation (staleness)', 'Crumb drying', 'Yeast souring'],
    categoryNotes: 'Standard bread stales faster in refrigerator temperatures (4°C) due to accelerated starch retrogradation; room temperature is ideal for short-term texture, freezing for long-term.'
  },
  'Cooked Food': {
    idealTempMin: 1,
    idealTempMax: 4,
    idealMethod: 'Refrigerator',
    typicalFridgeShelfLifeDays: 3.5,
    typicalRoomTempShelfLifeDays: 0.2, // Danger zone!
    typicalFreezerShelfLifeDays: 90,
    temperatureSensitivity: 'critical',
    primarySpoilageRisks: ['Bacillus cereus spore germination in cooked starches', 'Slimy surface film', 'Sour fermentation', 'Staphylococcus enterotoxin risks in lukewarm holding'],
    categoryNotes: 'Cooked leftovers must be cooled quickly and kept refrigerated (<4°C). Foods left in the danger zone (4°C–60°C) for >2 hours carry acute foodborne illness risks.'
  },
  'Other': {
    idealTempMin: 4,
    idealTempMax: 15,
    idealMethod: 'Refrigerator',
    typicalFridgeShelfLifeDays: 5,
    typicalRoomTempShelfLifeDays: 2,
    typicalFreezerShelfLifeDays: 90,
    temperatureSensitivity: 'moderate',
    primarySpoilageRisks: ['Oxidation', 'Mold formation', 'Flavor rancidity', 'Moisture deterioration'],
    categoryNotes: 'General perishable storage guidelines apply. Observe visual cues and aroma carefully.'
  }
};
