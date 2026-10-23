import React from 'react';
import { FeatureImpact } from '../../types/prediction';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface FeatureContributionBarProps {
  drivers: FeatureImpact[];
}

export const FeatureContributionBar: React.FC<FeatureContributionBarProps> = ({ drivers }) => {
  return (
    <div className="space-y-4">
      {drivers.map((driver, index) => {
        const isPositive = driver.impact === 'positive' || driver.weight > 0;
        const absWeight = Math.abs(driver.weight);
        const barWidth = Math.min(100, Math.round(absWeight * 200)); // normalized scale

        return (
          <div
            key={index}
            className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center space-x-2">
                <span
                  className={`p-1 rounded-md ${
                    isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                </span>
                <span className="font-semibold text-sm text-slate-800">
                  {driver.featureName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600 font-medium">
                  {driver.value}
                </span>
              </div>

              <span
                className={`text-xs font-mono font-bold ${
                  isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isPositive ? `+${(driver.weight * 100).toFixed(0)}%` : `${(driver.weight * 100).toFixed(0)}%`} Impact
              </span>
            </div>

            {/* Impact Magnitude Bar */}
            <div className="w-full bg-slate-200/60 rounded-full h-1.5 mb-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isPositive ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${barWidth}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{driver.explanation}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
};
