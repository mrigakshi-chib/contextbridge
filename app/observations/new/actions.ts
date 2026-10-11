"use server";

import { redirect } from "next/navigation";

import {
  Activity,
  Environment,
  ObservationSource,
  Partner,
  PromptLevel,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function createObservation(formData: FormData) {
  const goal = await prisma.goal.findFirst({
    where: {
      isActive: true,
    },
  });

  if (!goal) {
    throw new Error("No active developmental goal found.");
  }

  const environment = formData.get("environment") as Environment;
  const partner = formData.get("partner") as Partner;
  const activity = formData.get("activity") as Activity;
  const promptLevel = formData.get("promptLevel") as PromptLevel;

  const attempts = Number(formData.get("attempts"));
  const successes = Number(formData.get("successes"));
  const independentSuccesses = Number(
    formData.get("independentSuccesses")
  );

  const notes = String(formData.get("notes") ?? "").trim();

  if (
    attempts < 0 ||
    successes < 0 ||
    independentSuccesses < 0 ||
    successes > attempts ||
    independentSuccesses > successes
  ) {
    throw new Error("Observation values are invalid.");
  }

  await prisma.observation.create({
    data: {
      goalId: goal.id,

      observedAt: new Date(),

      source: ObservationSource.THERAPIST,

      environment,
      partner,
      activity,
      promptLevel,

      attempts,
      successes,
      independentSuccesses,

      notes: notes || null,
    },
  });

  redirect("/");
}