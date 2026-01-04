-- AddPatientPortalAuth: Adiciona campos de autenticação para o Portal do Paciente

-- Adicionar campos de autenticação ao Lead
ALTER TABLE "Lead" ADD COLUMN "password" TEXT;
ALTER TABLE "Lead" ADD COLUMN "emailVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Lead" ADD COLUMN "verificationToken" TEXT;
ALTER TABLE "Lead" ADD COLUMN "resetPasswordToken" TEXT;
ALTER TABLE "Lead" ADD COLUMN "resetPasswordExpires" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "lastLogin" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN "portalEnabled" BOOLEAN NOT NULL DEFAULT false;

-- Criar índice para melhor performance nas queries de autenticação
CREATE INDEX "Lead_email_idx" ON "Lead"("email") WHERE "email" IS NOT NULL;
CREATE INDEX "Lead_verificationToken_idx" ON "Lead"("verificationToken") WHERE "verificationToken" IS NOT NULL;
CREATE INDEX "Lead_resetPasswordToken_idx" ON "Lead"("resetPasswordToken") WHERE "resetPasswordToken" IS NOT NULL;