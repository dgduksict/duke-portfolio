import type { Metadata, Viewport } from "next";
import { Geologica } from "next/font/google";
import type { ReactNode } from "react";
import { Providers } from "@/components/layout/providers";
import { profile } from "@/data/profile";
import "./globals.css";

/** Cyrillic-ext carries Mongolian Ө and Ү, which most display faces lack. */
const geologica = Geologica({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  axes: ["SHRP"],
  display: "swap",
  variable: "--font-geologica",
});

const title = `${profile.name.en} – ${profile.headline.en.replace(/\.$/, "")}`;
const description = profile.intro.en;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: title,
    template: `%s – ${profile.shortName.en}`,
  },
  description,
  applicationName: `${profile.shortName.en} Portfolio`,
  authors: [{ name: profile.name.en, url: profile.socials[0]?.href }],
  keywords: [
    "AI engineer",
    "blockchain developer",
    "backend engineer",
    "NestJS",
    "FastAPI",
    "Next.js",
    "Solidity",
    "Ulaanbaatar",
    "Mongolia",
  ],
  openGraph: {
    type: "website",
    title,
    description,
    siteName: `${profile.name.en} – Portfolio`,
  },
  twitter: { card: "summary", title, description },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1322" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={geologica.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
