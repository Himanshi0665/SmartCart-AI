"use client";

import { useState } from "react";
import { Heart, Bell, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  initialWishlisted: boolean;
  initialTargetPrice: number | null;
  currentPrice: number;
  currency: string;
}

export function WishlistButton({
  productId,
  initialWishlisted,
  initialTargetPrice,
  currentPrice,
  currency,
}: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [targetPrice, setTargetPrice] = useState(
    initialTargetPrice?.toString() ?? ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPriceInput, setShowPriceInput] = useState(initialWishlisted);

  const handleToggleWishlist = async () => {
    if (wishlisted) {
      // Remove from wishlist — find item and delete
      setIsLoading(true);
      try {
        const listRes = await fetch("/api/wishlist");
        const items = await listRes.json();
        const item = items.find(
          (i: { productId: string; id: number }) => i.productId === productId
        );
        if (item) {
          await fetch(`/api/wishlist/${item.id}`, { method: "DELETE" });
        }
        setWishlisted(false);
        setShowPriceInput(false);
        setTargetPrice("");
        toast.success("Removed from wishlist");
      } catch {
        toast.error("Failed to remove from wishlist");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Add to wishlist
      setIsLoading(true);
      try {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId,
            targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
          }),
        });
        if (!res.ok) throw new Error();
        setWishlisted(true);
        setShowPriceInput(true);
        toast.success("Added to wishlist!");
      } catch {
        toast.error("Failed to add to wishlist");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{
        background: "hsl(222 39% 9%)",
        border: `1px solid ${wishlisted ? "rgba(244,63,94,0.25)" : "hsl(217 32% 17%)"}`,
        transition: "border-color 0.3s ease",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={handleToggleWishlist}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
        style={
          wishlisted
            ? {
                background: "rgba(244,63,94,0.12)",
                border: "1px solid rgba(244,63,94,0.25)",
                color: "#fb7185",
              }
            : {
                background: "hsl(222 47% 5%)",
                border: "1px solid hsl(217 32% 25%)",
                color: "hsl(215 20% 65%)",
              }
        }
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart
            className="w-4 h-4"
            style={{
              fill: wishlisted ? "#fb7185" : "transparent",
              color: wishlisted ? "#fb7185" : "currentColor",
              transition: "all 0.2s",
            }}
          />
        )}
        {wishlisted ? "In Wishlist" : "Add to Wishlist"}
      </button>

      {/* Target price section */}
      {showPriceInput && wishlisted && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
            <span className="text-xs font-medium" style={{ color: "hsl(215 20% 65%)" }}>
              Alert me when price drops to:
            </span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: "hsl(215 16% 47%)" }}
              >
                ₹
              </span>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder={Math.round(currentPrice * 0.9).toString()}
                className="w-full pl-7 pr-3 py-2 rounded-lg text-sm outline-none"
                style={{
                  background: "hsl(222 47% 5%)",
                  border: "1px solid hsl(217 32% 25%)",
                  color: "hsl(210 40% 98%)",
                }}
              />
            </div>
            <button
              onClick={async () => {
                const price = targetPrice ? parseFloat(targetPrice) : null;
                const listRes = await fetch("/api/wishlist");
                const items = await listRes.json();
                const item = items.find(
                  (i: { productId: string; id: number }) => i.productId === productId
                );
                if (item) {
                  await fetch(`/api/wishlist/${item.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ targetPrice: price }),
                  });
                  toast.success(
                    price
                      ? `Alert set for ${formatPrice(price, currency)}`
                      : "Alert cleared"
                  );
                }
              }}
              className="px-3 py-2 rounded-lg text-xs font-semibold"
              style={{
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
                color: "#f59e0b",
              }}
            >
              Set
            </button>
          </div>
          <p className="text-xs" style={{ color: "hsl(215 16% 47%)" }}>
            Current: {formatPrice(currentPrice, currency)}
          </p>
        </div>
      )}
    </div>
  );
}
