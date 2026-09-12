import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  Eye, 
  Info, 
  RefreshCw, 
  RotateCcw, 
  Share2, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Thermometer 
} from 'lucide-react';
import { FoodAnalysisResult, ScoreWeights } from '../types';
import { FreshnessGauge } from './FreshnessGauge';
import { ScoreBreakdownCard } from './ScoreBreakdownCard';

interface ResultViewProps {
  result: FoodAnalysisResult;
  onScanAnother: () => void;
  onRecalculateWithWeights?: (weights: ScoreWeights) => void;
  onSaveToDataset?: (result: FoodAnalysisResult) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  result,
  onScanAnother,
  onRecalculateWithWeights,
  onSaveToDataset,
}) => {
  const [copied, setCopied] = useState(false);
  const [datasetSaved, setDatasetSaved] = useState(false);

  const formattedDate = new Date(result.timestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handleShare = () => {
    const summary = `FoodFresh AI Analysis: ${result.food_name}
Freshness Score: ${result.freshness_score}/100 (${result.status})
Spoilage Risk: ${result.spoilage_risk}
Remaining Shelf Life: ${result.estimated_remaining_days}
Recommendation: ${result.recommendation}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSaveSample = () => {
    if (onSaveToDataset) {
      onSaveToDataset(result);
      setDatasetSaved(true);
    }
  };

  const isCriticalRisk = result.spoilage_risk === 'Critical' || result.spoilage_risk === 'High';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {result.food_category}
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500 font-mono">
              Scan ID: {result.id.slice(0, 14)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-0.5">
            {result.food_name}
          </h1>
          <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-1">
            <Clock className="w-3.5 h-3.5" />
            Analyzed on {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="share-summary-btn"
            onClick={handleShare}
            className="px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-stone-500" />
            <span>{copied ? 'Copied Summary!' : 'Share Summary'}</span>
          </button>

          <button
            id="scan-another-top-btn"
            onClick={onScanAnother}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Scan Another</span>
          </button>
        </div>
      </div>

      {/* Primary Results Hero Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Freshness Score Gauge (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Overall Freshness
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              result.engine_used === 'gemini_vision'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-stone-100 text-stone-700 border-stone-200'
            }`}>
              {result.engine_used === 'gemini_vision' ? 'Gemini Vision AI' : 'Rule Engine'}
            </span>
          </div>

          <FreshnessGauge
            score={result.freshness_score}
            status={result.status}
            risk={result.spoilage_risk}
            confidence={result.confidence}
            size="lg"
          />

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-stone-100 text-center">
            <div className="p-2 bg-stone-50 rounded-xl">
              <span className="text-[10px] text-stone-500 block uppercase font-medium">
                Remaining Shelf Life
              </span>
              <span className="text-sm font-bold text-stone-900">
                {result.estimated_remaining_days}
              </span>
            </div>
            <div className="p-2 bg-stone-50 rounded-xl">
              <span className="text-[10px] text-stone-500 block uppercase font-medium">
                AI Confidence
              </span>
              <span className="text-sm font-bold text-stone-900">
                {result.confidence}%
              </span>
            </div>
          </div>
        </div>

        {/* Right: Detected Indicators & Photo Evidence (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          {/* Visual Analysis Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  Visual Analysis & Optical Indicators
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Automated computer vision surface defect scan
                </p>
              </div>

              {result.visual_indicators_detail?.image_quality_rating && (
                <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                  Image: {result.visual_indicators_detail.image_quality_rating}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
              {/* Thumbnail if provided */}
              {result.image_thumbnail ? (
                <div className="w-28 h-28 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0 shadow-inner flex items-center justify-center">
                  <img
                    src={result.image_thumbnail}
                    alt={result.food_name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-stone-100 border border-stone-200 shrink-0 flex items-center justify-center text-stone-400">
                  <Eye className="w-8 h-8" />
                </div>
              )}

              <div className="flex-1 space-y-2 text-xs">
                <p className="text-stone-700 leading-relaxed font-medium bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                  "{result.visual_indicators_detail?.visual_assessment || 'No critical visual defects observed.'}"
                </p>

                {result.visual_indicators_detail?.quality_warning && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    ⚠️ {result.visual_indicators_detail.quality_warning}
                  </p>
                )}

                {/* Detected Indicators Badges */}
                <div>
                  <span className="text-[11px] font-bold text-stone-500 block mb-1">
                    Detected Indicators:
                  </span>
                  {result.detected_indicators && result.detected_indicators.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {result.detected_indicators.map((ind, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          {ind}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      Zero visible mold, rot, or discoloration detected
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Recommendation Banner */}
          <div
            className={`rounded-2xl border p-5 shadow-xs ${
              isCriticalRisk
                ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                  isCriticalRisk
                    ? 'bg-rose-600 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {isCriticalRisk ? (
                  <ShieldAlert className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider block">
                  {isCriticalRisk ? 'Food Safety Warning & Recommended Action' : 'Preservation & Usage Recommendation'}
                </span>
                <p className="text-sm font-semibold leading-snug">
                  {result.recommendation}
                </p>
                {result.safety_warning && (
                  <p className="text-xs text-rose-800 bg-rose-100/80 p-2 rounded-lg border border-rose-200/80 mt-2 font-medium">
                    {result.safety_warning}
                  </p>
                )}
                <p className="text-[11px] opacity-75 pt-1">
                  Food safety note: Never rely solely on visual AI to guarantee safety. Microscopic bacterial toxins (such as Listeria or botulinum) are invisible. When in doubt, discard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Information Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Thermometer className="w-4 h-4 text-sky-600" />
          Storage Information Evaluated
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-stone-500 block mb-0.5">Recorded Temp</span>
            <span className="text-sm font-mono font-bold text-stone-900">
              {result.storage_used.temperature}°C
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              Ideal: {result.storage_evaluation?.recommended_temp_range}
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-stone-500 block mb-0.5">Duration Stored</span>
            <span className="text-sm font-mono font-bold text-stone-900">
              {result.storage_used.duration} days
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              Ref limit: ~{result.storage_evaluation?.typical_shelf_life_days}d
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-stone-500 block mb-0.5">Storage Method</span>
            <span className="text-sm font-semibold text-stone-900">
              {result.storage_used.method}
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              Container environment
            </span>
          </div>

          <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
            <span className="text-stone-500 block mb-0.5">Sensory Flags</span>
            <span className="text-sm font-semibold text-stone-900">
              {Object.values(result.storage_used.observations).filter(Boolean).length} flagged
            </span>
            <span className="text-[10px] text-stone-400 block mt-0.5">
              Smell, texture, mold, color
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-600 mt-3 pt-3 border-t border-stone-100 leading-relaxed">
          <strong>Storage Assessment:</strong> {result.storage_evaluation?.temp_assessment} {result.storage_evaluation?.duration_assessment}
        </p>
      </div>

      {/* Transparent Explainability Breakdown Card */}
      <ScoreBreakdownCard
        scoreBreakdown={result.score_breakdown}
        weightsUsed={result.weights_used}
        subScores={result.sub_scores}
        onUpdateWeights={onRecalculateWithWeights}
      />

      {/* Footer Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200">
        <button
          type="button"
          onClick={handleSaveSample}
          disabled={datasetSaved}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>{datasetSaved ? 'Added to Local Dataset ✓' : 'Contribute to AI Training Dataset'}</span>
        </button>

        <button
          type="button"
          id="scan-another-bottom-btn"
          onClick={onScanAnother}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/10 flex items-center justify-center gap-2 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Scan Another Food Product</span>
        </button>
      </div>
    </div>
  );
};
