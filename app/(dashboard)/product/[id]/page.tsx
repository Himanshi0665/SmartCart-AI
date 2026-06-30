import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { ProductDetail } from "@/components/product/ProductDetail";
import { PriceChart } from "@/components/product/PriceChart";
import { ReviewSummary } from "@/components/ai/ReviewSummary";
import { ChatPanel } from "@/components/ai/ChatPanel";
import { WishlistButton } from "@/components/wishlist/WishlistButton";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id }, select: { title: true } });
  return {
    title: product?.title ?? "Product",
    description: `Track price history and get AI insights for this product on SmartCart AI.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
    include: {
      priceHistory: { orderBy: { recordedAt: "asc" } },
    },
  });

  if (!product) notFound();

  // Check tracking & wishlist status
  const [tracked, wishlistItem] = await Promise.all([
    db.trackedProduct.findUnique({
      where: { userId_productId: { userId, productId: id } },
    }),
    db.wishlistItem.findUnique({
      where: { userId_productId: { userId, productId: id } },
    }),
  ]);

  // Price stats
  const prices = product.priceHistory.map((p) => p.price);
  const allTimeLow = prices.length ? Math.min(...prices) : product.currentPrice;
  const allTimeHigh = prices.length ? Math.max(...prices) : product.currentPrice;
  const avgPrice = prices.length
    ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
    : product.currentPrice;

  return (
    <div className="max-w-7xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: "hsl(215 20% 65%)" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <span style={{ color: "hsl(215 16% 47%)" }}>/</span>
        <span
          className="text-sm truncate max-w-xs"
          style={{ color: "hsl(210 40% 98%)" }}
        >
          {product.title.slice(0, 50)}...
        </span>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Product detail */}
        <div className="lg:col-span-2 space-y-6">
          <ProductDetail
            product={{
              ...product,
              aiSummary: product.aiSummary as import("@/types").AiSummary | null,
              lastScrapedAt: product.lastScrapedAt?.toISOString() ?? null,
              createdAt: product.createdAt.toISOString(),
            }}
            isTracked={!!tracked}
            userId={userId}
          />

          {/* Price Chart */}
          {product.priceHistory.length > 0 && (
            <PriceChart
              data={product.priceHistory.map((p) => ({
                price: p.price,
                recordedAt: p.recordedAt.toISOString(),
              }))}
              allTimeLow={allTimeLow}
              allTimeHigh={allTimeHigh}
              avgPrice={avgPrice}
              currency={product.currency}
            />
          )}

          {/* AI Review Summary */}
          <ReviewSummary
            productId={product.id}
            initialSummary={product.aiSummary as import("@/types").AiSummary | null}
            verdict={product.aiVerdict}
          />
        </div>

        {/* Right — Sidebar actions */}
        <div className="space-y-4">
          {/* Quick stats card */}
          <div
            className="rounded-2xl p-5 space-y-4"
            style={{
              background: "hsl(222 39% 9%)",
              border: "1px solid hsl(217 32% 17%)",
            }}
          >
            <h3
              className="text-sm font-semibold uppercase tracking-wide"
              style={{ color: "hsl(215 16% 47%)" }}
            >
              Price Intelligence
            </h3>
            {[
              { label: "Current", value: product.currentPrice, highlight: false },
              { label: "All-Time Low", value: allTimeLow, highlight: true },
              { label: "All-Time High", value: allTimeHigh, highlight: false },
              { label: "Average", value: avgPrice, highlight: false },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "hsl(215 20% 65%)" }}>
                  {label}
                </span>
                <span
                  className="font-semibold text-sm"
                  style={{
                    color: highlight ? "#34d399" : "hsl(210 40% 98%)",
                    fontFamily: "Outfit, sans-serif",
                  }}
                >
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: product.currency,
                    maximumFractionDigits: 0,
                  }).format(value)}
                </span>
              </div>
            ))}
            {/* Is this the lowest? */}
            {product.currentPrice <= allTimeLow + 1 && prices.length > 1 && (
              <div
                className="rounded-lg px-3 py-2 text-xs font-semibold text-center"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.25)",
                  color: "#4ade80",
                }}
              >
                🎉 At or near All-Time Low!
              </div>
            )}
          </div>

          {/* Wishlist */}
          <WishlistButton
            productId={product.id}
            initialWishlisted={!!wishlistItem}
            initialTargetPrice={wishlistItem?.targetPrice ?? null}
            currentPrice={product.currentPrice}
            currency={product.currency}
          />

          {/* View on Amazon */}
          <a
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "hsl(222 39% 9%)",
              border: "1px solid hsl(217 32% 25%)",
              color: "hsl(215 20% 65%)",
            }}
          >
            <ExternalLink className="w-4 h-4" />
            View on {product.platform}
          </a>

          {/* Compare shortcut */}
          <Link
            href={`/compare?ids=${product.id}`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: "hsl(222 39% 9%)",
              border: "1px solid hsl(217 32% 25%)",
              color: "hsl(215 20% 65%)",
            }}
          >
            Add to Comparison
          </Link>
        </div>
      </div>

      {/* AI Chat — full width */}
      <ChatPanel productId={product.id} productTitle={product.title} />
    </div>
  );
}
