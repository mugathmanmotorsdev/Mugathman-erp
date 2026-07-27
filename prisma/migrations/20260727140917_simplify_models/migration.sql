/*
  Warnings:

  - You are about to drop the column `location_id` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `reference_id` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `reference_type` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `inventory_location_id` on the `vehicles` table. All the data in the column will be lost.
  - You are about to drop the `inventory_locations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `serialize_movements` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `stock_adjustments` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'QUALIFIED', 'DISQUALIFIED');

-- DropForeignKey
ALTER TABLE "serialize_movements" DROP CONSTRAINT "serialize_movements_stock_movement_id_fkey";

-- DropForeignKey
ALTER TABLE "serialize_movements" DROP CONSTRAINT "serialize_movements_vehicle_id_fkey";

-- DropForeignKey
ALTER TABLE "stock_adjustments" DROP CONSTRAINT "stock_adjustments_created_by_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_location_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicles" DROP CONSTRAINT "vehicles_inventory_location_id_fkey";

-- AlterTable
ALTER TABLE "stock_movements" DROP COLUMN "location_id",
DROP COLUMN "reference_id",
DROP COLUMN "reference_type";

-- AlterTable
ALTER TABLE "vehicles" DROP COLUMN "inventory_location_id";

-- DropTable
DROP TABLE "inventory_locations";

-- DropTable
DROP TABLE "serialize_movements";

-- DropTable
DROP TABLE "stock_adjustments";

-- DropEnum
DROP TYPE "Department";

-- DropEnum
DROP TYPE "ReferenceType";

-- DropEnum
DROP TYPE "StockAdjustmentReason";

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "organization" TEXT,
    "product_of_interest" TEXT,
    "message" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "meta_conversion_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);
