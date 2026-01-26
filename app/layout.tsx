import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreditPro - Intelligent Credit Application Scoring Platform",
  description: "Smart credit application management and scoring system",
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
