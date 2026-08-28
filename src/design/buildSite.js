/**
 * Builds a complete, standalone marketing site for one business.
 *
 * Ported from mercator's `buildWebsite/entry.ts`, with the Base44 pieces
 * removed: no LLM call, no image or video generation, no entity write. Every
 * word on the page is either real Google Places data or a fallback declared in
 * the category brief, so nothing is invented at build time.
 *
 * Section order and presence come from `brief.sections`, but a section is still
 * dropped when it has no data to show - an empty gallery renders nothing rather
 * than an empty frame.
 */

import { getTheme } from './themes.js';
import { getBrief } from './categories.js';
import { esc } from './escape.js';
import { headMeta } from './seo.js';
import { computeOpenNow } from './openNow.js';

const HE_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

/** Photos are served through the Worker so the Places key stays server-side. */
const photoUrl = (name, w = 1200) => `/api/photo?name=${encodeURIComponent(name)}&w=${w}`;

const reviewCard = r =>
  `<div class="review"><div class="stars">${'★'.repeat(Math.max(1, Math.min(5, Math.round(r.rating))))}</div>` +
  `<p>${esc(r.text)}</p><div class="author">— ${esc(r.author)} · Google${r.date ? ` · ${esc(r.date)}` : ''}</div></div>`;

/**
 * Assemble the page.
 *
 * @param {object} o
 * @param {object} o.lead     the map's business record ({name, addr, cat, city, phone, rating}).
 * @param {object|null} o.place raw Places detail, or null when nothing matched.
 * @param {string} o.style    theme key; defaults to the brief's own theme.
 * @param {string} o.origin   absolute origin, used for canonical/OG URLs.
 * @returns {{html: string, meta: object}}
 */
export function buildSite({ lead, place, style, origin = '' }) {
  const brief = getBrief(lead.cat);
  const theme = getTheme(style || brief.theme);

  // Real data first, lead record second, brief fallback last.
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

  const heroPhoto = brief.heroTreatment === 'photo' ? photos[0] : '';
  // The hero image is also in the gallery, so the gallery starts after it.
  const galleryPhotos = heroPhoto ? photos.slice(1) : photos;

  const waDigits = String(intlPhone).replace(/\D/g, '');
  const waLink = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(`${brief.wa} (${name})`)}`
    : '';
  const telLink = phone ? `tel:${phone}` : '';
  // Keyless embed. mercator uses maps/embed/v1, which puts the API key in the
  // page source; this form needs no key at all.
  const mapUrl = address ? `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed&hl=iw` : '';
  const mapLink = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${address}`)}` : '';

  const liveBadge = openNow === true ? '<span class="live open">● פתוח עכשיו</span>'
    : openNow === false ? '<span class="live closed">● סגור עכשיו</span>'
    : '';
  const ratingBadge = rating ? `⭐ ${Number(rating).toFixed(1)}${reviewCount ? ` · ${reviewCount} ביקורות` : ''}` : brief.label;

  // ---- sections ------------------------------------------------------------
  const build = {
    hero: () => `<section class="hero">
  ${heroPhoto ? `<img class="bg" src="${esc(heroPhoto)}" alt="">` : `<div class="gradient" style="background:${brief.grad}"></div>`}
  <div class="overlay"></div>
  <div class="inner">
    <span class="tag">${esc(ratingBadge)}${liveBadge ? ` <span style="opacity:.5">·</span> ${liveBadge}` : ''}</span>
    <h1>${esc(name)}</h1>
    <p>${esc([brief.label, city].filter(Boolean).join(' · '))}</p>
    ${waLink ? `<a class="cta" href="${esc(waLink)}" target="_blank" rel="noreferrer">${esc(brief.cta)} · WhatsApp</a>` : ''}
    ${telLink ? `<a class="cta outline" href="${esc(telLink)}">📞 ${esc(phone)}</a>` : ''}
  </div>
</section>
<section class="props reveal">${brief.copy.valueProps.map(v => `<div class="prop"><span>✓</span>${esc(v)}</div>`).join('')}</section>`,

    about: () => {
      const text = about || brief.copy.about;
      return `<section class="section about reveal"><h2>אודות</h2><p>${esc(text)}</p>${
        about ? '<p class="note">התיאור מתוך פרופיל Google של העסק</p>' : ''
      }</section>`;
    },

    services: () => `<section class="section reveal"><h2>השירותים שלנו</h2>
<div class="svc-grid">${brief.copy.services.map((s, i) =>
      `<div class="svc"><div class="svc-n">${i + 1}</div><div class="svc-t">${esc(s)}</div></div>`).join('')}</div></section>`,

    gallery: () => {
      if (!galleryPhotos.length) return '';
      if (galleryPhotos.length === 1) {
        return `<section class="section reveal"><h2>גלריה</h2><div class="single-photo"><img src="${esc(galleryPhotos[0])}" alt="" loading="lazy"></div></section>`;
      }
      return `<section class="section reveal"><h2>גלריה</h2>
<div class="carousel" id="gal">
  <div class="cs-viewport">
    <div class="cs-track">${galleryPhotos.map(u => `<div class="cs-slide"><img src="${esc(u)}" alt="" loading="lazy"></div>`).join('')}</div>
    <button class="cs-arrow cs-prev" onclick="csMove(-1)" aria-label="הקודמת">❮</button>
    <button class="cs-arrow cs-next" onclick="csMove(1)" aria-label="הבאה">❯</button>
  </div>
  <div class="cs-dots">${galleryPhotos.map((_, i) => `<button class="cs-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="תמונה ${i + 1}"></button>`).join('')}</div>
</div><p class="note">תמונות מפרופיל Google של העסק</p></section>`;
    },

    reviews: () => {
      if (!reviews.length) return '';
      const body = reviews.length === 1
        ? `<div class="reviews">${reviewCard(reviews[0])}</div>`
        : `<div class="carousel" id="revGal">
  <div class="cs-viewport"><div class="cs-track">${reviews.map(r => `<div class="cs-slide rev-slide">${reviewCard(r)}</div>`).join('')}</div>
  <button class="cs-arrow cs-prev" onclick="revMove(-1)" aria-label="הקודמת">❮</button>
  <button class="cs-arrow cs-next" onclick="revMove(1)" aria-label="הבאה">❯</button></div>
  <div class="cs-dots">${reviews.map((_, i) => `<button class="cs-dot${i === 0 ? ' active' : ''}" data-i="${i}" aria-label="ביקורת ${i + 1}"></button>`).join('')}</div>
</div>`;
      return `<section class="section reveal"><h2>מה הלקוחות אומרים</h2>${body}<p class="note">ביקורות אמיתיות מ-Google</p></section>`;
    },

    hours: () => {
      if (!hoursLines.length) return '';
      return `<section class="section reveal"><h2>שעות פתיחה</h2>${
        liveBadge ? `<p style="text-align:center;margin-bottom:18px">${liveBadge}</p>` : ''
      }<ul class="hoursList">${hoursLines.map(h => `<li>${esc(h)}</li>`).join('')}</ul></section>`;
    },

    map: () => mapUrl
      ? `<section class="section reveal"><h2>מיקום</h2><iframe class="map" src="${esc(mapUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="מפה"></iframe></section>`
      : '',

    contact: () => `<section class="section contact reveal"><h2>פרטים ויצירת קשר</h2>
  ${address ? `<p>📍 ${esc(address)}</p>` : ''}
  ${phone ? `<p>📞 <a href="${esc(telLink)}">${esc(phone)}</a></p>` : ''}
  ${mapLink ? `<p><a href="${esc(mapLink)}" target="_blank" rel="noreferrer">🗺️ צפייה במפה</a></p>` : ''}
  ${waLink ? `<form class="form" onsubmit="event.preventDefault();var n=this.n.value||'',p=this.p.value||'',m=this.m.value||'';window.open(${JSON.stringify(waLink)}+encodeURIComponent(' / שם: '+n+' / טלפון: '+p+' / הודעה: '+m),'_blank');this.reset();">
    <h3>${esc(brief.cta)} — נשלח ב-WhatsApp</h3>
    <input name="n" placeholder="שם מלא" autocomplete="name">
    <input name="p" placeholder="טלפון" dir="ltr" autocomplete="tel">
    <textarea name="m" placeholder="הודעה…"></textarea>
    <button type="submit">שליחה ב-WhatsApp</button>
  </form>` : ''}
</section>`,
  };

  const body = brief.sections.map(s => build[s]?.() || '').join('\n');

  const meta = {
    name, brief, city, address, phone, about, rating, reviewCount,
    photos: photos.map(p => (origin ? origin + p : p)),
    url: origin || '',
    openingHours: hoursLines,
  };

  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
${headMeta(meta)}
${theme.fontsLink}
<style>
:root{${theme.vars}}
*{margin:0;padding:0;box-sizing:border-box;font-family:var(--font-body),'Segoe UI',system-ui,sans-serif}
h1,h2,h3,.hero h1{font-family:var(--font-heading)}
body{color:var(--fg);background:var(--bg);line-height:1.5}
a{color:inherit}
@keyframes fu{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.hero .tag,.hero h1,.hero p,.hero .cta{animation:fu var(--reveal-dur) var(--reveal-ease) both}
.hero .tag{animation-delay:.1s}.hero h1{animation-delay:.2s}.hero p{animation-delay:.35s}.hero .cta{animation-delay:.5s}
.reveal{opacity:0;transform:translateY(24px);transition:opacity .6s var(--reveal-ease),transform .6s var(--reveal-ease)}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.reveal,.hero .tag,.hero h1,.hero p,.hero .cta{animation:none;transition:none;opacity:1;transform:none}}
.hero{position:relative;height:70vh;min-height:420px;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff;overflow:hidden}
.hero .bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0}
.hero .gradient{position:absolute;inset:0;z-index:0}
.hero .overlay{position:absolute;inset:0;background:linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.4));z-index:1}
.hero .inner{position:relative;z-index:2;padding:24px;max-width:820px}
.hero .tag{display:inline-flex;align-items:center;gap:10px;background:rgba(255,255,255,.16);padding:7px 18px;border-radius:999px;font-size:.92rem;margin-bottom:18px;backdrop-filter:blur(4px)}
.hero h1{font-size:clamp(2.3rem,6vw,4.4rem);font-weight:var(--h1-weight);margin-bottom:14px;text-shadow:0 2px 12px rgba(0,0,0,.4)}
.hero p{font-size:clamp(1rem,2.5vw,1.3rem);opacity:.96;margin:0 auto 26px}
.cta{display:inline-block;background:var(--accent);color:var(--accent-contrast);padding:14px 34px;border-radius:var(--cta-radius);font-weight:var(--cta-weight);text-decoration:none;font-size:1.05rem;margin:0 6px 10px;border:none;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.25)}
.cta.outline{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.85);box-shadow:none}
.live{font-size:.82rem;font-weight:700}
.live.open{color:#4ade80}.live.closed{color:#fca5a5}
.props{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;padding:28px 20px;border-bottom:1px solid var(--border)}
.prop{display:flex;align-items:center;gap:8px;background:var(--card);border:1px solid var(--border);padding:9px 18px;border-radius:999px;font-size:.9rem;font-weight:600}
.prop span{color:var(--accent);font-weight:800}
.section{max-width:1040px;margin:0 auto;padding:var(--sec-pad) 20px}
.section h2{font-size:clamp(1.6rem,4vw,2.2rem);margin-bottom:26px;text-align:center;position:relative}
.section h2::after{content:"";display:block;width:54px;height:4px;border-radius:2px;background:var(--accent);margin:12px auto 0}
.about p{font-size:1.12rem;line-height:1.9;color:var(--muted);text-align:center;max-width:720px;margin:0 auto}
.svc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px}
.svc{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:30px 20px;text-align:center}
.svc-n{width:46px;height:46px;border-radius:50%;background:var(--accent);color:var(--accent-contrast);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;margin:0 auto 16px}
.svc-t{font-weight:700;font-size:1.05rem;line-height:1.5}
.carousel{max-width:900px;margin:0 auto}
.cs-viewport{position:relative;border-radius:var(--radius);overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.12);background:var(--card)}
.cs-track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.cs-track::-webkit-scrollbar{display:none}
.cs-slide{flex:0 0 100%;scroll-snap-align:start;height:clamp(280px,52vw,460px)}
.cs-slide img{width:100%;height:100%;object-fit:cover;display:block}
.cs-arrow{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;border:none;font-size:1.3rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;backdrop-filter:blur(2px)}
.cs-arrow:hover{background:rgba(0,0,0,.75)}
.cs-prev{right:14px}.cs-next{left:14px}
.cs-dots{display:flex;justify-content:center;gap:9px;margin-top:16px}
.cs-dot{width:10px;height:10px;border-radius:50%;border:none;background:var(--border);cursor:pointer;padding:0;transition:background .2s,transform .2s}
.cs-dot.active{background:var(--accent);transform:scale(1.3)}
.single-photo{max-width:900px;margin:0 auto;border-radius:var(--radius);overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,.12)}
.single-photo img{width:100%;height:auto;max-height:520px;object-fit:cover;display:block}
.rev-slide{flex:0 0 100%;scroll-snap-align:start;padding:6px;height:auto}
@media(min-width:640px){.rev-slide{flex:0 0 50%}}
@media(min-width:900px){.rev-slide{flex:0 0 33.333%}}
.rev-slide .review{height:100%;display:flex;flex-direction:column}
.rev-slide .review p{flex:1}
#revGal .cs-viewport{background:transparent;box-shadow:none;overflow:hidden}
#revGal .cs-track{overflow:hidden;scroll-snap-type:none;transition:transform .4s cubic-bezier(0.16,1,0.3,1)}
.reviews{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;max-width:900px;margin:0 auto}
.review{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:26px}
.review .stars{color:#f59e0b;font-size:1.1rem;margin-bottom:10px;letter-spacing:2px}
.review p{color:var(--muted);line-height:1.7;font-style:italic}
.review .author{margin-top:12px;color:var(--muted2);font-size:.85rem}
.hoursList{list-style:none;max-width:520px;margin:0 auto}
.hoursList li{padding:9px 0;border-bottom:1px solid var(--border);color:var(--muted)}
.map{width:100%;height:340px;border:0;border-radius:var(--radius)}
.contact{background:var(--contact-bg);color:var(--contact-fg);text-align:center;max-width:none}
.contact a{color:var(--contact-fg)}
.contact p{margin:8px 0;font-size:1.05rem}
.form{max-width:560px;margin:24px auto 0;display:grid;gap:12px;text-align:right}
.form h3{text-align:center;font-size:1.1rem;margin-bottom:4px}
.form input,.form textarea{width:100%;padding:12px 14px;border-radius:10px;border:1px solid var(--input-border);background:var(--input-bg);color:var(--input-fg);font-size:1rem;font-family:inherit}
.form textarea{resize:vertical;min-height:90px}
.form button{background:var(--accent);color:var(--accent-contrast);border:none;padding:14px;border-radius:10px;font-weight:700;font-size:1.05rem;cursor:pointer}
footer{padding:26px;text-align:center;color:var(--muted2);font-size:.85rem}
.note{max-width:680px;margin:14px auto 0;text-align:center;color:var(--muted2);font-size:.8rem}
.float{position:fixed;bottom:18px;z-index:50;width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,.3)}
.float.wa{left:18px;background:#25D366}
.float.call{left:84px;background:var(--accent)}
.float svg{width:26px;height:26px;fill:#fff}
.float.call svg{fill:var(--accent-contrast)}
${theme.overrides}
</style></head>
<body>
${body}
<footer>${esc(name)} · נתונים אמיתיים מ-Google Places · נבנה ב-BizSite AI</footer>
${waLink ? `<a class="float wa" href="${esc(waLink)}" target="_blank" rel="noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.78 2.72 4.31 3.82.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/></svg></a>` : ''}
${telLink ? `<a class="float call" href="${esc(telLink)}" aria-label="חיוג"><svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg></a>` : ''}
<script>
// photo carousel - native scroll-snap, dots stay in sync while dragging
(function(){
  var gal=document.getElementById('gal');if(!gal)return;
  var track=gal.querySelector('.cs-track'),slides=gal.querySelectorAll('.cs-slide'),dots=gal.querySelectorAll('.cs-dot');
  if(!track||!slides.length)return;
  var n=slides.length,current=0;
  function snapTo(i){current=Math.max(0,Math.min(i,n-1));track.scrollTo({left:slides[current].offsetLeft,behavior:'smooth'});dots.forEach(function(d,j){d.classList.toggle('active',j===current)})}
  window.csMove=function(d){snapTo(current+d)};
  dots.forEach(function(d){d.addEventListener('click',function(){snapTo(Number(d.getAttribute('data-i')))})});
  track.addEventListener('scroll',function(){var sl=track.scrollLeft,best=0,bd=1e9;for(var j=0;j<slides.length;j++){var dd=Math.abs(slides[j].offsetLeft-sl);if(dd<bd){bd=dd;best=j}}current=best;dots.forEach(function(d,j){d.classList.toggle('active',j===best)})},{passive:true});
  window.addEventListener('resize',function(){track.scrollTo({left:slides[current].offsetLeft})});
})();
// review carousel - transform based so it works in RTL, hides nav when all fit
(function(){
  var gal=document.getElementById('revGal');if(!gal)return;
  var track=gal.querySelector('.cs-track'),slides=gal.querySelectorAll('.cs-slide'),prev=gal.querySelector('.cs-prev'),next=gal.querySelector('.cs-next'),dotWrap=gal.querySelector('.cs-dots'),dots=gal.querySelectorAll('.cs-dot');
  if(!track||!slides.length)return;
  var n=slides.length,current=0,rtl=getComputedStyle(document.documentElement).direction==='rtl';
  function visCount(){var w=slides[0]?slides[0].offsetWidth:track.clientWidth;return Math.max(1,Math.round(track.clientWidth/w))}
  function render(){
    var w=slides[0]?slides[0].offsetWidth:track.clientWidth;
    track.style.transform='translateX('+(current*w*(rtl?1:-1))+'px)';
    dots.forEach(function(d,j){d.classList.toggle('active',j===current)});
    var overflow=n>visCount();
    if(prev)prev.style.display=overflow?'':'none';
    if(next)next.style.display=overflow?'':'none';
    if(dotWrap)dotWrap.style.display=overflow?'':'none';
  }
  function go(i){current=Math.max(0,Math.min(i,Math.max(0,n-visCount())));render()}
  window.revMove=function(d){go(current+d)};
  dots.forEach(function(d){d.addEventListener('click',function(){go(Number(d.getAttribute('data-i')))})});
  window.addEventListener('resize',render);render();
})();
// reveal on scroll
(function(){var els=document.querySelectorAll('.reveal');if(!els.length)return;
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
  els.forEach(function(e){io.observe(e)})})();
</script>
</body></html>`;

  return { html, meta: { name, brief: brief.label, theme: style || brief.theme, sections: brief.sections, photos: photos.length, reviews: reviews.length } };
}
