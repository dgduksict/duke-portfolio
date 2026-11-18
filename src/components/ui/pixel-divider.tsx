/**
 * The strip between sections: a small skyline standing on a ground line, built from the
 * pixel unit and the theme tokens (see `.px-divider` in pixel.css). Decorative, so it is
 * hidden from assistive tech and from print.
 */
export function PixelDivider() {
  return <div className="px-divider" aria-hidden="true" data-pixel-divider="" data-print="hide" />;
}
