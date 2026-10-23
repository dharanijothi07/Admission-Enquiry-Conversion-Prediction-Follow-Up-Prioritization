import React, { useEffect, useState } from 'react';
import {
  BrainCircuit,
  ShieldAlert,
  Award,
  CheckCircle2,
  Cpu,
  Layers,
  Database,
  BarChart2,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { MLService } from '../services/mlService';
import { ConfusionMatrix } from '../components/ml/ConfusionMatrix';
import { MLEvaluationReport } from '../types/mlEvaluation';

export const MLEvaluation: React.FC = () => {
  const [report, setReport] = useState<MLEvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await MLService.getEvaluationReport();
        setReport(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { metrics, confusionMatrix, modelComparisons, datasetSize, featureImportances, calibrationCurve } = report;

  return (
    <div className="space-y-6">
      {/* Top Academic Disclaimer & Integrity Notice */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 text-amber-950 shadow-2xs">
        <div className="flex items-start space-x-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-sm uppercase tracking-wide text-amber-900">
                Academic Research Prototype Evaluation Notice
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold">
                Synthetic Benchmark Dataset (N = 1,200)
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              {report.disclaimer}
            </p>
            <p className="text-[11px] text-amber-700 font-medium">
              Academic Protocol: All model weights, evaluation splits, and confusion matrices reflect offline simulated benchmarking on synthetic student features to demonstrate system validity prior to production deployment.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-1">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span>Supervised Binary Classification</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Machine Learning Model Performance & Benchmark
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Model validation metrics, confusion matrix, ROC-AUC comparison, and calibration curves
          </p>
        </div>

        <div className="text-xs font-mono bg-white px-3 py-2 rounded-xl border border-slate-200 text-slate-700 shadow-2xs">
          Champion: <strong className="text-indigo-600 font-bold">XGBoost-Ensemble v2.3</strong>
        </div>
      </div>

      {/* Model Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            ROC-AUC Score
          </span>
          <span className="text-2xl font-black text-indigo-600">{metrics.rocAuc}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Discriminative Power</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Precision
          </span>
          <span className="text-2xl font-black text-emerald-600">
            {(metrics.precision * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Lead Quality Signal</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Recall (Sensitivity)
          </span>
          <span className="text-2xl font-black text-emerald-600">
            {(metrics.recall * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Conversion Capture</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            F1-Score
          </span>
          <span className="text-2xl font-black text-sky-600">
            {(metrics.f1Score * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Harmonic Balance</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            Overall Accuracy
          </span>
          <span className="text-2xl font-black text-slate-800">
            {(metrics.accuracy * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-1">Overall Test Accuracy</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
            PR-AUC
          </span>
          <span className="text-2xl font-black text-indigo-600">{metrics.prAuc}</span>
          <span className="text-[10px] text-slate-500 block mt-1">Precision-Recall Curve</span>
        </div>
      </div>

      {/* Two Column: Confusion Matrix & Training Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Component */}
        <ConfusionMatrix data={confusionMatrix} totalSamples={datasetSize.testRecords} />

        {/* Training Dataset Specs Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Dataset Partitioning & Validation Protocol
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Stratified split ensuring equal distribution of converted and un-enrolled leads
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">Total Synthetic Dataset Size:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {datasetSize.totalRecords.toLocaleString()} admission records
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">Training Partition (80%):</span>
                <span className="font-bold text-slate-900 font-mono">
                  {datasetSize.trainingRecords.toLocaleString()} samples
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">Holdout Stratified Test Set (20%):</span>
                <span className="font-bold text-indigo-700 font-mono">
                  {datasetSize.testRecords.toLocaleString()} samples
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">Validation Methodology:</span>
                <span className="font-bold text-slate-900">5-Fold Stratified Cross-Validation</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-medium text-slate-600">Feature Encoding:</span>
                <span className="font-bold text-slate-900">One-Hot + Robust Scaling</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-[11px] text-indigo-800 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Target Class: <strong>1 = Candidate Enrolled / Paid Fee</strong>, <strong>0 = Dropped Out / Lost</strong></span>
          </div>
        </div>
      </div>

      {/* Multi-Model Comparison Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800">
            Algorithmic Benchmark Comparison (Offline Test Split)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluating Tree ensembles against baseline logistic regression
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Algorithm Model</th>
                <th className="py-3 px-4">Model Class</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4">Inference Latency</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modelComparisons.map((model) => (
                <tr
                  key={model.name}
                  className={model.isCurrentChampion ? 'bg-indigo-50/30 font-medium' : 'hover:bg-slate-50'}
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                    {model.name}
                    {model.isCurrentChampion && (
                      <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-semibold">
                        Champion
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{model.type}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {(model.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-600">
                    {(model.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-600">
                    {(model.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {(model.f1Score * 100).toFixed(1)}%
                  </td>
                  <td className="py-3.5 px-4 font-mono font-black text-indigo-700">
                    {model.rocAuc}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {model.inferenceLatencyMs} ms
                  </td>
                  <td className="py-3.5 px-4">
                    {model.isCurrentChampion ? (
                      <span className="inline-flex items-center gap-1 text-indigo-700 text-[11px] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                        Active in Engine
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Benchmarked</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Model Calibration Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          Model Probability Calibration Curve (Reliability Diagram)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Compares mean predicted probability against actual fraction of enrolled students per score decile
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={calibrationCurve} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bin" stroke="#94a3b8" fontSize={11} />
              <YAxis domain={[0, 1]} stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="predictedProb"
                stroke="#6366f1"
                strokeWidth={2}
                name="Mean Predicted Probability"
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="trueFraction"
                stroke="#10b981"
                strokeWidth={2}
                name="Actual Enrolled Fraction"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
