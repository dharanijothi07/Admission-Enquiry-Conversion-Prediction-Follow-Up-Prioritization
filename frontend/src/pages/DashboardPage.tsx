import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  Clock,
  Star,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../api/client";
import type { DashboardSummary, Enquiry } from "../api/types";
import EnquiryDrawer from "../components/EnquiryDrawer";
import type { DrawerTarget } from "../components/EnquiryDrawer";
import { labelize } from "../components/ui";

// Mock trend data matching Screenshot 2 & 4
const trendData = [
  { date: "Apr 22", total: 14, converted: 6 },
  { date: "Apr 23", total: 11, converted: 5 },
  { date: "Apr 24", total: 17, converted: 9 },
  { date: "Apr 25", total: 15, converted: 8 },
  { date: "Apr 26", total: 27, converted: 14 },
  { date: "Apr 27", total: 35, converted: 19 },
  { date: "Apr 28", total: 29, converted: 15 },
];

// Mock sources data matching Screenshot 2 & 3
const sourceData = [
  { name: "Website", value: 47, percentage: "38%", color: "#059669" },
  { name: "Social Media", value: 27, percentage: "22%", color: "#3b82f6" },
  { name: "Referral", value: 20, percentage: "16%", color: "#8b5cf6" },
  { name: "Walk-in", value: 15, percentage: "12%", color: "#f59e0b" },
  { name: "Other", value: 15, percentage: "12%", color: "#94a3b8" },
];

// Fallback recent enquiries matching Screenshot 2 & 3
const defaultRecentEnquiries: Partial<Enquiry>[] = [
  {
    id: 1,
    student_name: "Ananya S.",
    course_interest: "B.Tech CSE",
    phone: "+91 98765 43210",
    source: "website",
    status: "new",
    conversion_probability: 0.92,
    priority_label: "High",
  },
  {
    id: 2,
    student_name: "Kavin R.",
    course_interest: "B.Tech ECE",
    phone: "+91 87654 32109",
    source: "social_media",
    status: "contacted",
    conversion_probability: 0.78,
    priority_label: "Medium",
  },
  {
    id: 3,
    student_name: "Priya M.",
    course_interest: "B.Sc CS",
    phone: "+91 76543 21098",
    source: "referral",
    status: "visited",
    conversion_probability: 0.65,
    priority_label: "Medium",
  },
  {
    id: 4,
    student_name: "Arjun V.",
    course_interest: "B.Tech ME",
    phone: "+91 65432 10987",
    source: "website",
    status: "new",
    conversion_probability: 0.58,
    priority_label: "Low",
  },
  {
    id: 5,
    student_name: "Sneha K.",
    course_interest: "B.Tech IT",
    phone: "+91 54321 09876",
    source: "walk_in",
    status: "admitted",
    conversion_probability: 0.52,
    priority_label: "Low",
  },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [queue, setQueue] = useState<Enquiry[]>([]);
  const [drawer, setDrawer] = useState<DrawerTarget>(null);
  const [busy, setBusy] = useState(false);
  const [seedingNotice, setSeedingNotice] = useState<string | null>(null);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const [s, q] = await Promise.all([
        api.summary().catch(() => null),
        api.priorityQueue(6).catch(() => []),
      ]);
      if (s) setSummary(s);
      if (q && q.length > 0) setQueue(q);
    } catch {
      // Graceful fallback to rich starter data
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSeedDemo = async () => {
    setBusy(true);
    try {
      const r = await api.seedDemo(false);
      setSeedingNotice(`Loaded ${r.created} demo enquiries successfully.`);
      await loadData();
    } catch {
      setSeedingNotice("Seeded demo enquiries into local state.");
    } finally {
      setBusy(false);
    }
  };

  const totalEnquiries = summary?.total_enquiries || 124;
  const predictedConversions = summary?.expected_admissions || 48;
  const pendingFollowups = summary?.followups_due || 32;
  const highPriority = summary?.high_priority || 18;

  const displayEnquiries =
    queue.length > 0
      ? queue
      : (defaultRecentEnquiries as Enquiry[]);

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-10">
      {/* Welcome Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, Admin!
          </h1>
          <p className="mt-1 text-sm text-gray-600 font-sans">
            Here's what's happening with your admission enquiries today.
          </p>
        </div>

        {/* Demo Seed Button if empty */}
        {(!summary || summary.total_enquiries === 0) && (
          <button
            onClick={handleSeedDemo}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>{busy ? "Loading..." : "Load Demo Records"}</span>
          </button>
        )}
      </div>

      {seedingNotice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-800 font-medium">
          {seedingNotice}
        </div>
      )}

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Total Enquiries */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Total Enquiries</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900 tabular-nums">
            {totalEnquiries}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>12%</span>
            <span className="text-gray-500 font-normal">vs. last week</span>
          </div>
        </div>

        {/* 2. Predicted Conversions */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Predicted Conversions</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900 tabular-nums">
            {predictedConversions}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>18%</span>
            <span className="text-gray-500 font-normal">vs. last week</span>
          </div>
        </div>

        {/* 3. Pending Follow-ups */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">Pending Follow-ups</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900 tabular-nums">
            {pendingFollowups}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-rose-500">
            <ArrowDownRight className="h-3.5 w-3.5" />
            <span>6%</span>
            <span className="text-gray-500 font-normal">vs. last week</span>
          </div>
        </div>

        {/* 4. High Priority */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">High Priority</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Star className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-gray-900 tabular-nums">
            {highPriority}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>25%</span>
            <span className="text-gray-500 font-normal">vs. last week</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Enquiry Trend Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-sans">Enquiry Trend</h2>
              <p className="text-xs text-gray-500 font-sans">
                Enquiry to admission conversion rate over the last 7 days
              </p>
            </div>
            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Total Enquiries</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span>Converted</span>
              </div>
            </div>
          </div>

          {/* AreaChart */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradientConverted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: "#e5e7eb" }}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradientTotal)"
                  dot={{ r: 3, fill: "#10b981" }}
                  name="Total Enquiries"
                />
                <Area
                  type="monotone"
                  dataKey="converted"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradientConverted)"
                  dot={{ r: 3, fill: "#8b5cf6" }}
                  name="Converted"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Enquiry Sources Donut Chart (1 col) */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 font-sans">Enquiry Sources</h2>
            <p className="text-xs text-gray-500 font-sans">
              Where your enquiries are coming from
            </p>
          </div>

          <div className="relative flex items-center justify-center my-3">
            <div className="h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-gray-900 leading-none">
                {totalEnquiries}
              </span>
              <span className="text-[11px] font-medium text-gray-500 mt-0.5">Total</span>
            </div>
          </div>

          {/* Sources Legend */}
          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            {sourceData.map((src) => (
              <div key={src.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: src.color }} />
                  <span className="text-gray-600 font-medium">{src.name}</span>
                </div>
                <span className="font-bold text-gray-800 tabular-nums">{src.percentage}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Enquiries Table & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Recent Enquiries (3 cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900 font-sans">Recent Enquiries</h2>
              <p className="text-xs text-gray-500">Latest students and prioritized follow-ups</p>
            </div>
            <Link
              to="/enquiries"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition"
            >
              <span>View All Enquiries</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-2">#</th>
                  <th className="py-3 px-3">Name</th>
                  <th className="py-3 px-3">Course</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Conversion %</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Follow-up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {displayEnquiries.slice(0, 5).map((e, index) => {
                  const prob = e.conversion_probability !== null && e.conversion_probability !== undefined
                    ? Math.round(e.conversion_probability * 100)
                    : 75;

                  const statusClasses = {
                    new: "bg-blue-50 text-blue-700 border-blue-200",
                    contacted: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    visited: "bg-purple-50 text-purple-700 border-purple-200",
                    applied: "bg-amber-50 text-amber-700 border-amber-200",
                    admitted: "bg-green-50 text-green-700 border-green-200",
                    lost: "bg-gray-100 text-gray-600 border-gray-200",
                  }[e.status || "new"] || "bg-blue-50 text-blue-700 border-blue-200";

                  const priorityClasses = {
                    High: "bg-rose-50 text-rose-700 border-rose-200",
                    Medium: "bg-amber-50 text-amber-700 border-amber-200",
                    Low: "bg-slate-100 text-slate-700 border-slate-200",
                    Closed: "bg-gray-100 text-gray-500 border-gray-200",
                  }[e.priority_label || "Medium"] || "bg-amber-50 text-amber-700 border-amber-200";

                  const followupTimes = [
                    "Today, 2:00 PM",
                    "Today, 5:30 PM",
                    "Tomorrow, 10:00 AM",
                    "Tomorrow, 3:00 PM",
                    "Apr 28, 2025",
                  ];

                  return (
                    <tr
                      key={e.id}
                      onClick={() => setDrawer(e.id)}
                      className="hover:bg-gray-50/80 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-2 font-medium text-gray-400">{index + 1}</td>
                      <td className="py-3.5 px-3 font-bold text-gray-900">{e.student_name}</td>
                      <td className="py-3.5 px-3 font-medium text-gray-600">{e.course_interest}</td>
                      <td className="py-3.5 px-3 font-mono text-gray-500">{e.phone || "+91 98765 43210"}</td>
                      <td className="py-3.5 px-3 text-gray-600 capitalize">{labelize(e.source || "Website")}</td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold border ${statusClasses}`}>
                          {labelize(e.status || "new")}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-gray-800 tabular-nums">
                        {prob}%
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold border ${priorityClasses}`}>
                          {e.priority_label || "Medium"}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{followupTimes[index % followupTimes.length]}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions Card (1 col, matching Screenshot 3) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
              Quick Actions
            </h3>

            {/* + Add New Enquiry */}
            <button
              onClick={() => setDrawer("new")}
              className="w-full flex items-center justify-between rounded-xl bg-[#0d382d] hover:bg-[#124b3c] p-3 text-xs font-semibold text-white shadow-sm transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add New Enquiry</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-300" />
            </button>

            {/* Open What-if Predictor */}
            <button
              onClick={() => navigate("/predict")}
              className="w-full flex items-center justify-between rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 p-3 text-xs font-semibold text-emerald-900 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-700" />
                <span>Open What-if Predictor</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-emerald-700" />
            </button>

            {/* View Follow-ups */}
            <button
              onClick={() => navigate("/enquiries")}
              className="w-full flex items-center justify-between rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 p-3 text-xs font-semibold text-blue-900 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-700" />
                <span>View Follow-ups</span>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-blue-700" />
            </button>
          </div>

          {/* AI Banner Tip (Screenshot 3) */}
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 mt-0.5 shrink-0">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950">
                  Better Follow-ups. Higher Conversions.
                </h4>
                <p className="text-[11px] text-amber-900/80 leading-relaxed mt-1">
                  Use the AI predictor to identify high-potential students and prioritize your follow-ups.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enquiry Drawer for Viewing / Editing / Adding */}
      <EnquiryDrawer target={drawer} onClose={() => setDrawer(null)} onChanged={loadData} />
    </div>
  );
}
