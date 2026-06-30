"use client";

import { useState } from "react";
import { Sparkles, ThumbsUp, ThumbsDown, Loader2, RefreshCw, Check, X } from "lucide-react";
import { toast } from "sonner";
import type { AiSummary } from "@/types";

interface ReviewSummaryProps {
  productId: string;
  initialSummary: AiSummary | null;
  verdict: number | null;
}

export function ReviewSummary({ productId, initialSummary, verdict }: ReviewSummaryProps) {
  const [summary, setSummary] = useState<AiSummary | null>(initialSummary);
  const [isLoading, setIsLoading] = useState(false);

  const verdictColor =
    verdict !== null
      ? verdict >= 70 ? "#34d399" : verdict >= 45 ? "#f59e0b" : "#f87171"
      : "#60a5fa";

  const verdictLabel =
    verdict !== null
      ? verdict >= 70 ? "Highly Recommended" : verdict >= 45 ? "Decent Option" : "Think Twice"
      : null;

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to generate summary");
      }

      const data: AiSummary = await res.json();
      setSummary(data);
      toast.success("AI analysis complete!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI analysis failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{
        background: "hsl(222 39% 9%)",
        border: "1px solid hsl(217 32% 17%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(168,85,247,0.1)",
              border: "1px solid rgba(168,85,247,0.2)",
            }}
          >
            <Sparkles className="w-4 h-4" style={{ color: "#a78bfa" }} />
          </div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "hsl(210 40% 98%)", fontFamily: "Outfit, sans-serif" }}
          >
            AI Review Analysis
          </h2>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60"
          style={{
            background: summary ? "hsl(222 47% 5%)" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
            border: summary ? "1px solid hsl(217 32% 25%)" : "none",
            color: summary ? "hsl(215 20% 65%)" : "white",
          }}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : summary ? (
            <RefreshCw className="w-3.5 h-3.5" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {isLoading ? "Analyzing..." : summary ? "Re-analyze" : "Analyze with AI"}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center animate-pulse"
            style={{ background: "rgba(168,85,247,0.1)" }}
          >
            <Sparkles className="w-6 h-6" style={{ color: "#a78bfa" }} />
          </div>
          <p className="text-sm" style={{ color: "hsl(215 20% 65%)" }}>
            AI is reading all reviews and generating insights...
          </p>
        </div>
      )}

      {/* Empty state */}
      {!summary && !isLoading && (
        <div
          className="flex flex-col items-center justify-center py-10 rounded-xl space-y-3"
          style={{ background: "hsl(222 47% 5%)" }}
        >
          <Sparkles className="w-8 h-8" style={{ color: "hsl(215 16% 47%)" }} />
          <p className="text-sm text-center" style={{ color: "hsl(215 20% 65%)" }}>
            No AI analysis yet. Click &quot;Analyze with AI&quot; to get pros, cons,
            <br /> and a buy recommendation.
          </p>
        </div>
      )}

      {/* Summary content */}
      {summary && !isLoading && (
        <div className="space-y-5">
          {/* Verdict score */}
          {verdict !== null && (
            <div
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{
                background: `${verdictColor}08`,
                border: `1px solid ${verdictColor}20`,
              }}
            >
              <div
                className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold"
                style={{
                  background: `${verdictColor}15`,
                  border: `2px solid ${verdictColor}`,
                  color: verdictColor,
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                {verdict}
              </div>
              <div>
                <div className="font-semibold" style={{ color: verdictColor }}>
                  {verdictLabel}
                </div>
                {summary.verdict && (
                  <p className="text-sm mt-1 leading-relaxed" style={{ color: "hsl(215 20% 65%)" }}>
                    {summary.verdict}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pros & Cons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pros */}
            {summary.pros && summary.pros.length > 0 && (
              <div
                className="p-4 rounded-xl space-y-2"
                style={{
                  background: "rgba(34,197,94,0.04)",
                  border: "1px solid rgba(34,197,94,0.12)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp className="w-4 h-4" style={{ color: "#4ade80" }} />
                  <span className="text-sm font-semibold" style={{ color: "#4ade80" }}>
                    Pros
                  </span>
                </div>
                {summary.pros.map((pro, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#4ade80" }} />
                    <span className="text-sm" style={{ color: "hsl(215 20% 65%)" }}>
                      {pro}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Cons */}
            {summary.cons && summary.cons.length > 0 && (
              <div
                className="p-4 rounded-xl space-y-2"
                style={{
                  background: "rgba(239,68,68,0.04)",
                  border: "1px solid rgba(239,68,68,0.12)",
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsDown className="w-4 h-4" style={{ color: "#f87171" }} />
                  <span className="text-sm font-semibold" style={{ color: "#f87171" }}>
                    Cons
                  </span>
                </div>
                {summary.cons.map((con, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <X className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#f87171" }} />
                    <span className="text-sm" style={{ color: "hsl(215 20% 65%)" }}>
                      {con}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs" style={{ color: "hsl(215 16% 47%)" }}>
            Powered by GPT-4.1 mini · Based on product features and specifications
          </p>
        </div>
      )}
    </div>
  );
}
