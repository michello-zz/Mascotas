-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('DUENO', 'ADMIN');
ALTER TABLE "user" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "user" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'DUENO';
COMMIT;

-- DropForeignKey
ALTER TABLE "pet_photo" DROP CONSTRAINT "pet_photo_petId_fkey";

-- DropForeignKey
ALTER TABLE "sighting" DROP CONSTRAINT "sighting_petId_fkey";

-- DropForeignKey
ALTER TABLE "sighting" DROP CONSTRAINT "sighting_reporterId_fkey";

-- DropIndex
DROP INDEX "pet_status_species_idx";

-- DropIndex
DROP INDEX "pet_department_city_idx";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "city",
DROP COLUMN "department",
ADD COLUMN     "comments" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ALTER COLUMN "role" SET DEFAULT 'DUENO';

-- AlterTable
ALTER TABLE "pet" DROP CONSTRAINT "pet_pkey",
DROP COLUMN "address",
DROP COLUMN "ageMonths",
DROP COLUMN "breed",
DROP COLUMN "chipNumber",
DROP COLUMN "city",
DROP COLUMN "color",
DROP COLUMN "contactEmail",
DROP COLUMN "contactPhone",
DROP COLUMN "contactWhatsapp",
DROP COLUMN "department",
DROP COLUMN "description",
DROP COLUMN "hasChip",
DROP COLUMN "lastSeenAt",
DROP COLUMN "lat",
DROP COLUMN "lng",
DROP COLUMN "resolvedAt",
DROP COLUMN "reward",
DROP COLUMN "sex",
DROP COLUMN "size",
DROP COLUMN "status",
DROP COLUMN "sterilized",
ADD COLUMN     "comments" TEXT,
ADD COLUMN     "foundAt" TIMESTAMP(3),
ADD COLUMN     "isLost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lostAt" TIMESTAMP(3),
ADD COLUMN     "lostComment" TEXT,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "pet_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "pet_photo";

-- DropTable
DROP TABLE "sighting";

-- DropEnum
DROP TYPE "Sex";

-- DropEnum
DROP TYPE "Size";

-- DropEnum
DROP TYPE "PetStatus";

-- DropEnum
DROP TYPE "SightingStatus";

-- CreateIndex
CREATE INDEX "pet_isLost_idx" ON "pet"("isLost");

