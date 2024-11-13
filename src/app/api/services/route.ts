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
    const services = await prisma.service.findMany({
      include: {
        createdBy: {
          select: { username: true },
        },
      },
    });
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description } = await request.json();

    // Check if service name already exists
    const existingService = await prisma.service.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive' // Case-insensitive comparison
        }
      }
    });

    if (existingService) {
      return NextResponse.json(
        { error: 'A service with this name already exists' },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        createdBy: { connect: { email: session.user.email } },
      },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}
