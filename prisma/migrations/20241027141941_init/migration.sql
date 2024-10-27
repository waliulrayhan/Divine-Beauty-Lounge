/*
  Warnings:

  - Added the required column `brandId` to the `StockOut` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StockOut" ADD COLUMN     "brandId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockOut" ADD CONSTRAINT "StockOut_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
