-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "maxInvocationsPerMinute" INTEGER NOT NULL DEFAULT 20;

-- AlterTable
ALTER TABLE "AgentAnalytics" ADD COLUMN     "throttledRequests" INTEGER NOT NULL DEFAULT 0;
