/**
 * Orchestrates one generated site.
 *
 * The old buildSite emitted a single hardcoded layout for every trade. This
 * assembles the context (lead + Places record + brief), picks an archetype
 * from `brief.layout`, and hands the render off to that module.
 */

import { getTheme } from './themes.js';
import { getBrief } from './categories.js';
import { esc } from './escape.js';
import { headMeta } from './seo.js';
import { computeOpenNow } from './openNow.js';
import { BASE_CSS, ARCHETYPE_CSS } from './css.js';
import * as showcase from './layouts/showcase.js';
import * as authority from './layouts/authority.js';
import * as local from './layouts/local.js';

const LAYOUTS = { showcase, authority, local };

/** Photos are served through the Worker so the Places key stays server-side. */
const photoUrl = (name, w = 1600) => `/api/photo?name=${encodeURIComponent(name)}&w=${w}`;

export function buildSite({ lead, place, style, origin = '' }) {
  const brief = getBrief(lead.cat);
  const theme = getTheme(style || brief.theme);
  const layout = LAYOUTS[brief.layout] || LAYOUTS.local;

  const name = place?.displayName?.text || lead.name;
  const address = place?.formattedAddress || lead.addr || '';
  const phone = place?.nationalPhoneNumber || lead.phone || '';
  const intlPhone = place?.internationalPhoneNumber || phone;
  const city = lead.cityLabel || lead.city || '';
  const rating = typeof place?.rating === 'number' ? place.rating : (lead.rating || null);
  const reviewCount = place?.userRatingCount ?? null;
  const about = place?.editorialSummary?.text || '';
  const reviews = lead.reviews || [];
  const photos = (lead.photos || []).map(n => photoUrl(n));
  const hoursLines = place?.regularOpeningHours?.weekdayDescriptions || [];
  const openNow = computeOpenNow(place?.regularOpeningHours?.periods);

  const waDigits = String(intlPhone).replace(/\D/g, '');
  const waLink = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(`${brief.wa} (${name})`)}`
    : '';
  const telLink = phone ? `tel:${phone}` : '';
  const mapUrl = address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed&hl=iw` : '';
  const mapLink = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}` : '';

  const ctx = {
    name, address, phone, city, rating, reviewCount, about, brief, theme,
    photos, reviews, hoursLines, openNow, waLink, telLink, mapUrl, mapLink,
  };

  const body = layout.render(ctx);

  const metaCtx = {
    name, brief, city, address, phone, about, rating, reviewCount,
    photos: photos.map(p => (origin ? origin + p : p)),
    url: origin || '',
    openingHours: hoursLines,
  };

  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${headMeta(metaCtx)}
${theme.fontsLink}
<style>
:root{${theme.vars}}
${BASE_CSS}
${ARCHETYPE_CSS[brief.layout] || ''}
${theme.overrides}
</style>
</head>
<body>
${body}
</body></html>`;

  const meta = {
    name, brief: brief.label, layout: brief.layout, theme: style || brief.theme,
    photos: photos.length, reviews: reviews.length, hours: hoursLines.length,
  };
  return { html, meta };
}
