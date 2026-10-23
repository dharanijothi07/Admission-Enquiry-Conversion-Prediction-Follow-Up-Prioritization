import React from 'react';
import { ConfusionMatrixData } from '../../types/mlEvaluation';

interface ConfusionMatrixProps {
  data: ConfusionMatrixData;
  totalSamples: number;
}

export const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ data, totalSamples }) => {
  const { truePositive, falsePositive, falseNegative, trueNegative } = data;

  const tpPct = ((truePositive / totalSamples) * 100).toFixed(1);
  const fpPct = ((falsePositive / totalSamples) * 100).toFixed(1);
  const fnPct = ((falseNegative / totalSamples) * 100).toFixed(1);
  const tnPct = ((trueNegative / totalSamples) * 100).toFixed(1);

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200">
      <div className="mb-4">
        <h4 className="font-bold text-slate-800 text-sm">Confusion Matrix (Synthetic Test Split, N = {totalSamples})</h4>
        <p className="text-xs text-slate-500">
          Evaluates actual candidate enrollment vs XGBoost model binary prediction
        </p>
      </div>

      <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center text-xs">
        {/* Header row */}
        <div></div>
        <div className="text-center font-semibold text-slate-700 py-1 bg-slate-100/70 rounded">
          Predicted: <span className="text-emerald-700">Enrolled (1)</span>
        </div>
        <div className="text-center font-semibold text-slate-700 py-1 bg-slate-100/70 rounded">
          Predicted: <span className="text-rose-700">Not Enrolled (0)</span>
        </div>

        {/* Actual: Enrolled row */}
        <div className="font-semibold text-slate-700 py-2 pr-2 text-right">
          Actual: <span className="text-emerald-700">Enrolled (1)</span>
        </div>
        {/* True Positive */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <div className="text-xs uppercase font-bold text-emerald-800">True Positive (TP)</div>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">{truePositive}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">{tpPct}% of test set</div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">Correctly Enrolled</div>
        </div>
        {/* False Negative */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <div className="text-xs uppercase font-bold text-amber-800">False Negative (FN)</div>
          <div className="text-2xl font-black text-amber-700 mt-0.5">{falseNegative}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">{fnPct}% of test set</div>
          <div className="text-[10px] text-amber-700 font-medium mt-1">Missed Opportunity</div>
        </div>

        {/* Actual: Not Enrolled row */}
        <div className="font-semibold text-slate-700 py-2 pr-2 text-right">
          Actual: <span className="text-rose-700">Not Enrolled (0)</span>
        </div>
        {/* False Positive */}
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
          <div className="text-xs uppercase font-bold text-rose-800">False Positive (FP)</div>
          <div className="text-2xl font-black text-rose-700 mt-0.5">{falsePositive}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">{fpPct}% of test set</div>
          <div className="text-[10px] text-rose-700 font-medium mt-1">False Alarm</div>
        </div>
        {/* True Negative */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div className="text-xs uppercase font-bold text-slate-700">True Negative (TN)</div>
          <div className="text-2xl font-black text-slate-800 mt-0.5">{trueNegative}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{tnPct}% of test set</div>
          <div className="text-[10px] text-slate-600 font-medium mt-1">Correctly Filtered</div>
        </div>
      </div>
    </div>
  );
};
