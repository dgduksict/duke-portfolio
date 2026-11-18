import { loaderGateScript } from "@/lib/loader";

const SCRIPT = loaderGateScript();

/**
 * The loader's gate: an inline script the browser runs while it parses the HTML, before anything paints. On a first
 * visit to `/` it marks `<html data-loader="on">`, which CSS reads to put the loading screen up before React has
 * hydrated (so the hero never flashes) and which releases itself if React never takes over (see lib/loader.ts).
 * Render it first in `<body>`. A server component: React never runs the script again on the client.
 */
export function LoaderGate() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
