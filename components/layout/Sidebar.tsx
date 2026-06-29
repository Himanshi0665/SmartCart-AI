"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Heart,
  GitCompare,
  Settings,
  Zap,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/wishlist", icon: Heart, label: "Wishlist" },
  { href: "/compare", icon: GitCompare, label: "Compare" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
];

const bottomNavItems = [
  { href: "/admin", icon: ShieldCheck, label: "Admin" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-50"
      style={{
        background: "hsl(222 44% 7%)",
        borderRight: "1px solid hsl(217 32% 13%)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 h-16 flex-shrink-0"
        style={{ borderBottom: "1px solid hsl(217 32% 13%)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #3b82f6, #a855f7)" }}
        >
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span
          className="font-bold text-lg gradient-text"
          style={{ fontFamily: "Outfit, sans-serif" }}
        >
          SmartCart AI
        </span>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p
          className="text-xs font-semibold uppercase tracking-wider px-3 py-2"
          style={{ color: "hsl(215 16% 47%)" }}
        >
          Main
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("sidebar-link", isActive && "active")}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="p-3 space-y-1" style={{ borderTop: "1px solid hsl(217 32% 13%)" }}>
        {bottomNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("sidebar-link", isActive && "active")}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}

        {/* Version tag */}
        <div className="px-3 pt-2">
          <div
            className="text-xs px-2 py-1 rounded-md inline-flex items-center gap-1"
            style={{
              background: "rgba(59,130,246,0.1)",
              color: "#60a5fa",
              border: "1px solid rgba(59,130,246,0.2)",
            }}
          >
            <Zap className="w-3 h-3" />
            v1.0 Beta
          </div>
        </div>
      </div>
    </aside>
  );
}
