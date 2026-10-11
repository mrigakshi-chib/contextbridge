"use server";

import { GoogleGenAI } from "@google/genai";
import {
  Activity,
  Environment,
  ObservationSource,
  Partner,
  PromptLevel,
} from "@prisma/client";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export type ExtractedObservation = {
  needsClarification: boolean;
  clarificationQuestion: string | null;

  environment:
    | "HOME"
    | "SCHOOL"
    | "CLINIC"
    | "COMMUNITY"
    | "UNKNOWN";

  partner:
    | "MOTHER"
    | "FATHER"
    | "THERAPIST"
    | "TEACHER"
    | "PEER"
    | "OTHER"
    | "UNKNOWN";

  activity:
    | "MEALTIME"
    | "STRUCTURED_PLAY"
    | "FREE_PLAY"
    | "CLASSROOM"
    | "PEER_INTERACTION"
    | "DAILY_ROUTINE"
    | "THERAPY_SESSION"
    | "OTHER"
    | "UNKNOWN";

  promptLevel:
    | "NONE"
    | "GESTURAL"
    | "VISUAL"
    | "VERBAL"
    | "PARTIAL"
    | "FULL"
    | "UNKNOWN";

  attempts: number;
  successes: number;
  independentSuccesses: number;

  summary: string;
};

export type ConfirmedObservation = {
  environment: Exclude<
    ExtractedObservation["environment"],
    "UNKNOWN"
  >;

  partner: Exclude<
    ExtractedObservation["partner"],
    "UNKNOWN"
  >;

  activity: Exclude<
    ExtractedObservation["activity"],
    "UNKNOWN"
  >;

  promptLevel: Exclude<
    ExtractedObservation["promptLevel"],
    "UNKNOWN"
  >;

  attempts: number;
  successes: number;
  independentSuccesses: number;
  summary: string;
};

async function generateWithRetry(prompt: string) {
  try {
    return await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    const isQuotaExceeded =
      message.includes("429") ||
      message.includes("RESOURCE_EXHAUSTED");

    const isTemporaryUnavailable =
      message.includes("503") ||
      message.includes("UNAVAILABLE");

    if (isQuotaExceeded) {
      throw new Error(
        "AI extraction limit reached for today. Please try again later."
      );
    }

    if (!isTemporaryUnavailable) {
      throw error;
    }

    console.warn(
      "Gemini temporarily unavailable. Retrying once..."
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 1200)
    );

    return ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });
  }
}

export async function extractObservation(
  note: string
): Promise<ExtractedObservation> {
  if (!note.trim()) {
    throw new Error("Observation note is required.");
  }

  const prompt = `
You convert caregiver notes into structured developmental observations.

You are NOT providing medical advice.
You are NOT diagnosing.
You are NOT recommending therapy.

Return ONLY valid JSON.

Allowed values:

environment:
HOME | SCHOOL | CLINIC | COMMUNITY | UNKNOWN

partner:
MOTHER | FATHER | THERAPIST | TEACHER | PEER | OTHER | UNKNOWN

activity:
MEALTIME | STRUCTURED_PLAY | FREE_PLAY | CLASSROOM |
PEER_INTERACTION | DAILY_ROUTINE | THERAPY_SESSION | OTHER | UNKNOWN

promptLevel:
NONE | GESTURAL | VISUAL | VERBAL | PARTIAL | FULL | UNKNOWN

Rules:
- Do not invent events that were not mentioned.
- Do not guess missing context.
- Use the minimum count clearly supported by the note.
- independentSuccesses must never exceed successes.
- successes must never exceed attempts.
- summary must be one short neutral sentence.
- If a categorical field is not clearly supported by the note, use UNKNOWN.
- If a count is not clearly supported by the note, use 0.

If the note does NOT contain enough information to determine a meaningful structured observation:
- set needsClarification to true
- use UNKNOWN for any missing categorical field
- use 0 for any count not explicitly supported
- ask one short clarification question
- do NOT guess environment, partner, activity, prompt level, or counts

If the note contains enough information:
- set needsClarification to false
- clarificationQuestion must be null

Examples:

Input:
"He did better today."

Output:
{
  "needsClarification": true,
  "clarificationQuestion": "Where did this happen and what did Aarav do independently?",
  "environment": "UNKNOWN",
  "partner": "UNKNOWN",
  "activity": "UNKNOWN",
  "promptLevel": "UNKNOWN",
  "attempts": 0,
  "successes": 0,
  "independentSuccesses": 0,
  "summary": ""
}

Input:
"He mostly pointed today."

Output:
{
  "needsClarification": true,
  "clarificationQuestion": "Where did this happen, who was Aarav interacting with, and did he use any words independently?",
  "environment": "UNKNOWN",
  "partner": "UNKNOWN",
  "activity": "UNKNOWN",
  "promptLevel": "UNKNOWN",
  "attempts": 0,
  "successes": 0,
  "independentSuccesses": 0,
  "summary": "Aarav mostly used pointing to communicate."
}

Input:
"Aarav asked for juice twice by himself during breakfast."

Output:
{
  "needsClarification": false,
  "clarificationQuestion": null,
  "environment": "HOME",
  "partner": "UNKNOWN",
  "activity": "MEALTIME",
  "promptLevel": "NONE",
  "attempts": 2,
  "successes": 2,
  "independentSuccesses": 2,
  "summary": "Aarav independently requested juice twice during breakfast."
}

Caregiver note:

"${note}"

Return exactly this JSON structure:

{
  "needsClarification": false,
  "clarificationQuestion": null,
  "environment": "UNKNOWN",
  "partner": "UNKNOWN",
  "activity": "UNKNOWN",
  "promptLevel": "UNKNOWN",
  "attempts": 0,
  "successes": 0,
  "independentSuccesses": 0,
  "summary": ""
}
`;

  const response = await generateWithRetry(prompt);

  const text = response.text?.trim();

  if (!text) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const parsed = JSON.parse(
    cleaned
  ) as ExtractedObservation;

  if (parsed.successes > parsed.attempts) {
    parsed.successes = parsed.attempts;
  }

  if (
    parsed.independentSuccesses >
    parsed.successes
  ) {
    parsed.independentSuccesses =
      parsed.successes;
  }

  return parsed;
}

export async function saveCaregiverObservation(
  observation: ConfirmedObservation,
  originalNote: string
) {
  if (
    observation.attempts < 1 ||
    observation.successes < 0 ||
    observation.independentSuccesses < 0 ||
    observation.successes > observation.attempts ||
    observation.independentSuccesses >
      observation.successes
  ) {
    throw new Error(
      "Please review the attempt and success counts."
    );
  }

  const goal = await prisma.goal.findFirst({
    where: {
      isActive: true,
    },
  });

  if (!goal) {
    throw new Error(
      "No active developmental goal found."
    );
  }

  await prisma.observation.create({
    data: {
      goalId: goal.id,
      observedAt: new Date(),

      source: ObservationSource.PARENT,

      environment:
        observation.environment as Environment,

      partner:
        observation.partner as Partner,

      activity:
        observation.activity as Activity,

      promptLevel:
        observation.promptLevel as PromptLevel,

      attempts: observation.attempts,
      successes: observation.successes,

      independentSuccesses:
        observation.independentSuccesses,

      notes: [
        observation.summary,
        `Caregiver note: ${originalNote}`,
      ]
        .filter(Boolean)
        .join("\n\n"),
    },
  });

  redirect("/");
}