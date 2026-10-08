-- CreateEnum
CREATE TYPE "ObservationSource" AS ENUM ('THERAPIST', 'PARENT', 'TEACHER');

-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('CLINIC', 'HOME', 'SCHOOL', 'COMMUNITY');

-- CreateEnum
CREATE TYPE "Partner" AS ENUM ('THERAPIST', 'MOTHER', 'FATHER', 'TEACHER', 'PEER', 'OTHER');

-- CreateEnum
CREATE TYPE "Activity" AS ENUM ('THERAPY_SESSION', 'MEALTIME', 'STRUCTURED_PLAY', 'FREE_PLAY', 'CLASSROOM', 'PEER_INTERACTION', 'DAILY_ROUTINE', 'OTHER');

-- CreateEnum
CREATE TYPE "PromptLevel" AS ENUM ('NONE', 'GESTURAL', 'VISUAL', 'VERBAL', 'PARTIAL', 'FULL');

-- CreateTable
CREATE TABLE "Child" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "skillArea" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Observation" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL,
    "source" "ObservationSource" NOT NULL,
    "environment" "Environment" NOT NULL,
    "partner" "Partner" NOT NULL,
    "activity" "Activity" NOT NULL,
    "promptLevel" "PromptLevel" NOT NULL,
    "attempts" INTEGER NOT NULL,
    "successes" INTEGER NOT NULL,
    "independentSuccesses" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Observation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Observation_goalId_idx" ON "Observation"("goalId");

-- CreateIndex
CREATE INDEX "Observation_observedAt_idx" ON "Observation"("observedAt");

-- CreateIndex
CREATE INDEX "Observation_environment_idx" ON "Observation"("environment");

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observation" ADD CONSTRAINT "Observation_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
