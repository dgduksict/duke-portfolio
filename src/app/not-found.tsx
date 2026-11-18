import { CatArt } from "@/components/cat/cat-art";
import { NotFoundCopy } from "@/components/layout/not-found-copy";
import { WindowScene } from "@/components/scene/window-scene";

export const metadata = {
  title: "Page not found",
};

/** Half past midnight in Ulaanbaatar: a lost page gets the night window, with the cat asleep on the sill. */
const MIDNIGHT = new Date("2026-01-01T16:30:00Z");

export default function NotFound() {
  return (
    <main id="main">
      {/* The compact scene has no header strip of its own: leave room for the fixed header. */}
      <div className="pt-20 sm:pt-24">
        <WindowScene now={MIDNIGHT} compact>
          <CatArt variant="hero" state="night" className="size-full" />
        </WindowScene>
      </div>
      <NotFoundCopy />
    </main>
  );
}
