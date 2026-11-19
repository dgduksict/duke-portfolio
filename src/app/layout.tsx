import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Providers } from "@/components/layout/providers";
import { LoaderGate } from "@/components/loader/loader-gate";
import { LoadingScreen } from "@/components/loader/loading-screen";
import { RevealGate } from "@/components/reveal/reveal-gate";
import { Ruler } from "@/components/ruler/ruler";
import { RulerGate } from "@/components/ruler/ruler-gate";
import { profile } from "@/data/profile";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

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
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7ecd3" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1631" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={fontVariables}>
      <body>
        <LoaderGate />
        <RulerGate />
        <RevealGate />
        <Providers>
          <LoadingScreen />
          {children}
          <Ruler />
        </Providers>
      </body>
    </html>
  );
}
