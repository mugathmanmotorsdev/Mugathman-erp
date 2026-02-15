/*
  Warnings:

  - You are about to drop the column `department` on the `products` table. All the data in the column will be lost.
  - Added the required column `category` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Truck', 'Tractor', 'Dozer', 'spare_part');

-- AlterTable
ALTER TABLE "products" DROP COLUMN "department",
ADD COLUMN     "category" "Category" NOT NULL;
