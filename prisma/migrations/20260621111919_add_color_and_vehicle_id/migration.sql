-- AlterTable
ALTER TABLE "sale_items" ADD COLUMN     "vehicle_id" TEXT;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "color" TEXT;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
