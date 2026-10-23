import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Target,
  Sparkles,
  TrendingUp,
  BrainCircuit,
  ArrowUpRight,
  Clock,
  PhoneCall,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { MetricCard } from '../components/common/MetricCard';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import { ScoreGauge } from '../components/common/ScoreGauge';
import { AnalyticsService, DashboardMetrics } from '../services/analyticsService';
import { EnquiryService } from '../services/enquiryService';
import { AuthService } from '../services/authService';
import { AdmissionEnquiry } from '../types/enquiry';
import { User } from '../types/auth';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
  const [counsellors, setCounsellors] = useState<User[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [met, enq, users, trends, sources] = await Promise.all([
          AnalyticsService.getExecutiveMetrics(),
          EnquiryService.getAllEnquiries(),
          AuthService.getAllUsers(),
          AnalyticsService.getMonthlyTrends(),
          AnalyticsService.getSourcePerformance()
        ]);
        setMetrics(met);
        setEnquiries(enq);
        setCounsellors(users.filter((u) => u.role === 'counsellor'));
        setMonthlyTrends(trends);
        setSourceData(sources);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const urgentEnquiries = enquiries
    .filter((e) => e.priorityTier === 'Urgent')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Director Admissions Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Macro-level conversion velocity, counsellor allocation & AI prioritization metrics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/ml-evaluation')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all"
          >
            <BrainCircuit className="w-4 h-4 text-indigo-600" />
            <span>ML Model Benchmark</span>
          </button>
          <button
            onClick={() => navigate('/enquiries/new')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-600/30 transition-all"
          >
            <span>+ Register Lead</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Pipeline Enquiries"
          value={metrics.totalEnquiries}
          subtitle="Active academic session"
          icon={Users}
          trend={{ value: '+14% vs last cycle', isPositive: true }}
          colorScheme="indigo"
          onClick={() => navigate('/enquiries')}
        />
        <MetricCard
          title="High-Intent Conversion Leads"
          value={metrics.predictedHighIntent}
          subtitle="AI score >= 75%"
          icon={Sparkles}
          trend={{ value: 'Prioritized for closing', isPositive: true }}
          colorScheme="emerald"
          onClick={() => navigate('/enquiries')}
        />
        <MetricCard
          title="Urgent Follow-Ups Pending"
          value={metrics.urgentFollowUps}
          subtitle="Requires immediate outreach"
          icon={Target}
          trend={{ value: 'Avg callback < 4 hrs', isPositive: false }}
          colorScheme="rose"
          onClick={() => navigate('/follow-ups')}
        />
        <MetricCard
          title="Overall Conversion Rate"
          value={`${metrics.overallConversionRate}%`}
          subtitle="Benchmarked against 35% target"
          icon={TrendingUp}
          trend={{ value: '+8.2% uplift via AI', isPositive: true }}
          colorScheme="sky"
          onClick={() => navigate('/analytics')}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Monthly Inbound Enquiries vs Enrolled Conversions
              </h3>
              <p className="text-xs text-slate-400">
                Tracking admissions velocity across peak counseling months
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              Session 2026-27
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEnq" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="enquiries"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEnq)"
                  name="Total Inquiries"
                />
                <Area
                  type="monotone"
                  dataKey="conversions"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorConv)"
                  name="Enrolled Conversions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Performance Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Source Conversion Yield</h3>
            <p className="text-xs text-slate-400 mb-4">
              Historical conversion percentage by acquisition channel
            </p>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData} layout="vertical" margin={{ left: 15, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 80]} stroke="#94a3b8" fontSize={10} unit="%" />
                  <YAxis
                    type="category"
                    dataKey="source"
                    stroke="#64748b"
                    fontSize={10}
                    width={90}
                    tickFormatter={(val) => (val.length > 12 ? `${val.slice(0, 12)}...` : val)}
                  />
                  <Tooltip
                    formatter={(value: any) => [`${value}% conversion rate`, 'Rate']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px'
                    }}
                  />
                  <Bar dataKey="rate" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between">
            <span className="font-semibold">Top Channel: Alumni Referrals</span>
            <span className="font-bold">65.6% Win Rate</span>
          </div>
        </div>
      </div>

      {/* Two-column Bottom: Urgent Attention Queue & Counsellor Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Attention Leads */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                Top Priority Leads Awaiting Closing
              </h3>
              <p className="text-xs text-slate-400">
                Highest ML scores requiring senior counsellor interaction
              </p>
            </div>
            <button
              onClick={() => navigate('/enquiries')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {urgentEnquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                onClick={() => navigate(`/enquiries/${enquiry.id}`)}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 cursor-pointer transition-all flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 truncate">
                      {enquiry.studentName}
                    </span>
                    <PriorityBadge priority={enquiry.priorityTier} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {enquiry.program} • {enquiry.city}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span>Counsellor: {enquiry.counsellorName}</span>
                    <span>Marks: {enquiry.percentageScore}%</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <ScoreGauge score={enquiry.prediction.probabilityPercentage} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Counsellor Workload Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Admissions Counsellor Allocation & Yield
              </h3>
              <p className="text-xs text-slate-400">
                Active lead capacity, follow-up rate, and conversion efficiency
              </p>
            </div>
            <button
              onClick={() => navigate('/users')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
            >
              <span>Manage Staff</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {counsellors.map((c) => (
              <div
                key={c.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/40 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{c.name}</h4>
                    <p className="text-[11px] text-slate-500">{c.department}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Active
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {c.activeEnquiriesCount}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Conversion
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      {c.conversionRate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
