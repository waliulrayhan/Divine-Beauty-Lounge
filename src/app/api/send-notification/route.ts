import { NextRequest, NextResponse } from 'next/server';
import { sendStockNotification } from '@/lib/notificationService'; // Adjust the import path as necessary

export async function POST(request: NextRequest) {
  const { productName, currentStock } = await request.json();

  try {
    await sendStockNotification(productName, currentStock);
    return NextResponse.json({ message: 'Notification sent successfully' });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
} 