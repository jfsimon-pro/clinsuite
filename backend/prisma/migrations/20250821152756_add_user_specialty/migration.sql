-- CreateEnum
CREATE TYPE "UserSpecialty" AS ENUM ('GENERAL', 'CLOSER_NEGOCIACAO', 'CLOSER_FOLLOW');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "specialty" "UserSpecialty" NOT NULL DEFAULT 'GENERAL';
