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

  const overall =
    calculateOverallProgress(observations);

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

  const MIN_OBSERVATIONS_FOR_TREND = 3;

  const reliableWeeks = weeklyTrend.filter(
    (week) =>
      week.observationCount >=
      MIN_OBSERVATIONS_FOR_TREND
  );

  const firstReliableWeek = reliableWeeks[0];

  const latestReliableWeek =
    reliableWeeks[reliableWeeks.length - 1];

  const independenceImprovement =
    firstReliableWeek && latestReliableWeek
      ? latestReliableWeek.independentSuccessRate -
        firstReliableWeek.independentSuccessRate
      : 0;

  const promptDependencyChange =
    firstReliableWeek && latestReliableWeek
      ? latestReliableWeek.promptDependencyRate -
        firstReliableWeek.promptDependencyRate
      : 0;

  const schoolPerformance =
    byEnvironment.find(
      (item) => item.name === "SCHOOL"
    );

  const clinicPerformance =
    byEnvironment.find(
      (item) => item.name === "CLINIC"
    );

  const peerPerformance =
    byActivity.find(
      (item) =>
        item.name === "PEER_INTERACTION"
    );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-teal-700">
              ContextBridge
            </p>

            <h1 className="text-3xl font-semibold">
              {child.firstName}
              &apos;s developmental journey
            </h1>

            <p className="mt-2 text-slate-500">
              Cross-context developmental intelligence
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              Therapist dashboard
            </div>

            <Link
              href="/parent/observation"
              className="rounded-full border border-teal-200 bg-teal-50 px-5 py-2 text-sm font-medium text-teal-800 shadow-sm transition hover:bg-teal-100"
            >
              Caregiver input
            </Link>

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
              generalizationGap?.hasEnoughEvidence
                ? `${generalizationGap.gap} pts`
                : "—"
            }
            subtitle={
              generalizationGap?.hasEnoughEvidence &&
              generalizationGap.strongestContext &&
              generalizationGap.weakestContext
                ? `${formatLabel(
                    generalizationGap.strongestContext
                  )} → ${formatLabel(
                    generalizationGap.weakestContext
                  )}`
                : "More cross-context data needed"
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
                  Across repeatedly observed
                  environments, independent
                  performance is strongest in{" "}
                  <strong>
                    {generalizationGap.strongestContext
                      ? formatLabel(
                          generalizationGap.strongestContext
                        )
                      : ""}
                  </strong>{" "}
                  at{" "}
                  {
                    generalizationGap.strongestRate
                  }
                  %, but falls to{" "}
                  <strong>
                    {generalizationGap.weakestRate}%
                  </strong>{" "}
                  in{" "}
                  <strong>
                    {generalizationGap.weakestContext
                      ? formatLabel(
                          generalizationGap.weakestContext
                        )
                      : ""}
                  </strong>
                  . This suggests that progress may
                  not yet be transferring
                  consistently across environments.
                </p>
              </div>
            </div>
          </section>
        )}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-wider text-teal-700">
              Core developmental signal
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Skill acquisition vs real-world generalization
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Progress in learning the skill is not
              the same as using it independently
              across everyday contexts.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-sm font-medium text-emerald-800">
                Skill acquisition
              </p>

              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-2xl font-semibold text-emerald-950">
                    Improving
                  </p>

                  <p className="mt-2 text-sm leading-6 text-emerald-900">
                    Independent success increased
                    from{" "}
                    <strong>
                      {firstReliableWeek
                        ?.independentSuccessRate ??
                        0}
                      %
                    </strong>{" "}
                    to{" "}
                    <strong>
                      {latestReliableWeek
                        ?.independentSuccessRate ??
                        0}
                      %
                    </strong>{" "}
                    across sufficiently observed
                    weeks.
                  </p>
                </div>

                <div className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm">
                  {independenceImprovement >= 0
                    ? "+"
                    : ""}
                  {independenceImprovement} pts
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
              <p className="text-sm font-medium text-amber-800">
                Real-world generalization
              </p>

              <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-2xl font-semibold text-amber-950">
                    {generalizationGap?.hasEnoughEvidence
                      ? "Uneven"
                      : "Still being established"}
                  </p>

                  {generalizationGap?.hasEnoughEvidence &&
                  generalizationGap.strongestContext &&
                  generalizationGap.weakestContext ? (
                    <p className="mt-2 text-sm leading-6 text-amber-900">
                      A{" "}
                      <strong>
                        {generalizationGap.gap}-point
                      </strong>{" "}
                      gap remains between{" "}
                      <strong>
                        {formatLabel(
                          generalizationGap.strongestContext
                        )}
                      </strong>{" "}
                      and{" "}
                      <strong>
                        {formatLabel(
                          generalizationGap.weakestContext
                        )}
                      </strong>
                      .
                      {peerPerformance && (
                        <>
                          {" "}
                          Peer interaction is currently{" "}
                          <strong>
                            {
                              peerPerformance.independentSuccessRate
                            }
                            %
                          </strong>
                          .
                        </>
                      )}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-amber-900">
                      More repeated observations
                      across environments are needed
                      before interpreting
                      cross-context differences.
                    </p>
                  )}
                </div>

                {generalizationGap?.hasEnoughEvidence && (
                  <div className="w-fit rounded-full bg-white px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm">
                    {generalizationGap.gap} pt gap
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-700">
              <strong>Interpretation:</strong>{" "}
              The skill is being acquired, but
              independence is not yet transferring
              consistently across everyday
              contexts.
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <p className="text-sm font-medium uppercase tracking-wider text-teal-700">
              Developmental intelligence
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              What the system noticed
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Patterns derived from longitudinal
              observations across contexts.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <InsightCard
              title="Progress is real"
              value={`${
                independenceImprovement >= 0
                  ? "+"
                  : ""
              }${independenceImprovement} pts`}
              description={`Independent success increased from ${
                firstReliableWeek
                  ?.independentSuccessRate ?? 0
              }% to ${
                latestReliableWeek
                  ?.independentSuccessRate ?? 0
              }% across weeks with sufficient observations.`}
            />

            <InsightCard
              title={
                generalizationGap?.hasEnoughEvidence
                  ? "Generalization remains uneven"
                  : "Generalization is still being established"
              }
              value={
                generalizationGap?.hasEnoughEvidence
                  ? `${generalizationGap.gap} pt gap`
                  : "More data needed"
              }
              description={
                generalizationGap?.hasEnoughEvidence &&
                generalizationGap.strongestContext &&
                generalizationGap.weakestContext
                  ? `Across repeatedly observed environments, independent performance is strongest in ${formatLabel(
                      generalizationGap.strongestContext
                    )}, but remains substantially lower in ${formatLabel(
                      generalizationGap.weakestContext
                    )}.`
                  : "More repeated observations across environments are needed before interpreting differences as a consistent generalization pattern."
              }
            />

            <InsightCard
              title="Prompt dependence is falling"
              value={`${
                promptDependencyChange > 0
                  ? "+"
                  : ""
              }${promptDependencyChange} pts`}
              description={`Prompt dependency decreased from ${
                firstReliableWeek
                  ?.promptDependencyRate ?? 0
              }% to ${
                latestReliableWeek
                  ?.promptDependencyRate ?? 0
              }% across weeks with sufficient observations.`}
            />
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-800">
              Cross-context interpretation
            </p>

            <p className="mt-2 max-w-5xl text-sm leading-6 text-slate-600">
              Aarav shows strong improvement in
              structured settings, especially
              clinic-based activities and familiar
              home routines. However, performance
              remains substantially lower in school
              and peer interaction contexts. This
              suggests that skill acquisition is
              progressing faster than real-world
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
              Independent success and prompt
              dependency over time.
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

                {week.observationCount <
                MIN_OBSERVATIONS_FOR_TREND ? (
                  <p className="mt-1 text-xs font-medium text-amber-700">
                    Early data ·{" "}
                    {week.observationCount}{" "}
                    {week.observationCount === 1
                      ? "observation"
                      : "observations"}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">
                    {week.observationCount}{" "}
                    observations
                  </p>
                )}

                <p className="mt-3 text-3xl font-semibold">
                  {
                    week.independentSuccessRate
                  }
                  %
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  independent success
                </p>

                <div className="mt-4 border-t border-slate-200 pt-3">
                  <p className="text-sm text-slate-600">
                    Prompt dependency{" "}
                    <strong>
                      {
                        week.promptDependencyRate
                      }
                      %
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
            Independent performance across
            different activity contexts.
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
                  {
                    item.independentSuccessRate
                  }
                  %
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  independent success
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {item.observationCount}{" "}
                  {item.observationCount === 1
                    ? "observation"
                    : "observations"}
                </p>
              </div>
            ))}
          </div>
        </section>

        <footer className="mt-8 text-xs leading-5 text-slate-400">
          Prototype using synthetic data only.
          ContextBridge does not diagnose
          developmental conditions or make
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
    observationCount: number;
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
            <div className="mb-2 flex justify-between gap-4 text-sm">
              <div>
                <span className="font-medium">
                  {formatLabel(item.name)}
                </span>

                <p className="mt-0.5 text-xs text-slate-400">
                  {item.observationCount}{" "}
                  {item.observationCount === 1
                    ? "observation"
                    : "observations"}
                </p>
              </div>

              <span className="text-slate-500">
                {
                  item.independentSuccessRate
                }
                %
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