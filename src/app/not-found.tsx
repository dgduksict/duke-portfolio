import Link from "next/link";
import { Aurora } from "@/components/visual/aurora";

export const metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <>
      <Aurora />
      <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-sm tracking-[0.2em] text-muted-foreground uppercase">
          404
        </p>
        <h1 className="text-balance-tight mt-4 text-4xl font-semibold sm:text-5xl">
          This page never shipped
        </h1>
        <p className="mt-4 max-w-md text-pretty text-muted-foreground">
          The link you followed does not point at anything here. Everything lives on the one page.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        >
          Back to the portfolio
        </Link>
      </main>
    </>
  );
}
