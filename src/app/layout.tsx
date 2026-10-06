import type { Metadata, Viewport } from "next";
import { Nunito_Sans } from "next/font/google";
import "./globals.css";

const nunito = Nunito_Sans({ subsets: ["latin"], weight: ["400", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "Appistic — Digital Business Card with Dynamic QR",
  description:
    "Build your digital business card in minutes. Dynamic QR code that never goes out of date. Share your business, products and socials. Capture leads from every scan.",
  metadataBase: new URL(process.env.PUBLIC_BASE_URL || "https://appistic.com"),
  openGraph: {
    title: "Appistic — Digital Business Card with Dynamic QR",
    description: "One smart link for your business: card, products, socials, leads.",
    url: "https://appistic.com",
    siteName: "Appistic",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${nunito.className} min-h-screen antialiased`}>{children}</body>
    </html>
  );
}
