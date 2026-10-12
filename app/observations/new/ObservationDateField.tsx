"use client";

import { useEffect, useState } from "react";

export default function ObservationDateField() {
  const [today, setToday] = useState("");

  useEffect(() => {
    const now = new Date();

    const localDate = new Date(
      now.getTime() - now.getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 10);

    setToday(localDate);
  }, []);

  return (
    <div>
      <label
        htmlFor="observedAt"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Observation date
      </label>

      <input
        id="observedAt"
        name="observedAt"
        type="date"
        value={today}
        max={today}
        onChange={(event) =>
          setToday(event.target.value)
        }
        required
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 md:max-w-sm"
      />

      <p className="mt-2 text-xs leading-5 text-slate-400">
        Select today or an earlier date if the observation was
        recorded late. Future dates are not allowed.
      </p>
    </div>
  );
}