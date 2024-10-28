import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

interface StockRecord {
  quantity: number;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all brands with their related product, service, and stock information
    const brands = await prisma.brand.findMany({
      include: {
        product: {
          include: {
            service: true,
          },
        },
        stockOuts: {
          select: { quantity: true },
        },
      },
    });

    // Get stock-in records for each brand
    const stockInData = await Promise.all(
      brands.map(async (brand) => {
        const stockIns = await prisma.stockIn.findMany({
          where: {
            productId: brand.productId,
            brandName: brand.name,
          },
          select: { quantity: true },
        });
        return { brandId: brand.id, stockIns };
      })
    );

    // Create a map of brand IDs to their stock-in data
    const stockInMap = new Map(
      stockInData.map(({ brandId, stockIns }) => [brandId, stockIns])
    );

    // Calculate current stock for each brand-product combination
    const currentStock = brands.map(brand => {
      const stockIns = stockInMap.get(brand.id) || [];
      const totalStockIn = stockIns.reduce((sum: number, record: StockRecord) => 
        sum + record.quantity, 0);
      const totalStockOut = brand.stockOuts.reduce((sum: number, record: StockRecord) => 
        sum + record.quantity, 0);

      return {
        id: brand.id,
        brandName: brand.name,
        productName: brand.product.name,
        serviceName: brand.product.service.name,
        totalStockIn,
        totalStockOut,
        currentStock: totalStockIn - totalStockOut,
      };
    });

    // Sort by brand name
    currentStock.sort((a, b) => a.brandName.localeCompare(b.brandName));

    return NextResponse.json(currentStock);
  } catch (error) {
    console.error('Error fetching current stock:', error);
    return NextResponse.json({ error: 'Failed to fetch current stock' }, { status: 500 });
  }
}
