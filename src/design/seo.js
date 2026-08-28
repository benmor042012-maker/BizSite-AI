/**
 * Structured data and social meta for a generated site.
 *
 * mercator produced these from an LLM call (`upgradeSEO`). Everything that call
 * returned can be derived from the brief plus the Places record, so this does it
 * deterministically: no key, no latency, and nothing invented.
 */

import { esc } from './escape.js';

/** Trim to a byte-sane length without cutting mid-word. */
function clamp(text, max) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + '…';
}

export function seoTitle(name, brief, city) {
  return clamp([name, brief.label, city && `ב${city}`].filter(Boolean).join(' · '), 60);
}

export function metaDescription({ name, brief, city, about, rating, reviewCount }) {
  const lead = about || brief.copy.about;
  const proof = rating ? ` דירוג ${Number(rating).toFixed(1)}★${reviewCount ? ` מתוך ${reviewCount} ביקורות בגוגל` : ''}.` : '';
  return clamp(`${name} — ${brief.label}${city ? ` ב${city}` : ''}. ${lead}${proof}`, 155);
}

export function keywords({ name, brief, city }) {
  return [name, brief.label, city, city && `${brief.label} ${city}`, ...brief.copy.services]
    .filter(Boolean)
    .slice(0, 8);
}

/**
 * schema.org JSON-LD. Only fields backed by real data are emitted — an absent
 * rating means no `aggregateRating`, not a zero.
 */
export function jsonLd({ name, brief, city, address, phone, about, rating, reviewCount, photos, url, openingHours }) {
  const node = {
    '@context': 'https://schema.org',
    '@type': brief.schemaType,
    name,
    description: about || brief.copy.about,
  };
  if (url) node.url = url;
  if (phone) node.telephone = phone;
  if (photos?.length) node.image = photos.slice(0, 5);
  if (address || city) {
    node.address = { '@type': 'PostalAddress', addressCountry: 'IL' };
    if (address) node.address.streetAddress = address;
    if (city) node.address.addressLocality = city;
  }
  if (typeof rating === 'number' && rating > 0 && reviewCount > 0) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(rating).toFixed(1),
      reviewCount,
      bestRating: '5',
    };
  }
  if (openingHours?.length) node.openingHours = openingHours;
  // </script> inside a JSON-LD block would close the tag early.
  return JSON.stringify(node).replace(/</g, '\\u003c');
}

/** The full <head> block: title, meta, Open Graph, Twitter and JSON-LD. */
export function headMeta(ctx) {
  const title = seoTitle(ctx.name, ctx.brief, ctx.city);
  const description = metaDescription(ctx);
  const image = ctx.photos?.[0] || '';
  return `<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="keywords" content="${esc(keywords(ctx).join(', '))}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:locale" content="he_IL">
${image ? `<meta property="og:image" content="${esc(image)}">` : ''}
<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<script type="application/ld+json">${jsonLd(ctx)}</script>`;
}
