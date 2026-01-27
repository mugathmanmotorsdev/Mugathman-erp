/*
  Warnings:

  - Added the required column `type` to the `stock_movements` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('IN', 'OUT');

-- AlterTable
ALTER TABLE "stock_movements" ADD COLUMN     "type" "StockMovementType" NOT NULL;

-- CreateTable
CREATE TABLE "serialize_movements" (
    "id" TEXT NOT NULL,
    "stock_movement_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,

    CONSTRAINT "serialize_movements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "serialize_movements" ADD CONSTRAINT "serialize_movements_stock_movement_id_fkey" FOREIGN KEY ("stock_movement_id") REFERENCES "stock_movements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serialize_movements" ADD CONSTRAINT "serialize_movements_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
