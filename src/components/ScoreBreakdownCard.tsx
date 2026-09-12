import React, { useState } from 'react';
import { 
  Eye, 
  Thermometer, 
  Clock, 
  AlertTriangle, 
  Box, 
  Sliders, 
  CheckCircle2, 
  Info,
  RotateCcw
} from 'lucide-react';
import { AnalysisExplanationFactor, ScoreWeights } from '../types';

interface ScoreBreakdownCardProps {
  scoreBreakdown: AnalysisExplanationFactor[];
  weightsUsed: ScoreWeights;
  subScores: {
    visual_score: number;
    temperature_score: number;
    duration_score: number;
    observations_score: number;
    condition_score: number;
  };
  onUpdateWeights?: (newWeights: ScoreWeights) => void;
  isRecalculating?: boolean;
}

export const ScoreBreakdownCard: React.FC<ScoreBreakdownCardProps> = ({
  scoreBreakdown,
  weightsUsed,
  subScores,
  onUpdateWeights,
  isRecalculating = false,
}) => {
  const [showWeightConfig, setShowWeightConfig] = useState(false);
  const [customWeights, setCustomWeights] = useState<ScoreWeights>({ ...weightsUsed });

  const categoryIcons: Record<string, React.ReactNode> = {
    visual: <Eye className="w-4 h-4 text-emerald-600" />,
    temperature: <Thermometer className="w-4 h-4 text-sky-600" />,
    duration: <Clock className="w-4 h-4 text-amber-600" />,
    observations: <AlertTriangle className="w-4 h-4 text-rose-600" />,
    condition: <Box className="w-4 h-4 text-indigo-600" />,
  };

  const handleSliderChange = (key: keyof ScoreWeights, value: number) => {
    setCustomWeights((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const totalSliderSum =
    customWeights.visualWeight +
    customWeights.tempWeight +
    customWeights.durationWeight +
    customWeights.indicatorsWeight +
    customWeights.conditionWeight;

  const handleResetWeights = () => {
    const defaultW: ScoreWeights = {
      visualWeight: 0.50,
      tempWeight: 0.20,
      durationWeight: 0.15,
      indicatorsWeight: 0.10,
      conditionWeight: 0.05,
    };
    setCustomWeights(defaultW);
    if (onUpdateWeights) onUpdateWeights(defaultW);
  };

  const handleApplyWeights = () => {
    if (onUpdateWeights) {
      onUpdateWeights(customWeights);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-stone-900 text-base">Score Explainability Breakdown</h3>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
              Deterministic Engine
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Transparent contribution points calculated from image cues and storage telemetry.
          </p>
        </div>

        <button
          id="toggle-weights-config-btn"
          onClick={() => setShowWeightConfig(!showWeightConfig)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors self-start sm:self-auto"
        >
          <Sliders className="w-3.5 h-3.5 text-stone-500" />
          <span>{showWeightConfig ? 'Hide Config' : 'Configure Weights'}</span>
        </button>
      </div>

      {/* Configurable Weights Inspector (Item 4) */}
      {showWeightConfig && (
        <div className="my-4 p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              Custom Scoring Weights Adjustment
            </span>
            <button
              onClick={handleResetWeights}
              className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 font-medium underline"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Defaults (50/20/15/10/5)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-stone-700 font-medium">
                <span>Visual Analysis Weight</span>
                <span className="font-bold text-stone-900">{Math.round(customWeights.visualWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.05"
                value={customWeights.visualWeight}
                onChange={(e) => handleSliderChange('visualWeight', parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-stone-700 font-medium">
                <span>Storage Temperature Weight</span>
                <span className="font-bold text-stone-900">{Math.round(customWeights.tempWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.50"
                step="0.05"
                value={customWeights.tempWeight}
                onChange={(e) => handleSliderChange('tempWeight', parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-stone-700 font-medium">
                <span>Storage Duration Weight</span>
                <span className="font-bold text-stone-900">{Math.round(customWeights.durationWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={customWeights.durationWeight}
                onChange={(e) => handleSliderChange('durationWeight', parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-stone-700 font-medium">
                <span>Physical Observations Weight</span>
                <span className="font-bold text-stone-900">{Math.round(customWeights.indicatorsWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={customWeights.indicatorsWeight}
                onChange={(e) => handleSliderChange('indicatorsWeight', parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex justify-between mb-1 text-stone-700 font-medium">
                <span>Storage Method / Condition Weight</span>
                <span className="font-bold text-stone-900">{Math.round(customWeights.conditionWeight * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.20"
                step="0.01"
                value={customWeights.conditionWeight}
                onChange={(e) => handleSliderChange('conditionWeight', parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-200">
            <span className="text-[11px] text-stone-500">
              Normalized relative share: {Math.round(totalSliderSum * 100)}%
            </span>
            <button
              id="apply-custom-weights-btn"
              onClick={handleApplyWeights}
              disabled={isRecalculating}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isRecalculating ? 'Recalculating...' : 'Apply & Recalculate'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5-Part Sub-Scores Progress Bars */}
      <div className="my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <Eye className="w-3 h-3 text-emerald-600" />
              Vision
            </span>
            <span className="font-bold text-stone-800">{subScores.visual_score}/100</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${subScores.visual_score}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-500 block mt-1">Weight: {Math.round(weightsUsed.visualWeight * 100)}%</span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-sky-600" />
              Temperature
            </span>
            <span className="font-bold text-stone-800">{subScores.temperature_score}/100</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-sky-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${subScores.temperature_score}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-500 block mt-1">Weight: {Math.round(weightsUsed.tempWeight * 100)}%</span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              Duration
            </span>
            <span className="font-bold text-stone-800">{subScores.duration_score}/100</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${subScores.duration_score}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-500 block mt-1">Weight: {Math.round(weightsUsed.durationWeight * 100)}%</span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              Observations
            </span>
            <span className="font-bold text-stone-800">{subScores.observations_score}/100</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${subScores.observations_score}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-500 block mt-1">Weight: {Math.round(weightsUsed.indicatorsWeight * 100)}%</span>
        </div>

        <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-500 font-medium flex items-center gap-1">
              <Box className="w-3 h-3 text-indigo-600" />
              Method
            </span>
            <span className="font-bold text-stone-800">{subScores.condition_score}/100</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${subScores.condition_score}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-500 block mt-1">Weight: {Math.round(weightsUsed.conditionWeight * 100)}%</span>
        </div>
      </div>

      {/* Itemized "Why this score?" Point Breakdown */}
      <div className="space-y-2.5 pt-2">
        <h4 className="text-xs font-bold text-stone-700 tracking-wide uppercase">
          Contributing Factors
        </h4>
        <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden">
          {scoreBreakdown.map((item, idx) => {
            const isPositive = item.impact === 'positive';
            const isNegative = item.impact === 'negative';
            return (
              <div 
                key={idx}
                className="p-3 bg-white hover:bg-stone-50/70 transition-colors flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-stone-100 text-stone-600 mt-0.5">
                    {categoryIcons[item.category] || <Info className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-stone-800 block">
                      {item.label}
                    </span>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                </div>

                <div className="flex items-center shrink-0">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                      isPositive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isNegative
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-stone-100 text-stone-700 border border-stone-200'
                    }`}
                  >
                    {item.points >= 0 ? `+${item.points}` : item.points} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
