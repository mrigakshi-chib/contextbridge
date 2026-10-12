type ObservationLike = {
  environment: string;
  partner: string;
  activity: string;
  promptLevel: string;
  attempts: number;
  successes: number;
  independentSuccesses: number;
};

export function calculateOverallProgress(
  observations: ObservationLike[]
) {
  const attempts = observations.reduce(
    (sum, observation) => sum + observation.attempts,
    0
  );

  const successes = observations.reduce(
    (sum, observation) => sum + observation.successes,
    0
  );

  const independentSuccesses = observations.reduce(
    (sum, observation) => sum + observation.independentSuccesses,
    0
  );

  return {
    attempts,
    successes,
    independentSuccesses,

    successRate:
      attempts === 0
        ? 0
        : Math.round((successes / attempts) * 100),

    independentSuccessRate:
      attempts === 0
        ? 0
        : Math.round(
            (independentSuccesses / attempts) * 100
          ),
  };
}

export function groupPerformance(
  observations: ObservationLike[],
  dimension: "environment" | "partner" | "activity"
) {
  const groups = new Map<
    string,
    {
      attempts: number;
      successes: number;
      independentSuccesses: number;
      observationCount: number;
    }
  >();

  for (const observation of observations) {
    const key = observation[dimension];

    const existing = groups.get(key) ?? {
      attempts: 0,
      successes: 0,
      independentSuccesses: 0,
      observationCount: 0,
    };

    existing.attempts += observation.attempts;
    existing.successes += observation.successes;
    existing.independentSuccesses +=
      observation.independentSuccesses;
    existing.observationCount += 1;

    groups.set(key, existing);
  }

  return Array.from(groups.entries()).map(
    ([name, data]) => ({
      name,
      ...data,

      successRate:
        data.attempts === 0
          ? 0
          : Math.round(
              (data.successes / data.attempts) * 100
            ),

      independentSuccessRate:
        data.attempts === 0
          ? 0
          : Math.round(
              (data.independentSuccesses /
                data.attempts) *
                100
            ),
    })
  );
}

export function detectGeneralizationGap(
  observations: ObservationLike[]
) {
  const MIN_OBSERVATIONS_PER_CONTEXT = 3;

  const environmentPerformance = groupPerformance(
    observations,
    "environment"
  );

  const reliableContexts =
    environmentPerformance.filter(
      (context) =>
        context.observationCount >=
        MIN_OBSERVATIONS_PER_CONTEXT
    );

  if (reliableContexts.length < 2) {
    return {
      strongestContext: null,
      strongestRate: null,
      weakestContext: null,
      weakestRate: null,
      gap: 0,
      hasMeaningfulGap: false,
      hasEnoughEvidence: false,
      reliableContextCount:
        reliableContexts.length,
    };
  }

  const sorted = [...reliableContexts].sort(
    (a, b) =>
      b.independentSuccessRate -
      a.independentSuccessRate
  );

  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const gap =
    strongest.independentSuccessRate -
    weakest.independentSuccessRate;

  return {
    strongestContext: strongest.name,
    strongestRate:
      strongest.independentSuccessRate,

    weakestContext: weakest.name,
    weakestRate:
      weakest.independentSuccessRate,

    gap,

    hasMeaningfulGap: gap >= 20,
    hasEnoughEvidence: true,
    reliableContextCount:
      reliableContexts.length,
  };
}

export function calculatePromptDependency(
  observations: ObservationLike[]
) {
  const totalAttempts = observations.reduce(
    (sum, observation) => sum + observation.attempts,
    0
  );

  const independentSuccesses = observations.reduce(
    (sum, observation) =>
      sum + observation.independentSuccesses,
    0
  );

  if (totalAttempts === 0) {
    return {
      dependencyRate: 0,
    };
  }

  const dependencyRate = Math.round(
    ((totalAttempts - independentSuccesses) /
      totalAttempts) *
      100
  );

  return {
    dependencyRate,
  };
}

export function calculateWeeklyTrend(
  observations: (ObservationLike & {
    observedAt: Date;
  })[]
) {
  const sorted = [...observations].sort(
    (a, b) =>
      new Date(a.observedAt).getTime() -
      new Date(b.observedAt).getTime()
  );

  if (sorted.length === 0) {
    return [];
  }

  const firstDate = new Date(
    sorted[0].observedAt
  );

  const weeks = new Map<
    number,
    {
      attempts: number;
      successes: number;
      independentSuccesses: number;
      observationCount: number;
    }
  >();

  for (const observation of sorted) {
    const currentDate = new Date(
      observation.observedAt
    );

    const diffInDays = Math.floor(
      (currentDate.getTime() -
        firstDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const weekNumber =
      Math.floor(diffInDays / 7) + 1;

    const current = weeks.get(
      weekNumber
    ) ?? {
      attempts: 0,
      successes: 0,
      independentSuccesses: 0,
      observationCount: 0,
    };

    current.attempts +=
      observation.attempts;

    current.successes +=
      observation.successes;

    current.independentSuccesses +=
      observation.independentSuccesses;

    current.observationCount += 1;

    weeks.set(weekNumber, current);
  }

  return Array.from(weeks.entries()).map(
    ([week, data]) => ({
      week: `Week ${week}`,

      observationCount:
        data.observationCount,

      successRate:
        data.attempts === 0
          ? 0
          : Math.round(
              (data.successes /
                data.attempts) *
                100
            ),

      independentSuccessRate:
        data.attempts === 0
          ? 0
          : Math.round(
              (data.independentSuccesses /
                data.attempts) *
                100
            ),

      promptDependencyRate:
        data.attempts === 0
          ? 0
          : Math.round(
              ((data.attempts -
                data.independentSuccesses) /
                data.attempts) *
                100
            ),
    })
  );
}