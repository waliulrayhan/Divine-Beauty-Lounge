import prisma from './prisma';

export async function getAvailableStock(productId: string, brandId: string) {
  // First get the brand name for the given brandId
  const brand = await prisma.brand.findUnique({
    where: { id: brandId },
    select: { name: true }
  });

  if (!brand) {
    throw new Error('Brand not found');
  }

  // Get total stock in using brand name
  const stockIns = await prisma.stockIn.findMany({
    where: {
      productId,
      brandName: brand.name // Using the actual brand name from Brand table
    },
    select: {
      quantity: true
    }
  });

  // Get total stock out using brandId
  const stockOuts = await prisma.stockOut.findMany({
    where: {
      productId,
      brandId
    },
    select: {
      quantity: true
    }
  });

  const totalStockIn = stockIns.reduce((sum, record) => sum + record.quantity, 0);
  const totalStockOut = stockOuts.reduce((sum, record) => sum + record.quantity, 0);

  console.log({
    productId,
    brandId,
    brandName: brand.name,
    totalStockIn,
    totalStockOut,
    available: totalStockIn - totalStockOut
  }); // For debugging

  return totalStockIn - totalStockOut;
}
