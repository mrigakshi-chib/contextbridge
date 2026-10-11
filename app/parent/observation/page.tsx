"use client";

import Link from "next/link";
import { useState } from "react";

import {
  extractObservation,
  ExtractedObservation,
} from "./actions";

export default function ParentObservationPage() {
  const [note, setNote] = useState("");

  const [result, setResult] =
    useState<ExtractedObservation | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleExtract() {
    if (!note.trim()) {
      setError("Please describe what you noticed.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const extracted = await extractObservation(note);

      setResult(extracted);
    } catch (error) {
      console.error(error);

      setError(
        "We couldn't structure that observation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link
          href="/"
          className="text-sm font-medium text-teal-700 hover:text-teal-800"
        >
          ← Back to dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm font-medium uppercase tracking-widest text-teal-700">
            ContextBridge
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Tell us what you noticed
          </h1>

          <p className="mt-2 max-w-2xl leading-6 text-slate-500">
            Describe what happened naturally. ContextBridge will
            structure the observation for you to review before
            anything is saved.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <label
            htmlFor="note"
            className="text-sm font-medium text-slate-700"
          >
            What happened today?
          </label>

          <textarea
            id="note"
            value={note}
            onChange={(event) =>
              setNote(event.target.value)
            }
            rows={7}
            placeholder='Example: Aarav asked me "want juice" twice by himself during breakfast. Later while playing he mostly pointed and I had to ask him what he wanted.'
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />

          {error && (
            <p className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={handleExtract}
              disabled={loading}
              className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Understanding observation..."
                : "Review observation"}
            </button>
          </div>
        </section>

        {result && result.needsClarification && (
          <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-sm font-medium uppercase tracking-wider text-amber-700">
              More information needed
            </p>

            <h2 className="mt-2 text-xl font-semibold text-amber-950">
              Could you tell us a little more?
            </h2>

            <p className="mt-3 text-sm leading-6 text-amber-900">
              {result.clarificationQuestion ??
                "Please add a little more detail about what happened."}
            </p>

            {result.summary && (
              <div className="mt-5 rounded-xl bg-white/70 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-700">
                  What we could understand
                </p>

                <p className="mt-2 text-sm leading-6 text-amber-950">
                  {result.summary}
                </p>
              </div>
            )}

            <p className="mt-5 text-xs leading-5 text-amber-800">
              ContextBridge will not guess missing details. Add
              more context above and review the observation again.
            </p>
          </section>
        )}

        {result && !result.needsClarification && (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-wider text-teal-700">
              AI-assisted extraction
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Here&apos;s what I understood
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please review this before saving.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <ReviewItem
                label="Environment"
                value={formatLabel(result.environment)}
              />

              <ReviewItem
                label="Partner"
                value={formatLabel(result.partner)}
              />

              <ReviewItem
                label="Activity"
                value={formatLabel(result.activity)}
              />

              <ReviewItem
                label="Prompt level"
                value={formatLabel(result.promptLevel)}
              />

              <ReviewItem
                label="Attempts"
                value={String(result.attempts)}
              />

              <ReviewItem
                label="Successful responses"
                value={String(result.successes)}
              />

              <ReviewItem
                label="Independent responses"
                value={String(
                  result.independentSuccesses
                )}
              />
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Summary
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-700">
                {result.summary}
              </p>
            </div>

            <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              AI extraction may be imperfect. A caregiver should
              review and confirm the structured information
              before it becomes part of the child&apos;s record.
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function ReviewItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-medium">
        {value}
      </p>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}