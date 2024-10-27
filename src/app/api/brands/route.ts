import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  try {
    const brands = await prisma.brand.findMany({
      where: { productId: productId },
    });
    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId, name } = await request.json();

    // Check if brand already exists
    const existingBrand = await prisma.brand.findFirst({
      where: {
        productId,
        name: {
          equals: name,
          mode: 'insensitive', // Case-insensitive comparison
        },
      },
    });

    if (existingBrand) {
      return NextResponse.json(existingBrand);
    }

    // Create new brand if it doesn't exist
    const brand = await prisma.brand.create({
      data: {
        productId,
        name,
      },
    });

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
