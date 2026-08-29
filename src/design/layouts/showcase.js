/**
 * showcase archetype: photo-forward, magazine feel.
 *
 * hero: full-bleed image (or the mesh backdrop when no photo), soft scrim so
 * the picture stays visible, name pinned to the bottom.
 * about: pull quote + stats column.
 * services: two-column list with numbers, not cards.
 * gallery: asymmetric grid (large + two small + two small) or single hero shot.
 * reviews: three-up cards.
 * info: two-column strip with hours on one side, keyless Google map on the other.
 */

import { esc } from '../escape.js';
import { header, footer, fabs, runtimeScript } from './shared.js';
import { meshBackdrop } from '../backdrop.js';

const reviewCard = r => `<article class="rev-card">
  <div class="stars">${'★'.repeat(Math.max(1, Math.min(5, Math.round(r.rating))))}</div>
  <p>${esc(r.text)}</p>
  <div class="who">— ${esc(r.author)} · Google${r.date ? ` · ${esc(r.date)}` : ''}</div>
</article>`;

export function render(ctx) {
  const { name, address, phone, city, rating, reviewCount, about, brief,
    photos, reviews, hoursLines, openNow, waLink, telLink, mapUrl, mapLink } = ctx;
  const copy = brief.copy;
  const heroPhoto = photos[0] || '';
  const gallery = heroPhoto ? photos.slice(1, 6) : photos.slice(0, 6);
  const nav = [
    { id: 'about', label: 'אודות' },
    copy.services.length && { id: 'services', label: 'השירותים' },
    gallery.length && { id: 'gallery', label: 'גלריה' },
    reviews.length && { id: 'reviews', label: 'ביקורות' },
    { id: 'contact', label: 'יצירת קשר' },
  ].filter(Boolean);

  const heroBg = heroPhoto
    ? `<img class="bg" src="${esc(heroPhoto)}" alt="">`
    : `<div class="bg" style="background:${meshBackdrop({ accent: brief.accent })}"></div>`;

  const ratingChip = rating
    ? `<span class="pill tag"><span class="stars">★</span> ${Number(rating).toFixed(1)}${reviewCount ? ` · ${reviewCount} ביקורות` : ''}</span>`
    : `<span class="pill tag">${esc(brief.label)}</span>`;

  const aboutStats = [
    rating && { n: Number(rating).toFixed(1), l: `דירוג ממוצע${reviewCount ? ` · ${reviewCount} ביקורות` : ''}` },
    { n: city || '', l: 'איזור שירות', hide: !city },
    { n: brief.label, l: 'תחום פעילות' },
  ].filter(s => s && !s.hide);

  const gallerySection = gallery.length ? `<section id="gallery" class="band tight reveal">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">גלריה</div><h2 class="h2">מהמקום</h2></div>
    <div class="gal-grid">${gallery.map(p => `<a href="${esc(p)}" target="_blank" rel="noreferrer"><img src="${esc(p)}" alt="" loading="lazy"></a>`).join('')}</div>
  </div>
</section>` : '';

  const reviewsSection = reviews.length ? `<section id="reviews" class="band alt reveal">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">לקוחות ממליצים</div><h2 class="h2">מה אומרים עלינו</h2></div>
    <div class="rev-row">${reviews.slice(0, 3).map(reviewCard).join('')}</div>
  </div>
</section>` : '';

  const hasInfo = hoursLines.length || mapUrl || address;
  const openBadge = openNow === true ? '<span class="live open" style="color:#16a34a;font-weight:800">● פתוח עכשיו</span>'
    : openNow === false ? '<span class="live closed" style="color:#dc2626;font-weight:800">● סגור עכשיו</span>' : '';

  const infoSection = hasInfo ? `<section id="hours" class="band full reveal">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">שעות פתיחה ומיקום</div><h2 class="h2">מוזמנים לבוא</h2></div>
    <div class="info-split">
      <div class="info-block">
        ${openBadge ? `<p style="margin-bottom:14px">${openBadge}</p>` : ''}
        ${hoursLines.length ? `<h3>שעות</h3><ul>${hoursLines.map(h => {
          const [day, time] = String(h).split(':').length > 1 ? [h.split(':')[0], h.split(':').slice(1).join(':')] : [h, ''];
          return `<li><span>${esc(day)}</span><span>${esc(time.trim())}</span></li>`;
        }).join('')}</ul>` : ''}
        ${address ? `<p style="margin-top:20px;color:var(--muted)">📍 ${esc(address)}</p>` : ''}
        ${mapLink ? `<p style="margin-top:8px"><a href="${esc(mapLink)}" target="_blank" rel="noreferrer" style="color:var(--accent);font-weight:600">← פתיחת מיקום במפות Google</a></p>` : ''}
      </div>
      ${mapUrl ? `<iframe class="map" src="${esc(mapUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="מפה"></iframe>` : '<div></div>'}
    </div>
  </div>
</section>` : '';

  const body = `<div class="arc-showcase" id="top">
${header({ name, phone, cta: brief.cta, waLink, telLink, variant: 'onDark', nav })}

<section class="hero">
  ${heroBg}
  <div class="scrim"></div>
  <div class="inner">
    ${ratingChip}
    <h1>${esc(copy.headline)}</h1>
    <p class="sub">${esc(copy.subhead)}</p>
    <div class="cta-row">
      ${waLink ? `<a class="cta" href="${esc(waLink)}" target="_blank" rel="noreferrer">${esc(brief.cta)} · WhatsApp</a>` : ''}
      ${telLink ? `<a class="cta ghost" href="${esc(telLink)}">📞 חיוג</a>` : ''}
    </div>
  </div>
</section>

<section id="about" class="band reveal">
  <div class="container">
    <div class="about-grid">
      <div>
        <div class="eyebrow">אודות</div>
        <p class="pullquote">${esc(about || copy.about)}</p>
        <p class="lead" style="margin-top:20px">${esc(copy.subhead)}</p>
      </div>
      <div class="stats">
        ${aboutStats.map(s => `<div class="stat"><div class="n">${esc(s.n)}</div><div class="l">${esc(s.l)}</div></div>`).join('')}
      </div>
    </div>
  </div>
</section>

<section id="services" class="band alt reveal">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">מה אנחנו עושים</div><h2 class="h2">השירותים שלנו</h2></div>
    <div class="svc-list">
      ${copy.services.map((s, i) => `<div class="svc-item">
        <div class="svc-num">0${i + 1}</div>
        <div><div class="svc-t">${esc(s.title)}</div><div class="svc-d">${esc(s.description)}</div></div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="band tight full reveal">
  <div class="container">
    <div style="display:flex;flex-wrap:wrap;gap:14px;justify-content:center">
      ${copy.valueProps.map(v => `<span class="pill" style="background:transparent;border-color:var(--border);color:var(--fg)"><span style="color:var(--accent);font-weight:800">✓</span> ${esc(v)}</span>`).join('')}
    </div>
  </div>
</section>

${gallerySection}
${reviewsSection}
${infoSection}

${footer({ name, address, phone, hours: hoursLines, waLink, telLink })}
${fabs({ waLink, telLink })}
</div>
${runtimeScript}`;

  return body;
}
