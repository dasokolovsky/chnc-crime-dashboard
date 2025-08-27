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
    icon: "https://images.squarespace-cdn.com/content/v1/5d659dacea31cf0001a036b4/1605818683199-G7V1ULX6IKMNG1SKZQDF/chnc.png",
  },
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
