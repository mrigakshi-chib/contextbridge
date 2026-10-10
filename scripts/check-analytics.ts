import { prisma } from "../lib/prisma";

import {
  calculateOverallProgress,
  groupPerformance,
  detectGeneralizationGap,
  calculatePromptDependency,
  calculateWeeklyTrend,
} from "../lib/analytics";

async function main() {
  const observations = await prisma.observation.findMany({
    orderBy: {
      observedAt: "asc",
    },
  });

  console.log(`Loaded ${observations.length} observations`);

  console.log(
    "\nOverall progress:",
    calculateOverallProgress(observations)
  );

  console.log(
    "\nPerformance by environment:",
    groupPerformance(observations, "environment")
  );

  console.log(
    "\nPerformance by partner:",
    groupPerformance(observations, "partner")
  );

  console.log(
    "\nPerformance by activity:",
    groupPerformance(observations, "activity")
  );

  console.log(
    "\nGeneralization gap:",
    detectGeneralizationGap(observations)
  );
  console.log(
  "\nPrompt dependency:",
  calculatePromptDependency(observations)
);

console.log(
  "\nWeekly trend:",
  calculateWeeklyTrend(observations)
);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });