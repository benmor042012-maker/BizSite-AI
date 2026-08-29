/**
 * Bits every layout uses: sticky header, floating action buttons, footer, and
 * the client-side scripts that run inside the generated page (reveal on
 * scroll, carousels, FAQ accordion, mobile menu).
 *
 * Layouts differ in structure; these differ across none of them. Keeping them
 * here means an authority page and a showcase page pick up the same header
 * behaviour without duplicating markup.
 */

import { esc } from '../escape.js';

/**
 * Sticky header. Starts transparent, gets an opaque background on scroll.
 * `variant`: 'onDark' (over a photo/mesh) or 'onLight'.
 */
export function header({ name, phone, cta, waLink, telLink, variant = 'onDark', nav = [] }) {
  const navHtml = nav.length
    ? `<nav class="site-nav" hidden id="siteNav">${nav.map(n => `<a href="#${esc(n.id)}">${esc(n.label)}</a>`).join('')}</nav>`
    : '';
  return `<header class="site-header ${variant}" id="siteHeader">
  <div class="hdr-inner">
    <a class="brand" href="#top"><span class="brand-mark">◆</span>${esc(name)}</a>
    ${navHtml}
    <div class="hdr-cta">
      ${telLink ? `<a class="hdr-phone" href="${esc(telLink)}" aria-label="חיוג">📞 <span>${esc(phone)}</span></a>` : ''}
      ${waLink ? `<a class="hdr-book" href="${esc(waLink)}" target="_blank" rel="noreferrer">${esc(cta)}</a>` : ''}
      ${nav.length ? `<button class="hdr-toggle" aria-label="תפריט" aria-expanded="false" aria-controls="siteNav">☰</button>` : ''}
    </div>
  </div>
</header>`;
}

/** Floating WhatsApp + call buttons, positioned bottom-left in RTL. */
export function fabs({ waLink, telLink }) {
  return `${waLink ? `<a class="fab wa" href="${esc(waLink)}" target="_blank" rel="noreferrer" aria-label="WhatsApp">
    <svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 01-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.78 2.72 4.31 3.82.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/></svg>
  </a>` : ''}
${telLink ? `<a class="fab call" href="${esc(telLink)}" aria-label="חיוג">
    <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
  </a>` : ''}`;
}

/** Site footer. Real content, not a one-liner. */
export function footer({ name, address, phone, hours, waLink, telLink }) {
  const shownHours = hours.slice(0, 4);
  return `<footer class="site-footer" id="contact">
  <div class="ft-grid">
    <div>
      <div class="ft-brand">${esc(name)}</div>
      ${address ? `<div class="ft-line">📍 ${esc(address)}</div>` : ''}
      ${phone ? `<div class="ft-line"><a href="${esc(telLink)}">📞 ${esc(phone)}</a></div>` : ''}
    </div>
    ${shownHours.length ? `<div>
      <div class="ft-h">שעות פתיחה</div>
      <ul class="ft-hours">${shownHours.map(h => `<li>${esc(h)}</li>`).join('')}</ul>
    </div>` : ''}
    <div>
      <div class="ft-h">יצירת קשר</div>
      ${waLink ? `<a class="ft-btn wa" href="${esc(waLink)}" target="_blank" rel="noreferrer">שליחת הודעה בוואטסאפ</a>` : ''}
      ${telLink ? `<a class="ft-btn" href="${esc(telLink)}">חיוג לעסק</a>` : ''}
    </div>
  </div>
  <div class="ft-fine">© ${new Date().getFullYear()} ${esc(name)} · נבנה ב-BizSite AI · נתונים מ-Google Places</div>
</footer>`;
}

/**
 * The one script tag every layout ships. reveal, carousel (photos), review
 * carousel, FAQ accordion, mobile menu, and a scroll-based `is-scrolled` flag
 * for the sticky header.
 */
export const runtimeScript = `<script>
(function(){
  // sticky header shadow
  var hdr = document.getElementById('siteHeader');
  if (hdr) {
    var flip = function(){ hdr.classList.toggle('is-scrolled', window.scrollY > 40); };
    flip(); window.addEventListener('scroll', flip, {passive:true});
  }
  // mobile nav toggle
  var toggle = document.querySelector('.hdr-toggle'), nav = document.getElementById('siteNav');
  if (toggle && nav) toggle.addEventListener('click', function(){
    var open = nav.hasAttribute('hidden'); if (open) nav.removeAttribute('hidden'); else nav.setAttribute('hidden','');
    toggle.setAttribute('aria-expanded', String(open));
  });
  // reveal on scroll - with a hard fallback so the page never stays half-hidden
  var revs = document.querySelectorAll('.reveal');
  var showAll = function(){ revs.forEach(function(e){ e.classList.add('in'); }); };
  if (!revs.length || !('IntersectionObserver' in window)) { showAll(); }
  else {
    var io = new IntersectionObserver(function(en){ en.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, {threshold:.1, rootMargin:'0px 0px -50px 0px'});
    revs.forEach(function(e){ io.observe(e); });
    // Safety net: any element still hidden 1.5s after load gets revealed anyway.
    setTimeout(showAll, 1500);
  }
  // FAQ accordion
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click', function(){
      var item = btn.parentElement, open = item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.faq-item.is-open').forEach(function(x){ x.classList.remove('is-open'); });
      if (!open) item.classList.add('is-open');
    });
  });
  // photo carousel - native scroll-snap, dots kept in sync
  var gal = document.getElementById('gal');
  if (gal) {
    var track = gal.querySelector('.cs-track'), slides = gal.querySelectorAll('.cs-slide'), dots = gal.querySelectorAll('.cs-dot');
    if (track && slides.length) {
      var i = 0, n = slides.length;
      var snap = function(k){ i = Math.max(0, Math.min(k, n-1)); track.scrollTo({left:slides[i].offsetLeft, behavior:'smooth'}); dots.forEach(function(d,j){ d.classList.toggle('active', j===i); }); };
      window.csMove = function(d){ snap(i+d); };
      dots.forEach(function(d){ d.addEventListener('click', function(){ snap(Number(d.getAttribute('data-i'))); }); });
      track.addEventListener('scroll', function(){ var sl = track.scrollLeft, best = 0, bd = 1e9; for (var j=0; j<n; j++){ var dd = Math.abs(slides[j].offsetLeft - sl); if (dd<bd){ bd = dd; best = j; } } i = best; dots.forEach(function(d,j){ d.classList.toggle('active', j===best); }); }, {passive:true});
    }
  }
  // review carousel - transform based, RTL aware, hides nav if all fit
  var rg = document.getElementById('revGal');
  if (rg) {
    var t2 = rg.querySelector('.cs-track'), sl2 = rg.querySelectorAll('.cs-slide'), prev = rg.querySelector('.cs-prev'), next = rg.querySelector('.cs-next'), dw = rg.querySelector('.cs-dots'), d2 = rg.querySelectorAll('.cs-dot');
    if (t2 && sl2.length) {
      var k = 0, m = sl2.length, rtl = getComputedStyle(document.documentElement).direction === 'rtl';
      var vis = function(){ var w = sl2[0] ? sl2[0].offsetWidth : t2.clientWidth; return Math.max(1, Math.round(t2.clientWidth / w)); };
      var render2 = function(){
        var w = sl2[0] ? sl2[0].offsetWidth : t2.clientWidth;
        t2.style.transform = 'translateX(' + (k * w * (rtl ? 1 : -1)) + 'px)';
        d2.forEach(function(d,j){ d.classList.toggle('active', j===k); });
        var over = m > vis();
        if (prev) prev.style.display = over ? '' : 'none';
        if (next) next.style.display = over ? '' : 'none';
        if (dw) dw.style.display = over ? '' : 'none';
      };
      var go = function(x){ k = Math.max(0, Math.min(x, Math.max(0, m - vis()))); render2(); };
      window.revMove = function(d){ go(k+d); };
      d2.forEach(function(d){ d.addEventListener('click', function(){ go(Number(d.getAttribute('data-i'))); }); });
      window.addEventListener('resize', render2);
      render2();
    }
  }
})();
</script>`;
