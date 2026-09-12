import React from 'react';
import { 
  AlertTriangle, 
  Apple, 
  CheckCircle2, 
  Clock,
  Eye, 
  FileText, 
  Flame, 
  Layers, 
  Lock, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Thermometer 
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-2 pb-4 border-b border-stone-200">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Explainable Food Science & AI Inspection
        </div>
        <h1 className="text-3xl font-black text-stone-900 tracking-tight">
          How FoodFresh AI Works
        </h1>
        <p className="text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed">
          FoodFresh AI combines multimodal computer vision with food-category preservation rules to provide transparent, explainable food freshness and spoilage estimations.
        </p>
      </div>

      {/* Mandatory Safety Disclaimer Callout */}
      <div className="p-5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
          <span>Important Food Safety & Medical Disclaimer</span>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>Never consume food solely based on an AI image scan.</strong> Dangerous bacterial pathogens—including <em>Listeria monocytogenes</em>, <em>Salmonella</em>, <em>Escherichia coli</em>, and <em>Clostridium botulinum</em>—can multiply to toxic levels without causing immediate visual changes, color alteration, or foul odor. When in doubt regarding odor, temperature abuse, expiration dates, or safety, discard the product immediately.
        </p>
      </div>

      {/* The 5-Pillar Deterministic Formulation */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          The 5-Pillar Weighted Scoring Engine
        </h2>
        <p className="text-xs text-stone-600 leading-relaxed">
          Rather than relying on opaque black-box outputs or generating random numbers, FoodFresh AI computes its 0–100 Freshness Score deterministically through calibrated domain weights:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Eye className="w-4 h-4" />
                1. Computer Vision (50%)
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200">
                50 pts max
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Analyzes surface texture, fungal mycelium/mold colonies, enzymatic browning, moisture exudate, and chlorophyll degradation.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="flex items-center gap-1.5 text-sky-700">
                <Thermometer className="w-4 h-4" />
                2. Storage Temperature (20%)
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200">
                20 pts max
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Monitors storage temperature against recommended baseline ranges and applies severe penalties if perishables enter the 4°C–60°C Danger Zone.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="flex items-center gap-1.5 text-amber-700">
                <Clock className="w-4 h-4" />
                3. Storage Duration (15%)
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200">
                15 pts max
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Compares elapsed storage days against category-specific perishability ceilings (e.g. 1-2 days for fresh fish vs 21 days for whole apples).
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="w-4 h-4" />
                4. Physical Sensory Cues (10%)
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200">
                10 pts max
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              User-confirmed observations (sour/putrid smell, slimy biofilm, visible spots, oxidation) trigger mandatory safety caps regardless of appearance.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1 sm:col-span-2">
            <div className="flex items-center justify-between font-bold text-stone-900">
              <span className="flex items-center gap-1.5 text-indigo-700">
                <Lock className="w-4 h-4" />
                5. Storage Method & Atmosphere (5%)
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200">
                5 pts max
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Rewards proper container sealing and climate conditioning (e.g. Freezer vs Open Environment exposure).
            </p>
          </div>
        </div>
      </div>

      {/* The Danger Zone Reference */}
      <div className="bg-stone-900 text-stone-100 p-6 rounded-2xl border border-stone-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-rose-400" />
          The Food Safety "Danger Zone"
        </h3>
        <p className="text-xs text-stone-300 leading-relaxed">
          The United States Department of Agriculture (USDA) and FDA designate the temperature range between <strong>4°C and 60°C (40°F and 140°F)</strong> as the Bacterial Danger Zone. In this environment, harmful pathogens can double their population in as little as 20 minutes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-3 bg-stone-800 rounded-xl border border-stone-700">
            <span className="text-sky-400 font-bold block mb-1">Freezer: &lt; -18°C</span>
            <p className="text-[11px] text-stone-400">Microbial dormancy; prevents decay while maintaining structural integrity.</p>
          </div>
          <div className="p-3 bg-stone-800 rounded-xl border border-stone-700">
            <span className="text-emerald-400 font-bold block mb-1">Chilled: 0°C to 4°C</span>
            <p className="text-[11px] text-stone-400">Significantly impedes bacterial replication in meat, dairy, seafood, and leftovers.</p>
          </div>
          <div className="p-3 bg-stone-800 rounded-xl border border-stone-700">
            <span className="text-rose-400 font-bold block mb-1">Danger Zone: 4°C to 60°C</span>
            <p className="text-[11px] text-stone-400">Perishables must not remain in this window for more than 2 cumulative hours.</p>
          </div>
        </div>
      </div>

      {/* Sustainable Development Goal 12.3: Food Waste Reduction */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Preventing Food Waste (UN SDG 12.3)
        </h3>
        <p className="text-xs text-stone-600 leading-relaxed">
          Globally, nearly one-third of all food produced for human consumption—approximately 1.3 billion tonnes annually—is lost or wasted. A substantial portion is discarded prematurely due to confusion between "Best Before" dates and actual food safety. By clarifying freshness scores and remaining shelf-life estimates, FoodFresh AI empowers households and commercial kitchens to cook aging food safely while averting avoidable spoilage.
        </p>
      </div>
    </div>
  );
};
