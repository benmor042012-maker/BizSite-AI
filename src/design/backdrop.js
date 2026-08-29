/**
 * Backdrops rendered without an image.
 *
 * The old builder painted a flat two-stop CSS gradient across the hero when
 * Google returned no photos, which is what makes an authority-type page - a
 * dental clinic, a law office, an insurance agency - look empty. Real sites in
 * these trades use a mesh: a few blurred blobs on a dark ground, sometimes
 * with a subtle grid or noise. This is that, generated deterministically from
 * the brief so no picture is invented.
 *
 * Returns a CSS `background:` value the hero drops in directly.
 */

const hexToRgb = h => {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

/** Blend two hex colours by t in [0..1]. */
function mix(hexA, hexB, t) {
  const [ar, ag, ab] = hexToRgb(hexA);
  const [br, bg, bb] = hexToRgb(hexB);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const b = Math.round(ab + (bb - ab) * t);
  return `rgb(${r} ${g} ${b})`;
}

/** rgba string with a given alpha, from a hex colour. */
const rgba = (hex, a) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
};

/**
 * A stack of radial blurs, layered over the theme's dark ground so nothing
 * bleeds white through the accent colour.
 */
export function meshBackdrop({ accent, ground = '#0b0d12', tone = '#151a24' }) {
  const layers = [
    `radial-gradient(60% 55% at 82% 18%, ${rgba(accent, 0.55)} 0%, transparent 60%)`,
    `radial-gradient(45% 45% at 18% 78%, ${rgba(accent, 0.35)} 0%, transparent 65%)`,
    `radial-gradient(30% 30% at 55% 55%, ${rgba(tone, 0.9)} 0%, transparent 75%)`,
    `linear-gradient(135deg, ${ground} 0%, ${mix(ground, accent, 0.08)} 100%)`,
  ];
  return layers.join(', ');
}

/**
 * A softer variant for section bands: same mesh idea, low-contrast so text on
 * top stays legible.
 */
export function subtleBackdrop({ accent, ground }) {
  return [
    `radial-gradient(70% 60% at 100% 0%, ${rgba(accent, 0.18)} 0%, transparent 55%)`,
    `radial-gradient(50% 50% at 0% 100%, ${rgba(accent, 0.12)} 0%, transparent 60%)`,
    ground || `linear-gradient(180deg, transparent, ${rgba(accent, 0.04)})`,
  ].join(', ');
}
