import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { SOURCES, STATUSES } from "../api/options";
import type { EnquiryPage } from "../api/types";
import EnquiryDrawer from "../components/EnquiryDrawer";
import type { DrawerTarget } from "../components/EnquiryDrawer";
import {
  ErrorNotice,
  Loading,
  OptionList,
  PriorityBadge,
  ProbabilityBar,
  StatusPill,
  formatDate,
  labelize,
} from "../components/ui";

const PAGE_SIZE = 15;

export default function EnquiriesPage() {
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("priority");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<EnquiryPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState<DrawerTarget>(null);

  // Wait until the user stops typing before searching.
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.listEnquiries({ q, status, source, priority, sort, page, page_size: PAGE_SIZE }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load enquiries.");
    } finally {
      setLoading(false);
    }
  }, [q, status, source, priority, sort, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const closeDrawer = useCallback(() => setDrawer(null), []);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;
  const filter = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Enquiries</h1>
          <p className="mt-1 text-sm text-muted">{data ? `${data.total} matching` : "Loading…"}</p>
        </div>
        <button className="btn-primary" onClick={() => setDrawer("new")}>New enquiry</button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="label" htmlFor="s-q">Search</label>
          <input id="s-q" className="input" placeholder="Name, email, phone or course" value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="s-status">Status</label>
          <select id="s-status" className="input" value={status} onChange={(e) => filter(setStatus)(e.target.value)}>
            <option value="">All statuses</option>
            <OptionList values={STATUSES} />
          </select>
        </div>
        <div>
          <label className="label" htmlFor="s-priority">Priority</label>
          <select id="s-priority" className="input" value={priority}
            onChange={(e) => filter(setPriority)(e.target.value)}>
            <option value="">All priorities</option>
            <OptionList values={["High", "Medium", "Low", "Closed"]} />
          </select>
        </div>
        <div>
          <label className="label" htmlFor="s-source">Source</label>
          <select id="s-source" className="input" value={source} onChange={(e) => filter(setSource)(e.target.value)}>
            <option value="">All sources</option>
            <OptionList values={SOURCES} />
          </select>
        </div>
        <div>
          <label className="label" htmlFor="s-sort">Sort by</label>
          <select id="s-sort" className="input" value={sort} onChange={(e) => filter(setSort)(e.target.value)}>
            <option value="priority">Follow-up priority</option>
            <option value="probability">Chance of enrolling</option>
            <option value="newest">Newest first</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      {error && <ErrorNotice message={error} />}
      {loading && !data && <Loading />}

      {data && data.items.length === 0 && !loading && (
        <p className="rounded-lg border border-dashed border-line bg-card p-6 text-sm text-muted">
          No enquiries match these filters. Clear a filter, or add a new enquiry.
        </p>
      )}

      {data && data.items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-line bg-card">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 font-medium">Student</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Source</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="w-40 px-4 py-2.5 font-medium">Chance of enrolling</th>
                <th className="px-4 py-2.5 font-medium">Priority</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Next follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((e) => (
                <tr key={e.id} className="cursor-pointer hover:bg-forest-tint/50" onClick={() => setDrawer(e.id)}>
                  <td className="px-4 py-3">
                    <button className="text-left font-medium hover:underline" onClick={() => setDrawer(e.id)}>
                      {e.student_name}
                    </button>
                    <span className="block text-xs text-muted">{e.course_interest}</span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">{labelize(e.source)}</td>
                  <td className="px-4 py-3"><StatusPill status={e.status} /></td>
                  <td className="px-4 py-3"><ProbabilityBar value={e.conversion_probability} /></td>
                  <td className="px-4 py-3">
                    <PriorityBadge label={e.priority_label} />
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">{formatDate(e.next_followup_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm">
          <button className="btn-quiet" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span className="text-muted">Page {page} of {pages}</span>
          <button className="btn-quiet" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}

      <EnquiryDrawer target={drawer} onClose={closeDrawer} onChanged={() => void load()} />
    </div>
  );
}
