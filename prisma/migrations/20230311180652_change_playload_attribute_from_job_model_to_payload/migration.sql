/*
  Warnings:

  - You are about to drop the column `playload` on the `jobs` table. All the data in the column will be lost.
  - Added the required column `payload` to the `jobs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "jobs" DROP COLUMN "playload",
ADD COLUMN     "payload" JSONB NOT NULL;
