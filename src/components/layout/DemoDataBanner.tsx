import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Database } from 'lucide-react';
import { DEMO_BANNER_TEXT } from '../../data/mockData';

export const DemoDataBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-indigo-950 text-indigo-100 border-b border-indigo-900/60 px-4 py-2 text-xs transition-all">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-indigo-900/80 text-indigo-300 border border-indigo-700/50">
            College Final Year Project
          </span>
          <span className="font-medium text-indigo-200">
            {DEMO_BANNER_TEXT}
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center space-x-1 text-indigo-300 hover:text-white transition-colors"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{expanded ? 'Hide Academic ML Notes' : 'View Prototype ML Notes'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-indigo-900/40 text-indigo-300 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-indigo-900/40 p-2.5 rounded border border-indigo-800/40">
            <p className="font-semibold text-white flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              1. Demo Data Compliance
            </p>
            <p className="text-[11px] leading-relaxed text-indigo-200/90">
              Student names, mobile numbers, and marks are purely synthetic fixtures generated for evaluation. No real personal data is collected or transmitted.
            </p>
          </div>
          <div className="bg-indigo-900/40 p-2.5 rounded border border-indigo-800/40">
            <p className="font-semibold text-white flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />
              2. Heuristic ML Simulation
            </p>
            <p className="text-[11px] leading-relaxed text-indigo-200/90">
              Conversion probabilities simulate an XGBoost Classifier trained on 4,800 historical records, outputting TreeSHAP attribution factor weights in real time.
            </p>
          </div>
          <div className="bg-indigo-900/40 p-2.5 rounded border border-indigo-800/40">
            <p className="font-semibold text-white flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
              3. Dynamic Prioritization
            </p>
            <p className="text-[11px] leading-relaxed text-indigo-200/90">
              Follow-up queue sorts leads into Urgent, High, Medium, and Low tiers to maximize counsellor call impact and minimize admission dropout latency.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
