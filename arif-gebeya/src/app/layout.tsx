import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: { default: "Arif Gebeya — Ethiopia's Classifieds", template: "%s | Arif Gebeya" },
  description: "Buy and sell anything in Ethiopia and the diaspora. Cars, phones, electronics, fashion, property and more.",
  keywords: ["Ethiopia", "classifieds", "buy sell", "marketplace", "Addis Ababa", "diaspora", "Arif Gebeya"],
  openGraph: { title: "Arif Gebeya", description: "Ethiopia's free classifieds marketplace", type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#16a34a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="layout-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
