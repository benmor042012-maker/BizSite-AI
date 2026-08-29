/**
 * local archetype: booking-forward. Compact hero with a big CTA, an "open
 * now" status bar right after it, services as a price list rather than
 * cards, gallery as a horizontal strip. Fits mespers, gyms, garages.
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
  const gallery = heroPhoto ? photos.slice(1, 8) : photos.slice(0, 8);
  const nav = [
    { id: 'services', label: 'שירותים' },
    gallery.length && { id: 'gallery', label: 'גלריה' },
    reviews.length && { id: 'reviews', label: 'ביקורות' },
    { id: 'contact', label: 'יצירת קשר' },
  ].filter(Boolean);

  const heroBg = heroPhoto
    ? `<img class="bg" src="${esc(heroPhoto)}" alt="" style="width:100%;height:100%;object-fit:cover">`
    : `<div class="bg" style="background:${meshBackdrop({ accent: brief.accent })}"></div>`;

  const liveHtml = openNow === true ? '<span class="live open">● פתוח עכשיו</span>'
    : openNow === false ? '<span class="live closed">● סגור עכשיו</span>' : '';

  // Bar between hero and services — status, phone, rating.
  const todayLine = openNow != null && hoursLines.length
    ? hoursLines.find(h => new Date().getDay() === ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'].findIndex(d => String(h).startsWith('יום ' + d) || String(h).startsWith(d)))
    : null;

  const gallerySection = gallery.length ? `<section id="gallery" class="section tight reveal">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">גלריה</div><h2 class="h2">מהמקום</h2></div>
    <div class="gal-strip">${gallery.map(p => `<a href="${esc(p)}" target="_blank" rel="noreferrer"><img src="${esc(p)}" alt="" loading="lazy"></a>`).join('')}</div>
  </div>
</section>` : '';

  const reviewsSection = reviews.length ? `<section id="reviews" class="section reveal" style="background:var(--card);border-block:1px solid var(--border)">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">לקוחות ממליצים</div><h2 class="h2">מה אומרים עלינו</h2></div>
    <div class="rev-row">${reviews.slice(0, 3).map(reviewCard).join('')}</div>
  </div>
</section>` : '';

  const infoSection = (hoursLines.length || mapUrl || address) ? `<section id="hours" class="section tight reveal">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">שעות ומיקום</div><h2 class="h2">מוזמנים לבוא</h2></div>
    <div class="info-split">
      <div>
        ${hoursLines.length ? `<h3 style="font-size:1.05rem;margin-bottom:12px">שעות פתיחה</h3><ul>${hoursLines.map(h => {
          const parts = String(h).split(':');
          const day = parts[0];
          const time = parts.slice(1).join(':').trim();
          return `<li><span>${esc(day)}</span><span>${esc(time)}</span></li>`;
        }).join('')}</ul>` : ''}
        ${address ? `<p style="margin-top:18px;color:var(--muted)">📍 ${esc(address)}</p>` : ''}
        ${mapLink ? `<p style="margin-top:8px"><a href="${esc(mapLink)}" target="_blank" rel="noreferrer" style="color:var(--accent);font-weight:600">← פתיחת מיקום במפות Google</a></p>` : ''}
      </div>
      ${mapUrl ? `<iframe class="map" src="${esc(mapUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="מפה"></iframe>` : '<div></div>'}
    </div>
  </div>
</section>` : '';

  return `<div class="arc-local" id="top">
${header({ name, phone, cta: brief.cta, waLink, telLink, variant: 'onDark', nav })}

<section class="hero">
  ${heroBg}
  <div class="scrim"></div>
  <div class="inner">
    <span class="pill tag">${esc(brief.label)}${city ? ' · ' + esc(city) : ''}</span>
    <h1>${esc(copy.headline)}</h1>
    <p class="sub">${esc(copy.subhead)}</p>
    <div class="cta-row">
      ${waLink ? `<a class="cta big" href="${esc(waLink)}" target="_blank" rel="noreferrer">${esc(brief.cta)} · WhatsApp</a>` : ''}
      ${telLink ? `<a class="cta ghost" href="${esc(telLink)}">📞 ${esc(phone)}</a>` : ''}
    </div>
  </div>
</section>

<div class="status-bar">
  <div class="status-inner">
    ${liveHtml ? `<span>${liveHtml}</span>` : ''}
    ${todayLine ? `<span>היום: <b>${esc(String(todayLine).split(':').slice(1).join(':').trim())}</b></span>` : ''}
    ${rating ? `<span>דירוג: <b>${Number(rating).toFixed(1)} ★</b>${reviewCount ? ` (${reviewCount} ביקורות)` : ''}</span>` : ''}
    ${phone ? `<span>טלפון: <b dir="ltr">${esc(phone)}</b></span>` : ''}
  </div>
</div>

<section id="services" class="section reveal">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">מה אנחנו נותנים</div><h2 class="h2">השירותים שלנו</h2></div>
    <div class="price-list" dir="rtl">
      ${copy.services.map((s, i) => `<div class="price-item">
        <span class="num">0${i + 1}</span>
        <span class="title">${esc(s.title)}</span>
        <span class="cta-inline">← ${esc(brief.cta)}</span>
        <div class="desc">${esc(s.description)}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

<section class="section tight reveal" style="background:var(--card);border-block:1px solid var(--border)">
  <div class="container">
    <div class="why-strip">
      ${copy.valueProps.map(v => `<div class="w"><div class="n">✓</div><div class="t">${esc(v)}</div></div>`).join('')}
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
}
