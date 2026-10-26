import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { API_BASE_URL, api } from "../api/client";

type ApiState = "checking" | "ok" | "degraded" | "down";

const links = [
  { to: "/", label: "Today", end: true },
  { to: "/enquiries", label: "Enquiries", end: false },
  { to: "/predict", label: "What-if predictor", end: false },
];

export default function Layout() {
  const [apiState, setApiState] = useState<ApiState>("checking");

  useEffect(() => {
    api
      .health()
      .then((h) => setApiState(h.database === "connected" ? "ok" : "degraded"))
      .catch(() => setApiState("down"));
  }, []);

  const statusText = {
    checking: "Checking API…",
    ok: "API connected",
    degraded: "API up, database unavailable",
    down: "API unreachable",
  }[apiState];
  const dot = { checking: "bg-line", ok: "bg-emerald-400", degraded: "bg-amber-400", down: "bg-red-400" }[apiState];

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-forest-dark text-white md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0">
        <div className="flex items-center justify-between gap-4 px-4 py-3 md:block md:px-5 md:py-6">
          <div>
            <p className="font-serif text-xl leading-tight">Admissions desk</p>
            <p className="hidden text-xs text-white/70 md:mt-1 md:block">Enquiry conversion and follow-ups</p>
          </div>
          <p className="flex items-center gap-2 text-xs text-white/80 md:mt-6" title={API_BASE_URL}>
            <span className={`inline-block h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
            {statusText}
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0" aria-label="Main">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-md px-3 py-2 text-sm ${
                  isActive ? "bg-white/15 font-medium" : "text-white/80 hover:bg-white/10"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-9">
        <Outlet />
      </main>
    </div>
  );
}
