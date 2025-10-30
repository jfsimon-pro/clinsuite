-- DropForeignKey
ALTER TABLE "FunnelStep" DROP CONSTRAINT "FunnelStep_funnelId_fkey";

-- AddForeignKey
ALTER TABLE "FunnelStep" ADD CONSTRAINT "FunnelStep_funnelId_fkey" FOREIGN KEY ("funnelId") REFERENCES "Funnel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
