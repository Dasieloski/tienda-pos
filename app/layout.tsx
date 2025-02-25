import type { Metadata } from "next";
import { Inter, Outfit } from 'next/font/google';
import "./globals.css";
import React from 'react'
import { CartProvider } from '@/contexts/CartContext'
import { cn } from "@/lib/utils"

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Variedades el Friñón",
  description: "Tienda especializada en piezas y accesorios para motos en La Habana, Cuba",
  icons: {
    icon: "/icons/moto-icon.svg",
    apple: "/icons/moto-icon.svg"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          outfit.variable,
          inter.variable
        )}
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
