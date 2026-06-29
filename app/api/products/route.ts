import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products — get all tracked products for current user
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tracked = await db.trackedProduct.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            priceHistory: {
              orderBy: { recordedAt: "desc" },
              take: 30,
            },
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });

    return NextResponse.json(tracked.map((t) => t.product));
  } catch (error) {
    console.error("[/api/products] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
