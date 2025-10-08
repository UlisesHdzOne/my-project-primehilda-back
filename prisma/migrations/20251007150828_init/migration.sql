/*
  Warnings:

  - You are about to drop the `free_products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."free_products" DROP CONSTRAINT "free_products_productId_fkey";

-- DropTable
DROP TABLE "public"."free_products";

-- CreateTable
CREATE TABLE "public"."free_options" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "free_options_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."free_options" ADD CONSTRAINT "free_options_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
