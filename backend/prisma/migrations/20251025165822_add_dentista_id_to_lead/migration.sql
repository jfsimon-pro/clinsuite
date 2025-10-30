-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "dentistaId" TEXT;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_dentistaId_fkey" FOREIGN KEY ("dentistaId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
