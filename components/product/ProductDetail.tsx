"use client";

import Image from "next/image";
import { useState } from "react";
import { Star, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { formatPrice, truncateText } from "@/lib/utils";
import type { AiSummary } from "@/types";
import { toast } from "sonner";

interface ProductDetailProps {
  product: {
    id: string;
    title: string;
    imageUrl: string | null;
    images: string[];
    currentPrice: number;
    originalPrice: number | null;
    currency: string;
    rating: number | null;
    reviewCount: number | null;
    availability: boolean;
    brand: string | null;
    category: string | null;
    features: string[];
    description: string | null;
    platform: string;
    asin: string | null;
    aiVerdict: number | null;
    aiSummary: AiSummary | null;
    lastScrapedAt: string | null;
    createdAt: string;
  };
  isTracked: boolean;
  userId: string;
}

export function ProductDetail({ product, isTracked }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const images = product.images.length > 0
    ? product.images
    : product.imageUrl
    ? [product.imageUrl]
    : [];

  const discount =
    product.originalPrice && product.originalPrice > product.currentPrice
      ? Math.round(
          ((product.originalPrice - product.currentPrice) / product.originalPrice) * 100
        )
      : null;

  const handleRefreshPrice = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/products/${product.id}/refresh`, {
        method: "POST",
      });
      if (res.ok) {
        toast.success("Price refreshed! Reloading...");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("Refresh failed. Try again.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const verdictColor =
    product.aiVerdict !== null
      ? product.aiVerdict >= 70
        ? "#34d399"
        : product.aiVerdict >= 45
        ? "#f59e0b"
        : "#f87171"
      : undefined;

  const verdictLabel =
    product.aiVerdict !== null
      ? product.aiVerdict >= 70
        ? "Highly Recommended"
        : product.aiVerdict >= 45
        ? "Decent Option"
        : "Think Twice"
      : null;

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "hsl(222 39% 9%)",
        border: "1px solid hsl(217 32% 17%)",
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Image gallery */}
        <div className="space-y-3">
          <div
            className="relative w-full aspect-square rounded-xl overflow-hidden"
            style={{ background: "hsl(222 47% 5%)" }}
          >
            {images[selectedImage] ? (
              <Image
                src={images[selectedImage]}
                alt={product.title}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-6xl">📦</div>
            )}
            {/* AI Verdict overlay */}
            {product.aiVerdict !== null && (
              <div
                className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold"
                style={{
                  background: `${verdictColor}15`,
                  border: `1.5px solid ${verdictColor}`,
                  color: verdictColor,
                }}
              >
                <span className="text-lg">{product.aiVerdict}</span>
                <span className="text-xs font-medium">{verdictLabel}</span>
              </div>
            )}
            {discount && (
              <div
                className="absolute top-3 right-3 px-2 py-1 rounded-lg text-sm font-bold"
                style={{
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  color: "#4ade80",
                }}
              >
                -{discount}%
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.slice(0, 6).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden transition-all"
                  style={{
                    border: selectedImage === i
                      ? "2px solid #3b82f6"
                      : "2px solid hsl(217 32% 17%)",
                    background: "hsl(222 47% 5%)",
                  }}
                >
                  <Image src={img} alt="" width={56} height={56} className="object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-4">
          {/* Brand + Category */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.brand && (
              <span
                className="text-xs px-2 py-1 rounded-md font-medium"
                style={{
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  color: "#60a5fa",
                }}
              >
                {product.brand}
              </span>
            )}
            {product.category && (
              <span
                className="text-xs px-2 py-1 rounded-md"
                style={{
                  background: "hsl(222 47% 5%)",
                  border: "1px solid hsl(217 32% 17%)",
                  color: "hsl(215 20% 65%)",
                }}
              >
                {product.category}
              </span>
            )}
            <span
              className="text-xs px-2 py-1 rounded-md ml-auto"
              style={{
                background: product.availability ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                border: product.availability ? "1px solid rgba(34,197,94,0.2)" : "1px solid rgba(239,68,68,0.2)",
                color: product.availability ? "#4ade80" : "#f87171",
              }}
            >
              {product.availability ? "✓ In Stock" : "✗ Out of Stock"}
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-lg font-semibold leading-snug"
            style={{ color: "hsl(210 40% 98%)", fontFamily: "Outfit, sans-serif" }}
          >
            {product.title}
          </h1>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4"
                    style={{
                      fill: i < Math.floor(product.rating!) ? "#f59e0b" : "transparent",
                      color: "#f59e0b",
                    }}
                  />
                ))}
              </div>
              <span className="text-sm font-medium" style={{ color: "hsl(210 40% 98%)" }}>
                {product.rating.toFixed(1)}
              </span>
              {product.reviewCount && (
                <span className="text-sm" style={{ color: "hsl(215 16% 47%)" }}>
                  ({product.reviewCount.toLocaleString("en-IN")} reviews)
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div
            className="p-4 rounded-xl space-y-1"
            style={{ background: "hsl(222 47% 5%)" }}
          >
            <div
              className="text-3xl font-bold"
              style={{ color: "hsl(210 40% 98%)", fontFamily: "Outfit, sans-serif" }}
            >
              {formatPrice(product.currentPrice, product.currency)}
            </div>
            {product.originalPrice && product.originalPrice > product.currentPrice && (
              <div className="flex items-center gap-3">
                <span className="text-sm line-through" style={{ color: "hsl(215 16% 47%)" }}>
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
                <span className="text-sm font-semibold" style={{ color: "#4ade80" }}>
                  Save {formatPrice(product.originalPrice - product.currentPrice, product.currency)}
                </span>
              </div>
            )}
          </div>

          {/* Features */}
          {product.features.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(215 16% 47%)" }}>
                Key Features
              </h3>
              <ul className="space-y-1.5">
                {product.features.slice(0, 6).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#60a5fa" }} />
                    <span className="text-sm" style={{ color: "hsl(215 20% 65%)" }}>
                      {truncateText(feature, 100)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Refresh price button */}
          <button
            onClick={handleRefreshPrice}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all disabled:opacity-50"
            style={{
              background: "hsl(222 47% 5%)",
              border: "1px solid hsl(217 32% 17%)",
              color: "hsl(215 20% 65%)",
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Price"}
          </button>

          {/* Last scraped */}
          {product.lastScrapedAt && (
            <p className="text-xs" style={{ color: "hsl(215 16% 47%)" }}>
              Last updated:{" "}
              {new Date(product.lastScrapedAt).toLocaleString("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div
          className="mt-6 pt-6 space-y-2"
          style={{ borderTop: "1px solid hsl(217 32% 17%)" }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "hsl(210 40% 98%)" }}>
            About this product
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "hsl(215 20% 65%)" }}>
            {truncateText(product.description, 500)}
          </p>
        </div>
      )}
    </div>
  );
}
