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
    const brands = await prisma.brand.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc'
      },
    });

    const formattedBrands = brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      productId: brand.product.id,
      productName: brand.product.name,
      serviceName: brand.product.service.name,
    }));

    return NextResponse.json(formattedBrands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, productId } = await request.json();
    
    const existingBrand = await prisma.brand.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: 'A brand with this name already exists' }, 
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        product: {
          connect: { id: productId }
        }
      },
    });
    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}
