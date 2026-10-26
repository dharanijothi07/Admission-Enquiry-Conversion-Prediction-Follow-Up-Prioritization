import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { DashboardSummary, Enquiry, ModelInfo } from "../api/types";
import EnquiryDrawer from "../components/EnquiryDrawer";
import type { DrawerTarget } from "../components/EnquiryDrawer";
import {
  BarList,
  ErrorNotice,
  Loading,
  PriorityBadge,
  ProbabilityBar,
  formatDate,
  labelize,
  pct,
} from "../components/ui";

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [queue, setQueue] = useState<Enquiry[]>([]);
  const [model, setModel] = useState<ModelInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerTarget>(null);

  const load = useCallback(async () => {
    try {
      const [s, q, m] = await Promise.all([
        api.summary(),
        api.priorityQueue(8),
        api.modelInfo().catch(() => null),
      ]);
      setSummary(s);
      setQueue(q);
      setModel(m);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const closeDrawer = useCallback(() => setDrawer(null), []);

  async function loadDemo() {
    setBusy(true);
    setError(null);
    try {
      const r = await api.seedDemo(false);
      setNotice(`Loaded ${r.created} demo enquiries.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load demo data.");
    } finally {
      setBusy(false);
    }
  }

  async function retrain() {
    setBusy(true);
    setError(null);
    try {
      const r = await api.retrain();
      setNotice(`Model retrained on ${r.model.data_source} data. ${r.enquiries_rescored} enquiries re-scored.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not retrain the model.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="text-3xl">Who to call today</h1>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Open enquiries ranked by how likely they are to enrol and how overdue the next contact is.
        </p>
      </header>

      {error && <ErrorNotice message={error} />}
      {notice && (
        <p role="status" className="rounded-md bg-forest-tint px-3 py-2 text-sm">{notice}</p>
      )}

      {summary && summary.total_enquiries === 0 ? (
        <section className="rounded-lg border border-dashed border-line bg-card p-8">
          <h2 className="text-xl">No enquiries yet</h2>
          <p className="mt-1 max-w-prose text-sm text-muted">
            Add your first enquiry, or load sample records to see how scoring and prioritization look.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn-primary" disabled={busy} onClick={() => void loadDemo()}>
              {busy ? "Loading…" : "Load demo data"}
            </button>
            <Link to="/enquiries" className="btn-quiet">Add an enquiry</Link>
          </div>
        </section>
      ) : (
        summary && (
          <>
            <section aria-label="Key figures"
              className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-5">
              {[
                ["Open enquiries", String(summary.open_enquiries)],
                ["High priority", String(summary.high_priority)],
                ["Follow-ups due", String(summary.followups_due)],
                ["Expected admissions", summary.expected_admissions.toFixed(1)],
                ["Past conversion rate", pct(summary.conversion_rate)],
              ].map(([label, value]) => (
                <div key={label} className="bg-card px-4 py-4 last:col-span-2 md:last:col-span-1">
                  <p className="font-serif text-3xl tabular-nums">{value}</p>
                  <p className="mt-0.5 text-xs text-muted">{label}</p>
                </div>
              ))}
            </section>

            <section>
              <h2 className="mb-3 text-xl">Call list</h2>
              {queue.length === 0 ? (
                <p className="text-sm text-muted">Every open enquiry has been handled. Nothing to follow up.</p>
              ) : (
                <ol className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-card">
                  {queue.map((e, i) => (
                    <li key={e.id}>
                      <button
                        onClick={() => setDrawer(e.id)}
                        className="grid w-full gap-x-4 gap-y-2 px-4 py-3 text-left hover:bg-forest-tint/50 md:grid-cols-[2rem_1.4fr_1.6fr_9rem_7rem] md:items-center"
                      >
                        <span className="hidden font-serif text-lg text-muted md:block">{i + 1}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{e.student_name}</span>
                          <span className="block truncate text-xs text-muted">
                            {e.course_interest}, via {labelize(e.source)}
                          </span>
                        </span>
                        <span className="text-sm">
                          {e.recommended_action}
                          <span className="block text-xs text-muted">
                            Last contact {formatDate(e.last_contact_date ?? e.enquiry_date)}
                          </span>
                        </span>
                        <ProbabilityBar value={e.conversion_probability} />
                        <span className="flex items-center gap-2">
                          <PriorityBadge label={e.priority_label} />
                          <span className="text-xs tabular-nums text-muted">{e.priority_score}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
              <Link to="/enquiries" className="mt-3 inline-block text-sm text-forest underline">
                See all enquiries
              </Link>
            </section>

            <section className="grid gap-8 md:grid-cols-3">
              <div>
                <h2 className="mb-3 text-xl">Pipeline</h2>
                <BarList rows={Object.entries(summary.by_status).map(([k, v]) => ({ label: labelize(k), value: v }))} />
              </div>
              <div>
                <h2 className="mb-3 text-xl">Conversion by source</h2>
                <BarList
                  rows={summary.by_source.map((s) => ({
                    label: labelize(s.source),
                    value: s.total,
                    note: s.conversion_rate === null ? "no outcomes yet" : `${pct(s.conversion_rate)} enrolled`,
                  }))}
                />
              </div>
              <div>
                <h2 className="mb-3 text-xl">Open enquiries by likelihood</h2>
                <BarList rows={Object.entries(summary.probability_buckets).map(([k, v]) => ({ label: k, value: v }))} />
              </div>
            </section>
          </>
        )
      )}

      <section className="rounded-lg border border-line bg-card p-5">
        <h2 className="text-xl">Prediction model</h2>
        {model ? (
          <>
            <p className="mt-1 max-w-prose text-sm text-muted">
              {model.data_source === "synthetic"
                ? "Scores currently come from a model trained on made-up starter data. Once you have at least 100 enquiries marked admitted or lost, retrain it on your own history."
                : "Scores come from a model trained on your own admitted and lost enquiries."}
            </p>
            <dl className="mt-3 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
              <div><dt className="text-xs text-muted">Training data</dt><dd>{labelize(model.data_source)}, {model.n_samples} rows</dd></div>
              <div><dt className="text-xs text-muted">Accuracy on held-out data</dt><dd>{pct(model.metrics.accuracy)}</dd></div>
              <div><dt className="text-xs text-muted">ROC AUC</dt><dd>{model.metrics.roc_auc.toFixed(2)}</dd></div>
              <div><dt className="text-xs text-muted">Trained</dt><dd>{formatDate(model.trained_at)}</dd></div>
            </dl>
          </>
        ) : (
          <p className="mt-1 text-sm text-muted">Model details are not available.</p>
        )}
        <button className="btn-quiet mt-4" disabled={busy} onClick={() => void retrain()}>
          {busy ? "Working…" : "Retrain model"}
        </button>
      </section>

      <EnquiryDrawer target={drawer} onClose={closeDrawer} onChanged={() => void load()} />
    </div>
  );
}
