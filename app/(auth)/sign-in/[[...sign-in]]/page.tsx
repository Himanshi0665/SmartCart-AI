import { SignIn } from "@clerk/nextjs";
import { Zap } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your SmartCart AI account",
};

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(59,130,246,0.12), transparent 70%), hsl(222 47% 5%)",
      }}
    >
      <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-8">
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
      <SignIn />
    </div>
  );
}
