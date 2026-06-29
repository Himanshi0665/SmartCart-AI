"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { isValidAmazonUrl } from "@/lib/utils";

export function ProductUrlInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      toast.error("Please enter an Amazon product URL");
      return;
    }
    if (!isValidAmazonUrl(trimmed)) {
      toast.error("Please enter a valid Amazon product URL (amazon.in or amazon.com)");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze product");
      }

      toast.success("Product analyzed successfully!");
      router.push(`/product/${data.id}`);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAnalyze();
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "hsl(222 39% 9%)",
        border: "1px solid hsl(217 32% 17%)",
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.15))",
            border: "1px solid rgba(59,130,246,0.3)",
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: "#60a5fa" }} />
        </div>
        <div>
          <h2
            className="text-base font-semibold"
            style={{ color: "hsl(210 40% 98%)" }}
          >
            Analyze a Product
          </h2>
          <p className="text-xs" style={{ color: "hsl(215 16% 47%)" }}>
            Paste an Amazon URL to get AI insights, price history & more
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "hsl(215 16% 47%)" }}
          />
          <input
            id="product-url-input"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://www.amazon.in/dp/B0CHX1W1XY"
            disabled={loading}
            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "hsl(222 47% 5%)",
              border: "1px solid hsl(217 32% 25%)",
              color: "hsl(210 40% 98%)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(59,130,246,0.5)";
              e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "hsl(217 32% 25%)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
        <button
          id="analyze-button"
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #3b82f6, #a855f7)",
            minWidth: "130px",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze
            </>
          )}
        </button>
      </div>

      {/* Example URLs */}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs" style={{ color: "hsl(215 16% 47%)" }}>
          Try:
        </span>
        {[
          { label: "Laptop", url: "https://www.amazon.in/dp/B0CHX1W1XY" },
          { label: "Headphones", url: "https://www.amazon.in/dp/B0BPPXX1DG" },
        ].map((example) => (
          <button
            key={example.label}
            onClick={() => setUrl(example.url)}
            className="text-xs px-2 py-1 rounded-md transition-colors"
            style={{
              background: "hsl(222 47% 5%)",
              border: "1px solid hsl(217 32% 17%)",
              color: "#60a5fa",
            }}
          >
            {example.label}
          </button>
        ))}
      </div>
    </div>
  );
}
