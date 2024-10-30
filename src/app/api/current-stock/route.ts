import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all brands with their related product and service information
    const brands = await prisma.brand.findMany({
      include: {
        product: {
          include: {
            service: true,
          },
        },
        stockIns: {
          select: {
            quantity: true,
          },
        },
        stockOuts: {
          select: {
            quantity: true,
          },
        },
      },
    });

    // Calculate current stock for each brand
    const currentStock = brands.map(brand => {
      const totalStockIn = brand.stockIns.reduce(
        (sum, record) => sum + record.quantity, 
        0
      );
      
      const totalStockOut = brand.stockOuts.reduce(
        (sum, record) => sum + record.quantity, 
        0
      );

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
    return NextResponse.json(
      { error: 'Failed to fetch current stock' }, 
      { status: 500 }
    );
  }
}
