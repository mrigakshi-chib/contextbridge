"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import {
  ConfirmedObservation,
  ExtractedObservation,
  extractObservation,
  saveCaregiverObservation,
} from "./actions";

export default function ParentObservationPage() {
  const [note, setNote] = useState("");

  const [result, setResult] =
    useState<ExtractedObservation | null>(
      null
    );

  const [editable, setEditable] =
    useState<ExtractedObservation | null>(
      null
    );

  const [observationDate, setObservationDate] =
    useState("");

  const [today, setToday] = useState("");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const now = new Date();

    const localDate = new Date(
      now.getTime() -
        now.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 10);

    setToday(localDate);
    setObservationDate(localDate);
  }, []);

  async function handleExtract() {
    if (!note.trim()) {
      setError(
        "Please describe what you noticed."
      );
      return;
    }

    if (!observationDate) {
      setError(
        "Please select when the observation happened."
      );
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setEditable(null);

    try {
      const extracted =
        await extractObservation(note);

      setResult(extracted);
      setEditable(extracted);
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "";

      if (
        message.includes(
          "AI extraction limit reached"
        )
      ) {
        setError(
          "AI extraction has reached its free usage limit for today. Please try again later."
        );
      } else {
        setError(
          "We couldn't structure that observation. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!editable) {
      return;
    }

    if (!observationDate) {
      setError(
        "Please select when the observation happened."
      );
      return;
    }

    if (
      editable.environment === "UNKNOWN" ||
      editable.partner === "UNKNOWN" ||
      editable.activity === "UNKNOWN" ||
      editable.promptLevel === "UNKNOWN"
    ) {
      setError(
        "Please review and complete all fields before saving."
      );
      return;
    }

    if (editable.attempts < 1) {
      setError(
        "Attempts must be at least 1 before saving."
      );
      return;
    }

    if (
      editable.successes >
        editable.attempts ||
      editable.independentSuccesses >
        editable.successes
    ) {
      setError(
        "Independent responses cannot exceed successful responses, and successful responses cannot exceed attempts."
      );
      return;
    }

    setSaving(true);
    setError("");

    try {
      const confirmed: ConfirmedObservation = {
        environment:
          editable.environment,

        partner: editable.partner,

        activity: editable.activity,

        promptLevel:
          editable.promptLevel,

        attempts: editable.attempts,

        successes:
          editable.successes,

        independentSuccesses:
          editable.independentSuccesses,

        summary: editable.summary,
      };

      await saveCaregiverObservation(
        confirmed,
        note,
        observationDate
      );
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "";

      if (
        message.includes(
          "future"
        )
      ) {
        setError(
          "Observation date cannot be in the future."
        );
      } else {
        setError(
          "We couldn't save the observation. Please review the fields and try again."
        );
      }

      setSaving(false);
    }
  }

  function updateField<
    K extends keyof ExtractedObservation
  >(
    field: K,
    value: ExtractedObservation[K]
  ) {
    setEditable((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        [field]: value,
      };
    });
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
            Describe what happened naturally.
            ContextBridge will structure the
            observation for you to review before
            anything is saved.
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <div>
            <label
              htmlFor="observationDate"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Observation date
            </label>

            <input
              id="observationDate"
              type="date"
              value={observationDate}
              max={today}
              onChange={(event) =>
                setObservationDate(
                  event.target.value
                )
              }
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 md:max-w-sm"
            />

            <p className="mt-2 text-xs leading-5 text-slate-400">
              Select today or an earlier date if
              you are recording something you
              noticed previously. Future dates are
              not allowed.
            </p>
          </div>

          <div className="mt-6">
            <label
              htmlFor="note"
              className="text-sm font-medium text-slate-700"
            >
              What happened?
            </label>

            <textarea
              id="note"
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              rows={7}
              placeholder='Example: Aarav asked me "want juice" twice by himself during breakfast.'
              className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

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

        {result &&
          result.needsClarification && (
            <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <p className="text-sm font-medium uppercase tracking-wider text-amber-700">
                More information needed
              </p>

              <h2 className="mt-2 text-xl font-semibold text-amber-950">
                Could you tell us a little
                more?
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
                Add more context to the note
                above and review the observation
                again.
              </p>
            </section>
          )}

        {editable &&
          !editable.needsClarification && (
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-wider text-teal-700">
                AI-assisted extraction
              </p>

              <h2 className="mt-2 text-xl font-semibold">
                Review before saving
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Correct anything the AI
                misunderstood. Only the confirmed
                information will be saved.
              </p>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Observed on
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {observationDate}
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <EditableSelect
                  label="Environment"
                  value={
                    editable.environment
                  }
                  options={[
                    [
                      "UNKNOWN",
                      "Select environment",
                    ],
                    ["HOME", "Home"],
                    ["SCHOOL", "School"],
                    ["CLINIC", "Clinic"],
                    [
                      "COMMUNITY",
                      "Community",
                    ],
                  ]}
                  onChange={(value) =>
                    updateField(
                      "environment",
                      value as ExtractedObservation["environment"]
                    )
                  }
                />

                <EditableSelect
                  label="Partner"
                  value={editable.partner}
                  options={[
                    [
                      "UNKNOWN",
                      "Select partner",
                    ],
                    ["MOTHER", "Mother"],
                    ["FATHER", "Father"],
                    [
                      "THERAPIST",
                      "Therapist",
                    ],
                    ["TEACHER", "Teacher"],
                    ["PEER", "Peer"],
                    ["OTHER", "Other"],
                  ]}
                  onChange={(value) =>
                    updateField(
                      "partner",
                      value as ExtractedObservation["partner"]
                    )
                  }
                />

                <EditableSelect
                  label="Activity"
                  value={editable.activity}
                  options={[
                    [
                      "UNKNOWN",
                      "Select activity",
                    ],
                    [
                      "MEALTIME",
                      "Mealtime",
                    ],
                    [
                      "STRUCTURED_PLAY",
                      "Structured play",
                    ],
                    [
                      "FREE_PLAY",
                      "Free play",
                    ],
                    [
                      "CLASSROOM",
                      "Classroom",
                    ],
                    [
                      "PEER_INTERACTION",
                      "Peer interaction",
                    ],
                    [
                      "DAILY_ROUTINE",
                      "Daily routine",
                    ],
                    [
                      "THERAPY_SESSION",
                      "Therapy session",
                    ],
                    ["OTHER", "Other"],
                  ]}
                  onChange={(value) =>
                    updateField(
                      "activity",
                      value as ExtractedObservation["activity"]
                    )
                  }
                />

                <EditableSelect
                  label="Prompt level"
                  value={
                    editable.promptLevel
                  }
                  options={[
                    [
                      "UNKNOWN",
                      "Select prompt level",
                    ],
                    ["NONE", "None"],
                    [
                      "GESTURAL",
                      "Gestural",
                    ],
                    ["VISUAL", "Visual"],
                    ["VERBAL", "Verbal"],
                    ["PARTIAL", "Partial"],
                    ["FULL", "Full"],
                  ]}
                  onChange={(value) =>
                    updateField(
                      "promptLevel",
                      value as ExtractedObservation["promptLevel"]
                    )
                  }
                />

                <EditableNumber
                  label="Attempts"
                  value={editable.attempts}
                  onChange={(value) =>
                    updateField(
                      "attempts",
                      value
                    )
                  }
                />

                <EditableNumber
                  label="Successful responses"
                  value={editable.successes}
                  onChange={(value) =>
                    updateField(
                      "successes",
                      value
                    )
                  }
                />

                <EditableNumber
                  label="Independent responses"
                  value={
                    editable.independentSuccesses
                  }
                  onChange={(value) =>
                    updateField(
                      "independentSuccesses",
                      value
                    )
                  }
                />
              </div>

              <div className="mt-5">
                <label
                  htmlFor="summary"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Summary
                </label>

                <textarea
                  id="summary"
                  rows={3}
                  value={editable.summary}
                  onChange={(event) =>
                    updateField(
                      "summary",
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                />
              </div>

              <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                AI extraction may be imperfect.
                Review and correct the fields
                before saving.
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving observation..."
                    : "Confirm & save"}
                </button>
              </div>
            </section>
          )}
      </div>
    </main>
  );
}

function EditableSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      >
        {options.map(
          ([optionValue, optionLabel]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {optionLabel}
            </option>
          )
        )}
      </select>
    </div>
  );
}

function EditableNumber({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) =>
          onChange(
            Number(event.target.value)
          )
        }
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />
    </div>
  );
}