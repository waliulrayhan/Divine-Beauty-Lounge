import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('Fetching services...');
    const services = await prisma.service.findMany({
      include: {
        createdBy: {
          select: { username: true }
        }
      }
    });
    console.log('Services fetched successfully:', services);
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { message: 'Failed to fetch services', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, serviceCharge } = await request.json();

    // Fetch the user based on the email in the session
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        serviceCharge: parseFloat(serviceCharge),
        createdBy: { connect: { id: user.id } }
      }
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { message: 'Failed to create service', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
