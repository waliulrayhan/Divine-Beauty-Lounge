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
  const serviceId = searchParams.get('serviceId');

  try {
    const products = await prisma.product.findMany({
      where: serviceId ? { serviceId: serviceId } : {},
      include: {
        service: {
          select: { name: true },
        },
        createdBy: {
          select: { username: true },
        },
      },
    });
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      serviceId: product.serviceId,
      serviceName: product.service.name,
      createdBy: product.createdBy.username,
      createdAt: product.createdAt,
    }));
    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description, serviceId } = await request.json();
    const product = await prisma.product.create({
      data: {
        name,
        description,
        service: { connect: { id: serviceId } },
        createdBy: { connect: { email: session.user.email } },
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
