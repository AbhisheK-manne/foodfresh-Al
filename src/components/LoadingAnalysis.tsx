import React, { useEffect, useState } from 'react';
import { Sparkles, Eye, ShieldCheck, Thermometer, Database } from 'lucide-react';

interface LoadingAnalysisProps {
  foodName: string;
}

export const LoadingAnalysis: React.FC<LoadingAnalysisProps> = ({ foodName }) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    { text: 'Preprocessing food image & extracting optical features...', icon: <Eye className="w-5 h-5 text-emerald-500" /> },
    { text: 'Running computer vision: checking for mold colonies, browning & rot...', icon: <Sparkles className="w-5 h-5 text-teal-500" /> },
    { text: 'Cross-referencing storage temperature and bacterial danger zones...', icon: <Thermometer className="w-5 h-5 text-sky-500" /> },
    { text: 'Synthesizing weighted 5-pillar freshness score & explainability breakdown...', icon: <Database className="w-5 h-5 text-indigo-500" /> },
    { text: 'Finalizing safety recommendations & remaining shelf-life estimation...', icon: <ShieldCheck className="w-5 h-5 text-emerald-600" /> },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="max-w-lg mx-auto py-12 px-6 text-center">
      <div className="relative w-28 h-28 mx-auto mb-6 flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 animate-ping"></div>
        {/* Inner rotating gradient spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-teal-400 border-b-transparent border-l-transparent animate-spin"></div>
        <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-inner">
          {steps[stepIndex].icon}
        </div>
      </div>

      <h3 className="text-lg font-bold text-stone-900 mb-1">
        Analyzing Freshness for {foodName}
      </h3>
      <p className="text-xs text-stone-500 mb-8">
        FoodFresh AI multimodal inspection in progress
      </p>

      {/* Progress Track */}
      <div className="space-y-3 text-left max-w-md mx-auto bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        {steps.map((step, idx) => {
          const isDone = idx < stepIndex;
          const isCurrent = idx === stepIndex;
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                isDone
                  ? 'text-emerald-700 font-medium'
                  : isCurrent
                  ? 'text-stone-900 font-bold'
                  : 'text-stone-400 opacity-50'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-mono transition-colors ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-600 animate-pulse'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </div>
              <span className="leading-snug">{step.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
