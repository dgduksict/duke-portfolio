import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { ReactNode } from "react";
import { Providers } from "@/components/layout/providers";
import { profile } from "@/data/profile";
import "./globals.css";

const title = `${profile.name.en} — ${profile.role.en}`;
const description = profile.tagline.en;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: title,
    template: `%s — ${profile.shortName.en}`,
  },
  description,
  applicationName: `${profile.shortName.en} Portfolio`,
  authors: [{ name: profile.name.en, url: profile.socials[0]?.href }],
  keywords: [
    "AI engineer",
    "blockchain developer",
    "backend engineer",
    "Next.js",
    "Solidity",
    "Ulaanbaatar",
  ],
  openGraph: {
    type: "website",
    title,
    description,
    siteName: `${profile.name.en} — Portfolio`,
  },
  twitter: { card: "summary_large_image", title, description },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8f9" },
    { media: "(prefers-color-scheme: dark)", color: "#111417" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
