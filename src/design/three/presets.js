/**
 * 3D presets — the motion half of the per-category design tool.
 *
 * Each preset is a scene configuration (palette, geometry, lighting, motion)
 * plus the vendored MotionSites prompt it was derived from. `scaffold.js` turns
 * a preset into React Three Fiber code; the prompt ships alongside it as
 * `PROMPT.md` so the same design can be handed to Lovable, Cursor or Claude for
 * variations the scaffold does not cover.
 *
 * Presets are referenced by `brief.three` in categories.js. The `prompt` field
 * names a file in vendor/motionsites-prompts/prompts/ — see the NOTICE there
 * for provenance before relying on it.
 */

export const THREE_PRESETS = {
  /** Food and events: slow, warm, shallow depth of field. */
  'cinematic-plate': {
    label: 'קולנועי חם',
    prompt: 'Basilico_Restaurant.md',
    bg: '#120c08', fog: [8, 28],
    primary: '#b45309', secondary: '#f59e0b',
    geometry: 'torus', metalness: 0.35, roughness: 0.45,
    rotationSpeed: 0.12, floatAmplitude: 0.25, particleCount: 900,
  },
  /** Cafes and bakeries: grainy, soft, unhurried. */
  'warm-grain': {
    label: 'גרעיני רך',
    prompt: 'Naturally.md',
    bg: '#1a1410', fog: [7, 26],
    primary: '#92400e', secondary: '#d9a066',
    geometry: 'sphere', metalness: 0.15, roughness: 0.8,
    rotationSpeed: 0.08, floatAmplitude: 0.3, particleCount: 1200,
  },
  /** Barbers and garages: hard edges, high contrast, metal. */
  'sharp-edge': {
    label: 'חד ומתכתי',
    prompt: 'Car_Shine.md',
    bg: '#08090c', fog: [6, 24],
    primary: '#e2e8f0', secondary: '#64748b',
    geometry: 'box', metalness: 0.95, roughness: 0.08,
    rotationSpeed: 0.2, floatAmplitude: 0.15, particleCount: 600,
  },
  /** Beauty, spa, jewellery: liquid, glossy, unhurried. */
  'silk-flow': {
    label: 'משי נוזלי',
    prompt: 'luxury_watch.md',
    bg: '#0d0a0c', fog: [9, 30],
    primary: '#d4a017', secondary: '#db2777',
    geometry: 'torusKnot', metalness: 0.9, roughness: 0.12,
    rotationSpeed: 0.06, floatAmplitude: 0.35, particleCount: 1500,
  },
  /** Dental and medical: clean, cool, calm - no aggressive motion. */
  'clinical-depth': {
    label: 'קליני נקי',
    prompt: 'Calm_Hero.md',
    bg: '#06121c', fog: [10, 32],
    primary: '#38bdf8', secondary: '#e0f2fe',
    geometry: 'icosahedron', metalness: 0.4, roughness: 0.35,
    rotationSpeed: 0.05, floatAmplitude: 0.18, particleCount: 800,
  },
  /** Gyms and driving schools: fast, energetic, grid-driven. */
  'kinetic-grid': {
    label: 'קינטי אנרגטי',
    prompt: 'Interactive_3D_Hero.md',
    bg: '#030308', fog: [8, 30],
    primary: '#22c55e', secondary: '#3b82f6',
    geometry: 'octahedron', metalness: 0.7, roughness: 0.2,
    rotationSpeed: 0.3, floatAmplitude: 0.4, particleCount: 2000,
  },
  /** Legal, accounting, insurance: still, weighted, sober. */
  'weighted-still': {
    label: 'מכובד ויציב',
    prompt: 'Northline.md',
    bg: '#0c0b0a', fog: [12, 34],
    primary: '#d4a017', secondary: '#a8a29e',
    geometry: 'box', metalness: 0.6, roughness: 0.3,
    rotationSpeed: 0.03, floatAmplitude: 0.1, particleCount: 500,
  },
  /** Vets, florists, pet shops: friendly, round, buoyant. */
  'soft-orbit': {
    label: 'רך ומזמין',
    prompt: 'Green_Hero.md',
    bg: '#08130f', fog: [8, 28],
    primary: '#14b8a6', secondary: '#a3e635',
    geometry: 'sphere', metalness: 0.25, roughness: 0.55,
    rotationSpeed: 0.1, floatAmplitude: 0.32, particleCount: 1100,
  },
  /** Photographers: depth and parallax rather than a hero object. */
  'frame-parallax': {
    label: 'פרלקס ממוסגר',
    prompt: 'My_portfolio.md',
    bg: '#0a0a0a', fog: [7, 26],
    primary: '#e5e7eb', secondary: '#9ca3af',
    geometry: 'plane', metalness: 0.1, roughness: 0.9,
    rotationSpeed: 0.04, floatAmplitude: 0.22, particleCount: 1400,
  },
};

export const getPreset = key => THREE_PRESETS[key] || THREE_PRESETS['soft-orbit'];
