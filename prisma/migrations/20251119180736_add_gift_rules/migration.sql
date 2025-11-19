-- CreateTable
CREATE TABLE "gift_rules" (
    "id" SERIAL NOT NULL,
    "principalProductId" INTEGER NOT NULL,
    "allowedGiftIds" INTEGER[],
    "maxFreeQuantity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gift_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gift_rules_principalProductId_idx" ON "gift_rules"("principalProductId");

-- CreateIndex
CREATE INDEX "gift_rules_isActive_idx" ON "gift_rules"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "gift_rules_principalProductId_key" ON "gift_rules"("principalProductId");

-- AddForeignKey
ALTER TABLE "gift_rules" ADD CONSTRAINT "gift_rules_principalProductId_fkey" FOREIGN KEY ("principalProductId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
