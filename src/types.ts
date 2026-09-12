export type FoodCategory = 
  | 'Fruits'
  | 'Vegetables'
  | 'Meat'
  | 'Fish'
  | 'Dairy'
  | 'Bakery'
  | 'Cooked Food'
  | 'Other';

export type StorageMethod = 
  | 'Refrigerator'
  | 'Freezer'
  | 'Room Temperature'
  | 'Open Environment';

export type FreshnessStatus = 
  | 'Fresh'
  | 'Mostly Fresh'
  | 'Aging / Use Soon'
  | 'High Spoilage Risk'
  | 'Likely Spoiled';

export type SpoilageRisk = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ScoreWeights {
  visualWeight: number;    // default 0.50
  tempWeight: number;      // default 0.20
  durationWeight: number;  // default 0.15
  indicatorsWeight: number;// default 0.10
  conditionWeight: number; // default 0.05
}

export interface Observations {
  unusual_smell: boolean;
  slimy_texture: boolean;
  visible_mold: boolean;
  color_change: boolean;
}

export interface AnalysisExplanationFactor {
  label: string;
  points: number;
  explanation: string;
  category: 'visual' | 'temperature' | 'duration' | 'observations' | 'condition';
  impact: 'positive' | 'negative' | 'neutral';
}

export interface FoodAnalysisRequest {
  image?: string; // data:image/...;base64,... or URL
  food_name: string;
  food_category: FoodCategory;
  storage_temperature: number; // in °C
  storage_duration: number; // in days
  storage_method: StorageMethod;
  storage_packaging?: 'Airtight / Vacuum Sealed' | 'Original Package / Loose Wrap' | 'Open / Uncovered';
  purchase_date?: string;
  observations: Observations;
  custom_notes?: string;
  custom_weights?: Partial<ScoreWeights>;
  is_demo?: boolean;
}

export interface VisualIndicatorsDetail {
  mold_detected: boolean;
  discoloration_detected: boolean;
  browning_detected: boolean;
  rot_detected: boolean;
  bruising_detected: boolean;
  surface_deterioration: boolean;
  texture_anomaly: boolean;
  fresh_appearance_score: number; // 0 - 100
  visual_assessment: string;
  image_quality_rating?: 'clear' | 'fair' | 'poor_or_obscured';
  quality_warning?: string;
}

export interface FoodAnalysisResult {
  id: string;
  userId?: string;
  timestamp: string;
  food_name: string;
  food_category: FoodCategory;
  freshness_score: number; // 0–100
  status: FreshnessStatus;
  spoilage_risk: SpoilageRisk;
  confidence: number; // 0–100 separate from freshness
  detected_indicators: string[];
  visual_indicators_detail: VisualIndicatorsDetail;
  storage_evaluation: {
    temp_assessment: string;
    duration_assessment: string;
    method_assessment: string;
    is_in_danger_zone: boolean;
    recommended_temp_range: string;
    typical_shelf_life_days: number;
  };
  weights_used: ScoreWeights;
  sub_scores: {
    visual_score: number;
    temperature_score: number;
    duration_score: number;
    observations_score: number;
    condition_score: number;
  };
  score_breakdown: AnalysisExplanationFactor[];
  recommendation: string;
  safety_warning?: string;
  estimated_remaining_days: string; // e.g. "1–2 days" or "< 12 hours"
  storage_used: {
    temperature: number;
    duration: number;
    method: StorageMethod;
    packaging?: string;
    custom_notes?: string;
    observations: Observations;
  };
  image_thumbnail?: string;
  is_demo?: boolean;
  engine_used: 'gemini_vision' | 'rule_heuristic_engine';
  raw_ai_notes?: string;
}

export type FreshnessLabel = 'Fresh' | 'Slightly deteriorated' | 'Spoiled';

export interface DatasetItem {
  id: string;
  image?: string;
  image_thumbnail?: string;
  food_name: string;
  food_category: FoodCategory;
  freshness_label: FreshnessLabel;
  storage_temperature: number;
  storage_duration: number;
  storage_method: StorageMethod;
  spoilage_indicators: string[];
  expert_confirmed_label?: FreshnessLabel;
  split: 'train' | 'test' | 'validation';
  created_at: string;
  source: 'lab_verified' | 'user_contributed' | 'benchmark_standard';
  authorId?: string;
  notes?: string;
}

export interface ModelEvaluationStats {
  status: 'not_evaluated' | 'evaluated';
  accuracy: number | null; // e.g. 0.892
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  total_samples: number;
  train_samples: number;
  test_samples: number;
  confusion_matrix: {
    classes: FreshnessLabel[];
    matrix: number[][]; // rows = actual, cols = predicted
  } | null;
  last_evaluated_at: string | null;
  evaluation_notes?: string;
}
