import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products/:id — full product detail with price history
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await db.product.findUnique({
      where: { id },
      include: {
        priceHistory: {
          orderBy: { recordedAt: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user is tracking this product
    const tracked = await db.trackedProduct.findUnique({
      where: { userId_productId: { userId, productId: id } },
    });

    // Check wishlist
    const wishlistItem = await db.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId: id } },
    });

    return NextResponse.json({
      ...product,
      isTracked: !!tracked,
      isWishlisted: !!wishlistItem,
      wishlistTargetPrice: wishlistItem?.targetPrice ?? null,
    });
  } catch (error) {
    console.error("[/api/products/:id] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/products/:id — stop tracking
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db.trackedProduct.deleteMany({
      where: { userId, productId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/products/:id DELETE] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
