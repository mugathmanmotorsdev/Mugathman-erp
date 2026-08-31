ALTER TABLE "leads" DROP COLUMN "email";
ALTER TABLE "leads" DROP COLUMN "organization";
ALTER TABLE "leads" DROP COLUMN "notes";
ALTER TABLE "leads" DROP COLUMN "status";
ALTER TABLE "leads" DROP COLUMN "meta_conversion_id";
ALTER TABLE "leads" ADD COLUMN     "source" TEXT;