import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CHNC Crime Dashboard — Hollywood LAPD Districts",
  description:
    "Explore LAPD-reported incidents across CHNC’s Hollywood districts. Choose a date range, view trends, and download data. Updated from LA City Open Data.",

  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
        sizes: '192x192',
      },
    ],
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: "CHNC Crime Dashboard — Hollywood LAPD Districts",
    description:
      "Explore LAPD-reported incidents across CHNC’s Hollywood districts. Choose a date range, view trends, and download data. Updated from LA City Open Data.",
    images: [
      "https://images.squarespace-cdn.com/content/v1/5d659dacea31cf0001a036b4/f4513343-c2c0-4387-b10d-eb377d813630/chnc_2line_c.png",
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#1e40af',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
