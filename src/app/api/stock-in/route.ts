import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stockIns = await prisma.stockIn.findMany({
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

    const formattedStockIns = stockIns.map(stockIn => ({
      id: stockIn.id,
      productId: stockIn.productId,
      productName: stockIn.product.name,
      serviceName: stockIn.product.service.name,
      quantity: stockIn.quantity,
      comments: stockIn.comments,
      createdBy: stockIn.createdBy.username,
      createdAt: stockIn.createdAt,
    }));
    return NextResponse.json(formattedStockIns);
  } catch (error) {
    console.error('Error fetching stock ins:', error);
    return NextResponse.json({ error: 'Failed to fetch stock ins' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, quantity, comments } = await request.json();
    
    const stockIn = await prisma.stockIn.create({
      data: {
        product: { connect: { id: productId } },
        quantity: parseInt(quantity),
        comments,
        createdBy: { connect: { email: session.user.email } },
      },
    });
    return NextResponse.json(stockIn);
  } catch (error) {
    console.error('Error creating stock in:', error);
    return NextResponse.json({ error: 'Failed to create stock in' }, { status: 500 });
  }
}
