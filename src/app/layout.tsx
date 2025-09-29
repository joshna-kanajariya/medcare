import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
