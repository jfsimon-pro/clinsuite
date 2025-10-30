-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_stepId_fkey";

-- DropForeignKey
ALTER TABLE "ReminderRule" DROP CONSTRAINT "ReminderRule_stepId_fkey";

-- DropForeignKey
ALTER TABLE "StageTaskRule" DROP CONSTRAINT "StageTaskRule_stepId_fkey";

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "FunnelStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReminderRule" ADD CONSTRAINT "ReminderRule_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "FunnelStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StageTaskRule" ADD CONSTRAINT "StageTaskRule_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "FunnelStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
