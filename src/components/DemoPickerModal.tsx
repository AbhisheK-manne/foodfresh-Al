import React from 'react';
import { Sparkles, X, ArrowRight, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import { DEMO_PRESETS, DemoPreset } from '../data/demoPresets';

interface DemoPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: DemoPreset) => void;
}

export const DemoPickerModal: React.FC<DemoPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="demo-modal-container"
        className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <Sparkles className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-stone-900">
                Prototype Demo Mode Presets
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Select a pre-calibrated scenario to test the multimodal scoring engine immediately.
            </p>
          </div>
          <button
            id="close-demo-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hackathon Disclaimer Banner (Per Item 17) */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Hackathon Presentation Mode:</strong> These presets populate realistic visual vectors and storage metrics for demonstration purposes. Demo results reflect the simulated algorithm and are not certified clinical or laboratory measurements.
          </p>
        </div>

        {/* Presets List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {DEMO_PRESETS.map((preset) => {
            return (
              <div
                key={preset.id}
                id={`preset-card-${preset.id}`}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-500/70 hover:bg-emerald-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-14 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0 flex items-center justify-center">
                    <img
                      src={preset.sampleImageSvg}
                      alt={preset.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-stone-900 text-xs group-hover:text-emerald-800 transition-colors">
                        {preset.title}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                        {preset.categoryBadge}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {preset.subtitle}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700 block mt-1">
                      Target: {preset.expectedStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0">
                  <span className="text-xs font-semibold mr-1 hidden sm:inline">Load</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
