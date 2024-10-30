import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    
    // Check if brand name already exists (excluding current brand)
    const existingBrand = await prisma.brand.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        NOT: {
          id: params.id
        }
      }
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: 'A brand with this name already exists' }, 
        { status: 400 }
      );
    }

    const brand = await prisma.brand.update({
      where: { id: params.id },
      data: { name },
    });
    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.role || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.brand.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}
