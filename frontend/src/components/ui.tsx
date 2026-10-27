import type { PriorityLabel } from "../api/types";

export function labelize(value: string): string {
  if (!value) return "";
  const s = value.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function pct(p: number | null | undefined): string {
  return p === null || p === undefined ? "–" : `${Math.round(p * 100)}%`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "–";
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function todayISO(): string {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function OptionList({ values }: { values: readonly string[] }) {
  return (
    <>
      {values.map((v) => (
        <option key={v} value={v}>
          {labelize(v)}
        </option>
      ))}
    </>
  );
}

const badgeStyles: Record<PriorityLabel, string> = {
  High: "bg-rose-50 text-rose-700 border border-rose-200",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200",
  Low: "bg-slate-100 text-slate-700 border border-slate-200",
  Closed: "bg-gray-100 text-gray-500 border border-gray-200",
};

export function PriorityBadge({ label }: { label: PriorityLabel }) {
  return (
    <span
      className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-bold ${
        badgeStyles[label] || badgeStyles.Medium
      }`}
    >
      {label}
    </span>
  );
}

export function ProbabilityBar({ value }: { value: number | null }) {
  const width = Math.max(0, Math.min(1, value ?? 0)) * 100;
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="h-2 w-full min-w-16 rounded-full bg-emerald-100/70 overflow-hidden"
        role="img"
        aria-label={`${pct(value)} likely to enrol`}
      >
        <div className="h-full rounded-full bg-[#1b7a63] transition-all" style={{ width: `${width}%` }} />
      </div>
      <span className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-gray-700">
        {pct(value)}
      </span>
    </div>
  );
}

const statusStyles: Record<string, string> = {
  new: "bg-blue-50 text-blue-700 border-blue-200",
  contacted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  visited: "bg-purple-50 text-purple-700 border-purple-200",
  applied: "bg-amber-50 text-amber-700 border-amber-200",
  admitted: "bg-green-50 text-green-700 border-green-200",
  lost: "bg-gray-100 text-gray-600 border-gray-200",
};

export function StatusPill({ status }: { status: string }) {
  const norm = status.toLowerCase();
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
        statusStyles[norm] || "bg-gray-50 text-gray-700 border-gray-200"
      }`}
    >
      {labelize(status)}
    </span>
  );
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800">
      {message}
    </div>
  );
}

export function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        <span>{text}</span>
      </div>
    </div>
  );
}
