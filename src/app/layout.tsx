import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedCare - Hospital Management System",
  description: "Modern hospital management application built with Next.js 15, TypeScript, Prisma, and MySQL. Manage patients, appointments, medical records, and healthcare staff efficiently.",
  keywords: "hospital management, healthcare software, patient management, medical records, appointment scheduling",
  authors: [{ name: "MedCare Team" }],
  creator: "MedCare",
  publisher: "MedCare",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#0284c7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
