import { CITIES, CATEGORIES, searchCategory } from './places.js';

/**
 * Cache window for a city's scan. Places data for small businesses barely
 * moves, and every miss is a billed Places request per category, so this is
 * deliberately long. Add ?refresh=1 to bypass it.
 */
const CACHE_SECONDS = 60 * 60 * 24;

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

    if (url.pathname.startsWith('/api/')) {
      return json({ error: 'not found' }, 404);
    }

    // Everything else is the static site.
    return env.ASSETS.fetch(request);
  },
};
