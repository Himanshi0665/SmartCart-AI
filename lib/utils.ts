import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function isValidAmazonUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname.includes("amazon.in") ||
        parsed.hostname.includes("amazon.com")) &&
      (parsed.pathname.includes("/dp/") ||
        parsed.pathname.includes("/gp/product/") ||
        parsed.pathname.includes("/d/"))
    );
  } catch {
    return false;
  }
}

export function extractAsin(url: string): string | null {
  const patterns = [
    /\/dp\/([A-Z0-9]{10})/,
    /\/gp\/product\/([A-Z0-9]{10})/,
    /\/d\/([A-Z0-9]{10})/,
    /\?.*&ASIN=([A-Z0-9]{10})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function normalizeAmazonUrl(url: string): string {
  const asin = extractAsin(url);
  if (asin) return `https://www.amazon.in/dp/${asin}`;
  return url;
}

export function getPriceChangePercent(current: number, previous: number): number {
  if (previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function getVerdictColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-yellow-400";
  return "text-red-400";
}

export function getVerdictLabel(score: number): string {
  if (score >= 80) return "Highly Recommended";
  if (score >= 65) return "Good Buy";
  if (score >= 50) return "Worth Considering";
  if (score >= 35) return "Approach with Caution";
  return "Not Recommended";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
