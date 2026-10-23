import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  colorScheme = 'indigo',
  onClick
}) => {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-50/70',
      iconColor: 'text-indigo-600',
      border: 'border-indigo-100',
      hover: 'hover:border-indigo-300'
    },
    emerald: {
      bg: 'bg-emerald-50/70',
      iconColor: 'text-emerald-600',
      border: 'border-emerald-100',
      hover: 'hover:border-emerald-300'
    },
    amber: {
      bg: 'bg-amber-50/70',
      iconColor: 'text-amber-600',
      border: 'border-amber-100',
      hover: 'hover:border-amber-300'
    },
    rose: {
      bg: 'bg-rose-50/70',
      iconColor: 'text-rose-600',
      border: 'border-rose-100',
      hover: 'hover:border-rose-300'
    },
    sky: {
      bg: 'bg-sky-50/70',
      iconColor: 'text-sky-600',
      border: 'border-sky-100',
      hover: 'hover:border-sky-300'
    }
  };

  const current = colorMap[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border ${current.border} ${current.hover} p-5 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${current.bg} ${current.iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <div
              className={`flex items-center space-x-1 font-medium ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span>{trend.value}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
