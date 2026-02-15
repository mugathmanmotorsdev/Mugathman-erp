/*
  Warnings:

  - The values [Truck] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `tracking_type` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TrackingType" AS ENUM ('SERIAL', 'BATCH');

-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('Truck_Head', 'Tipper', 'Tractor', 'Dozer', 'spare_part');
ALTER TABLE "products" ALTER COLUMN "category" TYPE "Category_new" USING ("category"::text::"Category_new");
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "public"."Category_old";
COMMIT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "tracking_type" "TrackingType" NOT NULL,
ALTER COLUMN "sku" DROP NOT NULL;
