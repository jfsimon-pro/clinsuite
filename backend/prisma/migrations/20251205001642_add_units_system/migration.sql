-- AlterTable
ALTER TABLE "Funnel" ADD COLUMN     "unitId" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "unitId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "unitId" TEXT;

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "companyId" TEXT NOT NULL,
    "managerId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Unit_companyId_code_key" ON "Unit"("companyId", "code");

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funnel" ADD CONSTRAINT "Funnel_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DATA MIGRATION: Create default unit for each existing company
INSERT INTO "Unit" (id, name, code, "companyId", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    CONCAT(c.name, ' - Sede'),
    'SEDE',
    c.id,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Company" c
WHERE NOT EXISTS (
    SELECT 1 FROM "Unit" u WHERE u."companyId" = c.id AND u.code = 'SEDE'
);

-- DATA MIGRATION: Assign all existing funnels to default unit
UPDATE "Funnel" f
SET "unitId" = (
    SELECT u.id 
    FROM "Unit" u 
    WHERE u."companyId" = f."companyId" 
    AND u.code = 'SEDE'
    LIMIT 1
)
WHERE f."unitId" IS NULL;

-- DATA MIGRATION: Assign all existing leads to default unit
UPDATE "Lead" l
SET "unitId" = (
    SELECT u.id 
    FROM "Unit" u 
    WHERE u."companyId" = l."companyId" 
    AND u.code = 'SEDE'
    LIMIT 1
)
WHERE l."unitId" IS NULL;
