import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !['SUPER_ADMIN', 'NORMAL_ADMIN'].includes(session.user?.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await prisma.user.findMany({
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
        permissions: session.user.role === 'SUPER_ADMIN' ? true : false, // Include permissions only for SUPER_ADMIN
      },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userData = await request.json();
    console.log('Received user data:', userData); // Add this line for debugging

    const user = await prisma.user.create({
      data: {
        employeeId: userData.employeeId,
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        password: userData.password,
        nidNumber: userData.nidNumber,
        jobStartDate: new Date(userData.jobStartDate),
        jobEndDate: userData.jobEndDate ? new Date(userData.jobEndDate) : null,
        isActive: userData.isActive,
        role: userData.role,
        permissions: userData.permissions,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userData = await request.json();
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...userData,
        jobStartDate: new Date(userData.jobStartDate),
        jobEndDate: userData.jobEndDate ? new Date(userData.jobEndDate) : null,
        permissions: userData.permissions,
      },
    });
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.user.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
