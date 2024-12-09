import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/authOptions";

interface StockRecord {
  quantity: number;
}

interface CurrentStockItem {
  id: string;
  productName: string;
  serviceName: string;
  totalStockIn: number;
  totalStockOut: number;
  currentStock: number;
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all products with their related service and stock information
    const products = await prisma.product.findMany({
      include: {
        service: true,
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

    // Calculate current stock for each product
    const currentStock: CurrentStockItem[] = products.map(product => {
      const totalStockIn = product.stockIns.reduce(
        (sum: number, record: StockRecord) => sum + record.quantity, 
        0
      );
      
      const totalStockOut = product.stockOuts.reduce(
        (sum: number, record: StockRecord) => sum + record.quantity, 
        0
      );

      return {
        id: product.id,
        productName: product.name,
        serviceName: product.service.name,
        totalStockIn,
        totalStockOut,
        currentStock: totalStockIn - totalStockOut,
      };
    });

    // Sort by product name
    currentStock.sort((a: CurrentStockItem, b: CurrentStockItem) => 
      a.productName.localeCompare(b.productName)
    );

    return NextResponse.json(currentStock);
  } catch (error) {
    console.error('Error fetching current stock:', error);
    return NextResponse.json(
      { error: 'Failed to fetch current stock' }, 
      { status: 500 }
    );
  }
}
