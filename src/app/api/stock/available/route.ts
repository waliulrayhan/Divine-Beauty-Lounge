import { NextRequest, NextResponse } from 'next/server';
import { getAvailableStock } from '@/lib/stockCalculations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json(
      { error: 'Product ID is required' },
      { status: 400 }
    );
  }

  try {
    const availableStock = await getAvailableStock(productId);
    return NextResponse.json({ availableStock });
  } catch (error) {
    console.error('Error checking available stock:', error);
    return NextResponse.json(
      { error: 'Failed to check available stock' },
      { status: 500 }
    );
  }
}
