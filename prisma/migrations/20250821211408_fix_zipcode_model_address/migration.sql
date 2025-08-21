/*
  Warnings:

  - You are about to drop the column `zipCode` on the `Address` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Address" DROP COLUMN "zipCode",
ADD COLUMN     "zipcode" TEXT;
