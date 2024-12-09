import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/authOptions";
import { getAvailableStock } from '@/lib/stockCalculations';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, quantity, comments } = await request.json();

    // Check if there's enough stock for the update
    const currentStockOut = await prisma.stockOut.findUnique({
      where: { id: params.id },
      select: { quantity: true }
    });

    const availableStock = await getAvailableStock(productId);
    const stockDifference = quantity - (currentStockOut?.quantity || 0);

    if (stockDifference > availableStock) {
      return NextResponse.json({
        error: `Insufficient stock. Available: ${availableStock}, Additional requested: ${stockDifference}`
      }, { status: 400 });
    }

    const stockOut = await prisma.stockOut.update({
      where: { id: params.id },
      data: {
        product: { connect: { id: productId } },
        quantity: parseInt(quantity),
        comments,
      },
    });
    return NextResponse.json(stockOut);
  } catch (error) {
    console.error('Error updating stock out:', error);
    return NextResponse.json({ error: 'Failed to update stock out' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.stockOut.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Stock out deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock out:', error);
    return NextResponse.json({ error: 'Failed to delete stock out' }, { status: 500 });
  }
}
