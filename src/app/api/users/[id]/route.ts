import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/authOptions";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userData = await request.json();
    console.log('Updating user with data:', userData); // For debugging

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        employeeId: userData.employeeId,
        username: userData.username,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
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
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to update user' },
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
