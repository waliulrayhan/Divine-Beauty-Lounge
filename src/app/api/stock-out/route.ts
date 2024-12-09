import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/authOptions";
import { getAvailableStock } from '@/lib/stockCalculations';

export async function GET() {
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
    const stockOutItems = await request.json();
    
    if (!Array.isArray(stockOutItems)) {
      return NextResponse.json({ error: 'Invalid request format' }, { status: 400 });
    }

    // Check available stock for all items first
    const stockChecks = await Promise.all(
      stockOutItems.map(async ({ productId, quantity }) => {
        const availableStock = await getAvailableStock(productId);
        return {
          productId,
          requested: quantity,
          available: availableStock,
          isValid: quantity <= availableStock
        };
      })
    );

    // If any item has insufficient stock, return error
    const insufficientStock = stockChecks.find(check => !check.isValid);
    if (insufficientStock) {
      return NextResponse.json({
        error: `Insufficient stock. Available: ${insufficientStock.available}, Requested: ${insufficientStock.requested}`
      }, { status: 400 });
    }

    // Create all stock outs in a transaction
    const createdStockOuts = await prisma.$transaction(
      stockOutItems.map(item => 
        prisma.stockOut.create({
          data: {
            product: { connect: { id: item.productId } },
            quantity: parseInt(item.quantity),
            comments: item.comments || null,
            createdBy: { connect: { email: session.user.email! } },
          },
        })
      )
    );

    return NextResponse.json(createdStockOuts);
  } catch (error) {
    console.error('Error creating stock outs:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create stock outs' },
      { status: 500 }
    );
  }
}
