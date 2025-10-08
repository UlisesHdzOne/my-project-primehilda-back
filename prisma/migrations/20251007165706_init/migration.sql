/*
  Warnings:

  - You are about to drop the column `type` on the `free_options` table. All the data in the column will be lost.
  - Added the required column `category` to the `free_options` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."free_options" DROP COLUMN "type",
ADD COLUMN     "category" TEXT NOT NULL;
