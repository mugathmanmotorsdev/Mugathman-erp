ALTER TABLE "leads" ADD COLUMN     "status" "LeadStatus" DEFAULT 'NEW';
ALTER TABLE "leads" ADD COLUMN     "meta_conversion_id" TEXT;