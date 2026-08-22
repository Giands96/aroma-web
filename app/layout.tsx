import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { ViewTransition } from "react";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
   display: "swap" 
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});



const mileast = localFont({
  src: "./fonts/mileast-regular.woff2",
  variable: "--font-mileast",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aroma - Velas y Recuerdos",
  description: "Aroma velas y recuerdos - Velas aromáticas, artesanales y personalizadas para cada ocasión.",
  keywords: ["velas","Aroma", "Aroma velas", "Velas aromáticas", "Velas artesanales", "Velas decorativas", "Velas personalizadas", "Velas de soja", "Velas de cera de abejas", "Velas perfumadas", "Velas para relajación", "Velas para meditación", "Velas para aromaterapia", "Velas para regalos", "Velas para eventos especiales"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${mileast.variable} ${inter.variable} ${dmSans.variable} h-full antialiased `}
    >
      <body className="min-h-full flex flex-col ">
        <ViewTransition default="page-transition">
          {children}
        </ViewTransition>
      </body>
    </html>
  );
}
