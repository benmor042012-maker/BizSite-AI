/**
 * Place *detail* lookup for the site builder.
 *
 * `places.js` scans for leads and asks for the few fields the map needs. Building
 * a site needs much more - photos, reviews, opening hours, the editorial blurb -
 * and those fields are billed at a higher tier, so this is a separate call made
 * only for the one business being built.
 */

const SEARCH_ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';

const DETAIL_FIELDS = [
  'id', 'displayName', 'formattedAddress', 'location', 'rating', 'userRatingCount',
  'nationalPhoneNumber', 'internationalPhoneNumber', 'websiteUri', 'reviews',
  'photos', 'regularOpeningHours', 'editorialSummary',
];

/** Food words used to reject a restaurant Google matched onto a non-food lead. */
const FOOD_TERMS = ['מסעדה', 'מסעדת', 'קפה', 'חומוס', 'שיפודי', 'פיצה', 'בורגר', 'סושי', 'ביסטרו', 'פאב', 'מאפי', 'קייטרינג', 'restaurant', 'cafe', 'pizza', 'burger', 'sushi'];

const FOOD_CATEGORIES = new Set(['restaurant', 'cafe', 'bakery', 'catering', 'events']);

const isFoodName = name => {
  const n = String(name || '').toLowerCase();
  return FOOD_TERMS.some(t => n.includes(t.toLowerCase()));
};

/**
 * Google's text search happily returns the nearest restaurant when it can't
 * find a clothing shop, which used to put someone else's food photos on the
 * page. A non-food lead that matched a food-looking place is treated as no
 * match at all, so the site falls back to the category gradient.
 */
export function isMismatch(placeName, leadName, cat) {
  if (FOOD_CATEGORIES.has(cat)) return false;
  return isFoodName(placeName) && !isFoodName(leadName);
}

const norm = s => String(s || '').replace(/["'.,]/g, '').trim().toLowerCase();

/** Pick the result that actually looks like the lead, else the first one. */
export function pickPlace(places, leadName) {
  if (!places.length) return null;
  const target = norm(leadName);
  return places.find(p => {
    const t = norm(p.displayName?.text);
    return t && (t.includes(target) || target.includes(t));
  }) || places[0];
}

/**
 * Look one business up in Places and return the raw place, or null.
 * `placeId` is preferred; `name` + `city` is the fallback the map cards have.
 */
export async function fetchPlaceDetails({ apiKey, placeId, name, city, cat }) {
  let place = null;

  if (placeId) {
    const mask = DETAIL_FIELDS.join(',');
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=he&regionCode=IL`, {
      headers: { 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': mask },
    });
    if (res.ok) place = await res.json();
    else if (res.status !== 404) {
      throw new Error(`Places detail ${res.status}: ${(await res.text()).slice(0, 200)}`);
    }
  }

  if (!place && name) {
    const mask = DETAIL_FIELDS.map(f => `places.${f}`).join(',');
    const res = await fetch(SEARCH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': mask },
      body: JSON.stringify({ textQuery: `${name} ${city || ''}`.trim(), languageCode: 'he', regionCode: 'IL' }),
    });
    if (!res.ok) throw new Error(`Places search ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();
    place = pickPlace(Array.isArray(data.places) ? data.places : [], name);
  }

  if (place && isMismatch(place.displayName?.text, name, cat)) return null;
  return place;
}

/** Reviews, newest first, in the shape the site template renders. */
export function toReviews(place, limit = 5) {
  const raw = Array.isArray(place?.reviews) ? place.reviews : [];
  return raw
    .slice()
    .sort((a, b) => String(b.publishTime || '').localeCompare(String(a.publishTime || '')))
    .slice(0, limit)
    .map(r => ({
      rating: Number(r.rating) || 5,
      text: r.originalText?.text || r.text?.text || '',
      author: r.authorAttribution?.displayName || 'לקוח',
      date: r.publishTime ? formatHebrewDate(r.publishTime) : '',
    }))
    .filter(r => r.text);
}

function formatHebrewDate(iso) {
  try {
    return new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(new Date(iso));
  } catch {
    return '';
  }
}

/**
 * Photo resource names, not URLs. The Worker proxies them through /api/photo so
 * the API key is never handed to the browser.
 */
export function photoNames(place, limit = 10) {
  return (Array.isArray(place?.photos) ? place.photos : [])
    .map(p => p.name)
    .filter(Boolean)
    .slice(0, limit);
}
