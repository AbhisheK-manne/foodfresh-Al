import {
  AnalysisExplanationFactor,
  FoodAnalysisRequest,
  FoodAnalysisResult,
  FreshnessStatus,
  ScoreWeights,
  SpoilageRisk
} from '../src/types';
import { CATEGORY_PROFILES, FoodProfile } from './foodProfiles';
import { VisionAnalysisResult } from './geminiVision';

export const DEFAULT_WEIGHTS: ScoreWeights = {
  visualWeight: 0.50,
  tempWeight: 0.20,
  durationWeight: 0.15,
  indicatorsWeight: 0.10,
  conditionWeight: 0.05,
};

export function calculateFreshness(
  req: FoodAnalysisRequest,
  vision: VisionAnalysisResult
): FoodAnalysisResult {
  const profile: FoodProfile = CATEGORY_PROFILES[req.food_category] || CATEGORY_PROFILES['Other'];

  // 1. Resolve Weights (normalized to 1.0)
  const userWeights = req.custom_weights || {};
  let wVisual = userWeights.visualWeight ?? DEFAULT_WEIGHTS.visualWeight;
  let wTemp = userWeights.tempWeight ?? DEFAULT_WEIGHTS.tempWeight;
  let wDuration = userWeights.durationWeight ?? DEFAULT_WEIGHTS.durationWeight;
  let wIndicators = userWeights.indicatorsWeight ?? DEFAULT_WEIGHTS.indicatorsWeight;
  let wCondition = userWeights.conditionWeight ?? DEFAULT_WEIGHTS.conditionWeight;

  const sumWeights = wVisual + wTemp + wDuration + wIndicators + wCondition;
  if (sumWeights > 0) {
    wVisual /= sumWeights;
    wTemp /= sumWeights;
    wDuration /= sumWeights;
    wIndicators /= sumWeights;
    wCondition /= sumWeights;
  } else {
    wVisual = 0.50;
    wTemp = 0.20;
    wDuration = 0.15;
    wIndicators = 0.10;
    wCondition = 0.05;
  }

  const normalizedWeights: ScoreWeights = {
    visualWeight: Number(wVisual.toFixed(3)),
    tempWeight: Number(wTemp.toFixed(3)),
    durationWeight: Number(wDuration.toFixed(3)),
    indicatorsWeight: Number(wIndicators.toFixed(3)),
    conditionWeight: Number(wCondition.toFixed(3)),
  };

  // 2. Sub-Score 1: AI Visual Analysis (0 - 100)
  const visualSubScore = Math.max(0, Math.min(100, vision.visual_detail.fresh_appearance_score));

  // 3. Sub-Score 2: Storage Temperature (0 - 100)
  const temp = req.storage_temperature;
  let tempSubScore = 100;
  let isInDangerZone = false;
  let tempAssessment = '';

  // Danger zone for perishables is between 4°C and 60°C (especially 20°C - 45°C)
  const isPerishable = ['Meat', 'Fish', 'Dairy', 'Cooked Food'].includes(req.food_category);

  if (temp >= profile.idealTempMin && temp <= profile.idealTempMax) {
    tempSubScore = 100;
    tempAssessment = `Optimal storage temperature maintained (${temp}°C, target ${profile.idealTempMin}°C–${profile.idealTempMax}°C).`;
  } else if (temp < profile.idealTempMin) {
    // Too cold (freezing fruits/veggies can cause chill injury/frost damage)
    const diff = profile.idealTempMin - temp;
    if (req.storage_method === 'Freezer') {
      tempSubScore = 95;
      tempAssessment = `Frozen storage (${temp}°C) arrests microbial multiplication.`;
    } else {
      tempSubScore = Math.max(40, 100 - diff * 7);
      tempAssessment = `Below recommended range (${temp}°C); risk of cellular frost damage or texture loss.`;
    }
  } else {
    // Warmer than ideal
    const excess = temp - profile.idealTempMax;
    if (isPerishable && temp > 4) {
      isInDangerZone = true;
      if (temp >= 20) {
        // Room temp or warm abuse on meat/fish/dairy/cooked food
        tempSubScore = Math.max(5, 100 - excess * 5.5);
        tempAssessment = `Elevated temperature (${temp}°C) in the bacterial danger zone (4°C–60°C). Accelerated microbial proliferation risk.`;
      } else {
        // Slightly warm fridge (5-10°C)
        tempSubScore = Math.max(25, 100 - excess * 8);
        tempAssessment = `Mild temperature elevation (${temp}°C); exceeds strict refrigeration threshold (<4°C).`;
      }
    } else {
      // Fruits / vegetables / bakery
      tempSubScore = Math.max(20, 100 - excess * 3.5);
      tempAssessment = `Storage temperature (${temp}°C) accelerates natural respiration and senescence.`;
    }
  }

  // 4. Sub-Score 3: Storage Duration (0 - 100)
  const duration = Math.max(0, req.storage_duration);
  let maxSafeDays = profile.typicalFridgeShelfLifeDays;
  if (req.storage_method === 'Freezer') {
    maxSafeDays = profile.typicalFreezerShelfLifeDays;
  } else if (req.storage_method === 'Room Temperature' || req.storage_method === 'Open Environment') {
    maxSafeDays = profile.typicalRoomTempShelfLifeDays;
  }

  let durationSubScore = 100;
  let durationAssessment = '';

  if (duration <= maxSafeDays * 0.35) {
    durationSubScore = 100;
    durationAssessment = `Within early fresh window (${duration} days stored vs estimated ${maxSafeDays} day baseline).`;
  } else if (duration <= maxSafeDays * 0.70) {
    durationSubScore = 80;
    durationAssessment = `Stored for ${duration} days; reaching mid-shelf life.`;
  } else if (duration <= maxSafeDays) {
    durationSubScore = 55;
    durationAssessment = `Stored for ${duration} days; approaching maximum recommended shelf life (${maxSafeDays} days).`;
  } else if (duration <= maxSafeDays * 1.5) {
    durationSubScore = 25;
    durationAssessment = `Storage time (${duration} days) exceeds typical shelf life (${maxSafeDays} days).`;
  } else {
    durationSubScore = Math.max(0, 15 - (duration - maxSafeDays * 1.5) * 3);
    durationAssessment = `Storage duration (${duration} days) substantially exceeds safety threshold. High decomposition likelihood.`;
  }

  // 5. Sub-Score 4: Visible/Observed Spoilage Indicators (0 - 100)
  let observationsSubScore = 100;
  const obs = req.observations;
  let obsCount = 0;
  if (obs.visible_mold) {
    observationsSubScore -= 50;
    obsCount++;
  }
  if (obs.slimy_texture) {
    observationsSubScore -= 35;
    obsCount++;
  }
  if (obs.unusual_smell) {
    observationsSubScore -= 35;
    obsCount++;
  }
  if (obs.color_change) {
    observationsSubScore -= 20;
    obsCount++;
  }
  observationsSubScore = Math.max(0, observationsSubScore);

  // 6. Sub-Score 5: Storage Condition / Method (0 - 100)
  let conditionSubScore = 90;
  let methodAssessment = '';
  if (req.storage_method === profile.idealMethod) {
    conditionSubScore = 100;
    methodAssessment = `Optimal storage method: ${req.storage_method}. Matches category preservation requirements.`;
  } else if (req.storage_method === 'Freezer') {
    conditionSubScore = 90;
    methodAssessment = 'Freezer storage preserves food safely, though repeated freeze-thaw may impact texture.';
  } else if (req.storage_method === 'Refrigerator' && profile.idealMethod === 'Room Temperature') {
    // E.g. bakery or certain tropical fruits
    conditionSubScore = 75;
    methodAssessment = 'Refrigeration for this category may accelerate staling or chill-injury, but impedes mold.';
  } else if (req.storage_method === 'Open Environment') {
    conditionSubScore = isPerishable ? 20 : 60;
    methodAssessment = 'Open environment exposes food to ambient contaminants, airborne spores, and fluctuating humidity.';
  } else {
    conditionSubScore = 50;
    methodAssessment = `Storage method (${req.storage_method}) is suboptimal for ${req.food_category}.`;
  }

  // Calculate Weighted Final Score (0 - 100)
  let rawScore =
    visualSubScore * normalizedWeights.visualWeight +
    tempSubScore * normalizedWeights.tempWeight +
    durationSubScore * normalizedWeights.durationWeight +
    observationsSubScore * normalizedWeights.indicatorsWeight +
    conditionSubScore * normalizedWeights.conditionWeight;

  // Food-safety hard clamps:
  // If active visible mold or severe slime is confirmed on high risk meat/dairy/fish, cap score
  if (obs.visible_mold && ['Meat', 'Fish', 'Dairy', 'Cooked Food'].includes(req.food_category)) {
    rawScore = Math.min(rawScore, 18);
  } else if (obs.visible_mold) {
    rawScore = Math.min(rawScore, 35);
  }

  if (isInDangerZone && duration >= 1 && ['Meat', 'Fish', 'Cooked Food'].includes(req.food_category)) {
    rawScore = Math.min(rawScore, 24);
  }

  const finalScore = Math.round(Math.max(0, Math.min(100, rawScore)));

  // Status mapping
  let status: FreshnessStatus;
  let risk: SpoilageRisk;

  if (finalScore >= 80) {
    status = 'Fresh';
    risk = 'Low';
  } else if (finalScore >= 60) {
    status = 'Mostly Fresh';
    risk = finalScore >= 70 ? 'Low' : 'Medium';
  } else if (finalScore >= 40) {
    status = 'Aging / Use Soon';
    risk = 'Medium';
  } else if (finalScore >= 20) {
    status = 'High Spoilage Risk';
    risk = 'High';
  } else {
    status = 'Likely Spoiled';
    risk = 'Critical';
  }

  // 7. Explainability Breakdown ("Why this score?")
  const explanationBreakdown: AnalysisExplanationFactor[] = [];

  // Visual points contribution
  const visualPoints = Math.round(visualSubScore * normalizedWeights.visualWeight);
  explanationBreakdown.push({
    label: visualSubScore >= 75 ? 'Image appears visually fresh' : visualSubScore >= 50 ? 'Moderate visual aging / minor defects' : 'Visual defects / discoloration detected',
    points: visualPoints,
    explanation: vision.visual_detail.visual_assessment || `AI visual score ${visualSubScore}/100 based on surface condition analysis.`,
    category: 'visual',
    impact: visualSubScore >= 70 ? 'positive' : visualSubScore >= 45 ? 'neutral' : 'negative'
  });

  // Temperature points contribution
  const tempPoints = Math.round(tempSubScore * normalizedWeights.tempWeight);
  explanationBreakdown.push({
    label: tempSubScore >= 85 ? `Stored at recommended temperature (${temp}°C)` : `Temperature deviates from ideal (${temp}°C)`,
    points: tempPoints,
    explanation: tempAssessment,
    category: 'temperature',
    impact: tempSubScore >= 75 ? 'positive' : tempSubScore >= 50 ? 'neutral' : 'negative'
  });

  // Duration points contribution
  const durationPoints = Math.round(durationSubScore * normalizedWeights.durationWeight);
  explanationBreakdown.push({
    label: durationSubScore >= 75 ? `Storage duration is within fresh window (${duration}d)` : `Storage duration is extended (${duration}d stored)`,
    points: durationPoints,
    explanation: durationAssessment,
    category: 'duration',
    impact: durationSubScore >= 70 ? 'positive' : durationSubScore >= 45 ? 'neutral' : 'negative'
  });

  // Observations contribution
  const obsPoints = Math.round(observationsSubScore * normalizedWeights.indicatorsWeight);
  explanationBreakdown.push({
    label: obsCount === 0 ? 'No visible mold, off-odor, or slime reported' : `${obsCount} physical spoilage indicator(s) noted`,
    points: obsPoints,
    explanation: obsCount === 0
      ? 'Clean physical inspection reported without sensory warning signs.'
      : `Deductions applied for: ${[
          obs.visible_mold ? 'mold' : null,
          obs.slimy_texture ? 'slime' : null,
          obs.unusual_smell ? 'smell' : null,
          obs.color_change ? 'color shift' : null,
        ].filter(Boolean).join(', ')}.`,
    category: 'observations',
    impact: obsCount === 0 ? 'positive' : 'negative'
  });

  // Condition contribution
  const condPoints = Math.round(conditionSubScore * normalizedWeights.conditionWeight);
  explanationBreakdown.push({
    label: conditionSubScore >= 80 ? `Appropriate storage method (${req.storage_method})` : `Suboptimal storage environment (${req.storage_method})`,
    points: condPoints,
    explanation: methodAssessment,
    category: 'condition',
    impact: conditionSubScore >= 80 ? 'positive' : 'neutral'
  });

  // Remaining shelf life estimate
  let remainingShelfLife = '0 days (Discard recommended)';
  if (finalScore >= 80) {
    const daysLeft = Math.max(2, Math.round(maxSafeDays - duration));
    remainingShelfLife = daysLeft > 1 ? `${Math.max(1, daysLeft - 1)}–${daysLeft + 1} days` : '1–2 days';
  } else if (finalScore >= 60) {
    remainingShelfLife = '2–3 days';
  } else if (finalScore >= 40) {
    remainingShelfLife = '1–2 days (Use promptly)';
  } else if (finalScore >= 20) {
    remainingShelfLife = '< 24 hours (High risk)';
  } else {
    remainingShelfLife = 'Expired / Discard';
  }

  // Action Recommendation
  let recommendation = '';
  let safetyWarning: string | undefined = undefined;

  if (finalScore >= 80) {
    recommendation = `Suitable for normal use. Maintain proper storage at ${profile.idealTempMin}°C–${profile.idealTempMax}°C in ${profile.idealMethod.toLowerCase()} to maximize remaining freshness.`;
  } else if (finalScore >= 60) {
    recommendation = `Food is mostly fresh. Plan to use within the next 2–3 days and keep properly sealed in the ${req.storage_method.toLowerCase()}.`;
  } else if (finalScore >= 40) {
    recommendation = `Aging detected. Use soon and cook thoroughly where applicable. Inspect closely for subtle off-odors or texture changes prior to consumption.`;
  } else if (finalScore >= 20) {
    recommendation = `High spoilage risk. Do not consume based solely on this AI result; inspect the food carefully and follow appropriate food-safety guidance.`;
    safetyWarning = `Caution: Critical spoilage indicators identified. Ingestion of spoiled ${req.food_category.toLowerCase()} can cause severe foodborne illness. When in doubt, discard.`;
  } else {
    recommendation = `Food is likely spoiled. Discard safely into organic compost or waste bin. Do not taste or consume.`;
    safetyWarning = `High spoilage risk. Spoilage pathogens or mold mycotoxins present high health risks. Never consume visibly molded or putrefied foods.`;
  }

  // Deduplication of indicators
  const allDetected = Array.from(new Set([
    ...vision.detected_indicators,
    ...(obs.visible_mold ? ['Visible fungal growth / mold'] : []),
    ...(obs.slimy_texture ? ['Bacterial slime layer'] : []),
    ...(obs.unusual_smell ? ['Off-putting fermentation / rancid odor'] : []),
    ...(obs.color_change ? ['Surface pigment degradation / discoloration'] : []),
    ...(isInDangerZone ? ['Extended holding in temperature danger zone (4°C–60°C)'] : [])
  ]));

  return {
    id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    food_name: req.food_name,
    food_category: req.food_category,
    freshness_score: finalScore,
    status,
    spoilage_risk: risk,
    confidence: vision.confidence,
    detected_indicators: allDetected,
    visual_indicators_detail: vision.visual_detail,
    storage_evaluation: {
      temp_assessment: tempAssessment,
      duration_assessment: durationAssessment,
      method_assessment: methodAssessment,
      is_in_danger_zone: isInDangerZone,
      recommended_temp_range: `${profile.idealTempMin}°C to ${profile.idealTempMax}°C`,
      typical_shelf_life_days: maxSafeDays,
    },
    weights_used: normalizedWeights,
    sub_scores: {
      visual_score: visualSubScore,
      temperature_score: tempSubScore,
      duration_score: durationSubScore,
      observations_score: observationsSubScore,
      condition_score: conditionSubScore,
    },
    score_breakdown: explanationBreakdown,
    recommendation,
    safety_warning: safetyWarning,
    estimated_remaining_days: remainingShelfLife,
    storage_used: {
      temperature: req.storage_temperature,
      duration: req.storage_duration,
      method: req.storage_method,
      packaging: req.storage_packaging,
      custom_notes: req.custom_notes,
      observations: req.observations,
    },
    image_thumbnail: req.image,
    is_demo: req.is_demo,
    engine_used: vision.engine,
    raw_ai_notes: vision.raw_notes,
  };
}
