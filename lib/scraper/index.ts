// Scraper index — URL router to the right platform scraper
export { scrapeAmazonProduct } from "./amazon";

import { scrapeAmazonProduct } from "./amazon";
import { ScrapedProduct } from "@/types";

export async function scrapeProduct(url: string): Promise<ScrapedProduct | null> {
  const isAmazon =
    url.includes("amazon.in") || url.includes("amazon.com");

  if (isAmazon) return scrapeAmazonProduct(url);

  // Flipkart support — coming soon
  return null;
}
