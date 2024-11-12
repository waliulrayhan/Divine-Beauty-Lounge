import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      totalServices,
      totalProducts,
      totalBrands,
      totalStockInEntries,
      totalStockOutEntries,
      lowStockProducts,
      currentStock,
    });
  } catch (error) {
    console.error("Error fetching quick stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch quick stats" },
      { status: 500 }
    );
  }
}
