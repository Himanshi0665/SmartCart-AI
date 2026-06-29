import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const wishlistAddSchema = z.object({
  productId: z.string().uuid(),
  targetPrice: z.number().positive().optional(),
});

const wishlistUpdateSchema = z.object({
  targetPrice: z.number().positive().nullable(),
});

// GET /api/wishlist
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await db.wishlistItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            currentPrice: true,
            originalPrice: true,
            currency: true,
            rating: true,
            availability: true,
            platform: true,
            aiVerdict: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("[/api/wishlist GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/wishlist
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = wishlistAddSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const item = await db.wishlistItem.upsert({
      where: { userId_productId: { userId, productId: parsed.data.productId } },
      update: { targetPrice: parsed.data.targetPrice ?? null },
      create: {
        userId,
        productId: parsed.data.productId,
        targetPrice: parsed.data.targetPrice ?? null,
      },
      include: { product: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[/api/wishlist POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
