/*
  Warnings:

  - The values [Truck_Head,Tipper,Tractor,Dozer,spare_part] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `sku` on table `products` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'SOLD', 'DAMAGED');

-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('heavy_duty', 'fertilizer', 'parts', 'truck_head', 'tipper', 'tractor', 'dozer');
ALTER TABLE "products" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "public"."Category_old";
COMMIT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "description" TEXT,
ADD COLUMN     "unit_price" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ALTER COLUMN "sku" SET NOT NULL;

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "vehicle_id" TEXT;

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "inventory_location_id" TEXT NOT NULL,
    "vin" TEXT NOT NULL,
    "status" "VehicleStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vin_key" ON "vehicles"("vin");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_inventory_location_id_fkey" FOREIGN KEY ("inventory_location_id") REFERENCES "inventory_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
