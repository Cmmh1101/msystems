import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://inmotionwebsolutions.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Montano Systems — Systems architecture for growing businesses",
  description:
    "We design the systems, automation, and AI that let your business run on one system instead of twelve tools that don't talk to each other.",
  openGraph: {
    title: "Montano Systems — Systems architecture for growing businesses",
    description:
      "We design the systems, automation, and AI that let your business run on one system instead of twelve tools that don't talk to each other.",
    url: siteUrl,
    siteName: "Montano Systems",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  );
}
