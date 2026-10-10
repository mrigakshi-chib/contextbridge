import "dotenv/config";

import {
  PrismaClient,
  ObservationSource,
  Environment,
  Partner,
  Activity,
  PromptLevel,
} from "@prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.observation.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.child.deleteMany();

  const child = await prisma.child.create({
    data: {
      firstName: "Aarav",
      dateOfBirth: new Date("2020-04-12"),
    },
  });

  const goal = await prisma.goal.create({
    data: {
      childId: child.id,
      title: "Independent two-word requesting",
      description:
        "Aarav will independently use two-word functional requests across everyday contexts.",
      skillArea: "Expressive Communication",
    },
  });

  const observations = [
    // WEEK 1
    {
      observedAt: new Date("2026-09-14T10:00:00"),
      source: ObservationSource.THERAPIST,
      environment: Environment.CLINIC,
      partner: Partner.THERAPIST,
      activity: Activity.THERAPY_SESSION,
      promptLevel: PromptLevel.VERBAL,
      attempts: 8,
      successes: 5,
      independentSuccesses: 2,
      notes: "Required frequent verbal prompts during requesting tasks.",
    },
    {
      observedAt: new Date("2026-09-15T08:30:00"),
      source: ObservationSource.PARENT,
      environment: Environment.HOME,
      partner: Partner.MOTHER,
      activity: Activity.MEALTIME,
      promptLevel: PromptLevel.VISUAL,
      attempts: 6,
      successes: 4,
      independentSuccesses: 2,
      notes: "Used 'want juice' twice with visual support.",
    },
    {
      observedAt: new Date("2026-09-16T11:00:00"),
      source: ObservationSource.TEACHER,
      environment: Environment.SCHOOL,
      partner: Partner.TEACHER,
      activity: Activity.CLASSROOM,
      promptLevel: PromptLevel.VERBAL,
      attempts: 7,
      successes: 3,
      independentSuccesses: 1,
      notes: "Mostly responded after teacher prompts.",
    },
    {
      observedAt: new Date("2026-09-17T17:30:00"),
      source: ObservationSource.PARENT,
      environment: Environment.HOME,
      partner: Partner.FATHER,
      activity: Activity.FREE_PLAY,
      promptLevel: PromptLevel.VERBAL,
      attempts: 6,
      successes: 3,
      independentSuccesses: 1,
      notes: "Pointed frequently instead of verbally requesting.",
    },
    {
      observedAt: new Date("2026-09-18T10:15:00"),
      source: ObservationSource.THERAPIST,
      environment: Environment.CLINIC,
      partner: Partner.THERAPIST,
      activity: Activity.STRUCTURED_PLAY,
      promptLevel: PromptLevel.VISUAL,
      attempts: 8,
      successes: 6,
      independentSuccesses: 3,
      notes: "Improved with structured toy-choice activity.",
    },
    {
      observedAt: new Date("2026-09-19T09:00:00"),
      source: ObservationSource.PARENT,
      environment: Environment.HOME,
      partner: Partner.MOTHER,
      activity: Activity.MEALTIME,
      promptLevel: PromptLevel.VISUAL,
      attempts: 7,
      successes: 5,
      independentSuccesses: 3,
      notes: "More spontaneous requesting during breakfast.",
    },
    {
      observedAt: new Date("2026-09-20T12:00:00"),
      source: ObservationSource.TEACHER,
      environment: Environment.SCHOOL,
      partner: Partner.PEER,
      activity: Activity.PEER_INTERACTION,
      promptLevel: PromptLevel.FULL,
      attempts: 5,
      successes: 2,
      independentSuccesses: 0,
      notes: "Did not independently request during peer play.",
    },

    // WEEK 2
    {
      observedAt: new Date("2026-09-21T10:00:00"),
      source: ObservationSource.THERAPIST,
      environment: Environment.CLINIC,
      partner: Partner.THERAPIST,
      activity: Activity.THERAPY_SESSION,
      promptLevel: PromptLevel.VISUAL,
      attempts: 9,
      successes: 7,
      independentSuccesses: 4,
      notes: "Reduced need for verbal prompting.",
    },
    {
      observedAt: new Date("2026-09-22T08:30:00"),
      source: ObservationSource.PARENT,
      environment: Environment.HOME,
      partner: Partner.MOTHER,
      activity: Activity.MEALTIME,
      promptLevel: PromptLevel.GESTURAL,
      attempts: 8,
      successes: 7,
      independentSuccesses: 5,
      notes: "Requested preferred foods more independently.",
    },
    {
      observedAt: new Date("2026-09-23T11:00:00"),
      source: ObservationSource.TEACHER,
      environment: Environment.SCHOOL,
      partner: Partner.TEACHER,
      activity: Activity.CLASSROOM,
      promptLevel: PromptLevel.VERBAL,
      attempts: 8,
      successes: 4,
      independentSuccesses: 2,
      notes: "Still required teacher prompts during transitions.",
    },
    {
      observedAt: new Date("2026-09-24T17:30:00"),
      source: ObservationSource.PARENT,
      environment: Environment.HOME,
      partner: Partner.FATHER,
      activity: Activity.FREE_PLAY,
      promptLevel: PromptLevel.VISUAL,
      attempts: 7,
      successes: 4,
      independentSuccesses: 2,
      notes: "Some improvement, but still relied on pointing.",
    },
    {
      observedAt: new Date("2026-09-25T10:15:00"),
      source: ObservationSource.THERAPIST,
      environment: Environment.CLINIC,
      partner: Partner.THERAPIST,
      activity: Activity.STRUCTURED_PLAY,
      promptLevel: PromptLevel.GESTURAL,
      attempts: 9,
      successes: 8,
      independentSuccesses: 6,
      notes: "Strong performance during structured play.",
    },
    {
      observedAt: new Date("2026-09-26T09:00:00"),
      source: ObservationSource.PARENT,
      environment: Environment.HOME,
      partner: Partner.MOTHER,
      activity: Activity.MEALTIME,
      promptLevel: PromptLevel.NONE,
      attempts: 8,
      successes: 7,
      independentSuccesses: 6,
      notes: "Used several spontaneous two-word requests.",
    },
    {
      observedAt: new Date("2026-09-27T12:00:00"),
      source: ObservationSource.TEACHER,
      environment: Environment.SCHOOL,
      partner: Partner.PEER,
      activity: Activity.PEER_INTERACTION,
      promptLevel: PromptLevel.VERBAL,
      attempts: 6,
      successes: 3,
      independentSuccesses: 1,
      notes: "Limited spontaneous requesting with peers.",
    },

    // WEEK 3
    {
      observedAt: new Date("2026-09-28T10:00:00"),
      source: ObservationSource.THERAPIST,
      environment: Environment.CLINIC,
      partner: Partner.THERAPIST,
      activity: Activity.THERAPY_SESSION,
      promptLevel: PromptLevel.NONE,
      attempts: 10,
      successes: 9,
      independentSuccesses: 8,
      notes: "Strong independent performance in therapy.",
    },
    {
      observedAt: new Date("2026-09-29T08:30:00"),
      source: ObservationSource.PARENT,
      environment: Environment.HOME,
      partner: Partner.MOTHER,
      activity: Activity.MEALTIME,
      promptLevel: PromptLevel.NONE,
      attempts: 9,
      successes: 8,
      independentSuccesses: 7,
      notes: "Consistent spontaneous requests during meals.",
    },
    {
      observedAt: new Date("2026-09-30T11:00:00"),
      source: ObservationSource.TEACHER,
      environment: Environment.SCHOOL,
      partner: Partner.TEACHER,
      activity: Activity.CLASSROOM,
      promptLevel: PromptLevel.VISUAL,
      attempts: 8,
      successes: 5,
      independentSuccesses: 2,
      notes: "Improvement present but independence remains inconsistent.",
    },
    {
      observedAt: new Date("2026-10-01T17:30:00"),
      source: ObservationSource.PARENT,
      environment: Environment.HOME,
      partner: Partner.FATHER,
      activity: Activity.FREE_PLAY,
      promptLevel: PromptLevel.GESTURAL,
      attempts: 8,
      successes: 5,
      independentSuccesses: 3,
      notes: "More verbal requesting than previous week.",
    },
    {
      observedAt: new Date("2026-10-02T10:15:00"),
      source: ObservationSource.THERAPIST,
      environment: Environment.CLINIC,
      partner: Partner.THERAPIST,
      activity: Activity.STRUCTURED_PLAY,
      promptLevel: PromptLevel.NONE,
      attempts: 10,
      successes: 9,
      independentSuccesses: 8,
      notes: "Skill appears well established in clinic.",
    },
    {
      observedAt: new Date("2026-10-03T09:00:00"),
      source: ObservationSource.PARENT,
      environment: Environment.HOME,
      partner: Partner.MOTHER,
      activity: Activity.MEALTIME,
      promptLevel: PromptLevel.NONE,
      attempts: 9,
      successes: 9,
      independentSuccesses: 8,
      notes: "Highly consistent spontaneous requesting at home.",
    },
    {
      observedAt: new Date("2026-10-04T12:00:00"),
      source: ObservationSource.TEACHER,
      environment: Environment.SCHOOL,
      partner: Partner.PEER,
      activity: Activity.PEER_INTERACTION,
      promptLevel: PromptLevel.VERBAL,
      attempts: 7,
      successes: 3,
      independentSuccesses: 1,
      notes: "Still struggles to request independently with peers.",
    },
  ];

  await prisma.observation.createMany({
    data: observations.map((observation) => ({
      ...observation,
      goalId: goal.id,
    })),
  });

  console.log("Seed complete");
  console.log(`Child: ${child.firstName}`);
  console.log(`Goal: ${goal.title}`);
  console.log(`Observations: ${observations.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });