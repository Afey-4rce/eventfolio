import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { ToastStack } from "@/components/toast-stack";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eventfolio.app"),
  title: "EventFolio — Generate event pages & portfolios in minutes",
  description:
    "EventFolio is the AI-native builder for events and portfolios. Describe your event or work — get a launch-ready, design-forward page in minutes.",
  keywords: [
    "EventFolio",
    "event landing page",
    "portfolio builder",
    "AI website builder",
    "design portfolio",
    "event marketing",
  ],
  authors: [{ name: "EventFolio" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "EventFolio",
    description: "Generate event pages & portfolios in minutes — AI-native, design-forward.",
    siteName: "EventFolio",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EventFolio",
    description: "Generate event pages & portfolios in minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <Providers>
          {children}
          <Toaster />
          <ToastStack />
        </Providers>
      </body>
    </html>
  );
}
