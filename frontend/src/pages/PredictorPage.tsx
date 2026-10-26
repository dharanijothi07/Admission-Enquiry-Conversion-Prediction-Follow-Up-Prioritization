import { useEffect, useState } from "react";
import { api } from "../api/client";
import { COURSES, FEE_LEVELS, SOURCES } from "../api/options";
import type { FeeLevel, PredictResult, Source } from "../api/types";
import { ErrorNotice, OptionList, ProbabilityBar, pct } from "../components/ui";

export default function PredictorPage() {
  const [course, setCourse] = useState<string>(COURSES[0]);
  const [source, setSource] = useState<Source>("website");
  const [fee, setFee] = useState<FeeLevel>("medium");
  const [score, setScore] = useState("65");
  const [followups, setFollowups] = useState("2");
  const [reply, setReply] = useState("24");
  const [visited, setVisited] = useState(false);
  const [scholarship, setScholarship] = useState(false);

  const [result, setResult] = useState<PredictResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Re-run the prediction shortly after any input changes.
  useEffect(() => {
    const t = setTimeout(() => {
      api
        .predict({
          course_interest: course.trim() || COURSES[0],
          source,
          fee_affordability: fee,
          previous_score: score.trim() === "" ? null : Number(score),
          followup_count: Number(followups || 0),
          response_time_hours: Number(reply || 0),
          campus_visited: visited,
          scholarship_requested: scholarship,
        })
        .then((r) => {
          setResult(r);
          setError(null);
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Prediction failed."));
    }, 400);
    return () => clearTimeout(t);
  }, [course, source, fee, score, followups, reply, visited, scholarship]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-3xl">What-if predictor</h1>
        <p className="mt-1 max-w-prose text-sm text-muted">
          Describe an enquiry and see how likely it is to become an admission. Nothing is saved.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-[1fr_20rem]">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="label" htmlFor="p-course">Course</label>
            <input id="p-course" className="input" list="p-courses" value={course}
              onChange={(e) => setCourse(e.target.value)} />
            <datalist id="p-courses">{COURSES.map((c) => <option key={c} value={c} />)}</datalist>
          </div>
          <div>
            <label className="label" htmlFor="p-source">How they found us</label>
            <select id="p-source" className="input" value={source} onChange={(e) => setSource(e.target.value as Source)}>
              <OptionList values={SOURCES} />
            </select>
          </div>
          <div>
            <label className="label" htmlFor="p-fee">Can the family afford the fees?</label>
            <select id="p-fee" className="input" value={fee} onChange={(e) => setFee(e.target.value as FeeLevel)}>
              <OptionList values={FEE_LEVELS} />
            </select>
          </div>
          <div>
            <label className="label" htmlFor="p-score">Academic score (%)</label>
            <input id="p-score" type="number" min={0} max={100} className="input" value={score}
              onChange={(e) => setScore(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="p-fu">Follow-ups so far</label>
            <input id="p-fu" type="number" min={0} max={200} className="input" value={followups}
              onChange={(e) => setFollowups(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="p-reply">Usual reply time (hours)</label>
            <input id="p-reply" type="number" min={0} max={720} className="input" value={reply}
              onChange={(e) => setReply(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={visited} onChange={(e) => setVisited(e.target.checked)} />
            Visited the campus
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={scholarship} onChange={(e) => setScholarship(e.target.checked)} />
            Asked about scholarships
          </label>
        </form>

        <aside className="rounded-lg border border-line bg-card p-5" aria-live="polite">
          {error && <ErrorNotice message={error} />}
          {result && (
            <>
              <p className="font-serif text-5xl tabular-nums">{pct(result.probability)}</p>
              <p className="mb-3 mt-1 text-sm text-muted">chance of enrolling ({result.band.toLowerCase()})</p>
              <ProbabilityBar value={result.probability} />
              <h2 className="mb-2 mt-6 text-lg">What moves the score</h2>
              {result.factors.length === 0 ? (
                <p className="text-sm text-muted">No single factor stands out.</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {result.factors.map((f) => (
                    <li key={f.feature} className="flex justify-between gap-3">
                      <span>{f.feature}</span>
                      <span className={f.direction === "up" ? "text-forest" : "text-brick"}>
                        {f.direction === "up" ? "Raises" : "Lowers"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {!result && !error && <p className="text-sm text-muted">Calculating…</p>}
        </aside>
      </div>
    </div>
  );
}
