import prisma from './prisma';

export async function getAvailableStock(productId: string, brandId: string) {
  // Get total stock in
  const stockIns = await prisma.stockIn.findMany({
    where: {
      productId,
      brandId
    },
    select: {
      quantity: true
    }
  });

  // Get total stock out
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

  return totalStockIn - totalStockOut;
}
