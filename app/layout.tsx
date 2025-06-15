import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import React from "react";
import Image from "next/image";

const poppins = Poppins({
  variable: "--font-poppins",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nuansa 2025: The Crying Stone",
  description: "Buy the tickets now!",
  icons: {
    icon: "/nuansa-icon.ico",
    shortcut: "/nuansa-icon.ico",
    apple: "/nuansa-icon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} tracking-wide antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
