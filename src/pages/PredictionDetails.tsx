import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BrainCircuit,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { EnquiryService } from '../services/enquiryService';
import { MLService } from '../services/mlService';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { PriorityBadge } from '../components/common/Badge';
import { FeatureContributionBar } from '../components/ml/FeatureContributionBar';
import { AdmissionEnquiry } from '../types/enquiry';
import { MLEvaluationReport } from '../types/mlEvaluation';

export const PredictionDetails: React.FC = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>('');
  const [report, setReport] = useState<MLEvaluationReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [allEnq, mlReport] = await Promise.all([
          EnquiryService.getAllEnquiries(),
          MLService.getEvaluationReport()
        ]);
        setEnquiries(allEnq);
        setReport(mlReport);
        if (allEnq.length > 0) {
          setSelectedEnquiryId(allEnq[0].id);
        }
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

  const activeEnquiry = enquiries.find((e) => e.id === selectedEnquiryId) || enquiries[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-1">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-600" />
            <span>Explainable AI Engine (XAI)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Prediction & Prioritization Mechanics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Understand how candidate attributes map to conversion probabilities and priority tiers
          </p>
        </div>

        <button
          onClick={() => navigate('/ml-evaluation')}
          className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-all"
        >
          <span>View Model Benchmark (ROC-AUC)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Prioritization Tier Rule Matrix */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          Dynamic Follow-Up Prioritization Logic
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          How the ML inference engine routes leads to ensure minimal callback latency on high-conversion prospects
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-rose-800 text-sm">Urgent Priority</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-200/60 text-rose-800 font-bold">
                ≥ 85% Score
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong>Action:</strong> Callback within 4 hours. Connect directly with Senior Admissions Dean or HOD. Offer provisional scholarship letter.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-amber-800 text-sm">High Priority</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-200/60 text-amber-800 font-bold">
                70% - 84%
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong>Action:</strong> Callback within 24 hours. Invite candidate and parents for physical campus walkthrough and fee schedule explanation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-sky-800 text-sm">Medium Priority</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-200/60 text-sky-800 font-bold">
                45% - 69%
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong>Action:</strong> Callback within 48 hours. Send curriculum brochure via WhatsApp; address education loan or branch options.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700 text-sm">Low Priority</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold">
                &lt; 45% Score
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              <strong>Action:</strong> Enroll in automated email drip sequence and invite to open-house webinar. Conserve counsellor manual bandwidth.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Candidate Lead Inspector */}
      {activeEnquiry && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-600" />
                Live Candidate Lead Inspector
              </h3>
              <p className="text-xs text-slate-500">
                Select an enquiry from the database to inspect individual feature impact weights
              </p>
            </div>

            {/* Candidate Selector Dropdown */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500">Inspect Lead:</span>
              <select
                value={selectedEnquiryId}
                onChange={(e) => setSelectedEnquiryId(e.target.value)}
                className="text-xs font-medium border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                {enquiries.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.studentName} ({e.program.slice(0, 24)}... - {e.prediction.probabilityPercentage}%)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Enquiry Dossier Strip */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold text-slate-900">
                  {activeEnquiry.studentName}
                </span>
                <PriorityBadge priority={activeEnquiry.priorityTier} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {activeEnquiry.program} • Source: <strong>{activeEnquiry.leadSource}</strong> • Board Marks: <strong>{activeEnquiry.percentageScore}%</strong>
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <ScoreGauge score={activeEnquiry.prediction.probabilityPercentage} size="md" />
            </div>
          </div>

          {/* Feature Drivers Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              TreeSHAP Feature Attributions for {activeEnquiry.studentName}
            </h4>
            <FeatureContributionBar drivers={activeEnquiry.prediction.topDrivers} />
          </div>
        </div>
      )}

      {/* Global Feature Importance Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          Global Feature Importance Ranking (XGBoost Gini Impurity Gain)
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Derived from 4,800 historical college admission training records
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={report.featureImportances}
              layout="vertical"
              margin={{ left: 40, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 0.35]} />
              <YAxis
                type="category"
                dataKey="feature"
                stroke="#64748b"
                fontSize={11}
                width={180}
              />
              <Tooltip
                formatter={(val: any) => [`${(Number(val) * 100).toFixed(1)}% importance`, 'Weight']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="importance" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
