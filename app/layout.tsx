import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SmartCart AI — Shop Smarter with AI",
    template: "%s | SmartCart AI",
  },
  description:
    "Make smarter online shopping decisions with AI-powered price tracking, review analysis, and product comparison. Never overpay again.",
  keywords: [
    "price tracker",
    "Amazon price history",
    "AI shopping assistant",
    "product comparison",
    "deal finder",
    "SmartCart AI",
  ],
  authors: [{ name: "SmartCart AI" }],
  creator: "SmartCart AI",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "SmartCart AI — Shop Smarter with AI",
    description:
      "AI-powered price tracking, review analysis, and product comparison for smarter shopping decisions.",
    siteName: "SmartCart AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartCart AI — Shop Smarter with AI",
    description:
      "AI-powered price tracking, review analysis, and product comparison.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <ThemeProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: {
                  background: "hsl(222 39% 9%)",
                  border: "1px solid hsl(217 32% 17%)",
                  color: "hsl(210 40% 98%)",
                },
              }}
            />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
