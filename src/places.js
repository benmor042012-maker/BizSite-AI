/**
 * Google Places API (New) adapter.
 *
 * Maps Places results onto the shape the BizSite AI map expects:
 *   {name, addr, lat, lng, cat, city, rating, phone, status}
 *
 * `status` is the whole product premise, so it is derived from the website:
 *   gold  = no website at all  -> the prime lead
 *   red   = only a social/aggregator page -> weak presence, worth replacing
 *   green = a real site of its own
 */

import { CATEGORY_PHRASES } from './design/categories.js';

const PLACES_ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.nationalPhoneNumber',
  'places.websiteUri',
].join(',');

/** Cities the map covers, with the centre each search is biased around. */
export const CITIES = {
  netanya: { label: 'נתניה', lat: 32.305, lng: 34.855, radius: 6000 },
  telaviv: { label: 'תל אביב', lat: 32.0853, lng: 34.7818, radius: 7000 },
  haifa: { label: 'חיפה', lat: 32.794, lng: 34.9896, radius: 7000 },
};

/**
 * Category ids used by the UI, with the Hebrew search phrase for each.
 *
 * Text search is used rather than nearby-search place types because several of
 * these categories (photo studios, driving schools) have no clean type match,
 * and Hebrew queries return far better results for small local businesses.
 *
 * The list is derived from the design briefs rather than duplicated here, so a
 * category can never exist on the map without a design to build it with.
 */
export const CATEGORIES = CATEGORY_PHRASES;

/**
 * Hosts that are somebody else's page rather than the business's own site.
 * A business whose only web presence is one of these is a "weak site" lead.
 */
const AGGREGATOR_HOSTS = [
  'facebook.com', 'fb.com', 'instagram.com', 'linktr.ee', 'wa.me',
  'business.site', 'sites.google.com', 'wixsite.com', 'blogspot.com',
  'rest.co.il', '10bis.co.il', 'wolt.com', 'mishlohim.co.il',
  'easy.co.il', 'dapey.co.il', 'zap.co.il', 'b144.co.il',
];

export function classifyWebsite(websiteUri) {
  if (!websiteUri) return 'gold';
  let host;
  try {
    host = new URL(websiteUri).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return 'gold';
  }
  const aggregated = AGGREGATOR_HOSTS.some(h => host === h || host.endsWith('.' + h));
  return aggregated ? 'red' : 'green';
}

/** Turn one Places result into a business record, or null if unusable. */
export function toBusiness(place, cat, city) {
  const name = place.displayName?.text?.trim();
  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  if (!name || typeof lat !== 'number' || typeof lng !== 'number') return null;

  return {
    id: place.id,
    name,
    addr: place.formattedAddress || '',
    lat,
    lng,
    cat,
    city,
    rating: typeof place.rating === 'number' ? Math.round(place.rating * 10) / 10 : 0,
    phone: place.nationalPhoneNumber || '',
    status: classifyWebsite(place.websiteUri),
  };
}

/** Fetch one category in one city. Returns an array of business records. */
export async function searchCategory({ apiKey, city, cat, maxResults = 20 }) {
  const place = CITIES[city];
  const phrase = CATEGORIES[cat];
  if (!place || !phrase) return [];

  const res = await fetch(PLACES_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify({
      textQuery: `${phrase} ${place.label}`,
      languageCode: 'he',
      regionCode: 'IL',
      maxResultCount: Math.min(maxResults, 20),
      locationBias: {
        circle: {
          center: { latitude: place.lat, longitude: place.lng },
          radius: place.radius,
        },
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Places ${res.status} for ${cat}/${city}: ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  return (data.places || [])
    .map(p => toBusiness(p, cat, city))
    .filter(Boolean);
}
