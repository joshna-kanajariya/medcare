import type { Metadata } from "next";
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
  title: {
    default: "MedCare Hospital Platform",
    template: "%s | MedCare",
  },
  description:
    "Modern hospital management application built with Next.js 15, TypeScript, Prisma, and MySQL.",
  keywords: [
    "hospital management",
    "healthcare software",
    "patient management",
    "medical records",
    "appointment scheduling",
  ],
  manifest: "/site.webmanifest",
  applicationName: "MedCare",
  authors: [{ name: "MedCare Team" }],
  creator: "MedCare",
  publisher: "MedCare",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
  themeColor: "#0ea5e9",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background text-foreground">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
