import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  targetPrice: z.number().positive().nullable(),
});

// PATCH /api/wishlist/:id
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const item = await db.wishlistItem.update({
      where: { id: parseInt(id), userId },
      data: { targetPrice: parsed.data.targetPrice },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("[/api/wishlist/:id PATCH]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/wishlist/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await db.wishlistItem.deleteMany({
      where: { id: parseInt(id), userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/wishlist/:id DELETE]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
