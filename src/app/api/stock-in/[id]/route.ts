import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/authOptions";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, brandId, quantity, pricePerUnit, comments } = await request.json();
    const stockIn = await prisma.stockIn.update({
      where: { id: params.id },
      data: {
        product: { connect: { id: productId } },
        brand: { connect: { id: brandId } },
        quantity: parseInt(quantity),
        pricePerUnit: parseFloat(pricePerUnit),
        comments,
      },
    });
    return NextResponse.json(stockIn);
  } catch (error) {
    console.error('Error updating stock in:', error);
    return NextResponse.json({ error: 'Failed to update stock in' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.stockIn.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Stock in deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock in:', error);
    return NextResponse.json({ error: 'Failed to delete stock in' }, { status: 500 });
  }
}
