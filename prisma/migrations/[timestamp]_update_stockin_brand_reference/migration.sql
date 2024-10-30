-- First, add the brandId column (nullable initially)
ALTER TABLE "StockIn" ADD COLUMN "brandId" TEXT;

-- Create temporary table to store brand mappings
CREATE TEMPORARY TABLE brand_mapping AS
SELECT b.id as brand_id, b.name as brand_name, b."productId"
FROM "Brand" b;

-- Update existing StockIn records to link with Brand records
UPDATE "StockIn" si
SET "brandId" = bm.brand_id
FROM brand_mapping bm
WHERE bm.brand_name = si."brandName" 
AND bm."productId" = si."productId";

-- Make brandId non-nullable and add foreign key constraint
ALTER TABLE "StockIn" ALTER COLUMN "brandId" SET NOT NULL;
ALTER TABLE "StockIn" ADD CONSTRAINT "StockIn_brandId_fkey" 
FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remove the old brandName column
ALTER TABLE "StockIn" DROP COLUMN "brandName";

-- Drop temporary table
DROP TABLE brand_mapping;