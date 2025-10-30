/*
  Warnings:

  - The `closerFollow` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `closerNegociacao` column on the `Lead` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "closerFollow",
ADD COLUMN     "closerFollow" TEXT,
DROP COLUMN "closerNegociacao",
ADD COLUMN     "closerNegociacao" TEXT;

-- DropEnum
DROP TYPE "CloserFollow";

-- DropEnum
DROP TYPE "CloserNegociacao";
