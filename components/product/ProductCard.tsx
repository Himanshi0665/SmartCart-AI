"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, TrendingDown, TrendingUp, Minus, ExternalLink } from "lucide-react";
import { formatPrice, getPriceChangePercent, truncateText } from "@/lib/utils";

interface PriceHistory {
  price: number;
  recordedAt: Date | string;
}

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    imageUrl: string | null;
    currentPrice: number;
    originalPrice: number | null;
    currency: string;
    rating: number | null;
    reviewCount: number | null;
    availability: boolean;
    platform: string;
    aiVerdict: number | null;
    priceHistory: PriceHistory[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const history = product.priceHistory;
  const oldestPrice = history.length > 1 ? history[history.length - 1].price : null;
  const priceChange = oldestPrice
    ? getPriceChangePercent(product.currentPrice, oldestPrice)
    : 0;

  const verdictColor =
    product.aiVerdict !== null
      ? product.aiVerdict >= 70
        ? "#34d399"
        : product.aiVerdict >= 45
        ? "#f59e0b"
        : "#f87171"
      : undefined;

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div
        className="card card-glow p-4 group cursor-pointer h-full flex flex-col"
        style={{ borderRadius: "16px" }}
      >
        {/* Image + Verdict */}
        <div className="relative mb-4">
          <div
            className="w-full h-44 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ background: "hsl(222 47% 5%)" }}
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="object-contain p-2 transition-transform group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div
                className="text-4xl flex items-center justify-center w-full h-full"
                style={{ color: "hsl(215 16% 47%)" }}
              >
                📦
              </div>
            )}
          </div>

          {/* AI Verdict badge */}
          {product.aiVerdict !== null && (
            <div
              className="absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: `${verdictColor}20`,
                border: `2px solid ${verdictColor}`,
                color: verdictColor,
              }}
            >
              {product.aiVerdict}
            </div>
          )}

          {/* Platform badge */}
          <div
            className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-semibold"
            style={{
              background: "rgba(59,130,246,0.15)",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#60a5fa",
            }}
          >
            {product.platform}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h3
            className="text-sm font-medium mb-3 leading-snug"
            style={{ color: "hsl(210 40% 98%)" }}
          >
            {truncateText(product.title, 70)}
          </h3>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1.5 mb-3">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium" style={{ color: "hsl(210 40% 98%)" }}>
                {product.rating.toFixed(1)}
              </span>
              {product.reviewCount && (
                <span className="text-xs" style={{ color: "hsl(215 16% 47%)" }}>
                  ({product.reviewCount.toLocaleString("en-IN")})
                </span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="mt-auto">
            <div className="flex items-end justify-between">
              <div>
                <div
                  className="text-xl font-bold"
                  style={{ color: "hsl(210 40% 98%)", fontFamily: "Outfit, sans-serif" }}
                >
                  {formatPrice(product.currentPrice, product.currency)}
                </div>
                {product.originalPrice && product.originalPrice > product.currentPrice && (
                  <div
                    className="text-xs line-through"
                    style={{ color: "hsl(215 16% 47%)" }}
                  >
                    {formatPrice(product.originalPrice, product.currency)}
                  </div>
                )}
              </div>

              {/* Price trend */}
              {oldestPrice && priceChange !== 0 && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                  style={
                    priceChange < 0
                      ? {
                          background: "rgba(34,197,94,0.1)",
                          color: "#4ade80",
                          border: "1px solid rgba(34,197,94,0.2)",
                        }
                      : {
                          background: "rgba(239,68,68,0.1)",
                          color: "#f87171",
                          border: "1px solid rgba(239,68,68,0.2)",
                        }
                  }
                >
                  {priceChange < 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  {Math.abs(priceChange)}%
                </div>
              )}
              {oldestPrice && priceChange === 0 && (
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    background: "rgba(100,116,139,0.1)",
                    color: "hsl(215 20% 65%)",
                    border: "1px solid rgba(100,116,139,0.2)",
                  }}
                >
                  <Minus className="w-3 h-3" />
                  Stable
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid hsl(217 32% 17%)" }}>
              <span
                className="text-xs flex items-center gap-1"
                style={{ color: product.availability ? "#4ade80" : "#f87171" }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: product.availability ? "#4ade80" : "#f87171" }}
                />
                {product.availability ? "In Stock" : "Out of Stock"}
              </span>
              <ExternalLink className="w-3.5 h-3.5" style={{ color: "hsl(215 16% 47%)" }} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
