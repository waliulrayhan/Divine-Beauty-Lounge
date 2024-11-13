import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        employeeId: true,
        username: true, 
        email: true, 
        phoneNumber: true,
        nidNumber: true,
        jobStartDate: true,
        jobEndDate: true,
        isActive: true,
        role: true,
        permissions: true
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userData = await request.json();
    const isSuperAdmin = session.user.role === 'SUPER_ADMIN';
    
    // Define updateData based on user role
    const updateData: Partial<typeof userData> = isSuperAdmin 
      ? {
          username: userData.username,
          phoneNumber: userData.phoneNumber,
          password: userData.password,
          nidNumber: userData.nidNumber,
          jobStartDate: new Date(userData.jobStartDate),
          jobEndDate: userData.jobEndDate ? new Date(userData.jobEndDate) : null,
          isActive: userData.isActive,
          role: userData.role,
        }
      : {
          phoneNumber: userData.phoneNumber,
          password: userData.password,
          nidNumber: userData.nidNumber,
        };

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
