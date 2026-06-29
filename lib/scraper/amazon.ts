import { ScrapedProduct } from "@/types";
import { extractAsin, sleep } from "@/lib/utils";
import type { Route } from "playwright";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Scrape an Amazon product page using Playwright.
 * Retries up to MAX_RETRIES times on failure.
 */
export async function scrapeAmazonProduct(
  url: string
): Promise<ScrapedProduct | null> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await attemptScrape(url);
      if (result) return result;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.error(`[Scraper] Attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
      }
    }
  }

  console.error("[Scraper] All attempts exhausted for:", url, lastError);
  return null;
}

async function attemptScrape(url: string): Promise<ScrapedProduct | null> {
  // Dynamic import to avoid loading Playwright at build time
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
    ],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
      locale: "en-IN",
      extraHTTPHeaders: {
        "Accept-Language": "en-IN,en;q=0.9",
      },
    });

    const page = await context.newPage();

    // Block unnecessary resources to speed up scraping
    await page.route("**/*", (route: Route) => {
      const resourceType = route.request().resourceType();
      if (["font", "media"].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Wait for the product title to appear
    await page.waitForSelector("#productTitle, #title", { timeout: 15000 });

    const data = await page.evaluate(() => {
      // ── Title ──
      const title =
        document.querySelector("#productTitle")?.textContent?.trim() ??
        document.querySelector("#title span")?.textContent?.trim() ??
        "";

      // ── Price ──
      const priceWhole = document.querySelector(".a-price-whole")?.textContent?.replace(/[^0-9]/g, "") ?? "";
      const priceFraction = document.querySelector(".a-price-fraction")?.textContent?.replace(/[^0-9]/g, "") ?? "00";
      const currentPrice = priceWhole
        ? parseFloat(`${priceWhole}.${priceFraction}`)
        : 0;

      // Original/MRP price
      const originalPriceText =
        document.querySelector(".a-text-price .a-offscreen")?.textContent ??
        document.querySelector("#priceblock_saleprice + * .a-text-price .a-offscreen")?.textContent ??
        null;
      const originalPrice = originalPriceText
        ? parseFloat(originalPriceText.replace(/[^0-9.]/g, ""))
        : null;

      // ── Images ──
      const imageUrl =
        (document.querySelector("#landingImage") as HTMLImageElement)?.src ??
        (document.querySelector("#imgTagWrapperId img") as HTMLImageElement)?.src ??
        null;

      // Try to get all images from the image gallery
      const imageScripts = Array.from(document.querySelectorAll("script")).find(
        (s) => s.textContent?.includes("colorImages")
      );
      const images: string[] = [];
      if (imageScripts?.textContent) {
        const matches = imageScripts.textContent.matchAll(/"hiRes":"(https[^"]+)"/g);
        for (const match of matches) {
          if (!images.includes(match[1])) images.push(match[1]);
        }
      }
      if (images.length === 0 && imageUrl) images.push(imageUrl);

      // ── Rating ──
      const ratingText = document.querySelector("#acrPopover")?.getAttribute("title") ?? null;
      const rating = ratingText
        ? parseFloat(ratingText.split(" ")[0])
        : null;

      // ── Review Count ──
      const reviewText =
        document.querySelector("#acrCustomerReviewText")?.textContent ?? null;
      const reviewCount = reviewText
        ? parseInt(reviewText.replace(/[^0-9]/g, ""), 10)
        : null;

      // ── Availability ──
      const availabilityEl = document.querySelector("#availability span");
      const availabilityText = availabilityEl?.textContent?.trim().toLowerCase() ?? "";
      const availability =
        availabilityText.includes("in stock") ||
        availabilityText.includes("available");

      // ── Brand ──
      const brand =
        document.querySelector("#bylineInfo")?.textContent?.replace(/^(Visit the |Brand: |by )/i, "").trim() ??
        document.querySelector("a#bylineInfo")?.textContent?.trim() ??
        null;

      // ── Description / Features ──
      const features: string[] = Array.from(
        document.querySelectorAll("#feature-bullets ul li span.a-list-item")
      )
        .map((el) => el.textContent?.trim() ?? "")
        .filter((f) => f.length > 10 && f.length < 300)
        .slice(0, 10);

      const description =
        document.querySelector("#productDescription p")?.textContent?.trim() ??
        document.querySelector("#aplus .aplus-module")?.textContent?.trim() ??
        null;

      // ── Category ──
      const breadcrumbs = Array.from(
        document.querySelectorAll("#wayfinding-breadcrumbs_container li")
      );
      const category =
        breadcrumbs.length > 0
          ? breadcrumbs[breadcrumbs.length - 1]?.textContent?.trim() ?? null
          : null;

      return {
        title,
        currentPrice,
        originalPrice,
        imageUrl,
        images,
        rating,
        reviewCount,
        availability,
        brand,
        features,
        description,
        category,
      };
    });

    // Validate we got a meaningful result
    if (!data.title || data.currentPrice === 0) {
      throw new Error("Could not extract title or price from the page");
    }

    const asin = extractAsin(url);

    return {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      images: data.images,
      brand: data.brand,
      category: data.category,
      currentPrice: data.currentPrice,
      originalPrice: data.originalPrice,
      currency: "INR",
      rating: data.rating,
      reviewCount: data.reviewCount,
      availability: data.availability,
      features: data.features,
      asin,
      platform: "AMAZON",
    };
  } finally {
    await browser.close();
  }
}
