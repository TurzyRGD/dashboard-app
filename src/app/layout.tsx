'use client';

import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useStore } from "@/store/useStore";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initFromServer = useStore((state) => state.initFromServer);
  const logo = useStore((state) => state.logo); // Pobieramy logo ze stanu globalnego

  // Ładowanie początkowych danych z naszej lokalnej "bazy"
  useEffect(() => {
    fetch('/api/db')
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          initFromServer(data);
        }
      })
      .catch((err) => console.error("Błąd ładowania danych:", err));
  }, [initFromServer]);

  // Dynamiczna zmiana Favicony w przeglądarce
  useEffect(() => {
    if (logo) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = logo;
    }
  }, [logo]);

  return (
    <html lang="pl">
      <head>
        <title>Dashboard Usług</title>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}