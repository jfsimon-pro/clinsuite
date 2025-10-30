/*
  Warnings:

  - Added the required column `updatedAt` to the `Lead` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoProcura" AS ENUM ('ORTODONTIA', 'IMPLANTE', 'ESTETICA', 'LIMPEZA', 'CANAL', 'EXTRACAO', 'PROTESE', 'CLAREAMENTO', 'OUTROS');

-- CreateEnum
CREATE TYPE "MeioCaptacao" AS ENUM ('WHATSAPP', 'INSTAGRAM', 'FACEBOOK', 'GOOGLE_ADS', 'INDICACAO', 'SITE', 'TELEFONE', 'PRESENCIAL', 'OUTROS');

-- CreateEnum
CREATE TYPE "CloserNegociacao" AS ENUM ('IANARA', 'FUNCIONARIO_1', 'FUNCIONARIO_2', 'FUNCIONARIO_3', 'OUTROS');

-- CreateEnum
CREATE TYPE "CloserFollow" AS ENUM ('IANARA', 'FUNCIONARIO_1', 'FUNCIONARIO_2', 'FUNCIONARIO_3', 'OUTROS');

-- CreateEnum
CREATE TYPE "Dentista" AS ENUM ('IANARA', 'DENTISTA_1', 'DENTISTA_2', 'DENTISTA_3', 'OUTROS');

-- CreateEnum
CREATE TYPE "MotivoPerda" AS ENUM ('PRECO', 'TEMPO', 'LOCALIZACAO', 'CONFIANCA', 'CONCORRENCIA', 'NAO_INTERESSADO', 'NAO_RESPONDEU', 'OUTROS');

-- CreateEnum
CREATE TYPE "DentistaParticipou" AS ENUM ('SIM', 'NAO');

-- CreateEnum
CREATE TYPE "Objecao" AS ENUM ('PRECO_ALTO', 'TEMPO_TRATAMENTO', 'DOR_MEDO', 'SEGUNDA_OPINIAO', 'PENSANDO', 'CONVERSAR_FAMILIA', 'CONDICOES_PAGAMENTO', 'OUTROS');

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_responsibleId_fkey";

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "closerFollow" "CloserFollow",
ADD COLUMN     "closerNegociacao" "CloserNegociacao",
ADD COLUMN     "dataConsulta" TIMESTAMP(3),
ADD COLUMN     "dentista" "Dentista",
ADD COLUMN     "dentistaParticipou" "DentistaParticipou",
ADD COLUMN     "meioCaptacao" "MeioCaptacao",
ADD COLUMN     "motivoPerda" "MotivoPerda",
ADD COLUMN     "objecao" "Objecao",
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "previsaoFechamento" TIMESTAMP(3),
ADD COLUMN     "tipoProcura" "TipoProcura",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "valorVenda" DECIMAL(65,30),
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "responsibleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
