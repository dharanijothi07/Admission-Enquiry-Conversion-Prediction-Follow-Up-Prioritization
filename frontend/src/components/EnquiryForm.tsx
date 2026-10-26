import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";
import { COURSES, FEE_LEVELS, SOURCES, STATUSES } from "../api/options";
import type { Enquiry, EnquiryInput, FeeLevel, Source, Status } from "../api/types";
import { ErrorNotice, OptionList, todayISO } from "./ui";

interface FormState {
  student_name: string;
  email: string;
  phone: string;
  city: string;
  course_interest: string;
  source: Source;
  previous_score: string;
  fee_affordability: FeeLevel;
  enquiry_date: string;
  last_contact_date: string;
  next_followup_date: string;
  followup_count: string;
  response_time_hours: string;
  campus_visited: boolean;
  scholarship_requested: boolean;
  status: Status;
  notes: string;
}

function toState(e?: Enquiry): FormState {
  return {
    student_name: e?.student_name ?? "",
    email: e?.email ?? "",
    phone: e?.phone ?? "",
    city: e?.city ?? "",
    course_interest: e?.course_interest ?? "",
    source: e?.source ?? "website",
    previous_score: e?.previous_score?.toString() ?? "",
    fee_affordability: e?.fee_affordability ?? "medium",
    enquiry_date: e?.enquiry_date ?? todayISO(),
    last_contact_date: e?.last_contact_date ?? "",
    next_followup_date: e?.next_followup_date ?? "",
    followup_count: (e?.followup_count ?? 0).toString(),
    response_time_hours: (e?.response_time_hours ?? 24).toString(),
    campus_visited: e?.campus_visited ?? false,
    scholarship_requested: e?.scholarship_requested ?? false,
    status: e?.status ?? "new",
    notes: e?.notes ?? "",
  };
}

function toInput(s: FormState): EnquiryInput {
  const orNull = (v: string) => (v.trim() === "" ? null : v.trim());
  return {
    student_name: s.student_name,
    email: orNull(s.email),
    phone: orNull(s.phone),
    city: orNull(s.city),
    course_interest: s.course_interest,
    source: s.source,
    previous_score: s.previous_score.trim() === "" ? null : Number(s.previous_score),
    fee_affordability: s.fee_affordability,
    enquiry_date: s.enquiry_date,
    last_contact_date: orNull(s.last_contact_date),
    next_followup_date: orNull(s.next_followup_date),
    followup_count: Number(s.followup_count || 0),
    response_time_hours: Number(s.response_time_hours || 0),
    campus_visited: s.campus_visited,
    scholarship_requested: s.scholarship_requested,
    status: s.status,
    notes: orNull(s.notes),
  };
}

interface Props {
  initial?: Enquiry;
  onSaved: (saved: Enquiry) => void;
  onCancel: () => void;
}

export default function EnquiryForm({ initial, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(() => toState(initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = toInput(form);
      const saved = initial ? await api.updateEnquiry(initial.id, payload) : await api.createEnquiry(payload);
      onSaved(saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the enquiry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <ErrorNotice message={error} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="f-name">Student name</label>
          <input id="f-name" className="input" required maxLength={120} value={form.student_name}
            onChange={(e) => set("student_name", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="f-email">Email</label>
          <input id="f-email" type="email" className="input" value={form.email}
            onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="f-phone">Phone</label>
          <input id="f-phone" className="input" placeholder="+91 98765 43210" value={form.phone}
            onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="f-course">Course interested in</label>
          <input id="f-course" className="input" required list="course-options" maxLength={80}
            value={form.course_interest} onChange={(e) => set("course_interest", e.target.value)} />
          <datalist id="course-options">
            {COURSES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className="label" htmlFor="f-city">City</label>
          <input id="f-city" className="input" value={form.city} onChange={(e) => set("city", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="f-source">How they found us</label>
          <select id="f-source" className="input" value={form.source}
            onChange={(e) => set("source", e.target.value as Source)}>
            <OptionList values={SOURCES} />
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-score">Academic score (%)</label>
          <input id="f-score" type="number" min={0} max={100} step="0.1" className="input"
            value={form.previous_score} onChange={(e) => set("previous_score", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="f-fee">Can the family afford the fees?</label>
          <select id="f-fee" className="input" value={form.fee_affordability}
            onChange={(e) => set("fee_affordability", e.target.value as FeeLevel)}>
            <OptionList values={FEE_LEVELS} />
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-status">Status</label>
          <select id="f-status" className="input" value={form.status}
            onChange={(e) => set("status", e.target.value as Status)}>
            <OptionList values={STATUSES} />
          </select>
        </div>
        <div>
          <label className="label" htmlFor="f-edate">Enquiry date</label>
          <input id="f-edate" type="date" required className="input" value={form.enquiry_date}
            onChange={(e) => set("enquiry_date", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="f-last">Last contacted</label>
          <input id="f-last" type="date" className="input" value={form.last_contact_date}
            onChange={(e) => set("last_contact_date", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="f-next">Next follow-up on</label>
          <input id="f-next" type="date" className="input" value={form.next_followup_date}
            onChange={(e) => set("next_followup_date", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="f-count">Follow-ups so far</label>
          <input id="f-count" type="number" min={0} max={200} className="input" value={form.followup_count}
            onChange={(e) => set("followup_count", e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="f-resp">Usual reply time (hours)</label>
          <input id="f-resp" type="number" min={0} max={720} step="0.5" className="input"
            value={form.response_time_hours} onChange={(e) => set("response_time_hours", e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.campus_visited}
            onChange={(e) => set("campus_visited", e.target.checked)} />
          Visited the campus
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.scholarship_requested}
            onChange={(e) => set("scholarship_requested", e.target.checked)} />
          Asked about scholarships
        </label>
      </div>

      <div>
        <label className="label" htmlFor="f-notes">Notes</label>
        <textarea id="f-notes" rows={3} maxLength={2000} className="input" value={form.notes}
          onChange={(e) => set("notes", e.target.value)} />
      </div>

      <div className="flex gap-2">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add enquiry"}
        </button>
        <button type="button" className="btn-quiet" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
