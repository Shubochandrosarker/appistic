import type { Metadata, Viewport } from "next";
import "./globals.css";

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
  themeColor: "#0b0b12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
