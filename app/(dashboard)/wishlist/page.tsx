import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist | SmartCart AI",
  description: "Products you're watching with target price alerts.",
};

export default async function WishlistPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const items = await db.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          currentPrice: true,
          originalPrice: true,
          currency: true,
          rating: true,
          availability: true,
          platform: true,
          aiVerdict: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "Outfit, sans-serif", color: "hsl(210 40% 98%)" }}
          >
            Wishlist
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(215 20% 65%)" }}>
            {items.length} {items.length === 1 ? "product" : "products"} being watched
          </p>
        </div>
        <Link
          href="/dashboard"
          className="text-sm px-4 py-2 rounded-lg transition-all"
          style={{
            background: "hsl(222 39% 9%)",
            border: "1px solid hsl(217 32% 17%)",
            color: "hsl(215 20% 65%)",
          }}
        >
          + Track New Product
        </Link>
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div
          className="rounded-2xl p-16 flex flex-col items-center justify-center text-center"
          style={{
            background: "hsl(222 39% 9%)",
            border: "1px solid hsl(217 32% 17%)",
          }}
        >
          <Heart className="w-12 h-12 mb-4" style={{ color: "hsl(215 16% 47%)" }} />
          <h3 className="text-xl font-semibold mb-2" style={{ color: "hsl(210 40% 98%)" }}>
            Your wishlist is empty
          </h3>
          <p className="text-sm mb-6" style={{ color: "hsl(215 20% 65%)" }}>
            Track a product and add it to your wishlist to get notified when the
            price drops.
          </p>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-xl text-white font-semibold text-sm"
            style={{ background: "linear-gradient(135deg, #3b82f6, #7c3aed)" }}
          >
            Track Your First Product
          </Link>
        </div>
      )}

      {/* Wishlist grid */}
      {items.length > 0 && (
        <div className="space-y-4">
          {items.map(({ id, product, targetPrice, createdAt }) => {
            const isAtTarget =
              targetPrice !== null && product.currentPrice <= targetPrice;

            const verdictColor =
              product.aiVerdict !== null
                ? product.aiVerdict >= 70
                  ? "#34d399"
                  : product.aiVerdict >= 45
                  ? "#f59e0b"
                  : "#f87171"
                : undefined;

            return (
              <div
                key={id}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                style={{
                  background: "hsl(222 39% 9%)",
                  border: isAtTarget
                    ? "1px solid rgba(34,197,94,0.35)"
                    : "1px solid hsl(217 32% 17%)",
                }}
              >
                {/* Image */}
                <Link href={`/product/${product.id}`} className="flex-shrink-0">
                  <div
                    className="w-20 h-20 rounded-xl overflow-hidden flex items-center justify-center"
                    style={{ background: "hsl(222 47% 5%)" }}
                  >
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        width={80}
                        height={80}
                        className="object-contain p-1"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${product.id}`}>
                    <h3
                      className="font-medium text-sm leading-snug mb-2 hover:text-blue-400 transition-colors"
                      style={{ color: "hsl(210 40% 98%)" }}
                    >
                      {product.title.slice(0, 80)}{product.title.length > 80 ? "…" : ""}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="text-lg font-bold"
                      style={{
                        color: isAtTarget ? "#4ade80" : "hsl(210 40% 98%)",
                        fontFamily: "Outfit, sans-serif",
                      }}
                    >
                      {formatPrice(product.currentPrice, product.currency)}
                    </span>
                    {targetPrice && (
                      <span className="text-xs" style={{ color: "hsl(215 16% 47%)" }}>
                        Target: {formatPrice(targetPrice, product.currency)}
                      </span>
                    )}
                    {isAtTarget && (
                      <span
                        className="text-xs px-2 py-1 rounded-full font-semibold animate-pulse"
                        style={{
                          background: "rgba(34,197,94,0.15)",
                          color: "#4ade80",
                          border: "1px solid rgba(34,197,94,0.3)",
                        }}
                      >
                        🎉 Target Reached!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: "hsl(215 16% 47%)" }}>
                      Added {new Date(createdAt).toLocaleDateString("en-IN")}
                    </span>
                    {product.aiVerdict !== null && (
                      <span
                        className="text-xs font-semibold"
                        style={{ color: verdictColor }}
                      >
                        AI Score: {product.aiVerdict}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  <Link
                    href={`/product/${product.id}`}
                    className="text-xs px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: "hsl(222 47% 5%)",
                      border: "1px solid hsl(217 32% 17%)",
                      color: "hsl(215 20% 65%)",
                    }}
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
