/**
 * HTML escaping for every value interpolated into a generated page.
 *
 * Business names, addresses and review text all come from Google, and CRM
 * records come from a user-supplied JSON import. The old `buildSite` dropped
 * them into `innerHTML` raw.
 */
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ENTITIES[m]);

/** For text placed inside a <script> string literal. */
export const escJs = s => JSON.stringify(String(s ?? '')).replace(/</g, '\\u003c');
