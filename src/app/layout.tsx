import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Horas acumuladas | Escuela Manuela Santa María",
    template: "%s | Horas acumuladas",
  },
  description:
    "Sistema para gestionar solicitudes de rebajo de horas acumuladas en una escuela costarricense.",
  icons: {
    icon: "/school-brand.jpg",
    shortcut: "/school-brand.jpg",
    apple: "/school-brand.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
