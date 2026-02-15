import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CreditPro Tunisie - Demande de crédit en ligne",
  description: "Plateforme de demande de crédit pour la Tunisie. Simulateur en TND, suivi de dossier en temps réel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
