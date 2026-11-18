import { rulerGateScript } from "@/lib/ruler-gate";

const SCRIPT = rulerGateScript();

/**
 * The ruler's gate: an inline script the browser runs while it parses the HTML, before the first paint. On a wide,
 * fine-pointer visit to `/` it sets `<html data-ruler="on">`, which hides the native scrollbar (ruler.css), so the
 * page does not shift sideways when the Ruler mounts and draws its own. If the Ruler never takes over, the script gives
 * the scrollbar back by itself after a few seconds (see lib/ruler-gate.ts). A server component: React never runs the
 * script again on the client. Render it beside the LoaderGate in `<body>`.
 */
export function RulerGate() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
