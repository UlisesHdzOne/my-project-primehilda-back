-- CreateTable
CREATE TABLE "public"."Auto" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "placas" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auto_placas_key" ON "public"."Auto"("placas");

-- AddForeignKey
ALTER TABLE "public"."Auto" ADD CONSTRAINT "Auto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
