import { GoogleGenAI, Type } from '@google/genai';
import { FoodCategory, VisualIndicatorsDetail } from '../src/types';

let genAIClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

export interface VisionAnalysisResult {
  visual_detail: VisualIndicatorsDetail;
  detected_indicators: string[];
  confidence: number;
  engine: 'gemini_vision' | 'rule_heuristic_engine';
  raw_notes?: string;
}

export async function analyzeFoodImageWithGemini(
  base64ImageWithHeader: string | undefined,
  foodName: string,
  category: FoodCategory,
  observations: {
    unusual_smell: boolean;
    slimy_texture: boolean;
    visible_mold: boolean;
    color_change: boolean;
  },
  customNotes?: string
): Promise<VisionAnalysisResult> {
  const client = getGeminiClient();

  if (!client || !base64ImageWithHeader) {
    // Fallback rule/heuristic engine when API key is missing or no image uploaded
    return fallbackVisionAnalysis(foodName, category, observations, false);
  }

  let mimeType = 'image/jpeg';
  let data = '';

  if (base64ImageWithHeader.startsWith('data:image/')) {
    const matches = base64ImageWithHeader.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return fallbackVisionAnalysis(foodName, category, observations, false);
    }
    mimeType = matches[1];
    data = matches[2];
  } else if (base64ImageWithHeader.startsWith('http://') || base64ImageWithHeader.startsWith('https://')) {
    try {
      const resp = await fetch(base64ImageWithHeader);
      const arrayBuffer = await resp.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      data = buffer.toString('base64');
      const ct = resp.headers.get('content-type');
      if (ct && ct.startsWith('image/')) {
        mimeType = ct;
      }
    } catch (e) {
      console.warn('Could not fetch external image URL:', e);
      return fallbackVisionAnalysis(foodName, category, observations, false);
    }
  } else {
    return fallbackVisionAnalysis(foodName, category, observations, false);
  }

  try {
    const promptText = `You are an expert food technologist and computer-vision specialist assessing food freshness.
Inspect this food image carefully for visible signs of freshness and spoilage.

Target Food: "${foodName}" (Category: "${category}")
${customNotes ? `User's Custom Notes / Context: "${customNotes}"` : ''}
User-reported physical observations:
- Unusual smell reported: ${observations.unusual_smell ? 'Yes' : 'No'}
- Slimy texture reported: ${observations.slimy_texture ? 'Yes' : 'No'}
- Visible mold reported by user: ${observations.visible_mold ? 'Yes' : 'No'}
- Color change reported by user: ${observations.color_change ? 'Yes' : 'No'}

Instructions:
1. Examine surface color, fungal spores/mold mycelium, browning, wilting, bruising, slimy sheen, rotting soft patches, or vibrant fresh taut appearance.
2. If the image is blurry, poorly lit, partially cropped, or obstructed, rate confidence lower (below 70%) and note in quality_warning.
3. If the image clearly shows fresh product with natural bloom, high turgor, unoxidized color, rate fresh_appearance_score 85-98.
4. If deterioration is evident, detail specific indicators detected.
5. Never state that the food is guaranteed safe to consume, because microscopic toxins or bacteria (Listeria, Salmonella, botulism) may not be visible.

Respond strictly in JSON matching the requested schema.`;

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mold_detected: { type: Type.BOOLEAN },
            discoloration_detected: { type: Type.BOOLEAN },
            browning_detected: { type: Type.BOOLEAN },
            rot_detected: { type: Type.BOOLEAN },
            bruising_detected: { type: Type.BOOLEAN },
            surface_deterioration: { type: Type.BOOLEAN },
            texture_anomaly: { type: Type.BOOLEAN },
            fresh_appearance_score: { 
              type: Type.INTEGER, 
              description: '0 to 100 where 100 is pristine fresh and 0 is severe rot' 
            },
            visual_assessment: { 
              type: Type.STRING, 
              description: 'Specific visual condition summary, e.g., Taut, unblemished skin with natural color saturation' 
            },
            confidence: { 
              type: Type.INTEGER, 
              description: 'AI detection confidence 0 to 100 based on image clarity, lighting and angle' 
            },
            image_quality_rating: { 
              type: Type.STRING, 
              description: 'clear, fair, or poor_or_obscured' 
            },
            quality_warning: { 
              type: Type.STRING, 
              description: 'Optional warning if image is blurry or dark' 
            },
            detected_indicators: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of specific visual defects found, e.g. ["Localized blue-green mold spots", "Oxidized brown edges"]'
            },
            notes: { type: Type.STRING }
          },
          required: [
            'mold_detected',
            'discoloration_detected',
            'browning_detected',
            'rot_detected',
            'bruising_detected',
            'surface_deterioration',
            'texture_anomaly',
            'fresh_appearance_score',
            'visual_assessment',
            'confidence',
            'detected_indicators'
          ]
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');

    const freshScore = Math.max(0, Math.min(100, Number(parsed.fresh_appearance_score) || 75));
    const conf = Math.max(25, Math.min(99, Number(parsed.confidence) || 85));

    const detectedIndicators: string[] = Array.isArray(parsed.detected_indicators) 
      ? parsed.detected_indicators 
      : [];

    if (parsed.mold_detected && !detectedIndicators.some(i => i.toLowerCase().includes('mold'))) {
      detectedIndicators.push('Surface mold colonies detected');
    }
    if (parsed.rot_detected && !detectedIndicators.some(i => i.toLowerCase().includes('rot'))) {
      detectedIndicators.push('Tissue breakdown / soft rot detected');
    }
    if (parsed.discoloration_detected && !detectedIndicators.some(i => i.toLowerCase().includes('discolor'))) {
      detectedIndicators.push('Abnormal surface discoloration');
    }

    const visualDetail: VisualIndicatorsDetail = {
      mold_detected: Boolean(parsed.mold_detected),
      discoloration_detected: Boolean(parsed.discoloration_detected),
      browning_detected: Boolean(parsed.browning_detected),
      rot_detected: Boolean(parsed.rot_detected),
      bruising_detected: Boolean(parsed.bruising_detected),
      surface_deterioration: Boolean(parsed.surface_deterioration),
      texture_anomaly: Boolean(parsed.texture_anomaly),
      fresh_appearance_score: freshScore,
      visual_assessment: parsed.visual_assessment || 'Visual analysis completed by Gemini Vision.',
      image_quality_rating: (parsed.image_quality_rating as any) || (conf > 75 ? 'clear' : 'fair'),
      quality_warning: parsed.quality_warning || (conf < 65 ? 'Image resolution or lighting may limit fine defect detection; capture closer in bright natural light.' : undefined)
    };

    return {
      visual_detail: visualDetail,
      detected_indicators: detectedIndicators,
      confidence: conf,
      engine: 'gemini_vision',
      raw_notes: parsed.notes
    };
  } catch (error) {
    console.error('Gemini vision analysis error, falling back to rule engine:', error);
    return fallbackVisionAnalysis(foodName, category, observations, true);
  }
}

function fallbackVisionAnalysis(
  foodName: string,
  category: FoodCategory,
  observations: {
    unusual_smell: boolean;
    slimy_texture: boolean;
    visible_mold: boolean;
    color_change: boolean;
  },
  hasImage: boolean
): VisionAnalysisResult {
  const indicators: string[] = [];
  let baseScore = hasImage ? 78 : 70;
  let conf = hasImage ? 78 : 65;

  let mold = observations.visible_mold;
  let discoloration = observations.color_change;
  let browning = false;
  let rot = false;
  let bruising = false;
  let surfaceDeterioration = false;
  let textureAnomaly = observations.slimy_texture;

  if (mold) {
    indicators.push('Visible mold fungal structure recorded');
    baseScore -= 45;
    surfaceDeterioration = true;
  }
  if (discoloration) {
    indicators.push('Pigment oxidation / color departure noted');
    baseScore -= 20;
    browning = true;
  }
  if (textureAnomaly) {
    indicators.push('Slimy surface microbial film identified');
    baseScore -= 30;
    surfaceDeterioration = true;
  }
  if (observations.unusual_smell) {
    indicators.push('Volatile off-odor detected');
    baseScore -= 25;
  }

  baseScore = Math.max(10, Math.min(95, baseScore));

  let assessment = 'Heuristic rule-based assessment applied.';
  if (mold || textureAnomaly) {
    assessment = 'Severe degradation indicators present from reported surface conditions.';
  } else if (discoloration) {
    assessment = 'Moderate surface oxidation and pigment shift observed.';
  } else {
    assessment = 'No severe surface fungal or structural breakdown indicated.';
  }

  return {
    visual_detail: {
      mold_detected: mold,
      discoloration_detected: discoloration,
      browning_detected: browning,
      rot_detected: rot,
      bruising_detected: bruising,
      surface_deterioration: surfaceDeterioration,
      texture_anomaly: textureAnomaly,
      fresh_appearance_score: baseScore,
      visual_assessment: assessment,
      image_quality_rating: hasImage ? 'fair' : 'poor_or_obscured',
      quality_warning: hasImage ? undefined : 'No image provided for optical verification; confidence reduced.'
    },
    detected_indicators: indicators,
    confidence: conf,
    engine: 'rule_heuristic_engine',
    raw_notes: 'Calculated using deterministic rule engine.'
  };
}
