import type { PriorityLabel } from "../api/types";

export function labelize(value: string): string {
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
  High: "bg-forest text-white",
  Medium: "bg-saffron-tint text-saffron",
  Low: "bg-line/70 text-muted",
  Closed: "border border-line text-muted",
};

export function PriorityBadge({ label }: { label: PriorityLabel }) {
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${badgeStyles[label]}`}>{label}</span>
  );
}

export function ProbabilityBar({ value }: { value: number | null }) {
  const width = Math.max(0, Math.min(1, value ?? 0)) * 100;
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-1.5 w-full min-w-16 rounded-full bg-line"
        role="img"
        aria-label={`${pct(value)} likely to enrol`}
      >
        <div className="h-full rounded-full bg-forest" style={{ width: `${width}%` }} />
      </div>
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted">{pct(value)}</span>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  return <span className="rounded border border-line px-2 py-0.5 text-xs text-ink">{labelize(status)}</span>;
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-md border border-brick/30 bg-brick-tint px-3 py-2 text-sm text-brick">
      {message}
    </div>
  );
}

export function Loading({ text = "Loading…" }: { text?: string }) {
  return <p className="py-8 text-sm text-muted">{text}</p>;
}

export interface BarRow {
  label: string;
  value: number;
  note?: string;
}

export function BarList({ rows }: { rows: BarRow[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="text-sm">
          <div className="mb-1 flex justify-between gap-2">
            <span>{r.label}</span>
            <span className="tabular-nums text-muted">
              {r.value}
              {r.note ? ` · ${r.note}` : ""}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-line">
            <div className="h-full rounded-full bg-forest/80" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
