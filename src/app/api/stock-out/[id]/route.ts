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
    const { productId, quantity, comments } = await request.json();
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
