import { classifyWebsite, toBusiness, searchCategory, CITIES, CATEGORIES } from '../src/places.js';
import { DESIGN_BRIEFS } from '../src/design/categories.js';

let fail = 0;
const eq = (got, want, label) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fail++; console.log(`FAIL ${label}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
  else console.log(`ok   ${label}`);
};

// --- status derivation: the core sales logic ---
eq(classifyWebsite(undefined), 'gold', 'no website -> gold (אין אתר)');
eq(classifyWebsite(''), 'gold', 'empty website -> gold');
eq(classifyWebsite('https://www.facebook.com/somecafe'), 'red', 'facebook page -> red');
eq(classifyWebsite('https://m.facebook.com/x'), 'red', 'facebook subdomain -> red');
eq(classifyWebsite('https://mycafe.wixsite.com/home'), 'red', 'wixsite -> red');
eq(classifyWebsite('https://www.rest.co.il/rest/123'), 'red', 'rest.co.il aggregator -> red');
eq(classifyWebsite('https://fratelli.co.il'), 'green', 'own domain -> green');
eq(classifyWebsite('not a url'), 'gold', 'unparseable -> gold');
eq(classifyWebsite('https://notfacebook.com/x'), 'green', 'lookalike host not matched as aggregator');

// --- record mapping ---
const place = {
  id: 'ChIJabc',
  displayName: { text: 'קפה שטמפפר' },
  formattedAddress: 'רחוב יהושע שטמפפר 6, נתניה',
  location: { latitude: 32.328388, longitude: 34.854721 },
  rating: 4.23,
  nationalPhoneNumber: '09-884-4714',
};
eq(toBusiness(place, 'cafe', 'netanya'), {
  id: 'ChIJabc', name: 'קפה שטמפפר', addr: 'רחוב יהושע שטמפפר 6, נתניה',
  lat: 32.328388, lng: 34.854721, cat: 'cafe', city: 'netanya',
  rating: 4.2, phone: '09-884-4714', status: 'gold',
}, 'maps a place onto the UI business shape');

eq(toBusiness({ displayName: { text: 'x' } }, 'cafe', 'netanya'), null, 'drops a place with no coordinates');
eq(toBusiness({ location: { latitude: 1, longitude: 2 } }, 'cafe', 'netanya'), null, 'drops a place with no name');
eq(toBusiness({ ...place, rating: undefined }, 'cafe', 'netanya').rating, 0, 'missing rating -> 0');
eq(toBusiness({ ...place, nationalPhoneNumber: undefined }, 'cafe', 'netanya').phone, '', 'missing phone -> empty string');

// --- request shape + end-to-end fetch, with Places stubbed ---
let captured;
globalThis.fetch = async (url, init) => {
  captured = { url, init, body: JSON.parse(init.body) };
  return new Response(JSON.stringify({ places: [place, { ...place, id: 'b', websiteUri: 'https://real.co.il' }] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } });
};

const out = await searchCategory({ apiKey: 'TEST_KEY', city: 'netanya', cat: 'cafe' });
eq(captured.url, 'https://places.googleapis.com/v1/places:searchText', 'calls Places searchText');
eq(captured.init.headers['X-Goog-Api-Key'], 'TEST_KEY', 'sends key in X-Goog-Api-Key header');
eq(captured.body.textQuery, 'בתי קפה נתניה', 'builds Hebrew text query from category + city');
eq(captured.body.languageCode, 'he', 'requests Hebrew');
eq(captured.body.regionCode, 'IL', 'requests Israel region');
eq(captured.body.locationBias.circle.center, { latitude: 32.305, longitude: 34.855 }, 'biases to city centre');
eq(captured.init.headers['X-Goog-FieldMask'].includes('places.websiteUri'), true, 'field mask asks for websiteUri');
eq(out.map(b => b.status), ['gold', 'green'], 'maps both results with correct status');

eq(await searchCategory({ apiKey: 'k', city: 'nope', cat: 'cafe' }), [], 'unknown city -> empty');
eq(await searchCategory({ apiKey: 'k', city: 'netanya', cat: 'nope' }), [], 'unknown category -> empty');

// --- error surfacing ---
globalThis.fetch = async () => new Response('REQUEST_DENIED: bad key', { status: 403 });
try {
  await searchCategory({ apiKey: 'bad', city: 'netanya', cat: 'cafe' });
  fail++; console.log('FAIL non-200 should throw');
} catch (e) {
  eq(e.message.includes('403') && e.message.includes('cafe/netanya'), true, 'non-200 throws with status and context');
}

// The category list is derived from the design briefs, so this asserts the
// derivation still holds rather than pinning a count that any new trade breaks.
eq(Object.keys(CATEGORIES), Object.keys(DESIGN_BRIEFS), 'categories are the design briefs, in order');
eq(Object.values(CATEGORIES).every(p => typeof p === 'string' && p.length > 1), true, 'every category has a search phrase');
eq(Object.keys(CITIES), ['netanya','telaviv','haifa'], 'all 3 UI cities are mapped');

console.log(fail ? `\n${fail} FAILURE(S)` : '\nall assertions passed');
process.exit(fail ? 1 : 0);
