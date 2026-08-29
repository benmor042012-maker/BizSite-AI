/**
 * Design layer: briefs, themes, the archetype builder, SEO, zip and 3D
 * scaffold. Same hand-rolled assertion style as places.test.mjs; run with
 * `node --import ./test/md-text-loader.mjs test/design.test.mjs`.
 */
import { DESIGN_BRIEFS, DEFAULT_BRIEF, getBrief, LAYOUTS } from '../src/design/categories.js';
import { STYLE_THEMES, getTheme } from '../src/design/themes.js';
import { buildSite } from '../src/design/buildSite.js';
import { esc } from '../src/design/escape.js';
import { seoTitle, metaDescription, jsonLd } from '../src/design/seo.js';
import { computeOpenNow } from '../src/design/openNow.js';
import { isMismatch, toReviews, photoNames } from '../src/placeDetails.js';
import { THREE_PRESETS } from '../src/design/three/presets.js';
import { buildScaffold, slugify } from '../src/design/three/scaffold.js';
import { zipSync } from '../src/zip.js';
import { meshBackdrop, subtleBackdrop } from '../src/design/backdrop.js';
import { readFileSync } from 'node:fs';

let fail = 0;
const eq = (got, want, label) => {
  const okv = JSON.stringify(got) === JSON.stringify(want);
  if (!okv) { fail++; console.log(`FAIL ${label}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
  else console.log(`ok   ${label}`);
};
const ok = (cond, label) => eq(!!cond, true, label);

// --- brief structure -------------------------------------------------------
const briefIds = Object.keys(DESIGN_BRIEFS);
ok(briefIds.length >= 21, `${briefIds.length} category briefs defined`);

const perLayout = {};
for (const [id, b] of Object.entries(DESIGN_BRIEFS)) {
  ok(STYLE_THEMES[b.theme], `${id}: theme "${b.theme}" exists`);
  ok(THREE_PRESETS[b.three], `${id}: 3D preset "${b.three}" exists`);
  ok(LAYOUTS.includes(b.layout), `${id}: layout "${b.layout}" is one of ${LAYOUTS.join(',')}`);
  perLayout[b.layout] = (perLayout[b.layout] || 0) + 1;
  ok(b.copy.headline && b.copy.subhead && b.copy.about, `${id}: has headline/subhead/about`);
  eq(b.copy.valueProps.length, 4, `${id}: has exactly 4 value props`);
  ok(b.copy.services.length >= 3, `${id}: has 3+ services`);
  for (const s of b.copy.services) ok(s.title && s.description, `${id}: every service has a title and a description`);
  ok(b.copy.faq.length >= 3, `${id}: has 3+ FAQ items`);
  if (b.layout === 'authority') ok(b.copy.whyUs.length >= 3, `${id}: authority layout has 3+ whyUs items`);
}
for (const l of LAYOUTS) ok(perLayout[l] >= 1, `layout ${l} has at least one brief`);

// No two briefs may share layout + theme + headline — the whole point is
// distinct designs, not colour swaps of the same one.
const seen = new Map();
for (const [id, b] of Object.entries(DESIGN_BRIEFS)) {
  const k = `${b.layout}|${b.theme}|${b.copy.headline}`;
  if (seen.has(k)) { fail++; console.log(`FAIL duplicate design fingerprint: ${id} <-> ${seen.get(k)}`); }
  else seen.set(k, id);
}
ok(seen.size === briefIds.length, 'every brief has a unique design fingerprint');

// --- resolution & escaping ------------------------------------------------
eq(getBrief('dentist').schemaType, 'Dentist', 'exact id lookup');
eq(getBrief('מרפאת שיניים פרטית').layout, 'authority', 'substring lookup lands on the right layout');
eq(getBrief('').layout, 'local', 'empty category -> default brief');
eq(getTheme('nope').label, STYLE_THEMES.modern.label, 'unknown theme -> modern');
eq(esc('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;', 'escapes angle brackets');

// --- opening hours --------------------------------------------------------
eq(computeOpenNow(null), null, 'no periods -> unknown');
const mon = [{ open: { day: 1, hour: 9, minute: 0 }, close: { day: 1, hour: 17, minute: 0 } }];
eq(computeOpenNow(mon, new Date('2026-08-24T09:00:00Z')), true, 'Monday noon Jerusalem -> open');
eq(computeOpenNow(mon, new Date('2026-08-24T17:00:00Z')), false, 'Monday 20:00 Jerusalem -> closed');

// --- Places helpers -------------------------------------------------------
ok(isMismatch('מסעדת הדר', 'בגדי הדר', 'clothing'), 'food match on non-food lead is a mismatch');
ok(!isMismatch('מסעדת הדר', 'מסעדת הדר', 'restaurant'), 'food match on food lead is fine');
eq(toReviews({ reviews: [] }), [], 'no reviews -> empty');
eq(photoNames({}), [], 'no photos -> empty');

// --- backdrops ------------------------------------------------------------
ok(meshBackdrop({ accent: '#0ea5e9' }).includes('radial-gradient'), 'mesh backdrop uses radial gradients');
ok(subtleBackdrop({ accent: '#d4a017' }).includes('radial-gradient'), 'subtle backdrop uses radial gradients');

// --- the built site -------------------------------------------------------
const lead = {
  name: 'מרפאת שיניים ד״ר לוי', addr: 'הרצל 5, נתניה', cat: 'dentist',
  city: 'netanya', cityLabel: 'נתניה', phone: '09-8123456', rating: 4.8,
  reviews: [{ rating: 5, text: 'צוות מעולה', author: 'דנה', date: 'מאי 2025' }],
  photos: ['places/abc/photos/def'],
};
const dentist = buildSite({ lead, place: null });
const restaurant = buildSite({ lead: { ...lead, cat: 'restaurant', name: 'מסעדת הים' }, place: null });
const barber = buildSite({ lead: { ...lead, cat: 'barber', name: 'מספרת דני' }, place: null });

ok(dentist.html.startsWith('<!doctype html>'), 'emits a standalone document');
ok(dentist.html.includes('dir="rtl"'), 'document is RTL');
eq(dentist.meta.layout, 'authority', 'dentist uses the authority layout');
eq(restaurant.meta.layout, 'showcase', 'restaurant uses the showcase layout');
eq(barber.meta.layout, 'local', 'barber uses the local layout');
ok(dentist.html.includes('arc-authority') && restaurant.html.includes('arc-showcase') && barber.html.includes('arc-local'),
  'each page carries its archetype class');
ok(dentist.html.includes('class="book"'), 'authority layout ships the booking card');
ok(barber.html.includes('price-list'), 'local layout ships a price list');
ok(restaurant.html.includes('gal-grid') || restaurant.meta.photos === 0, 'showcase layout ships the asymmetric grid when there are photos');
ok(restaurant.html.includes('pullquote'), 'showcase layout ships a pull quote');
ok(dentist.html.includes('faq-q'), 'authority layout ships the FAQ accordion');
ok(dentist.html.includes('site-header'), 'sticky header is present');
ok(dentist.html.includes('site-footer') && dentist.html.includes('ft-hours'), 'real footer with hours slot is present');

// The regression that started this rewrite.
const lawyer = buildSite({ lead: { ...lead, cat: 'lawyer' }, place: null });
ok(lawyer.html !== dentist.html, 'lawyer and dentist no longer render the same page');
ok(lawyer.meta.theme !== dentist.meta.theme, 'lawyer and dentist use different themes');

// Nothing that reaches the browser may carry the Places key.
for (const [label, out] of [['dentist', dentist], ['restaurant', restaurant]]) {
  ok(!/[?&]key=/.test(out.html), `${label}: no API key in the generated page`);
}

// Hostile Places data must not become markup.
const evil = buildSite({
  lead: { ...lead, name: '<img src=x onerror=alert(1)>', addr: '"><script>alert(2)</script>' },
  place: null,
});
ok(!evil.html.includes('<img src=x onerror'), 'hostile business name is escaped');
ok(!evil.html.includes('<script>alert(2)'), 'hostile address is escaped');

// Every brief must build without throwing.
for (const id of briefIds) {
  const out = buildSite({ lead: { ...lead, cat: id }, place: null });
  ok(out.html.length > 8000 && out.html.endsWith('</html>'), `${id}: builds a complete page (${out.html.length}b)`);
}

// --- SEO -----------------------------------------------------------------
const seoCtx = {
  name: 'מרפאת שיניים ד״ר לוי', brief: getBrief('dentist'), city: 'נתניה',
  address: 'הרצל 5', phone: '09-8123456', about: '', rating: 4.8, reviewCount: 132,
  photos: [], openingHours: [],
};
ok(seoTitle(seoCtx.name, seoCtx.brief, seoCtx.city).length <= 60, 'SEO title within 60 chars');
ok(metaDescription(seoCtx).length <= 156, 'meta description within 155 chars');
const ld = JSON.parse(jsonLd(seoCtx).replace(/\\u003c/g, '<'));
eq(ld['@type'], 'Dentist', 'JSON-LD uses the category schema type');
eq(ld.aggregateRating.reviewCount, 132, 'JSON-LD carries the real review count');
ok(!jsonLd({ ...seoCtx, rating: 0, reviewCount: 0 }).includes('aggregateRating'), 'no rating -> no aggregateRating');

// --- zip -----------------------------------------------------------------
const zip = zipSync({ 'a/b.txt': 'שלום', 'c.txt': 'hi' });
eq([...zip.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04], 'zip starts with a local file header signature');
const end = new DataView(zip.buffer, zip.length - 22);
eq(end.getUint32(0, true), 0x06054b50, 'ends with the central directory record');
eq(end.getUint16(8, true), 2, 'central directory lists both files');

// --- 3D scaffold ---------------------------------------------------------
eq(slugify('מסעדת הים'), 'msdt-hym', 'Hebrew names transliterate rather than vanish');
ok(slugify('מסעדת הים') !== slugify('מספרת דני'), 'different Hebrew names stay distinct');
const scaffold = buildScaffold({ lead: { ...lead, cat: 'restaurant', name: 'מסעדת הים הכחול' }, place: null, promptText: '# spec' });
const names = Object.keys(scaffold.files).map(f => f.replace(scaffold.dir + '/', ''));
for (const required of ['package.json', 'vite.config.ts', 'index.html', 'src/main.tsx',
  'src/App.tsx', 'src/data/business.ts', 'src/components/Hero3D.tsx', 'PROMPT.md']) {
  ok(names.includes(required), `scaffold contains ${required}`);
}
ok(scaffold.files[`${scaffold.dir}/src/data/business.ts`].includes('מסעדת הים הכחול'), 'scaffold injects the real business name');
ok(scaffold.files[`${scaffold.dir}/src/data/business.ts`].includes('הזמנת שולחן'), 'scaffold injects the category CTA');

// Every preset must produce a scaffold whose hero declares geometry.
for (const [id, b] of Object.entries(DESIGN_BRIEFS)) {
  const out = buildScaffold({ lead: { ...lead, cat: id }, place: null });
  ok(/<\w+Geometry args=/.test(out.files[`${out.dir}/src/components/Hero3D.tsx`]), `${id}: Hero3D declares geometry (${b.three})`);
}

// --- frontend guards -----------------------------------------------------
const frontend = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
ok(frontend.includes("'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'"),
  'preview iframe keeps allow-same-origin (Chromium renders it blank without)');
ok(!/innerHTML\s*=\s*buildSite/.test(frontend), 'preview is framed, not spliced');
ok(frontend.includes('const STATUS_LABEL'), 'STATUS_LABEL survives (the map legend depends on it)');
for (const gone of ['FAMILY_STYLE =', 'HOURS_BY_CAT =', 'const COPY =']) {
  ok(!frontend.includes(gone), `hardcoded design table removed: ${gone}`);
}

console.log(fail ? `\n${fail} FAILURE(S)` : '\nall assertions passed');
process.exit(fail ? 1 : 0);
