import React from 'react';
import { Sparkles } from 'lucide-react';

interface ScoreGaugeProps {
  score: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  showLabel = true,
  size = 'md'
}) => {
  // Determine color based on conversion probability
  const getColor = () => {
    if (score >= 80) return { stroke: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    if (score >= 60) return { stroke: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    if (score >= 40) return { stroke: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    return { stroke: '#ef4444', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
  };

  const colors = getColor();

  if (size === 'sm') {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${score}%`,
              backgroundColor: colors.stroke
            }}
          />
        </div>
        <span className={`text-xs font-bold ${colors.text}`}>{score}%</span>
      </div>
    );
  }

  // Circular SVG for md / lg
  const radius = size === 'lg' ? 42 : 28;
  const strokeWidth = size === 'lg' ? 7 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const dimension = (radius + strokeWidth) * 2;

  return (
    <div className="inline-flex items-center space-x-3">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimension}
          height={dimension}
          className="transform -rotate-90 transition-all duration-700"
        >
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`${size === 'lg' ? 'text-xl' : 'text-sm'} font-extrabold ${colors.text}`}>
            {score}%
          </span>
        </div>
      </div>

      {showLabel && (
        <div className="text-left">
          <div className="flex items-center space-x-1 text-slate-500 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>AI Conversion Chance</span>
          </div>
          <div className="text-xs text-slate-400">
            {score >= 80 ? 'Very High Potential' : score >= 60 ? 'Promising Lead' : score >= 40 ? 'Requires Nurturing' : 'Low Conversion Odds'}
          </div>
        </div>
      )}
    </div>
  );
};
