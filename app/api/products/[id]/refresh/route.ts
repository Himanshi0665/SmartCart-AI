import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scrapeAmazonProduct } from "@/lib/scraper/amazon";

// POST /api/products/:id/refresh — force re-scrape
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const product = await db.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const scraped = await scrapeAmazonProduct(product.url);
    if (!scraped) {
      return NextResponse.json({ error: "Scrape failed" }, { status: 422 });
    }

    // Update product
    const updated = await db.product.update({
      where: { id },
      data: {
        currentPrice: scraped.currentPrice,
        originalPrice: scraped.originalPrice,
        availability: scraped.availability,
        rating: scraped.rating,
        reviewCount: scraped.reviewCount,
        lastScrapedAt: new Date(),
      },
    });

    // Record new price point
    await db.priceHistory.create({
      data: { productId: id, price: scraped.currentPrice },
    });

    return NextResponse.json({ currentPrice: updated.currentPrice });
  } catch (error) {
    console.error("[/api/products/:id/refresh]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
