/**
 * End-to-end tests through the Worker's fetch handler with the Places API
 * mocked, so routing, caching, the photo proxy and the zip download are all
 * exercised without a key or a network.
 */
import worker from '../src/index.js';

let fail = 0;
const eq = (got, want, label) => {
  const okv = JSON.stringify(got) === JSON.stringify(want);
  if (!okv) { fail++; console.log(`FAIL ${label}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
  else console.log(`ok   ${label}`);
};
const ok = (cond, label) => eq(!!cond, true, label);

// `caches.default` is a Workers global; Node has no equivalent.
const store = new Map();
globalThis.caches = {
  default: {
    async match(req) { const hit = store.get(req.url); return hit ? hit.clone() : undefined; },
    async put(req, res) { store.set(req.url, res); },
  },
};
const ctx = { waitUntil: p => p };
const env = { GOOGLE_PLACES_API_KEY: 'test-key', ASSETS: { fetch: async () => new Response('', { status: 404 }) } };

const PLACE = {
  id: 'ChIJtest',
  displayName: { text: 'מרפאת שיניים ד״ר לוי' },
  formattedAddress: 'הרצל 5, נתניה',
  nationalPhoneNumber: '09-8123456',
  internationalPhoneNumber: '+972 9-812-3456',
  rating: 4.8,
  userRatingCount: 132,
  editorialSummary: { text: 'מרפאה עם ציוד חדיש וצוות ותיק.' },
  reviews: [
    { rating: 5, originalText: { text: 'צוות מעולה' }, authorAttribution: { displayName: 'דנה' }, publishTime: '2025-05-01T00:00:00Z' },
    { rating: 4, originalText: { text: 'שירות טוב' }, authorAttribution: { displayName: 'עמית' }, publishTime: '2025-03-01T00:00:00Z' },
  ],
  photos: [{ name: 'places/ChIJtest/photos/abc' }, { name: 'places/ChIJtest/photos/def' }],
  regularOpeningHours: { weekdayDescriptions: ['יום שני: 09:00–17:00'], periods: [] },
};

let lastRequest = null;
globalThis.fetch = async (url, init) => {
  lastRequest = { url: String(url), init };
  if (String(url).includes('/media')) {
    return new Response(new Uint8Array([0xFF, 0xD8, 0xFF]), { headers: { 'Content-Type': 'image/jpeg' } });
  }
  if (String(url).includes('places:searchText')) return Response.json({ places: [PLACE] });
  return Response.json(PLACE);
};

const call = (path, init) => worker.fetch(new Request('https://bizsite.test' + path, init), env, ctx);

// --- /api/design -----------------------------------------------------------
{
  const res = await call('/api/design');
  eq(res.status, 200, 'GET /api/design -> 200');
  const body = await res.json();
  ok(Object.keys(body.briefs).length >= 21, 'design endpoint lists every category brief');
  eq(Object.keys(body.themes).length, 9, 'design endpoint lists all nine themes');
  ok(body.briefs.dentist.label === 'מרפאת שיניים', 'brief carries its Hebrew label');
  ok(!JSON.stringify(body).includes('test-key'), 'design endpoint leaks no key');
}

// --- /api/site -------------------------------------------------------------
{
  const res = await call('/api/site?placeId=ChIJtest&cat=dentist&city=netanya&name=x');
  eq(res.status, 200, 'GET /api/site -> 200');
  eq(res.headers.get('Content-Type'), 'text/html; charset=utf-8', 'site is served as HTML');
  const html = await res.text();
  ok(html.startsWith('<!doctype html>'), 'site is a standalone document');
  ok(html.includes('מרפאת שיניים ד״ר לוי'), 'site shows the real business name');
  ok(html.includes('09-8123456'), 'site shows the real phone');
  ok(html.includes('צוות מעולה'), 'site shows a real Google review');
  ok(html.includes('מרפאה עם ציוד חדיש'), 'site uses the editorial summary for about');
  ok(html.includes('יום שני: 09:00–17:00'), 'site shows real opening hours');
  ok(!html.includes('test-key'), 'generated page never carries the API key');
  ok(html.includes('/api/photo?name='), 'photos are referenced through the proxy');
  const meta = JSON.parse(decodeURIComponent(res.headers.get('X-BizSite-Meta')));
  eq(meta.theme, 'business', 'meta reports the resolved theme');
  eq(meta.reviews, 2, 'meta reports the review count');
}

// The same business under two categories must not produce the same page.
{
  const a = await (await call('/api/site?placeId=ChIJtest&cat=dentist&name=x')).text();
  const b = await (await call('/api/site?placeId=ChIJtest&cat=restaurant&name=x')).text();
  ok(a !== b, 'dentist and restaurant render different pages');
  const style = await (await call('/api/site?placeId=ChIJtest&cat=dentist&name=x&style=luxury')).text();
  ok(style !== a, 'an explicit style overrides the brief default');
}

// --- validation ------------------------------------------------------------
eq((await call('/api/site?cat=dentist')).status, 400, 'site without placeId or name -> 400');
eq((await call('/api/site?name=x&style=nope')).status, 400, 'unknown style -> 400');
eq((await call('/api/site', { method: 'POST' })).status, 405, 'POST to /api/site -> 405');
eq((await call('/api/site3d?name=x')).status, 405, 'GET to /api/site3d -> 405');
eq((await call('/api/nope')).status, 404, 'unknown api route -> 404');

// --- /api/photo ------------------------------------------------------------
{
  eq((await call('/api/photo?name=https://evil.example/x')).status, 400, 'photo proxy rejects a non-Places name');
  eq((await call('/api/photo?name=../../etc/passwd')).status, 400, 'photo proxy rejects traversal');
  const res = await call('/api/photo?name=places/ChIJtest/photos/abc&w=800');
  eq(res.status, 200, 'photo proxy serves a valid resource name');
  eq(res.headers.get('Content-Type'), 'image/jpeg', 'photo proxy forwards the content type');
  ok(lastRequest.url.includes('key=test-key'), 'photo proxy sends the key upstream');
  ok(lastRequest.url.includes('maxWidthPx=800'), 'photo proxy honours the width');
  // Width is clamped so the proxy can't be used to pull arbitrary sizes.
  await call('/api/photo?name=places/ChIJtest/photos/abc&w=99999');
  ok(lastRequest.url.includes('maxWidthPx=1600'), 'photo proxy clamps oversized widths');
}

// --- /api/site3d -----------------------------------------------------------
{
  const res = await call('/api/site3d?placeId=ChIJtest&cat=restaurant&name=מסעדת הים', { method: 'POST' });
  eq(res.status, 200, 'POST /api/site3d -> 200');
  eq(res.headers.get('Content-Type'), 'application/zip', '3D export is a zip');
  ok(/attachment; filename=".+\.zip"/.test(res.headers.get('Content-Disposition')), '3D export downloads as a file');
  const buf = new Uint8Array(await res.arrayBuffer());
  eq([...buf.slice(0, 2)], [0x50, 0x4b], 'zip magic bytes');
  const text = new TextDecoder().decode(buf);
  ok(text.includes('package.json') && text.includes('src/components/Hero3D.tsx'), 'zip lists the scaffold files');
  ok(text.includes('@react-three/fiber'), 'zip carries the R3F dependency');
  ok(!text.includes('test-key'), '3D export never carries the API key');
}

// --- caching ---------------------------------------------------------------
{
  store.clear();
  let calls = 0;
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (...a) => { calls++; return realFetch(...a); };

  await call('/api/site?placeId=ChIJtest&cat=dentist&name=x');
  const afterFirst = calls;
  await call('/api/site?placeId=ChIJtest&cat=dentist&name=x');
  eq(calls, afterFirst, 'a repeat request is served from cache');

  // Parameter order must not fragment the cache.
  await call('/api/site?cat=dentist&name=x&placeId=ChIJtest');
  eq(calls, afterFirst, 'reordered parameters hit the same cache entry');

  // refresh=1 must replace the entry ordinary requests read, not add a second.
  const before = store.size;
  await call('/api/site?placeId=ChIJtest&cat=dentist&name=x&refresh=1');
  ok(calls > afterFirst, 'refresh=1 bypasses the cache');
  eq(store.size, before, 'refresh=1 overwrites rather than adding an entry');

  globalThis.fetch = realFetch;
}

// --- missing key -----------------------------------------------------------
{
  const bare = { GOOGLE_PLACES_API_KEY: '', ASSETS: env.ASSETS };
  const res = await worker.fetch(new Request('https://bizsite.test/api/site?name=x'), bare, ctx);
  eq(res.status, 503, 'no key -> 503 rather than a broken page');
  eq((await res.json()).configured, false, 'no key -> reports configured:false');
}

console.log(fail ? `\n${fail} FAILURE(S)` : '\nall assertions passed');
process.exit(fail ? 1 : 0);
