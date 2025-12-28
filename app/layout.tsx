import type { Metadata } from "next";
import { Inter, Archivo_Black } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const archivo = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Ferrari Icona Exhibit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW" className="bg-black">
      <body className={`${inter.variable} ${archivo.variable} antialiased bg-black text-white`}>
        {children}
      </body>
    </html>
  );
}