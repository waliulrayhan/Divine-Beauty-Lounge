import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { StockIn, StockOut } from '@prisma/client';

interface StockRecord {
  quantity: number;
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all products with their stock-in and stock-out records
    const products = await prisma.product.findMany({
      include: {
        service: true,
        stockIns: {
          select: { quantity: true },
        },
        stockOuts: {
          select: { quantity: true },
        },
      },
    });

    // Calculate current stock for each product
    const currentStock = products.map(product => ({
      id: product.id,
      name: product.name,
      serviceName: product.service.name,
      totalStockIn: product.stockIns.reduce((sum: number, record: StockRecord) => 
        sum + record.quantity, 0),
      totalStockOut: product.stockOuts.reduce((sum: number, record: StockRecord) => 
        sum + record.quantity, 0),
      currentStock: product.stockIns.reduce((sum: number, record: StockRecord) => 
        sum + record.quantity, 0) -
        product.stockOuts.reduce((sum: number, record: StockRecord) => 
        sum + record.quantity, 0),
    }));

    return NextResponse.json(currentStock);
  } catch (error) {
    console.error('Error fetching current stock:', error);
    return NextResponse.json({ error: 'Failed to fetch current stock' }, { status: 500 });
  }
}
