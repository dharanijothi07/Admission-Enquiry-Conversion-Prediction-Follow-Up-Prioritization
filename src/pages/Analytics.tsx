import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  ArrowUpRight,
  Filter,
  PieChart as PieIcon,
  Download
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { AnalyticsService } from '../services/analyticsService';
import { MetricCard } from '../components/common/MetricCard';

const PROGRAM_DISTRIBUTION = [
  { name: 'B.Tech AI & Data Science', students: 142, color: '#6366f1' },
  { name: 'B.Tech Computer Science', students: 168, color: '#3b82f6' },
  { name: 'B.Tech Information Tech.', students: 84, color: '#06b6d4' },
  { name: 'B.Tech Electronics & Comm.', students: 62, color: '#10b981' },
  { name: 'MCA & MBA Tech.', students: 58, color: '#f59e0b' }
];

export const Analytics: React.FC = () => {
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [funnel, trends, sources] = await Promise.all([
          AnalyticsService.getFunnelData(),
          AnalyticsService.getMonthlyTrends(),
          AnalyticsService.getSourcePerformance()
        ]);
        setFunnelData(funnel);
        setMonthlyTrends(trends);
        setSourceData(sources);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Admissions Conversion & Funnel Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Holistic yield analysis across enquiry channels, departmental interest, and candidate lifecycle
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            Current Cycle: 2026-27 Admissions
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Funnel Lead Volume"
          value="480"
          subtitle="Processed this session"
          icon={Users}
          colorScheme="indigo"
          trend={{ value: '+18% YoY', isPositive: true }}
        />
        <MetricCard
          title="Campus Walk-in Ratio"
          value="39.1%"
          subtitle="188 visited campus"
          icon={Target}
          colorScheme="emerald"
          trend={{ value: 'Strongest conversion signal', isPositive: true }}
        />
        <MetricCard
          title="Enrolled Seats"
          value="86"
          subtitle="Paid token registration"
          icon={TrendingUp}
          colorScheme="sky"
          trend={{ value: 'Target: 120 seats', isPositive: true }}
        />
        <MetricCard
          title="Lead-to-Seat Win Rate"
          value="17.9%"
          subtitle="Industry benchmark: ~12%"
          icon={BarChart3}
          colorScheme="amber"
          trend={{ value: '+5.9% with AI scoring', isPositive: true }}
        />
      </div>

      {/* Funnel Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-800">
            Admissions Stage Drop-Off Funnel
          </h3>
          <p className="text-xs text-slate-400">
            Tracking candidate attrition from first digital touchpoint through final enrollment fee payment
          </p>
        </div>

        <div className="space-y-4">
          {funnelData.map((stage, idx) => {
            const widthPct = Math.round((stage.count / 480) * 100);
            return (
              <div key={stage.stage} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {idx + 1}. {stage.stage}
                  </span>
                  <div className="flex items-center space-x-3 text-slate-600">
                    <span className="font-mono font-bold text-indigo-700">{stage.count} candidates</span>
                    <span className="text-[11px] text-slate-400">({widthPct}%)</span>
                    {idx > 0 && (
                      <span className="text-[11px] text-rose-500 font-semibold">
                        -{stage.dropoff} drop-off
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 transition-all duration-700"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Interest Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Program Demand Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">
              Student candidate preference across engineering and postgraduate programs
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PROGRAM_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="students"
                  >
                    {PROGRAM_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-800 flex items-center justify-between">
            <span className="font-semibold">Top In-Demand Branch:</span>
            <span className="font-bold">B.Tech Computer Science (168 Enquiries)</span>
          </div>
        </div>

        {/* Source Yield Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Enquiries vs Enrolled by Source</h3>
            <p className="text-xs text-slate-400 mb-4">
              Total volume generated vs converted admissions
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="source"
                    stroke="#94a3b8"
                    fontSize={10}
                    angle={-18}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} />
                  <Bar dataKey="count" fill="#94a3b8" name="Total Inquiries" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="converted" fill="#10b981" name="Converted Seats" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 flex items-center justify-between">
            <span className="font-semibold">Highest Yield Source:</span>
            <span className="font-bold">Alumni Referrals (65.6%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
