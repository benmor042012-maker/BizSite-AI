/**
 * authority archetype: split hero with a floating booking card, FAQ,
 * why-us grid. Meant for trades where a clean layout beats a photo:
 * dental, legal, accounting.
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
  const nav = [
    { id: 'services', label: 'שירותים' },
    { id: 'why', label: 'למה אנחנו' },
    copy.faq.length && { id: 'faq', label: 'שאלות ותשובות' },
    { id: 'contact', label: 'יצירת קשר' },
  ].filter(Boolean);

  const heroBg = heroPhoto
    ? `<img class="bg" src="${esc(heroPhoto)}" alt="" style="width:100%;height:100%;object-fit:cover">`
    : `<div class="bg" style="background:${meshBackdrop({ accent: brief.accent })}"></div>`;

  // Trust chips — real facts only, no invented "20 years of experience".
  const trustChips = [
    rating && `⭐ ${Number(rating).toFixed(1)}${reviewCount ? ` (${reviewCount} ביקורות)` : ''}`,
    city && `📍 ${city}`,
    hoursLines.length && openNow === true && '● פתוח עכשיו',
  ].filter(Boolean);

  const todayLabel = openNow === true ? 'פתוח כעת' : openNow === false ? 'סגור כעת' : 'ראו שעות למטה';

  const reviewsSection = reviews.length ? `<section id="reviews" class="section band-alt reveal">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">לקוחות מספרים</div><h2 class="h2">מה אומרים עלינו</h2></div>
    <div class="rev-row">${reviews.slice(0, 3).map(reviewCard).join('')}</div>
  </div>
</section>` : '';

  const faqSection = copy.faq.length ? `<section id="faq" class="section reveal">
  <div class="container" style="max-width:820px">
    <div class="hgroup"><div class="eyebrow">שאלות ותשובות</div><h2 class="h2">שאלנו את עצמנו קודם</h2></div>
    <div>${copy.faq.map(f => `<div class="faq-item">
      <button class="faq-q" type="button">${esc(f.q)}</button>
      <div class="faq-a"><p>${esc(f.a)}</p></div>
    </div>`).join('')}</div>
  </div>
</section>` : '';

  const infoSection = (hoursLines.length || mapUrl || address) ? `<section id="hours" class="section band-alt reveal">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">שעות ומיקום</div><h2 class="h2">איפה למצוא אותנו</h2></div>
    <div class="info-split">
      <div class="info-block">
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

  return `<div class="arc-authority" id="top">
${header({ name, phone, cta: brief.cta, waLink, telLink, variant: 'onDark', nav })}

<section class="hero">
  ${heroBg}
  <div class="scrim"></div>
  <div class="inner">
    <div>
      <span class="pill tag">${esc(brief.label)}${city ? ' · ' + esc(city) : ''}</span>
      <h1>${esc(copy.headline)}</h1>
      <p class="sub">${esc(copy.subhead)}</p>
      ${trustChips.length ? `<div class="trust-chips">${trustChips.map(c => `<span class="pill">${esc(c)}</span>`).join('')}</div>` : ''}
      <div class="cta-row">
        ${waLink ? `<a class="cta" href="${esc(waLink)}" target="_blank" rel="noreferrer">${esc(brief.cta)}</a>` : ''}
        ${telLink ? `<a class="cta ghost" href="${esc(telLink)}">📞 ${esc(phone)}</a>` : ''}
      </div>
    </div>
    <aside class="book">
      <h3>${esc(brief.cta)}</h3>
      ${rating ? `<div class="row"><span>דירוג בגוגל</span><b>${Number(rating).toFixed(1)} ★ ${reviewCount ? `<span style="color:#6b7280;font-weight:400">(${reviewCount})</span>` : ''}</b></div>` : ''}
      <div class="row"><span>${city ? 'מיקום' : 'שירות ל'}</span><b>${esc(city || 'איזור השירות')}</b></div>
      <div class="row"><span>סטטוס היום</span><b>${esc(todayLabel)}</b></div>
      ${phone ? `<div class="row"><span>טלפון</span><b dir="ltr">${esc(phone)}</b></div>` : ''}
      <div class="btns">
        ${waLink ? `<a class="wa" href="${esc(waLink)}" target="_blank" rel="noreferrer">📱 שליחת הודעה בוואטסאפ</a>` : ''}
        ${telLink ? `<a class="tel" href="${esc(telLink)}">📞 חיוג לעסק</a>` : ''}
      </div>
    </aside>
  </div>
</section>

<section id="services" class="section reveal">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">מה אנחנו מציעים</div><h2 class="h2">השירותים שלנו</h2></div>
    <div class="svc-grid" dir="rtl">
      ${copy.services.map((s, i) => `<article class="svc-card">
        <div class="n">0${i + 1}</div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
      </article>`).join('')}
    </div>
  </div>
</section>

${copy.whyUs && copy.whyUs.length ? `<section id="why" class="section band-alt reveal">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">למה אנחנו</div><h2 class="h2">מה חשוב לדעת עלינו</h2></div>
    <div class="why-grid">
      ${copy.whyUs.map(w => `<div class="why-card"><div class="lbl">${esc(w.label)}</div><div class="txt">${esc(w.text)}</div></div>`).join('')}
    </div>
  </div>
</section>` : ''}

<section class="section tight reveal">
  <div class="container">
    <div class="hgroup"><div class="eyebrow">אודות</div><h2 class="h2">${esc(name)}</h2></div>
    <p class="lead" style="font-size:1.1rem;max-width:780px">${esc(about || copy.about)}</p>
  </div>
</section>

${faqSection}
${reviewsSection}
${infoSection}

${footer({ name, address, phone, hours: hoursLines, waLink, telLink })}
${fabs({ waLink, telLink })}
</div>
${runtimeScript}`;
}
