/*
  Warnings:

  - Added the required column `orderType` to the `free_options` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."free_options" ADD COLUMN     "orderType" TEXT NOT NULL;
