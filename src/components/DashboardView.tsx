import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Layers, 
  PieChart, 
  ShieldCheck, 
  Sparkles, 
  Thermometer, 
  TrendingUp, 
  Utensils 
} from 'lucide-react';
import { FoodAnalysisResult } from '../types';

interface DashboardViewProps {
  scans: FoodAnalysisResult[];
  onNewScan: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  scans,
  onNewScan,
}) => {
  const totalScans = scans.length;

  const freshCount = scans.filter((s) => s.status === 'Fresh' || s.status === 'Mostly Fresh').length;
  const agingCount = scans.filter((s) => s.status === 'Aging / Use Soon').length;
  const spoiledCount = scans.filter((s) => s.status === 'High Spoilage Risk' || s.status === 'Likely Spoiled').length;

  const avgScore = totalScans > 0
    ? Math.round(scans.reduce((acc, s) => acc + s.freshness_score, 0) / totalScans)
    : 0;

  // Temperature Danger Zone violations (Temp > 4°C for perishables)
  const dangerZoneCount = scans.filter((s) => {
    const isPerishable = ['Meat', 'Fish', 'Dairy', 'Cooked Food'].includes(s.food_category);
    return isPerishable && s.storage_used.temperature > 4 && s.storage_used.temperature < 60;
  }).length;

  // Category counts
  const categoryCounts = scans.reduce((acc, s) => {
    acc[s.food_category] = (acc[s.food_category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Kitchen Freshness & Waste Dashboard
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Aggregate monitoring of scanned pantry goods, temperature compliance, and spoilage trends.
          </p>
        </div>

        <button
          onClick={onNewScan}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          Scan New Food
        </button>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">
            Total Items Scanned
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-stone-900">{totalScans}</span>
            <span className="text-xs text-stone-400 font-medium">products</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2">
            Logged across sessions
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            Average Freshness
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600">{avgScore}</span>
            <span className="text-xs text-stone-400 font-medium">/100</span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-2">
            {avgScore >= 70 ? 'Optimal inventory quality' : 'Inventory requires attention'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">
            Aging / Use Soon
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{agingCount}</span>
            <span className="text-xs text-stone-400 font-medium">items</span>
          </div>
          <p className="text-[11px] text-amber-700 mt-2">
            Prioritize cooking this week
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block mb-1">
            Danger Zone Flags
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600">{dangerZoneCount}</span>
            <span className="text-xs text-stone-400 font-medium">violations</span>
          </div>
          <p className="text-[11px] text-rose-700 mt-2">
            Perishables stored at 4°C–60°C
          </p>
        </div>
      </div>

      {/* Freshness Health Distribution Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
            Inventory Freshness Spectrum
          </h3>
          <span className="text-xs text-stone-500">
            {totalScans > 0 ? `${Math.round((freshCount / totalScans) * 100)}% Freshness Ratio` : 'No scans yet'}
          </span>
        </div>

        {totalScans > 0 ? (
          <>
            <div className="w-full bg-stone-100 rounded-xl h-4 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${(freshCount / totalScans) * 100}%` }}
                className="bg-emerald-500 h-full transition-all"
                title={`Fresh / Mostly Fresh: ${freshCount}`}
              />
              <div
                style={{ width: `${(agingCount / totalScans) * 100}%` }}
                className="bg-amber-400 h-full transition-all"
                title={`Aging / Use Soon: ${agingCount}`}
              />
              <div
                style={{ width: `${(spoiledCount / totalScans) * 100}%` }}
                className="bg-rose-500 h-full transition-all"
                title={`High Risk / Spoiled: ${spoiledCount}`}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-stone-600">Fresh / Mostly Fresh ({freshCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="text-stone-600">Aging / Eat Soon ({agingCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="text-stone-600">High Spoilage Risk / Spoiled ({spoiledCount})</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-stone-500 py-3 text-center">
            Scan your first food item to populate inventory distribution charts.
          </p>
        )}
      </div>

      {/* Grid: Category Distribution & Food Safety Protocol */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-stone-600" />
            Categories Analyzed
          </h3>

          {Object.keys(categoryCounts).length > 0 ? (
            <div className="space-y-2.5">
              {Object.entries(categoryCounts).map(([cat, rawCount]) => {
                const count = Number(rawCount) || 0;
                const percentage = totalScans > 0 ? Math.round((count / totalScans) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs text-stone-700 font-medium">
                      <span>{cat}</span>
                      <span className="font-bold">{count} items ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-stone-400 py-6 text-center">
              No categories logged yet.
            </p>
          )}
        </div>

        {/* Temperature Danger Zone Guide */}
        <div className="bg-stone-900 text-stone-100 p-5 rounded-2xl border border-stone-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Food Safety Danger Zone Protocol</span>
          </div>

          <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/80 space-y-1.5 text-xs">
            <div className="flex items-center justify-between font-bold text-white">
              <span>Bacterial Danger Zone</span>
              <span className="text-rose-400 font-mono">4°C to 60°C (40°F - 140°F)</span>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              Bacteria such as <em>Salmonella</em>, <em>E. coli</em>, and <em>Staphylococcus aureus</em> double every 20 minutes in this range. Perishables left over 2 hours in this zone should be discarded regardless of appearance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="p-2.5 bg-stone-800 rounded-lg">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">
                Chilled Safe Zone
              </span>
              <span className="font-bold text-stone-100 text-xs">0°C to 4°C</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Slows microbial growth</span>
            </div>

            <div className="p-2.5 bg-stone-800 rounded-lg">
              <span className="text-[10px] text-sky-400 uppercase font-bold block">
                Frozen Safe Zone
              </span>
              <span className="font-bold text-stone-100 text-xs">Below -18°C</span>
              <span className="text-[10px] text-stone-400 block mt-0.5">Dormant microbes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
