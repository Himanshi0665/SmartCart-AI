// Shared TypeScript interfaces for SmartCart AI

export interface ScrapedProduct {
  title: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  brand: string | null;
  category: string | null;
  currentPrice: number;
  originalPrice: number | null;
  currency: string;
  rating: number | null;
  reviewCount: number | null;
  availability: boolean;
  features: string[];
  asin: string | null;
  platform: "AMAZON" | "FLIPKART";
}

export interface AiSummary {
  pros: string[];
  cons: string[];
  verdict: string;
  score: number;
  promptVersion: string;
  generatedAt: string;
}

export interface PricePoint {
  price: number;
  recordedAt: string;
}

export interface ProductWithHistory {
  id: string;
  url: string;
  platform: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  images: string[];
  brand: string | null;
  category: string | null;
  currentPrice: number;
  originalPrice: number | null;
  currency: string;
  rating: number | null;
  reviewCount: number | null;
  availability: boolean;
  features: string[];
  asin: string | null;
  aiSummary: AiSummary | null;
  aiVerdict: number | null;
  lastScrapedAt: string | null;
  createdAt: string;
  priceHistory: PricePoint[];
}

export interface WishlistItemWithProduct {
  id: number;
  targetPrice: number | null;
  createdAt: string;
  product: {
    id: string;
    title: string;
    imageUrl: string | null;
    currentPrice: number;
    currency: string;
    rating: number | null;
    availability: boolean;
    platform: string;
  };
}

export interface AdminMetrics {
  totalUsers: number;
  totalProducts: number;
  totalScrapeJobs: number;
  successfulScrapes: number;
  failedScrapes: number;
  scrapeSuccessRate: number;
  recentJobs: ScrapeJobEntry[];
}

export interface ScrapeJobEntry {
  id: number;
  productId: string;
  productTitle: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  errorMessage: string | null;
  durationMs: number | null;
  runAt: string;
}

export interface CompareProduct {
  id: string;
  title: string;
  imageUrl: string | null;
  currentPrice: number;
  currency: string;
  rating: number | null;
  reviewCount: number | null;
  availability: boolean;
  brand: string | null;
  features: string[];
  aiVerdict: number | null;
  platform: string;
}

export interface ChatMessage {
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
}

export type AnalyzeUrlRequest = {
  url: string;
};

export type WishlistUpdateRequest = {
  targetPrice: number | null;
};

export type WishlistAddRequest = {
  productId: string;
  targetPrice?: number;
};
