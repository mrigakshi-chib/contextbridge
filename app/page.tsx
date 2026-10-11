import Link from "next/link";
import { Suspense } from "react";

import { prisma } from "@/lib/prisma";

import {
  calculateOverallProgress,
  groupPerformance,
  detectGeneralizationGap,
  calculateWeeklyTrend,
} from "@/lib/analytics";

export default function Home() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <Dashboard />
    </Suspense>
  );
}

async function Dashboard() {
  const child = await prisma.child.findFirst({
    include: {
      goals: {
        where: {
          isActive: true,
        },
        include: {
          observations: {
            orderBy: {
              observedAt: "asc",
            },
          },
        },
      },
    },
  });

  if (!child || child.goals.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 p-10">
        <p>No developmental data available.</p>
      </main>
    );
  }

  const goal = child.goals[0];
  const observations = goal.observations;

  const overall = calculateOverallProgress(observations);

  const byEnvironment = groupPerformance(
    observations,
    "environment"
  );

  const byPartner = groupPerformance(
    observations,
    "partner"
  );

  const byActivity = groupPerformance(
    observations,
    "activity"
  );

  const generalizationGap =
    detectGeneralizationGap(observations);

  const weeklyTrend =
    calculateWeeklyTrend(observations);

  const schoolPerformance = byEnvironment.find(
    (item) => item.name === "SCHOOL"
  );

  const clinicPerformance = byEnvironment.find(
    (item) => item.name === "CLINIC"
  );

  const peerPerformance = byActivity.find(
    (item) => item.name === "PEER_INTERACTION"
  );

  const latestWeek =
    weeklyTrend[weeklyTrend.length - 1];

  const firstWeek = weeklyTrend[0];

  const independenceImprovement =
    latestWeek && firstWeek
      ? latestWeek.independentSuccessRate -
        firstWeek.independentSuccessRate
      : 0;

  const promptDependencyReduction =
    latestWeek && firstWeek
      ? firstWeek.promptDependencyRate -
        latestWeek.promptDependencyRate
      : 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10 flex items-start justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-teal-700">
              ContextBridge
            </p>

            <h1 className="text-3xl font-semibold">
              {child.firstName}&apos;s developmental journey
            </h1>

            <p className="mt-2 text-slate-500">
              Cross-context developmental intelligence
            </p>
          </div>

          <div className="flex items-center gap-3">
  <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
    Therapist View
  </div>

  <Link
    href="/observations/new"
    className="rounded-full bg-teal-700 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800"
  >
    + Add observation
  </Link>
</div>
        </header>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Current developmental goal
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            {goal.title}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {goal.description}
          </p>

          <p className="mt-4 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">
            {goal.skillArea}
          </p>
        </section>

        <section className="mb-8 grid gap-5 md:grid-cols-3">
          <MetricCard
            title="Overall success"
            value={`${overall.successRate}%`}
            subtitle={`${overall.successes} of ${overall.attempts} attempts`}
          />

          <MetricCard
            title="Independent success"
            value={`${overall.independentSuccessRate}%`}
            subtitle={`${overall.independentSuccesses} independent responses`}
          />

          <MetricCard
            title="Cross-context gap"
            value={
              generalizationGap
                ? `${generalizationGap.gap} pts`
                : "—"
            }
            subtitle={
              generalizationGap
                ? `${formatLabel(
                    generalizationGap.strongestContext
                  )} → ${formatLabel(
                    generalizationGap.weakestContext
                  )}`
                : "Not enough contexts"
            }
          />
        </section>

        {generalizationGap?.hasMeaningfulGap && (
          <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl">
                ⚠
              </div>

              <div>
                <p className="font-semibold text-amber-950">
                  Generalization gap detected
                </p>

                <p className="mt-2 max-w-4xl text-sm leading-6 text-amber-900">
                  Independent performance is strongest in{" "}
                  <strong>
                    {formatLabel(
                      generalizationGap.strongestContext
                    )}
                  </strong>{" "}
                  at {generalizationGap.strongestRate}%,
                  but falls to{" "}
                  <strong>
                    {generalizationGap.weakestRate}%
                  </strong>{" "}
                  in{" "}
                  <strong>
                    {formatLabel(
                      generalizationGap.weakestContext
                    )}
                  </strong>
                  . This suggests that progress may not yet
                  be transferring consistently across
                  environments.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-wider text-teal-700">
              Developmental intelligence
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              What the system noticed
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Patterns derived from longitudinal observations
              across contexts.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <InsightCard
              title="Progress is real"
              value={`+${independenceImprovement} pts`}
              description={`Independent success increased from ${
                firstWeek?.independentSuccessRate ?? 0
              }% to ${
                latestWeek?.independentSuccessRate ?? 0
              }% across the observed period.`}
            />

            <InsightCard
              title="Generalization remains uneven"
              value={`${generalizationGap?.gap ?? 0} pt gap`}
              description={`Independent performance is strongest in ${
                generalizationGap
                  ? formatLabel(
                      generalizationGap.strongestContext
                    )
                  : "the strongest setting"
              }, but remains substantially lower in ${
                generalizationGap
                  ? formatLabel(
                      generalizationGap.weakestContext
                    )
                  : "the weakest setting"
              }.`}
            />

            <InsightCard
              title="Prompt dependence is falling"
              value={`-${promptDependencyReduction} pts`}
              description={`Prompt dependency decreased from ${
                firstWeek?.promptDependencyRate ?? 0
              }% to ${
                latestWeek?.promptDependencyRate ?? 0
              }%, suggesting increasing independence over time.`}
            />
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-800">
              Cross-context interpretation
            </p>

            <p className="mt-2 max-w-5xl text-sm leading-6 text-slate-600">
              Aarav shows strong improvement in structured
              settings, especially clinic-based activities and
              familiar home routines. However, performance
              remains substantially lower in school and peer
              interaction contexts. This suggests that skill
              acquisition is progressing faster than real-world
              generalization.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {clinicPerformance && (
                <span className="rounded-full bg-white px-3 py-1.5 text-slate-600 shadow-sm">
                  Clinic independence:{" "}
                  <strong>
                    {
                      clinicPerformance.independentSuccessRate
                    }
                    %
                  </strong>
                </span>
              )}

              {schoolPerformance && (
                <span className="rounded-full bg-white px-3 py-1.5 text-slate-600 shadow-sm">
                  School independence:{" "}
                  <strong>
                    {
                      schoolPerformance.independentSuccessRate
                    }
                    %
                  </strong>
                </span>
              )}

              {peerPerformance && (
                <span className="rounded-full bg-white px-3 py-1.5 text-slate-600 shadow-sm">
                  Peer interaction:{" "}
                  <strong>
                    {
                      peerPerformance.independentSuccessRate
                    }
                    %
                  </strong>
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <PerformanceCard
            title="Performance by environment"
            description="Independent success across clinic, home and school."
            data={byEnvironment}
          />

          <PerformanceCard
            title="Performance by communication partner"
            description="How independently the skill appears with different people."
            data={byPartner}
          />
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Progress over time
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Independent success and prompt dependency over time.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {weeklyTrend.map((week) => (
              <div
                key={week.week}
                className="rounded-xl bg-slate-50 p-5"
              >
                <p className="text-sm font-medium text-slate-500">
                  {week.week}
                </p>

                <p className="mt-3 text-3xl font-semibold">
                  {week.independentSuccessRate}%
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  independent success
                </p>

                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="text-sm text-slate-600">
                    Prompt dependency{" "}
                    <strong>
                      {week.promptDependencyRate}%
                    </strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">
            Activity-level patterns
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Independent performance across different activity
            contexts.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {byActivity.map((item) => (
              <div
                key={item.name}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-sm font-medium">
                  {formatLabel(item.name)}
                </p>

                <p className="mt-3 text-2xl font-semibold">
                  {item.independentSuccessRate}%
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  independent success
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-8 text-xs leading-5 text-slate-400">
          Prototype using synthetic data only. ContextBridge
          does not diagnose developmental conditions or make
          treatment decisions.
        </footer>
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {title}
      </p>

      <p className="mt-3 text-4xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function InsightCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
      <p className="text-sm font-medium text-slate-600">
        {title}
      </p>

      <p className="mt-3 text-2xl font-semibold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function PerformanceCard({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: {
    name: string;
    independentSuccessRate: number;
  }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

      <div className="mt-6 space-y-5">
        {data.map((item) => (
          <div key={item.name}>
            <div className="mb-2 flex justify-between text-sm">
              <span className="font-medium">
                {formatLabel(item.name)}
              </span>

              <span className="text-slate-500">
                {item.independentSuccessRate}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-600"
                style={{
                  width: `${item.independentSuccessRate}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
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

function DashboardLoading() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm text-slate-500">
          Loading developmental insights...
        </p>
      </div>
    </main>
  );
}