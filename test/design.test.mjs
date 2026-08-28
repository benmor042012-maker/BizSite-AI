/**
 * Covers the design layer: briefs, themes, the site builder, SEO, the zip
 * writer and the 3D scaffold. Same hand-rolled assertion style as
 * places.test.mjs - no test framework, run with `node test/design.test.mjs`.
 */
import { DESIGN_BRIEFS, DEFAULT_BRIEF, getBrief, SECTIONS } from '../src/design/categories.js';
import { STYLE_THEMES, getTheme } from '../src/design/themes.js';
import { buildSite } from '../src/design/buildSite.js';
import { esc } from '../src/design/escape.js';
import { seoTitle, metaDescription, jsonLd } from '../src/design/seo.js';
import { computeOpenNow } from '../src/design/openNow.js';
import { isMismatch, toReviews, photoNames } from '../src/placeDetails.js';
import { THREE_PRESETS } from '../src/design/three/presets.js';
import { buildScaffold, slugify } from '../src/design/three/scaffold.js';
import { zipSync } from '../src/zip.js';
import { readFileSync } from 'node:fs';

let fail = 0;
const eq = (got, want, label) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fail++; console.log(`FAIL ${label}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
  else console.log(`ok   ${label}`);
};
const ok = (cond, label) => eq(!!cond, true, label);

// --- every brief is complete and internally consistent ---------------------
const briefIds = Object.keys(DESIGN_BRIEFS);
ok(briefIds.length >= 21, `${briefIds.length} category briefs defined`);
for (const [id, b] of Object.entries(DESIGN_BRIEFS)) {
  ok(STYLE_THEMES[b.theme], `${id}: theme "${b.theme}" exists`);
  ok(THREE_PRESETS[b.three], `${id}: 3D preset "${b.three}" exists`);
  ok(b.sections.every(s => SECTIONS.includes(s)), `${id}: only known sections`);
  ok(b.sections.includes('hero') && b.sections.includes('contact'), `${id}: has hero and contact`);
  ok(b.copy.valueProps.length >= 3 && b.copy.services.length >= 3, `${id}: copy pack filled`);
  ok(['photo', 'gradient'].includes(b.heroTreatment), `${id}: valid hero treatment`);
}
ok(STYLE_THEMES[DEFAULT_BRIEF.theme] && THREE_PRESETS[DEFAULT_BRIEF.three], 'default brief is valid');

// The whole point of this change: categories must not share a design wholesale.
const fingerprints = new Map();
for (const [id, b] of Object.entries(DESIGN_BRIEFS)) {
  const fp = `${b.theme}|${b.accent}|${b.cta}|${b.sections.join(',')}|${b.heroTreatment}`;
  fingerprints.set(fp, [...(fingerprints.get(fp) || []), id]);
}
const clashes = [...fingerprints.values()].filter(v => v.length > 1);
eq(clashes, [], 'no two categories share an identical design fingerprint');
ok(new Set(Object.values(DESIGN_BRIEFS).map(b => b.theme)).size === Object.keys(STYLE_THEMES).length,
  'all nine themes are actually used');

// --- brief resolution ------------------------------------------------------
eq(getBrief('dentist').schemaType, 'Dentist', 'exact id lookup');
eq(getBrief('מרפאת שיניים פרטית').schemaType, 'Dentist', 'substring lookup on Hebrew label');
eq(getBrief('חנות גלידה').schemaType, 'LocalBusiness', 'unknown category -> default brief');
eq(getBrief('').schemaType, 'LocalBusiness', 'empty category -> default brief');
eq(getTheme('nope').label, STYLE_THEMES.modern.label, 'unknown theme -> modern');

// --- escaping --------------------------------------------------------------
eq(esc('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;', 'escapes angle brackets');
eq(esc(null), '', 'escapes null to empty');

// --- opening hours ---------------------------------------------------------
eq(computeOpenNow(null), null, 'no periods -> unknown');
const mon9to17 = [{ open: { day: 1, hour: 9, minute: 0 }, close: { day: 1, hour: 17, minute: 0 } }];
eq(computeOpenNow(mon9to17, new Date('2026-08-24T09:00:00Z')), true, 'Monday noon Jerusalem -> open');
eq(computeOpenNow(mon9to17, new Date('2026-08-24T17:00:00Z')), false, 'Monday 20:00 Jerusalem -> closed');
const overnight = [{ open: { day: 5, hour: 20, minute: 0 }, close: { day: 6, hour: 2, minute: 0 } }];
eq(computeOpenNow(overnight, new Date('2026-08-28T22:00:00Z')), true, 'overnight span stays open past midnight');

// --- Places helpers --------------------------------------------------------
ok(isMismatch('מסעדת הדר', 'בגדי הדר', 'clothing'), 'food result on a non-food lead is a mismatch');
ok(!isMismatch('מסעדת הדר', 'מסעדת הדר', 'restaurant'), 'food result on a food lead is fine');
eq(toReviews({ reviews: [] }), [], 'no reviews -> empty');
eq(photoNames({}), [], 'no photos -> empty');

// --- the built site --------------------------------------------------------
const lead = {
  name: 'מרפאת שיניים ד״ר לוי', addr: 'הרצל 5, נתניה', cat: 'dentist',
  city: 'netanya', cityLabel: 'נתניה', phone: '09-8123456', rating: 4.8,
  reviews: [{ rating: 5, text: 'צוות מעולה', author: 'דנה', date: 'מאי 2025' }],
  photos: ['places/abc/photos/def'],
};
const dentist = buildSite({ lead, place: null });
const restaurant = buildSite({ lead: { ...lead, cat: 'restaurant', name: 'מסעדת הים' }, place: null });

ok(dentist.html.startsWith('<!doctype html>'), 'emits a standalone document');
ok(dentist.html.includes('dir="rtl"'), 'document is RTL');
eq(dentist.meta.theme, 'business', 'dentist gets the business theme');
eq(restaurant.meta.theme, 'luxury', 'restaurant gets the luxury theme');
ok(dentist.html.includes('Heebo') && restaurant.html.includes('Frank+Ruhl'), 'themes load different fonts');
ok(!dentist.meta.sections.includes('gallery'), 'dentist brief omits the gallery');
ok(restaurant.meta.sections.includes('gallery'), 'restaurant brief includes the gallery');
ok(restaurant.html.includes('class="bg" src="/api/photo'), 'photo hero goes through the proxy');
ok(dentist.html.includes('linear-gradient'), 'gradient hero used when the brief says so');

// The old builder produced byte-identical pages for same-family categories.
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

// Only real data renders: no reviews and no photos means no such sections.
const bare = buildSite({ lead: { ...lead, cat: 'restaurant', reviews: [], photos: [] }, place: null });
ok(!bare.html.includes('גלריה'), 'no photos -> no gallery section');
ok(!bare.html.includes('מה הלקוחות אומרים'), 'no reviews -> no reviews section');

// Every brief must build without throwing.
for (const id of briefIds) {
  const out = buildSite({ lead: { ...lead, cat: id }, place: null });
  ok(out.html.length > 5000 && out.html.endsWith('</html>'), `${id}: builds a complete page`);
}

// --- SEO -------------------------------------------------------------------
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
ok(!jsonLd({ ...seoCtx, rating: 0, reviewCount: 0 }).includes('aggregateRating'),
  'no rating -> no aggregateRating (never invented)');

// --- zip -------------------------------------------------------------------
const zip = zipSync({ 'a/b.txt': 'שלום', 'c.txt': 'hi' });
eq([...zip.slice(0, 4)], [0x50, 0x4b, 0x03, 0x04], 'zip starts with a local file header signature');
ok(zip.length > 100, 'zip has content');
// End-of-central-directory record, last 22 bytes, claims both entries.
const end = new DataView(zip.buffer, zip.length - 22);
eq(end.getUint32(0, true), 0x06054b50, 'ends with the central directory record');
eq(end.getUint16(8, true), 2, 'central directory lists both files');

// --- 3D scaffold -----------------------------------------------------------
eq(slugify('מסעדת הים'), 'msdt-hym', 'Hebrew names transliterate rather than vanish');
ok(slugify('מסעדת הים') !== slugify('מספרת דני'), 'different Hebrew names stay distinct');
eq(slugify('!!!'), 'business', 'unusable name falls back');

const foodLead = { ...lead, cat: 'restaurant', name: 'מסעדת הים הכחול' };
const scaffold = buildScaffold({ lead: foodLead, place: null, promptText: '# spec' });
eq(scaffold.dir, 'msdt-hym-hkchvl-3d', 'export directory is named after the business');
const names = Object.keys(scaffold.files).map(f => f.replace(scaffold.dir + '/', ''));
for (const required of ['package.json', 'vite.config.ts', 'index.html', 'src/main.tsx',
  'src/App.tsx', 'src/data/business.ts', 'src/components/Hero3D.tsx', 'PROMPT.md', 'README.md']) {
  ok(names.includes(required), `scaffold contains ${required}`);
}
const pkg = JSON.parse(scaffold.files[`${scaffold.dir}/package.json`]);
ok(pkg.dependencies['@react-three/fiber'] && pkg.dependencies.three && pkg.dependencies['framer-motion'],
  'scaffold declares the R3F stack the prompts assume');
ok(/^[a-z0-9][a-z0-9._-]*$/.test(pkg.name), 'scaffold package name is npm-legal');
eq(scaffold.files[`${scaffold.dir}/PROMPT.md`], '# spec', 'design spec ships inside the export');
const data = scaffold.files[`${scaffold.dir}/src/data/business.ts`];
ok(data.includes('מסעדת הים הכחול'), 'scaffold injects the real business name');
ok(data.includes('09-8123456') && data.includes('הרצל 5, נתניה'), 'scaffold injects phone and address');
ok(data.includes('הזמנת שולחן'), 'scaffold injects the category CTA');

// Every preset must produce a scaffold whose hero has real geometry.
for (const [id, b] of Object.entries(DESIGN_BRIEFS)) {
  const out = buildScaffold({ lead: { ...lead, cat: id }, place: null });
  const hero = out.files[`${out.dir}/src/components/Hero3D.tsx`];
  ok(/<\w+Geometry args=/.test(hero), `${id}: Hero3D declares geometry (${b.three})`);
}

// --- frontend guards -------------------------------------------------------
// These live here because the frontend is a single hand-written HTML file with
// no build step, so there is nowhere else to catch a regression in it.
const frontend = readFileSync(new URL('../public/index.html', import.meta.url), 'utf8');
// A srcdoc frame without allow-same-origin gets an opaque origin and Chromium
// renders it blank - the preview silently shows nothing. Verified in a browser.
ok(frontend.includes("'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox'"),
  'preview iframe keeps allow-same-origin, without which it renders blank');
ok(!/innerHTML\s*=\s*buildSite/.test(frontend), 'preview is framed, not spliced into the host page');
ok(frontend.includes('const STATUS_LABEL'), 'STATUS_LABEL survives (the map legend depends on it)');
for (const gone of ['FAMILY_STYLE =', 'HOURS_BY_CAT =', 'const COPY =']) {
  ok(!frontend.includes(gone), `hardcoded design table removed: ${gone}`);
}

console.log(fail ? `\n${fail} FAILURE(S)` : '\nall assertions passed');
process.exit(fail ? 1 : 0);
