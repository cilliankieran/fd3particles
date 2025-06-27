import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Logo Particles - Test system using Three.js and React Three Fiber",
  description: "Interactive logo particle system built with Three.js and React Three Fiber",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://ethyca.fides-cdn.ethyca.com/fides.js?property_id=FDS-KSB4MF"
          strategy="beforeInteractive"
        />
        <Script id="fides-gtm" strategy="afterInteractive">
          {`Fides.gtm()`}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} antialiased h-screen overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
