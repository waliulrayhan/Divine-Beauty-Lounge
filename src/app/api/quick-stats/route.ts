import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Count total number of services
    const totalServices = await prisma.service.count();

    // Count total number of products
    const totalProducts = await prisma.product.count();

    // Count total number of brands
    const totalBrands = await prisma.brand.count();

    // Count total stock entries
    const totalStockInEntries = await prisma.stockIn.count();

    // Count total stock out entries
    const totalStockOutEntries = await prisma.stockOut.count();

    // Get all brands with their related product and service information for current stock
    const brands = await prisma.brand.findMany({
      include: {
        product: {
          include: {
            service: true,
          },
        },
        stockIns: {
          select: {
            quantity: true,
          },
        },
        stockOuts: {
          select: {
            quantity: true,
          },
        },
      },
    });

    // Calculate current stock for each brand
    const currentStock = brands.map((brand) => {
      const totalStockIn = brand.stockIns.reduce(
        (sum, record) => sum + record.quantity,
        0
      );

      const totalStockOut = brand.stockOuts.reduce(
        (sum, record) => sum + record.quantity,
        0
      );

      return {
        id: brand.id,
        brandName: brand.name,
        productName: brand.product.name,
        serviceName: brand.product.service.name,
        totalStockIn,
        totalStockOut,
        currentStock: totalStockIn - totalStockOut,
      };
    });

    // Count products with low stock (current stock <= 2)
    const lowStockProducts = currentStock.filter(item => item.currentStock <= 2).length;

    // Sort current stock by brand name
    currentStock.sort((a, b) => a.brandName.localeCompare(b.brandName));

    // Get stock in statistics with quantity and value calculations
    const stockInStats = await prisma.stockIn.aggregate({
      _sum: {
        quantity: true,
        pricePerUnit: true,
      },
    });

    // Calculate total stock in value
    const stockInDetails = await prisma.stockIn.findMany({
      select: {
        quantity: true,
        pricePerUnit: true,
      },
    });
    
    const totalStockInValue = stockInDetails.reduce(
      (sum, item) => sum + (item.quantity * item.pricePerUnit),
      0
    );

    // Get stock out quantities
    const stockOutStats = await prisma.stockOut.aggregate({
      _sum: {
        quantity: true,
      },
    });

    // Calculate stock out value based on the most recent stock in price for each item
    const stockOuts = await prisma.stockOut.findMany({
      include: {
        product: true,
        brand: true,
      },
    });

    let totalStockOutValue = 0;
    for (const stockOut of stockOuts) {
      // Get the most recent stock in price for this product/brand combination
      const mostRecentStockIn = await prisma.stockIn.findFirst({
        where: {
          productId: stockOut.productId,
          brandId: stockOut.brandId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (mostRecentStockIn) {
        totalStockOutValue += stockOut.quantity * mostRecentStockIn.pricePerUnit;
      }
    }

    return NextResponse.json({
      totalServices,
      totalProducts,
      totalBrands,
      totalStockInEntries,
      totalStockOutEntries,
      lowStockProducts,
      currentStock,
      stockInQuantity: stockInStats._sum.quantity || 0,
      stockOutQuantity: stockOutStats._sum.quantity || 0,
      totalStockInValue: totalStockInValue || 0,
      totalStockOutValue: totalStockOutValue || 0,
    });
  } catch (error) {
    console.error("Error fetching quick stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch quick stats" },
      { status: 500 }
    );
  }
}
