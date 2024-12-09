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
    const totalServices = await prisma.service.count();
    const totalProducts = await prisma.product.count();
    const totalStockInEntries = await prisma.stockIn.count();
    const totalStockOutEntries = await prisma.stockOut.count();

    // Get all products with their stock information
    const products = await prisma.product.findMany({
      include: {
        service: true,
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

    // Calculate current stock for each product
    const currentStock = products.map((product) => {
      const totalStockIn = product.stockIns.reduce(
        (sum, record) => sum + record.quantity,
        0
      );

      const totalStockOut = product.stockOuts.reduce(
        (sum, record) => sum + record.quantity,
        0
      );

      return {
        id: product.id,
        productName: product.name,
        serviceName: product.service.name,
        totalStockIn,
        totalStockOut,
        currentStock: totalStockIn - totalStockOut,
      };
    });

    // Count products with low stock (current stock <= 2)
    const lowStockProducts = currentStock.filter(item => item.currentStock <= 2).length;

    // Get total quantities
    const stockInStats = await prisma.stockIn.aggregate({
      _sum: {
        quantity: true,
      },
    });

    const stockOutStats = await prisma.stockOut.aggregate({
      _sum: {
        quantity: true,
      },
    });

    return NextResponse.json({
      totalServices,
      totalProducts,
      totalStockInEntries,
      totalStockOutEntries,
      lowStockProducts,
      currentStock,
      stockInQuantity: stockInStats._sum.quantity || 0,
      stockOutQuantity: stockOutStats._sum.quantity || 0,
    });
  } catch (error) {
    console.error("Error fetching quick stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch quick stats" },
      { status: 500 }
    );
  }
}
