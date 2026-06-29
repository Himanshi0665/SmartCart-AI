import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ProductUrlInput } from "@/components/product/ProductUrlInput";
import { ProductCard } from "@/components/product/ProductCard";
import { BarChart3, Package, Heart, TrendingDown, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your SmartCart AI product tracking dashboard",
};

export default async function DashboardPage() {
  const user = await currentUser();

  // Upsert user in DB
  if (user) {
    await db.user.upsert({
      where: { id: user.id },
      update: {
        name: user.fullName ?? user.firstName ?? "User",
        email: user.emailAddresses[0]?.emailAddress ?? "",
        avatarUrl: user.imageUrl,
      },
      create: {
        id: user.id,
        name: user.fullName ?? user.firstName ?? "User",
        email: user.emailAddresses[0]?.emailAddress ?? "",
        avatarUrl: user.imageUrl,
      },
    });
  }

  // Fetch tracked products
  const trackedProducts = user
    ? await db.trackedProduct.findMany({
        where: { userId: user.id },
        include: {
          product: {
            include: {
              priceHistory: {
                orderBy: { recordedAt: "desc" },
                take: 30,
              },
            },
          },
        },
        orderBy: { addedAt: "desc" },
      })
    : [];

  const wishlistCount = user
    ? await db.wishlistItem.count({ where: { userId: user.id } })
    : 0;

  const firstName = user?.firstName ?? "there";

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: "Outfit, sans-serif", color: "hsl(210 40% 98%)" }}
        >
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 18
            ? "afternoon"
            : "evening"}
          , {firstName} 👋
        </h1>
        <p style={{ color: "hsl(215 20% 65%)" }}>
          Track products, analyze prices, and shop smarter with AI.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up stagger-1">
        {[
          {
            label: "Products Tracked",
            value: trackedProducts.length,
            icon: Package,
            color: "#60a5fa",
          },
          {
            label: "Wishlist Items",
            value: wishlistCount,
            icon: Heart,
            color: "#f472b6",
          },
          {
            label: "Price Drops Found",
            value: trackedProducts.filter((tp) => {
              const history = tp.product.priceHistory;
              if (history.length < 2) return false;
              return history[0].price < history[history.length - 1].price;
            }).length,
            icon: TrendingDown,
            color: "#34d399",
          },
          {
            label: "AI Analyses Done",
            value: trackedProducts.filter((tp) => tp.product.aiSummary !== null)
              .length,
            icon: Sparkles,
            color: "#a78bfa",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card p-5 flex items-center gap-4"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `${stat.color}15`,
                border: `1px solid ${stat.color}30`,
              }}
            >
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
            <div>
              <p
                className="text-2xl font-bold"
                style={{ color: "hsl(210 40% 98%)", fontFamily: "Outfit, sans-serif" }}
              >
                {stat.value}
              </p>
              <p className="text-sm" style={{ color: "hsl(215 20% 65%)" }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* URL Input */}
      <div className="animate-fade-in-up stagger-2">
        <ProductUrlInput />
      </div>

      {/* Products Grid */}
      <div className="animate-fade-in-up stagger-3">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xl font-semibold"
            style={{ color: "hsl(210 40% 98%)", fontFamily: "Outfit, sans-serif" }}
          >
            Tracked Products
          </h2>
          <div
            className="text-sm px-3 py-1 rounded-full"
            style={{
              background: "hsl(222 39% 9%)",
              border: "1px solid hsl(217 32% 17%)",
              color: "hsl(215 20% 65%)",
            }}
          >
            {trackedProducts.length} products
          </div>
        </div>

        {trackedProducts.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{
              background: "hsl(222 39% 9%)",
              border: "1px dashed hsl(217 32% 25%)",
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <BarChart3 className="w-8 h-8" style={{ color: "#60a5fa" }} />
            </div>
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: "hsl(210 40% 98%)" }}
            >
              No products tracked yet
            </h3>
            <p className="text-sm max-w-sm mx-auto" style={{ color: "hsl(215 20% 65%)" }}>
              Paste an Amazon product URL above to start tracking prices,
              get AI insights, and never miss a deal.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {trackedProducts.map((tp) => (
              <ProductCard key={tp.productId} product={tp.product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
