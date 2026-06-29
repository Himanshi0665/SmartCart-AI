import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { normalizeAmazonUrl } from "@/lib/utils";

const analyzeSchema = z.object({
  url: z.string().url("Must be a valid URL"),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = analyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeAmazonUrl(parsed.data.url);

    // Check if product already exists
    let product = await db.product.findUnique({
      where: { url: normalizedUrl },
    });

    if (!product) {
      // Dynamically import scraper to avoid loading Playwright on every request
      const { scrapeAmazonProduct } = await import("@/lib/scraper");
      const scraped = await scrapeAmazonProduct(normalizedUrl);

      if (!scraped) {
        return NextResponse.json(
          { error: "Could not extract product data. Please check the URL and try again." },
          { status: 422 }
        );
      }

      // Save product
      product = await db.product.create({
        data: {
          url: normalizedUrl,
          platform: "AMAZON",
          title: scraped.title,
          description: scraped.description,
          imageUrl: scraped.imageUrl,
          images: scraped.images,
          brand: scraped.brand,
          category: scraped.category,
          currentPrice: scraped.currentPrice,
          originalPrice: scraped.originalPrice,
          currency: scraped.currency,
          rating: scraped.rating,
          reviewCount: scraped.reviewCount,
          availability: scraped.availability,
          features: scraped.features,
          asin: scraped.asin,
          lastScrapedAt: new Date(),
        },
      });

      // Save first price history entry
      await db.priceHistory.create({
        data: {
          productId: product.id,
          price: scraped.currentPrice,
        },
      });

      // Log scrape job
      await db.scrapeJobLog.create({
        data: {
          productId: product.id,
          status: "SUCCESS",
        },
      });
    }

    // Track product for user (upsert — idempotent)
    await db.trackedProduct.upsert({
      where: {
        userId_productId: { userId, productId: product.id },
      },
      update: {},
      create: { userId, productId: product.id },
    });

    return NextResponse.json({ id: product.id, title: product.title });
  } catch (error) {
    console.error("[/api/products/analyze] Error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
