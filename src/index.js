import { CITIES, CATEGORIES, searchCategory } from './places.js';
import { fetchPlaceDetails, toReviews, photoNames } from './placeDetails.js';
import { buildSite } from './design/buildSite.js';
import { generateSite } from './design/llm/generate.js';

import { computeOpenNow } from './design/openNow.js';
import { buildScaffold } from './design/three/scaffold.js';
import { getPromptText } from './design/three/prompts.js';
import { getBrief, DESIGN_BRIEFS } from './design/categories.js';
import { STYLE_THEMES, getTheme } from './design/themes.js';
import { zipSync } from './zip.js';

/**
 * Cache window for a city's scan. Places data for small businesses barely
 * moves, and every miss is a billed Places request per category, so this is
 * deliberately long. Add ?refresh=1 to bypass it.
 */
const CACHE_SECONDS = 60 * 60 * 24;

/**
 * A generated site is derived entirely from a Places record, so it is cached as
 * long as the scan behind it. Photos are immutable once Google hands out the
 * resource name, so they are cached far longer.
 */
const SITE_CACHE_SECONDS = 60 * 60 * 24;
const PHOTO_CACHE_SECONDS = 60 * 60 * 24 * 30;

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...extraHeaders },
  });
}

async function handleBusinesses(request, env, ctx) {
  const url = new URL(request.url);
  const city = url.searchParams.get('city') || 'netanya';
  const catParam = url.searchParams.get('cat');
  const refresh = url.searchParams.get('refresh') === '1';

  if (!CITIES[city]) {
    return json({ error: `unknown city "${city}"`, cities: Object.keys(CITIES) }, 400);
  }
  if (catParam && !CATEGORIES[catParam]) {
    return json({ error: `unknown category "${catParam}"`, categories: Object.keys(CATEGORIES) }, 400);
  }

  const apiKey = env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    // Not an error the visitor can fix - the frontend falls back to seed data.
    return json({ error: 'GOOGLE_PLACES_API_KEY is not configured', configured: false }, 503);
  }

  // Cache on the normalised query so ?refresh=1 doesn't fragment the cache.
  const cacheUrl = new URL(url.origin + '/api/businesses');
  cacheUrl.searchParams.set('city', city);
  if (catParam) cacheUrl.searchParams.set('cat', catParam);
  const cacheKey = new Request(cacheUrl.toString(), { method: 'GET' });
  const cache = caches.default;

  if (!refresh) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  const cats = catParam ? [catParam] : Object.keys(CATEGORIES);

  const settled = await Promise.allSettled(
    cats.map(cat => searchCategory({ apiKey, city, cat }))
  );

  const businesses = [];
  const failed = [];
  settled.forEach((result, i) => {
    if (result.status === 'fulfilled') businesses.push(...result.value);
    else failed.push({ cat: cats[i], error: String(result.reason?.message || result.reason) });
  });

  // Every category failing means the key or the API is the problem, not the
  // data - report it so the frontend can keep its seed data instead of
  // rendering an empty map.
  if (!businesses.length && failed.length) {
    return json({ error: 'all Places requests failed', failed }, 502);
  }

  // The same business can surface under two category phrases.
  const seen = new Set();
  const deduped = businesses.filter(b => {
    const key = b.id || `${b.name}|${b.lat.toFixed(5)},${b.lng.toFixed(5)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const body = {
    city,
    count: deduped.length,
    fetchedAt: new Date().toISOString(),
    businesses: deduped,
    ...(failed.length ? { partial: true, failed } : {}),
  };

  const response = json(body, 200, {
    'Cache-Control': `public, max-age=${CACHE_SECONDS}`,
  });

  // Only cache a complete result - a partial scan shouldn't stick for a day.
  if (!failed.length) ctx.waitUntil(cache.put(cacheKey, response.clone()));

  return response;
}


/**
 * Resolve the lead a build request refers to.
 *
 * The map already holds name, address and phone, and passing them through
 * avoids a second Places call when the detail lookup finds nothing usable.
 */
function leadFromQuery(params) {
  return {
    name: params.get('name') || '',
    addr: params.get('addr') || '',
    cat: params.get('cat') || '',
    city: params.get('city') || '',
    cityLabel: CITIES[params.get('city')]?.label || '',
    phone: params.get('phone') || '',
    rating: Number(params.get('rating')) || 0,
  };
}

/** Look the business up and fold the detail fields into the lead record. */
async function enrich(lead, apiKey, placeId) {
  const place = await fetchPlaceDetails({
    apiKey, placeId, name: lead.name, city: lead.cityLabel || lead.city, cat: lead.cat,
  });
  return {
    place,
    lead: { ...lead, reviews: toReviews(place), photos: photoNames(place) },
  };
}


/**
 * Assemble the flat context object the LLM prompt reads.
 *
 * `enrich()` gives us lead + place; the prompt wants the resolved values so
 * it does not have to know either shape. Kept out of buildSite so the two
 * paths cannot drift on which fields matter.
 */
function buildLlmCtx({ lead, place, style }) {
  const brief = getBrief(lead.cat);
  const theme = getTheme(style || brief.theme);
  const name = place?.displayName?.text || lead.name;
  const city = lead.cityLabel || lead.city || '';
  const address = place?.formattedAddress || lead.addr || '';
  const phone = place?.nationalPhoneNumber || lead.phone || '';
  const intlPhone = place?.internationalPhoneNumber || phone;
  const waDigits = String(intlPhone).replace(/\D/g, '');
  const waLink = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(`${brief.wa} (${name})`)}`
    : '';
  const telLink = phone ? `tel:${phone}` : '';
  const mapUrl = address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed&hl=iw` : '';
  const mapLink = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}` : '';
  return {
    lead, place, brief, theme,
    name, city, address, phone,
    rating: place?.rating || lead.rating || null,
    reviewCount: place?.userRatingCount ?? null,
    about: place?.editorialSummary?.text || '',
    hoursLines: place?.regularOpeningHours?.weekdayDescriptions || [],
    openNow: computeOpenNow(place?.regularOpeningHours?.periods),
    reviews: lead.reviews || [],
    photos: (lead.photos || []).map(n => `/api/photo?name=${encodeURIComponent(n)}`),
    waLink, telLink, mapUrl, mapLink,
  };
}

async function handleSite(request, env, ctx) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const lead = leadFromQuery(params);
  const placeId = params.get('placeId') || '';
  const style = params.get('style') || '';
  // llm=0 forces the template path (for comparison). Anything else = try LLM.
  const wantLlm = params.get('llm') !== '0';

  if (!placeId && !lead.name) {
    return json({ error: 'placeId or name is required' }, 400);
  }
  if (style && !STYLE_THEMES[style]) {
    return json({ error: `unknown style "${style}"`, styles: Object.keys(STYLE_THEMES) }, 400);
  }

  const apiKey = env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return json({ error: 'GOOGLE_PLACES_API_KEY is not configured', configured: false }, 503);

  // Normalise the key so ?refresh=1 replaces the entry ordinary requests read
  // instead of filling a second one, and so parameter order can't fragment it.
  const cacheUrl = new URL(url.origin + url.pathname);
  for (const [k, v] of [...params].filter(([k]) => k !== 'refresh').sort()) {
    cacheUrl.searchParams.append(k, v);
  }
  const cacheKey = new Request(cacheUrl.toString(), { method: 'GET' });
  const cache = caches.default;
  if (params.get('refresh') !== '1') {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  const enriched = await enrich(lead, apiKey, placeId);
  const templateOut = buildSite({ ...enriched, style, origin: url.origin });

  let html = templateOut.html;
  let source = 'template';
  let llmMeta = null;
  let fellBackReason = null;

  if (wantLlm) {
    const llmCtx = buildLlmCtx({ ...enriched, style });
    const gen = await generateSite({ ctx: llmCtx, ai: env.AI });
    if (gen.ok) {
      html = gen.html;
      source = 'llm';
      llmMeta = { model: gen.model, neurons: gen.neurons };
    } else {
      fellBackReason = gen.reason;
    }
  }

  const meta = { ...templateOut.meta, source, ...(llmMeta ? { llm: llmMeta } : {}), ...(fellBackReason ? { fell_back_from_llm: fellBackReason } : {}) };

  const response = new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': `public, max-age=${SITE_CACHE_SECONDS}`,
      // Lets the frontend label the preview without parsing the document.
      'X-BizSite-Meta': encodeURIComponent(JSON.stringify(meta)),
      'X-BizSite-Source': source,
    },
  });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

/**
 * Proxy a Places photo.
 *
 * Photo URLs need the API key, and mercator worked around that by re-uploading
 * every image to its own storage. Proxying is simpler and keeps the key on the
 * server: the generated page only ever references /api/photo.
 */
async function handlePhoto(request, env, ctx) {
  const url = new URL(request.url);
  const name = url.searchParams.get('name') || '';
  const width = Math.min(Math.max(Number(url.searchParams.get('w')) || 1200, 100), 1600);

  // Photo resource names look like places/<id>/photos/<ref>. Anything else
  // would turn this route into an open proxy.
  if (!/^places\/[\w-]+\/photos\/[\w-]+$/.test(name)) {
    return json({ error: 'invalid photo name' }, 400);
  }

  const apiKey = env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return json({ error: 'GOOGLE_PLACES_API_KEY is not configured' }, 503);

  const cacheKey = new Request(url.toString(), { method: 'GET' });
  const cache = caches.default;
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const upstream = await fetch(
    `https://places.googleapis.com/v1/${name}/media?maxWidthPx=${width}&key=${apiKey}`,
    { cf: { cacheTtl: PHOTO_CACHE_SECONDS } }
  );
  if (!upstream.ok) return json({ error: `photo ${upstream.status}` }, 502);

  const response = new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('Content-Type') || 'image/jpeg',
      'Cache-Control': `public, max-age=${PHOTO_CACHE_SECONDS}, immutable`,
    },
  });
  ctx.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

/** Build the React + Vite 3D project and return it as a zip download. */
async function handleSite3d(request, env) {
  const url = new URL(request.url);
  const lead = leadFromQuery(url.searchParams);
  const placeId = url.searchParams.get('placeId') || '';

  if (!placeId && !lead.name) return json({ error: 'placeId or name is required' }, 400);

  const apiKey = env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return json({ error: 'GOOGLE_PLACES_API_KEY is not configured', configured: false }, 503);

  const enriched = await enrich(lead, apiKey, placeId);

  // The design spec ships inside the export so the project can be handed to
  // another AI tool for variants.
  const promptText = getPromptText(getBrief(lead.cat).three);

  const { files, dir } = buildScaffold({ ...enriched, promptText });
  const zip = zipSync(files);

  return new Response(zip, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${dir}.zip"`,
      'Cache-Control': 'no-store',
    },
  });
}

/** The design briefs, so the frontend renders one source of truth, not a copy. */
function handleDesignMeta() {
  const briefs = Object.fromEntries(
    Object.entries(DESIGN_BRIEFS).map(([id, b]) => [id, {
      label: b.label, theme: b.theme, accent: b.accent, cta: b.cta,
      sections: b.sections, three: b.three,
    }])
  );
  const themes = Object.fromEntries(
    Object.entries(STYLE_THEMES).map(([id, t]) => [id, { label: t.label }])
  );
  return json({ briefs, themes }, 200, { 'Cache-Control': 'public, max-age=3600' });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/businesses') {
      if (request.method !== 'GET') {
        return json({ error: 'method not allowed' }, 405, { Allow: 'GET' });
      }
      try {
        return await handleBusinesses(request, env, ctx);
      } catch (err) {
        return json({ error: String(err?.message || err) }, 500);
      }
    }

    const routes = {
      '/api/site': { method: 'GET', handler: handleSite },
      '/api/photo': { method: 'GET', handler: handlePhoto },
      '/api/site3d': { method: 'POST', handler: handleSite3d },
      '/api/design': { method: 'GET', handler: handleDesignMeta },
    };
    const route = routes[url.pathname];
    if (route) {
      if (request.method !== route.method) {
        return json({ error: 'method not allowed' }, 405, { Allow: route.method });
      }
      try {
        return await route.handler(request, env, ctx);
      } catch (err) {
        return json({ error: String(err?.message || err) }, 500);
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'not found' }, 404);
    }

    // Everything else is the static site.
    return env.ASSETS.fetch(request);
  },
};
