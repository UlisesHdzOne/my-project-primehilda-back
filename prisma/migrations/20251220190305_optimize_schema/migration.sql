/*
  Warnings:

  - The values [cash,card,transfer] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createdAt` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the `cars` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `order_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `services` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `washId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "WashStatus" AS ENUM ('WAITING', 'WASHING', 'COMPLETED', 'READY', 'DELIVERED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH', 'CARD', 'TRANSFER');
ALTER TABLE "payments" ALTER COLUMN "method" TYPE "PaymentMethod_new" USING ("method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_carId_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_orderId_fkey";

-- DropIndex
DROP INDEX "payments_createdAt_idx";

-- DropIndex
DROP INDEX "payments_orderId_idx";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "createdAt",
DROP COLUMN "orderId",
ADD COLUMN     "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "washId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "cars";

-- DropTable
DROP TABLE "order_items";

-- DropTable
DROP TABLE "orders";

-- DropTable
DROP TABLE "services";

-- DropEnum
DROP TYPE "OrderStatus";

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "plateNumber" VARCHAR(15) NOT NULL,
    "brand" VARCHAR(50) NOT NULL,
    "model" VARCHAR(50) NOT NULL,
    "color" VARCHAR(30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wash_services" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "category" VARCHAR(30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wash_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "washes" (
    "id" SERIAL NOT NULL,
    "washNumber" VARCHAR(20) NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "status" "WashStatus" NOT NULL DEFAULT 'WAITING',
    "arrivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "readyAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "subtotal" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "washNotes" TEXT,

    CONSTRAINT "washes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wash_items" (
    "id" SERIAL NOT NULL,
    "washId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "wash_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plateNumber_key" ON "vehicles"("plateNumber");

-- CreateIndex
CREATE INDEX "vehicles_plateNumber_idx" ON "vehicles"("plateNumber");

-- CreateIndex
CREATE INDEX "vehicles_isActive_idx" ON "vehicles"("isActive");

-- CreateIndex
CREATE INDEX "vehicles_registeredAt_idx" ON "vehicles"("registeredAt");

-- CreateIndex
CREATE INDEX "wash_services_category_idx" ON "wash_services"("category");

-- CreateIndex
CREATE INDEX "wash_services_isActive_idx" ON "wash_services"("isActive");

-- CreateIndex
CREATE INDEX "wash_services_price_idx" ON "wash_services"("price");

-- CreateIndex
CREATE UNIQUE INDEX "washes_washNumber_key" ON "washes"("washNumber");

-- CreateIndex
CREATE INDEX "washes_vehicleId_idx" ON "washes"("vehicleId");

-- CreateIndex
CREATE INDEX "washes_status_idx" ON "washes"("status");

-- CreateIndex
CREATE INDEX "washes_arrivedAt_idx" ON "washes"("arrivedAt");

-- CreateIndex
CREATE INDEX "washes_washNumber_idx" ON "washes"("washNumber");

-- CreateIndex
CREATE INDEX "wash_items_washId_idx" ON "wash_items"("washId");

-- CreateIndex
CREATE INDEX "wash_items_serviceId_idx" ON "wash_items"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "wash_items_washId_serviceId_key" ON "wash_items"("washId", "serviceId");

-- CreateIndex
CREATE INDEX "payments_washId_idx" ON "payments"("washId");

-- CreateIndex
CREATE INDEX "payments_paidAt_idx" ON "payments"("paidAt");

-- AddForeignKey
ALTER TABLE "washes" ADD CONSTRAINT "washes_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wash_items" ADD CONSTRAINT "wash_items_washId_fkey" FOREIGN KEY ("washId") REFERENCES "washes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wash_items" ADD CONSTRAINT "wash_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "wash_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_washId_fkey" FOREIGN KEY ("washId") REFERENCES "washes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
