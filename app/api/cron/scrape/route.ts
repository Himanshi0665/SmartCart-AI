import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scrapeAmazonProduct } from "@/lib/scraper/amazon";

// GET /api/cron/scrape
// Called by Vercel Cron every 12 hours
// Protected by CRON_SECRET header
export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  let success = 0;
  let failed = 0;

  try {
    // Get all unique tracked products (products tracked by at least one user)
    const products = await db.product.findMany({
      where: {
        trackedBy: { some: {} },
      },
      select: {
        id: true,
        url: true,
        platform: true,
        currentPrice: true,
      },
    });

    console.log(`[Cron] Starting re-scrape for ${products.length} products`);

    for (const product of products) {
      const jobStart = Date.now();
      try {
        let scraped = null;

        if (product.platform === "AMAZON") {
          scraped = await scrapeAmazonProduct(product.url);
        }

        if (!scraped) {
          await db.scrapeJobLog.create({
            data: {
              productId: product.id,
              status: "FAILED",
              errorMessage: "Scraper returned null",
              durationMs: Date.now() - jobStart,
            },
          });
          failed++;
          continue;
        }

        // Update product price and metadata
        await db.product.update({
          where: { id: product.id },
          data: {
            currentPrice: scraped.currentPrice,
            originalPrice: scraped.originalPrice,
            availability: scraped.availability,
            rating: scraped.rating,
            reviewCount: scraped.reviewCount,
            lastScrapedAt: new Date(),
          },
        });

        // Always record a price history entry
        await db.priceHistory.create({
          data: {
            productId: product.id,
            price: scraped.currentPrice,
          },
        });

        await db.scrapeJobLog.create({
          data: {
            productId: product.id,
            status: "SUCCESS",
            durationMs: Date.now() - jobStart,
          },
        });

        success++;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        await db.scrapeJobLog.create({
          data: {
            productId: product.id,
            status: "FAILED",
            errorMessage: message,
            durationMs: Date.now() - jobStart,
          },
        });
        failed++;
      }
    }

    const totalMs = Date.now() - startTime;
    console.log(`[Cron] Done: ${success} success, ${failed} failed in ${totalMs}ms`);

    return NextResponse.json({
      success,
      failed,
      total: products.length,
      durationMs: totalMs,
    });
  } catch (error) {
    console.error("[Cron] Fatal error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
