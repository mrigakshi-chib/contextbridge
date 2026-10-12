import Link from "next/link";

import { createObservation } from "./actions";
import ObservationDateField from "./ObservationDateField";

export default function NewObservationPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-teal-700 hover:text-teal-800"
          >
            ← Back to dashboard
          </Link>

          <p className="mt-8 text-sm font-medium uppercase tracking-widest text-teal-700">
            ContextBridge
          </p>

          <h1 className="mt-2 text-3xl font-semibold">
            Add observation
          </h1>

          <p className="mt-2 text-slate-500">
            Record how the developmental skill appeared in a
            specific context.
          </p>
        </div>

        <form
          action={createObservation}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
        >
          <ObservationDateField />

          <div className="grid gap-6 md:grid-cols-2">
            <FormSelect
              label="Environment"
              name="environment"
              options={[
                ["CLINIC", "Clinic"],
                ["HOME", "Home"],
                ["SCHOOL", "School"],
                ["COMMUNITY", "Community"],
              ]}
            />

            <FormSelect
              label="Communication partner"
              name="partner"
              options={[
                ["THERAPIST", "Therapist"],
                ["MOTHER", "Mother"],
                ["FATHER", "Father"],
                ["TEACHER", "Teacher"],
                ["PEER", "Peer"],
                ["OTHER", "Other"],
              ]}
            />

            <FormSelect
              label="Activity"
              name="activity"
              options={[
                ["THERAPY_SESSION", "Therapy session"],
                ["MEALTIME", "Mealtime"],
                ["STRUCTURED_PLAY", "Structured play"],
                ["FREE_PLAY", "Free play"],
                ["CLASSROOM", "Classroom"],
                ["PEER_INTERACTION", "Peer interaction"],
                ["DAILY_ROUTINE", "Daily routine"],
                ["OTHER", "Other"],
              ]}
            />

            <FormSelect
              label="Prompt level"
              name="promptLevel"
              options={[
                ["NONE", "None"],
                ["GESTURAL", "Gestural"],
                ["VISUAL", "Visual"],
                ["VERBAL", "Verbal"],
                ["PARTIAL", "Partial"],
                ["FULL", "Full"],
              ]}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <NumberField
              label="Attempts"
              name="attempts"
            />

            <NumberField
              label="Successful responses"
              name="successes"
            />

            <NumberField
              label="Independent responses"
              name="independentSuccesses"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Observation notes
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={5}
              placeholder="Example: Used two-word requests consistently during structured play but needed verbal prompting during transitions."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            This observation contributes to ContextBridge&apos;s
            cross-context analysis. It does not generate clinical
            treatment decisions.
          </div>

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/"
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
            >
              Save observation
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function FormSelect({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: [string, string][];
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        required
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      >
        {options.map(([value, optionLabel]) => (
          <option
            key={value}
            value={value}
          >
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  label,
  name,
}: {
  label: string;
  name: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type="number"
        min="0"
        required
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />
    </div>
  );
}