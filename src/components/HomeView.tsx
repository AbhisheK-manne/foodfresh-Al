import React from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  Camera, 
  CheckCircle, 
  Eye, 
  Flame, 
  Layers, 
  RotateCcw, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Thermometer 
} from 'lucide-react';
import { DEMO_PRESETS, DemoPreset } from '../data/demoPresets';

interface HomeViewProps {
  onStartScan: () => void;
  onOpenDemoPicker: () => void;
  onSelectPreset: (preset: DemoPreset) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onStartScan,
  onOpenDemoPicker,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-900 to-emerald-950 text-white p-8 sm:p-12 border border-stone-800 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Multimodal Vision & Storage Science</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Stop guessing freshness. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Detect spoilage risk accurately.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
            FoodFresh AI inspects surface defect cues, storage temperatures, and shelf-life timelines to generate a calibrated 0–100 Freshness Score with transparent score explanations.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              id="hero-scan-cta-btn"
              onClick={onStartScan}
              className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Input Food Data / Scan</span>
            </button>

            <button
              id="hero-demo-cta-btn"
              onClick={onOpenDemoPicker}
              className="px-5 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Sample Presets</span>
            </button>
          </div>
          <p className="text-xs text-stone-400 pt-1">
            Input your own food photo, storage temperature, duration, and sensory observations.
          </p>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* 3 Core Architecture Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">Computer Vision Inspection</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Gemini vision inspects images for surface mold mycelium, rot, darkening, browning, and skin texture degradation.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
            <Thermometer className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">Danger Zone Enforcement</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Cross-references food storage temperatures against bacterial replication danger zones (4°C–60°C) and chilling limits.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-stone-200/90 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-900 text-sm">5-Pillar Explainable Score</h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Every score provides an itemized breakdown (+35 visual, +18 temp, -15 duration) so users understand exactly why a rating was assigned.
          </p>
        </div>
      </section>

      {/* Quick Demo Launchpad */}
      <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-stone-900">
                Interactive Food Scenarios (Demo Mode)
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Click any sample below to immediately simulate the analysis pipeline:
            </p>
          </div>

          <button
            onClick={onOpenDemoPicker}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Presets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {DEMO_PRESETS.slice(0, 3).map((preset) => (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-500/70 hover:bg-emerald-50/20 transition-all cursor-pointer group flex items-center gap-3"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden border border-stone-200 bg-stone-50 shrink-0">
                <img
                  src={preset.sampleImageSvg}
                  alt={preset.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">
                  {preset.categoryBadge}
                </span>
                <h4 className="font-bold text-stone-900 text-xs truncate group-hover:text-emerald-800">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-stone-500 truncate">{preset.expectedStatus}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Safety Notice Footer */}
      <section className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-stone-600 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          FoodFresh AI is engineered as an informational food quality and waste prevention assistant. Always heed your natural senses of smell and touch; never consume spoiled meat, seafood, dairy, or moldy bakery products.
        </p>
      </section>
    </div>
  );
};
