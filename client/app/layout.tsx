import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Raleway } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import Script from "next/script";

const raleway = Raleway({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PlusOnne - Elevate Your Celebrations",
  description: "Discover curated categories, premium packages, and verified hosts across India.",
};

import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, outfit.variable, "font-sans", raleway.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <React.Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-[#07090E]"><div className="w-8 h-8 border-4 border-[#0098FF] border-t-transparent rounded-full animate-spin"></div></div>}>
            <AuthProvider>{children}</AuthProvider>
          </React.Suspense>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
