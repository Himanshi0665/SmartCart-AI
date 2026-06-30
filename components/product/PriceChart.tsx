"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingDown, TrendingUp, Minus, BarChart3 } from "lucide-react";

interface PricePoint {
  price: number;
  recordedAt: string;
}

interface PriceChartProps {
  data: PricePoint[];
  allTimeLow: number;
  allTimeHigh: number;
  avgPrice: number;
  currency: string;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

// Custom tooltip
const CustomTooltip = ({
  active,
  payload,
  label,
  currency,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  currency: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl"
      style={{
        background: "hsl(222 39% 9%)",
        border: "1px solid hsl(217 32% 25%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <p className="text-xs mb-1" style={{ color: "hsl(215 16% 47%)" }}>
        {label}
      </p>
      <p
        className="text-lg font-bold"
        style={{ color: "#60a5fa", fontFamily: "Outfit, sans-serif" }}
      >
        {formatCurrency(payload[0].value, currency)}
      </p>
    </div>
  );
};

export function PriceChart({
  data,
  allTimeLow,
  allTimeHigh,
  avgPrice,
  currency,
}: PriceChartProps) {
  if (data.length < 2) {
    return (
      <div
        className="rounded-2xl p-6 flex flex-col items-center justify-center h-48"
        style={{
          background: "hsl(222 39% 9%)",
          border: "1px solid hsl(217 32% 17%)",
        }}
      >
        <BarChart3 className="w-8 h-8 mb-2" style={{ color: "hsl(215 16% 47%)" }} />
        <p className="text-sm" style={{ color: "hsl(215 16% 47%)" }}>
          Not enough data yet — check back after the first price update
        </p>
      </div>
    );
  }

  const chartData = data.map((point) => ({
    date: formatDate(point.recordedAt),
    price: point.price,
    fullDate: point.recordedAt,
  }));

  // Price trend
  const first = data[0].price;
  const last = data[data.length - 1].price;
  const trendPercent = Math.abs(Math.round(((last - first) / first) * 100));
  const isDown = last < first;
  const isFlat = trendPercent === 0;

  const yMin = Math.floor((allTimeLow * 0.97) / 100) * 100;
  const yMax = Math.ceil((allTimeHigh * 1.03) / 100) * 100;

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
        <h2
          className="text-lg font-semibold"
          style={{ color: "hsl(210 40% 98%)", fontFamily: "Outfit, sans-serif" }}
        >
          Price History
        </h2>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
          style={
            isFlat
              ? {
                  background: "rgba(100,116,139,0.1)",
                  border: "1px solid rgba(100,116,139,0.2)",
                  color: "hsl(215 20% 65%)",
                }
              : isDown
              ? {
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.2)",
                  color: "#4ade80",
                }
              : {
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                }
          }
        >
          {isFlat ? (
            <Minus className="w-3.5 h-3.5" />
          ) : isDown ? (
            <TrendingDown className="w-3.5 h-3.5" />
          ) : (
            <TrendingUp className="w-3.5 h-3.5" />
          )}
          {isFlat ? "Stable" : `${isDown ? "↓" : "↑"} ${trendPercent}% overall`}
        </div>
      </div>

      {/* Chart */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(217 32% 17%)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(215 16% 47%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[yMin, yMax]}
              tick={{ fill: "hsl(215 16% 47%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                new Intl.NumberFormat("en-IN", {
                  notation: "compact",
                  maximumFractionDigits: 0,
                }).format(v)
              }
              width={60}
            />
            <Tooltip
              content={<CustomTooltip currency={currency} />}
              cursor={{ stroke: "hsl(217 32% 25%)", strokeWidth: 1 }}
            />
            {/* Average price reference line */}
            <ReferenceLine
              y={avgPrice}
              stroke="hsl(215 16% 47%)"
              strokeDasharray="4 4"
              label={{
                value: "Avg",
                fill: "hsl(215 16% 47%)",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
            {/* All-time low reference line */}
            <ReferenceLine
              y={allTimeLow}
              stroke="#34d399"
              strokeDasharray="4 4"
              label={{
                value: "Low",
                fill: "#34d399",
                fontSize: 10,
                position: "insideBottomRight",
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#priceGradient)"
              dot={data.length < 15 ? { fill: "#3b82f6", r: 3, strokeWidth: 0 } : false}
              activeDot={{ fill: "#60a5fa", r: 5, strokeWidth: 2, stroke: "#1d4ed8" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Stats row */}
      <div
        className="grid grid-cols-3 gap-3 pt-4"
        style={{ borderTop: "1px solid hsl(217 32% 17%)" }}
      >
        {[
          { label: "All-Time Low", value: allTimeLow, color: "#34d399" },
          { label: "Average", value: avgPrice, color: "#60a5fa" },
          { label: "All-Time High", value: allTimeHigh, color: "#f87171" },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <div className="text-xs mb-1" style={{ color: "hsl(215 16% 47%)" }}>
              {label}
            </div>
            <div
              className="text-sm font-bold"
              style={{ color, fontFamily: "Outfit, sans-serif" }}
            >
              {formatCurrency(value, currency)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
