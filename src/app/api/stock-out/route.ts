import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { getAvailableStock } from '@/lib/stockCalculations';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stockOuts = await prisma.stockOut.findMany({
      include: {
        product: {
          include: {
            service: {
              select: { name: true },
            },
          },
        },
        brand: {
          select: { name: true },
        },
        createdBy: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const formattedStockOuts = stockOuts.map(stockOut => ({
      id: stockOut.id,
      productId: stockOut.productId,
      productName: stockOut.product.name,
      serviceName: stockOut.product.service.name,
      brandId: stockOut.brandId,
      brandName: stockOut.brand.name,
      quantity: stockOut.quantity,
      comments: stockOut.comments,
      createdBy: stockOut.createdBy.username,
      createdAt: stockOut.createdAt,
    }));
    return NextResponse.json(formattedStockOuts);
  } catch (error) {
    console.error('Error fetching stock outs:', error);
    return NextResponse.json({ error: 'Failed to fetch stock outs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, brandId, quantity, comments } = await request.json();
    
    console.log('Stock out request:', {
      productId,
      brandId,
      quantity,
      comments
    });
    
    // Check available stock
    const availableStock = await getAvailableStock(productId, brandId);
    
    console.log('Available stock:', availableStock);
    
    if (quantity > availableStock) {
      return NextResponse.json({
        error: `Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`
      }, { status: 400 });
    }

    const stockOut = await prisma.stockOut.create({
      data: {
        product: { connect: { id: productId } },
        brand: { connect: { id: brandId } },
        quantity: parseInt(quantity),
        comments,
        createdBy: { connect: { email: session.user.email } },
      },
    });
    return NextResponse.json(stockOut);
  } catch (error) {
    console.error('Error creating stock out:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create stock out' },
      { status: 500 }
    );
  }
}
