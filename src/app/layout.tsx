import type { Metadata } from "next";
import { DM_Sans, Sora, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Slide Generator",
  description: "Generate interactive HTML teaching slide decks from uploads or topics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${sora.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <div id="app-root">
          <Header />
          <main className="max-w-6xl mx-auto px-6 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
