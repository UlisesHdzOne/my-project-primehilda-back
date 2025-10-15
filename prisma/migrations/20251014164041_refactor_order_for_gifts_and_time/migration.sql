/*
  Warnings:

  - You are about to drop the column `freeSoups` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `freeSoupsAvailable` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `freeSoupsUsed` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."order_items" DROP COLUMN "freeSoups",
ADD COLUMN     "isGift" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."orders" DROP COLUMN "freeSoupsAvailable",
DROP COLUMN "freeSoupsUsed";
