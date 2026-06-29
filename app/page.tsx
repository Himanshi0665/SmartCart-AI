import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import {
  Brain,
  TrendingDown,
  Star,
  BarChart3,
  Heart,
  GitCompare,
  Zap,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Check,
} from "lucide-react";

// We'll handle auth conditionally via server component
export default async function LandingPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="min-h-screen" style={{ background: "hsl(222 47% 5%)" }}>
      {/* ── Navigation ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(7, 13, 26, 0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid hsl(217 32% 17%)",
        }}
      >
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #a855f7)" }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="gradient-text" style={{ fontFamily: "Outfit, sans-serif" }}>
            SmartCart AI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "How it Works"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm font-medium transition-colors"
              style={{ color: "hsl(215 20% 65%)" }}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-semibold px-4 py-2 rounded-lg text-white mr-2"
                style={{ background: "linear-gradient(135deg, #3b82f6, #a855f7)" }}
              >
                Dashboard
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
                style={{ color: "hsl(215 20% 65%)" }}
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-semibold px-4 py-2 rounded-lg text-white"
                style={{ background: "linear-gradient(135deg, #3b82f6, #a855f7)" }}
              >
                Get Started Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% -5%, rgba(59,130,246,0.18), transparent 70%), radial-gradient(ellipse 50% 40% at 80% 50%, rgba(168,85,247,0.1), transparent 70%)",
          }}
        />

        {/* Floating orbs */}
        <div
          className="absolute top-32 left-12 w-64 h-64 rounded-full opacity-10 blur-3xl animate-float"
          style={{ background: "linear-gradient(135deg, #3b82f6, #a855f7)" }}
        />
        <div
          className="absolute top-48 right-16 w-48 h-48 rounded-full opacity-10 blur-3xl animate-float"
          style={{ background: "linear-gradient(135deg, #14b8a6, #3b82f6)", animationDelay: "1s" }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in-up"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.25)",
              color: "#60a5fa",
            }}
          >
            <Sparkles className="w-4 h-4" />
            AI-Powered Shopping Intelligence
          </div>

          <h1
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up stagger-1"
            style={{ fontFamily: "Outfit, sans-serif", color: "hsl(210 40% 98%)" }}
          >
            Never Overpay.{" "}
            <br />
            <span className="gradient-text-brand">Never Regret.</span>
          </h1>

          <p
            className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in-up stagger-2"
            style={{ color: "hsl(215 20% 65%)" }}
          >
            SmartCart AI tracks Amazon prices, summarizes thousands of reviews
            with AI, and tells you the perfect time to buy — all in one dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up stagger-3">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #a855f7)",
                  boxShadow: "0 0 40px -8px rgba(59,130,246,0.5)",
                }}
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up"
                  className="group flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg transition-all"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #a855f7)",
                    boxShadow: "0 0 40px -8px rgba(59,130,246,0.5)",
                  }}
                >
                  Start Tracking for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="#features"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg transition-all"
                  style={{
                    background: "hsl(222 39% 9%)",
                    border: "1px solid hsl(217 32% 17%)",
                    color: "hsl(210 40% 98%)",
                  }}
                >
                  See Features
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div
            className="flex flex-wrap items-center justify-center gap-6 text-sm animate-fade-in-up stagger-4"
            style={{ color: "hsl(215 16% 47%)" }}
          >
            {[
              { icon: ShieldCheck, text: "No credit card required" },
              { icon: Zap, text: "Results in seconds" },
              { icon: Star, text: "AI-powered insights" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: "#60a5fa" }} />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Hero mockup */}
        <div className="relative max-w-4xl mx-auto mt-16 animate-fade-in-up stagger-5">
          <div
            className="rounded-2xl p-6 overflow-hidden"
            style={{
              background: "hsl(222 39% 9%)",
              border: "1px solid hsl(217 32% 17%)",
              boxShadow: "0 40px 80px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.05)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
              <div className="w-3 h-3 rounded-full" style={{ background: "#22c55e" }} />
              <div
                className="ml-4 flex-1 rounded-md px-3 py-1 text-xs"
                style={{ background: "hsl(222 47% 5%)", color: "hsl(215 16% 47%)" }}
              >
                amazon.in/dp/B0CHX1W1XY
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2 rounded-xl p-4" style={{ background: "hsl(222 47% 5%)" }}>
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg flex-shrink-0 skeleton" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-3/4" />
                    <div className="skeleton h-3 w-1/2" />
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-2xl font-bold" style={{ color: "#60a5fa" }}>₹45,990</span>
                      <span className="text-sm line-through" style={{ color: "hsl(215 16% 47%)" }}>₹54,999</span>
                      <span className="price-badge">↓ 16% off</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="rounded-xl p-4 flex flex-col justify-between"
                style={{
                  background: "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(20,184,166,0.05))",
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <div className="text-xs font-medium mb-2" style={{ color: "hsl(215 20% 65%)" }}>AI Verdict</div>
                <div className="text-4xl font-bold" style={{ color: "#22c55e" }}>82</div>
                <div className="text-sm font-semibold" style={{ color: "#4ade80" }}>Highly Recommended</div>
                <div className="mt-2 space-y-1">
                  {["Great battery life", "Excellent display", "Near all-time low"].map((pro) => (
                    <div key={pro} className="flex items-center gap-1.5 text-xs" style={{ color: "hsl(215 20% 65%)" }}>
                      <Check className="w-3 h-3" style={{ color: "#22c55e" }} />
                      {pro}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ fontFamily: "Outfit, sans-serif", color: "hsl(210 40% 98%)" }}
            >
              Everything you need to{" "}
              <span className="gradient-text">shop smarter</span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto" style={{ color: "hsl(215 20% 65%)" }}>
              Stop guessing. Start knowing. Our AI does the heavy lifting so you
              can make confident decisions instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="card card-glow p-6 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0, animationFillMode: "forwards" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{
                    background: `${feature.color}15`,
                    border: `1px solid ${feature.color}30`,
                  }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "hsl(210 40% 98%)" }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "hsl(215 20% 65%)" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: "Outfit, sans-serif", color: "hsl(210 40% 98%)" }}
          >
            3 steps to smarter shopping
          </h2>
          <p className="text-lg mb-16" style={{ color: "hsl(215 20% 65%)" }}>
            From product URL to AI-powered insights in seconds.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                {i < 2 && (
                  <div
                    className="hidden md:block absolute top-8 left-full w-full h-px -translate-x-4"
                    style={{ background: "linear-gradient(90deg, hsl(217 32% 25%), transparent)" }}
                  />
                )}
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.1))",
                    border: "1px solid rgba(59,130,246,0.25)",
                    color: "#60a5fa",
                    fontFamily: "Outfit, sans-serif",
                  }}
                >
                  {i + 1}
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "hsl(210 40% 98%)" }}>
                  {step.title}
                </h3>
                <p className="text-sm" style={{ color: "hsl(215 20% 65%)" }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="rounded-2xl p-12 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(168,85,247,0.08))",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.15), transparent 70%)" }}
            />
            <div className="relative">
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ fontFamily: "Outfit, sans-serif", color: "hsl(210 40% 98%)" }}
              >
                Ready to shop smarter?
              </h2>
              <p className="text-lg mb-8" style={{ color: "hsl(215 20% 65%)" }}>
                Join thousands of shoppers saving money with AI-powered insights.
              </p>
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg"
                  style={{ background: "linear-gradient(135deg, #3b82f6, #a855f7)" }}
                >
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold text-lg"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #a855f7)",
                    boxShadow: "0 0 40px -8px rgba(59,130,246,0.5)",
                  }}
                >
                  Get Started — It&apos;s Free <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="py-8 px-6 text-center text-sm"
        style={{ borderTop: "1px solid hsl(217 32% 17%)", color: "hsl(215 16% 47%)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <div
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #a855f7)" }}
          >
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-semibold gradient-text" style={{ fontFamily: "Outfit, sans-serif" }}>
            SmartCart AI
          </span>
        </div>
        <p>© 2026 SmartCart AI. Built with Next.js 15, OpenAI & Playwright.</p>
      </footer>
    </div>
  );
}

const features = [
  { icon: TrendingDown, title: "Price History Tracking", color: "#60a5fa", description: "See exactly how prices have moved over time. Know if today's deal is genuinely the lowest it's ever been." },
  { icon: Brain, title: "AI Review Summarizer", color: "#a78bfa", description: "Our AI reads thousands of reviews and gives you a clean summary of pros, cons, and what buyers actually say." },
  { icon: Star, title: "Buy Verdict Score", color: "#f59e0b", description: "Get an AI-generated 0–100 verdict score on every product with plain-English reasoning you can trust." },
  { icon: Heart, title: "Smart Wishlist", color: "#f472b6", description: "Save products you love, set your target price, and get notified the moment the price drops to your budget." },
  { icon: GitCompare, title: "Product Comparison", color: "#34d399", description: "Compare up to 3 products side-by-side with AI-extracted specs. See clear winner highlights at a glance." },
  { icon: BarChart3, title: "AI Shopping Assistant", color: "#fb923c", description: "Ask natural language questions about any product. Get grounded, factual answers based on real product data." },
];

const steps = [
  { title: "Paste a URL", description: "Copy any Amazon product link and paste it into SmartCart AI. We support amazon.in and amazon.com." },
  { title: "AI Analyzes It", description: "Our AI scrapes the product, reads all the reviews, and generates a complete intelligence report in seconds." },
  { title: "Shop Confidently", description: "Get price history, a buy verdict, review summary, and comparison tools — everything to make the right call." },
];
