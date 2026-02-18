import type { Metadata } from "next";
import { Lora, Nunito } from "next/font/google";
import "./globals.css";

const serif = Lora({
  variable: "--font-cozy-serif",
  subsets: ["latin"],
});

const sans = Nunito({
  variable: "--font-cozy-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gastos Brasil",
  description: "App privada para seguimiento de gastos de viaje",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${serif.variable} ${sans.variable} antialiased`}>{children}</body>
    </html>
  );
}
