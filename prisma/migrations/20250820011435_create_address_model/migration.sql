-- CreateTable
CREATE TABLE "public"."Address" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "colony" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "zipCode" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);
