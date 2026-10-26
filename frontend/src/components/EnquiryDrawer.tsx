import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";
import { CHANNELS, STATUSES } from "../api/options";
import type { Channel, Enquiry, FollowUp, Status } from "../api/types";
import EnquiryForm from "./EnquiryForm";
import {
  ErrorNotice,
  Loading,
  OptionList,
  PriorityBadge,
  ProbabilityBar,
  formatDate,
  labelize,
} from "./ui";

export type DrawerTarget = number | "new" | null;

interface Props {
  target: DrawerTarget;
  onClose: () => void;
  /** Called after anything is created, changed or deleted so the page can refresh. */
  onChanged: () => void;
}

export default function EnquiryDrawer({ target, onClose, onChanged }: Props) {
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [channel, setChannel] = useState<Channel>("call");
  const [notes, setNotes] = useState("");
  const [nextDate, setNextDate] = useState("");
  const [moveTo, setMoveTo] = useState<"" | Status>("");
  const [logging, setLogging] = useState(false);

  const load = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const [e, f] = await Promise.all([api.getEnquiry(id), api.listFollowUps(id)]);
      setEnquiry(e);
      setFollowups(f);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load this enquiry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setEnquiry(null);
    setFollowups([]);
    setError(null);
    setEditing(target === "new");
    if (typeof target === "number") void load(target);
  }, [target, load]);

  useEffect(() => {
    if (target === null) return;
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, onClose]);

  if (target === null) return null;

  async function changeStatus(status: Status) {
    if (!enquiry) return;
    try {
      setEnquiry(await api.updateStatus(enquiry.id, status));
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change the status.");
    }
  }

  async function remove() {
    if (!enquiry || !window.confirm(`Delete the enquiry for ${enquiry.student_name}? This cannot be undone.`)) return;
    try {
      await api.deleteEnquiry(enquiry.id);
      onChanged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the enquiry.");
    }
  }

  async function logFollowUp(ev: FormEvent) {
    ev.preventDefault();
    if (!enquiry) return;
    setLogging(true);
    setError(null);
    try {
      await api.addFollowUp(enquiry.id, {
        channel,
        notes: notes.trim() || null,
        next_followup_date: nextDate || null,
        new_status: moveTo || null,
      });
      setNotes("");
      setNextDate("");
      setMoveTo("");
      await load(enquiry.id);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the follow-up.");
    } finally {
      setLogging(false);
    }
  }

  const facts: [string, string][] = enquiry
    ? [
        ["Course", enquiry.course_interest],
        ["Found us via", labelize(enquiry.source)],
        ["City", enquiry.city ?? "–"],
        ["Email", enquiry.email ?? "–"],
        ["Phone", enquiry.phone ?? "–"],
        ["Academic score", enquiry.previous_score !== null ? `${enquiry.previous_score}%` : "–"],
        ["Fee affordability", labelize(enquiry.fee_affordability)],
        ["Enquired on", formatDate(enquiry.enquiry_date)],
        ["Last contacted", formatDate(enquiry.last_contact_date)],
        ["Next follow-up", formatDate(enquiry.next_followup_date)],
        ["Follow-ups so far", String(enquiry.followup_count)],
        ["Usual reply time", `${enquiry.response_time_hours} h`],
        ["Visited campus", enquiry.campus_visited ? "Yes" : "No"],
        ["Asked for scholarship", enquiry.scholarship_requested ? "Yes" : "No"],
      ]
    : [];

  return (
    <div className="fixed inset-0 z-40 flex justify-end" role="dialog" aria-modal="true" aria-label="Enquiry details">
      <button className="absolute inset-0 bg-ink/40" aria-label="Close panel" onClick={onClose} />
      <div className="relative h-full w-full max-w-xl overflow-y-auto bg-card p-5 shadow-xl md:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-2xl">{target === "new" ? "New enquiry" : (enquiry?.student_name ?? "Enquiry")}</h2>
          <button className="btn-quiet" onClick={onClose}>Close</button>
        </div>

        {error && <div className="mb-4"><ErrorNotice message={error} /></div>}
        {loading && <Loading />}

        {editing ? (
          <EnquiryForm
            initial={enquiry ?? undefined}
            onCancel={() => (target === "new" ? onClose() : setEditing(false))}
            onSaved={(saved) => {
              onChanged();
              if (target === "new") onClose();
              else {
                setEnquiry(saved);
                setEditing(false);
              }
            }}
          />
        ) : (
          enquiry && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <PriorityBadge label={enquiry.priority_label} />
                  <label className="flex items-center gap-2 text-sm">
                    <span className="text-muted">Status</span>
                    <select className="input w-auto py-1" value={enquiry.status}
                      onChange={(e) => void changeStatus(e.target.value as Status)}>
                      <OptionList values={STATUSES} />
                    </select>
                  </label>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted">Chance of enrolling</p>
                  <ProbabilityBar value={enquiry.conversion_probability} />
                </div>
                <p className="rounded-md bg-forest-tint px-3 py-2 text-sm">{enquiry.recommended_action}</p>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {facts.map(([k, v]) => (
                  <div key={k} className="min-w-0">
                    <dt className="text-xs text-muted">{k}</dt>
                    <dd className="break-words">{v}</dd>
                  </div>
                ))}
              </dl>

              {enquiry.notes && (
                <div>
                  <p className="text-xs text-muted">Notes</p>
                  <p className="whitespace-pre-wrap text-sm">{enquiry.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button className="btn-quiet" onClick={() => setEditing(true)}>Edit details</button>
                <button className="btn-danger" onClick={() => void remove()}>Delete</button>
              </div>

              <section className="border-t border-line pt-5">
                <h3 className="mb-3 text-lg">Log a follow-up</h3>
                <form onSubmit={logFollowUp} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="label" htmlFor="fu-channel">How did you reach out?</label>
                      <select id="fu-channel" className="input" value={channel}
                        onChange={(e) => setChannel(e.target.value as Channel)}>
                        <OptionList values={CHANNELS} />
                      </select>
                    </div>
                    <div>
                      <label className="label" htmlFor="fu-next">Next follow-up on</label>
                      <input id="fu-next" type="date" className="input" value={nextDate}
                        onChange={(e) => setNextDate(e.target.value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="label" htmlFor="fu-status">Move to status</label>
                      <select id="fu-status" className="input" value={moveTo}
                        onChange={(e) => setMoveTo(e.target.value as "" | Status)}>
                        <option value="">Keep current status</option>
                        <OptionList values={STATUSES} />
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label" htmlFor="fu-notes">What was discussed?</label>
                    <textarea id="fu-notes" rows={2} maxLength={2000} className="input" value={notes}
                      onChange={(e) => setNotes(e.target.value)} />
                  </div>
                  <button type="submit" className="btn-primary" disabled={logging}>
                    {logging ? "Saving…" : "Save follow-up"}
                  </button>
                </form>

                <h3 className="mb-2 mt-6 text-lg">History</h3>
                {followups.length === 0 ? (
                  <p className="text-sm text-muted">No follow-ups logged yet.</p>
                ) : (
                  <ul className="divide-y divide-line text-sm">
                    {followups.map((f) => (
                      <li key={f.id} className="py-2.5">
                        <p>
                          <span className="font-medium">{labelize(f.channel)}</span>
                          <span className="text-muted"> on {formatDate(f.created_at)}</span>
                        </p>
                        {f.notes && <p className="text-muted">{f.notes}</p>}
                        {f.next_followup_date && (
                          <p className="text-muted">Next: {formatDate(f.next_followup_date)}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )
        )}
      </div>
    </div>
  );
}
