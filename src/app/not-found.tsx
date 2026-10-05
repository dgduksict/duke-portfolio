import { NotFoundCopy } from "@/components/layout/not-found-copy";
import { Sky } from "@/components/sky/sky";

export const metadata = {
  title: "Page not found",
};

/** Half past midnight in Ulaanbaatar: a lost page gets the night sky. */
const MIDNIGHT = new Date("2026-01-01T16:30:00Z");

export default function NotFound() {
  return (
    <main id="main">
      <Sky now={MIDNIGHT} />
      <NotFoundCopy />
    </main>
  );
}
