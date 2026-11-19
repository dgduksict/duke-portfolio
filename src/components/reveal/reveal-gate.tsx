import { revealGateScript } from "@/lib/reveal";

const SCRIPT = revealGateScript();

/**
 * The reveal's gate: an inline script the browser runs while it parses the HTML, before the first paint. When the
 * browser can observe and the visitor has not asked for reduced motion it sets `<html data-reveal="on">`, which lets
 * reveal.css hold the blocks below the hero back until they come into view, so they never flash in and then vanish.
 * If the client never takes over, the script lets every block show by itself after a few seconds (see lib/reveal.ts).
 * A server component: React never runs the script again on the client. Render it beside the other gates in `<body>`.
 */
export function RevealGate() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
