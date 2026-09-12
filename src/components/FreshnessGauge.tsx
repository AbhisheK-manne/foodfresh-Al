import React from 'react';
import { FreshnessStatus, SpoilageRisk } from '../types';

interface FreshnessGaugeProps {
  score: number; // 0 - 100
  status: FreshnessStatus;
  risk: SpoilageRisk;
  confidence?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const FreshnessGauge: React.FC<FreshnessGaugeProps> = ({
  score,
  status,
  risk,
  confidence,
  size = 'md',
}) => {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // Color theme mapping
  const getTheme = (val: number) => {
    if (val >= 80) {
      return {
        stroke: '#10b981', // emerald-500
        bgRing: '#d1fae5',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        textColor: 'text-emerald-700',
        ringGlow: 'shadow-emerald-100',
      };
    }
    if (val >= 60) {
      return {
        stroke: '#0d9488', // teal-600
        bgRing: '#ccfbf1',
        badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
        textColor: 'text-teal-700',
        ringGlow: 'shadow-teal-100',
      };
    }
    if (val >= 40) {
      return {
        stroke: '#f59e0b', // amber-500
        bgRing: '#fef3c7',
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
        textColor: 'text-amber-700',
        ringGlow: 'shadow-amber-100',
      };
    }
    if (val >= 20) {
      return {
        stroke: '#f97316', // orange-500
        bgRing: '#ffedd5',
        badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
        textColor: 'text-orange-700',
        ringGlow: 'shadow-orange-100',
      };
    }
    return {
      stroke: '#e11d48', // rose-600
      bgRing: '#ffe4e6',
      badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
      textColor: 'text-rose-700',
      ringGlow: 'shadow-rose-100',
    };
  };

  const theme = getTheme(clampedScore);

  // SVG Geometry for semi-circular/circular arc gauge
  // Circumference for r=70 is 2 * PI * 70 = ~439.8
  const radius = size === 'lg' ? 84 : size === 'sm' ? 52 : 72;
  const strokeWidth = size === 'lg' ? 14 : size === 'sm' ? 8 : 12;
  const circumference = 2 * Math.PI * radius;
  // Use a 240-degree open gauge arc
  const arcFraction = 0.75;
  const arcLength = circumference * arcFraction;
  const strokeDashoffset = arcLength - (clampedScore / 100) * arcLength;
  const viewBoxSize = (radius + strokeWidth) * 2 + 10;
  const center = viewBoxSize / 2;

  const riskBadgeStyles: Record<SpoilageRisk, string> = {
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Medium: 'bg-amber-100 text-amber-800 border-amber-300',
    High: 'bg-orange-100 text-orange-800 border-orange-300',
    Critical: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse',
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-2">
      {/* Gauge SVG */}
      <div className="relative flex items-center justify-center">
        <svg
          width={size === 'lg' ? 240 : size === 'sm' ? 140 : 190}
          height={size === 'lg' ? 240 : size === 'sm' ? 140 : 190}
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="transform -rotate-90"
        >
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#e7e5e4"
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={0}
            strokeLinecap="round"
            className="transition-all duration-700"
          />

          {/* Active Score Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={arcLength}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Numbers */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-stone-600">
            Freshness
          </span>
          <div className="flex items-baseline justify-center">
            <span
              className={`font-black tracking-tight ${
                size === 'lg' ? 'text-5xl' : size === 'sm' ? 'text-2xl' : 'text-4xl'
              } ${theme.textColor}`}
            >
              {clampedScore}
            </span>
            <span className="text-stone-600 text-xs sm:text-sm font-medium ml-0.5">/100</span>
          </div>
          {confidence !== undefined && (
            <span className="text-[11px] text-stone-600 font-medium mt-0.5">
              Confidence: {confidence}%
            </span>
          )}
        </div>
      </div>

      {/* Status & Risk Pill Labels */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${theme.badgeBg}`}
        >
          {status}
        </span>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs flex items-center gap-1 ${riskBadgeStyles[risk]}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          Risk: {risk}
        </span>
      </div>
    </div>
  );
};
