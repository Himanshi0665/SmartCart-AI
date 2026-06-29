"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Zap, Bell, Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header
      className="fixed top-0 left-64 right-0 z-40 flex items-center justify-between px-6 h-16"
      style={{
        background: "hsl(222 44% 7%)",
        borderBottom: "1px solid hsl(217 32% 13%)",
      }}
    >
      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <div
          className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm"
          style={{
            background: "hsl(222 47% 5%)",
            border: "1px solid hsl(217 32% 17%)",
          }}
        >
          <Search className="w-4 h-4" style={{ color: "hsl(215 16% 47%)" }} />
          <span style={{ color: "hsl(215 16% 47%)" }}>
            Paste an Amazon URL to analyze...
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4 ml-4">
        <ThemeToggle />
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: "hsl(222 47% 5%)",
            border: "1px solid hsl(217 32% 17%)",
            color: "hsl(215 20% 65%)",
          }}
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
            },
          }}
        />
      </div>
    </header>
  );
}
