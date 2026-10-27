import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  TrendingUp,
  Calendar,
  Bell,
  Search,
  ChevronDown,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { API_BASE_URL, api } from "../api/client";

type ApiState = "checking" | "ok" | "degraded" | "down";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/enquiries", label: "Enquiries", icon: Users, end: false },
  { to: "/predict", label: "What-if predictor", icon: TrendingUp, end: false },
];

export default function Layout() {
  const [apiState, setApiState] = useState<ApiState>("checking");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    api
      .health()
      .then((h) => setApiState(h.database === "connected" ? "ok" : "degraded"))
      .catch(() => setApiState("down"));
  }, []);

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isOnline = apiState === "ok" || apiState === "checking";
  const statusLabel = {
    checking: "Checking system...",
    ok: "System online",
    degraded: "Degraded performance",
    down: "System offline",
  }[apiState];

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#f8faf9] md:flex text-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="bg-[#0d382d] text-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 flex flex-col justify-between shadow-xl z-30">
        <div>
          {/* Logo / Header */}
          <div className="flex items-center justify-between p-5 border-b border-emerald-900/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold leading-tight tracking-tight text-white">
                  Admissions desk
                </h1>
                <p className="text-[11px] text-emerald-200/70 font-sans">
                  Enquiry conversion & follow-ups
                </p>
              </div>
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white/80 hover:text-white p-1"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* System status pill */}
          <div className="px-5 pt-4 pb-2">
            <div
              className="inline-flex items-center gap-2 rounded-full bg-emerald-950/70 px-3 py-1 text-xs text-emerald-200 border border-emerald-800/60"
              title={`API endpoint: ${API_BASE_URL || "Local mock"}`}
            >
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  isOnline ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`}
              />
              <span className="font-medium">{statusLabel}</span>
            </div>
          </div>

          {/* Nav links */}
          <nav
            className={`${
              mobileMenuOpen ? "block" : "hidden"
            } md:block px-3 py-3 space-y-1.5`}
            aria-label="Main navigation"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white/15 text-white shadow-sm font-semibold border-l-4 border-emerald-400 pl-3"
                        : "text-emerald-100/75 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 space-y-4">
          {/* Better Insights Banner */}
          <div className="rounded-2xl border border-emerald-700/40 bg-emerald-900/40 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold text-white leading-tight">
                Better Insights
                <br />
                <span className="text-emerald-300">Bigger Admissions</span>
              </p>
            </div>
            <p className="text-[10px] text-emerald-200/70 tracking-wider uppercase font-medium">
              Track • Predict • Convert
            </p>
          </div>

          {/* User profile section */}
          <div className="flex items-center justify-between rounded-xl bg-emerald-950/60 p-2.5 border border-emerald-800/40">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 font-semibold text-xs text-white">
                AD
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-white leading-tight">Admin</p>
                <p className="text-[10px] text-emerald-200/60">Administrator</p>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-emerald-300/70" />
          </div>
        </div>
      </aside>

      {/* Main content container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 backdrop-blur-md px-6 md:px-10">
          {/* Search bar */}
          <div className="relative w-full max-w-md hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search enquiries, students, or courses..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-2 pl-9 pr-4 text-xs text-gray-700 outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Date pill */}
            <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-600 font-medium">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span>{todayFormatted}</span>
            </div>

            {/* Notification bell */}
            <button
              className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-rose-500" />
            </button>

            {/* User pill */}
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0d382d] text-white text-xs font-semibold">
                AD
              </div>
              <span className="text-xs font-semibold text-gray-800 hidden md:inline">Admin</span>
            </div>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 px-4 py-6 md:px-10 md:py-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
