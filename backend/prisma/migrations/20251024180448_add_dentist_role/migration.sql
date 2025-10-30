-- CreateEnum
CREATE TYPE "TipoEtapaConceitual" AS ENUM ('CAPTACAO', 'QUALIFICACAO', 'APRESENTACAO', 'PROPOSTA', 'NEGOCIACAO', 'FECHAMENTO');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'DENTIST';

-- AlterTable
ALTER TABLE "FunnelStep" ADD COLUMN     "tipoConceitual" "TipoEtapaConceitual" NOT NULL DEFAULT 'CAPTACAO';
