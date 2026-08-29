/**
 * All the CSS a generated page ships. Split into a base block plus one block
 * per archetype so the browser only receives what the layout actually uses.
 *
 * `--sec-pad` in the theme tokens used to be 56-90px top AND bottom around a
 * couple of lines of text, which is what gave the old pages their empty look.
 * This CSS drops it in favour of tighter, per-archetype spacing.
 */

/** Foundations everything uses: reset, tokens, header, footer, FABs, motion. */
export const BASE_CSS = `
*{margin:0;padding:0;box-sizing:border-box;font-family:var(--font-body),'Segoe UI',system-ui,sans-serif}
h1,h2,h3,h4{font-family:var(--font-heading);line-height:1.15;letter-spacing:-0.01em}
body{color:var(--fg);background:var(--bg);line-height:1.55}
a{color:inherit;text-decoration:none}
img{max-width:100%;display:block}
button{border:0;background:none;font:inherit;color:inherit;cursor:pointer}
.reveal{opacity:0;transform:translateY(24px);transition:opacity .6s var(--reveal-ease,ease),transform .6s var(--reveal-ease,ease)}
.reveal.in{opacity:1;transform:none}
@media(prefers-reduced-motion:reduce){.reveal{opacity:1!important;transform:none!important;transition:none!important}}

/* ---- header ---- */
.site-header{position:fixed;top:0;inset-inline:0;z-index:40;transition:background .25s,box-shadow .25s,padding .25s}
.hdr-inner{max-width:1200px;margin:0 auto;padding:14px 24px;display:flex;align-items:center;gap:18px}
.brand{font-weight:800;font-size:1.05rem;display:flex;align-items:center;gap:10px}
.brand-mark{color:var(--accent);font-size:.9em}
.site-nav{margin-inline-start:24px;display:flex;gap:20px;font-size:.92rem}
.site-nav a{opacity:.75}
.site-nav a:hover{opacity:1}
.hdr-cta{margin-inline-start:auto;display:flex;align-items:center;gap:10px}
.hdr-phone{font-size:.88rem;opacity:.85}
.hdr-phone span{display:inline}
.hdr-book{background:var(--accent);color:var(--accent-contrast);padding:9px 18px;border-radius:999px;font-weight:700;font-size:.9rem;transition:transform .15s}
.hdr-book:hover{transform:translateY(-1px)}
.hdr-toggle{display:none;font-size:1.4rem;padding:6px 10px}
.site-header.onDark{color:#fff}
.site-header.onDark .hdr-book{color:#0a0a0a}
.site-header.is-scrolled{background:rgba(10,12,16,.85);backdrop-filter:blur(14px);box-shadow:0 6px 24px rgba(0,0,0,.25)}
.site-header.onLight.is-scrolled{background:rgba(255,255,255,.92);color:var(--fg);box-shadow:0 4px 20px rgba(0,0,0,.06)}
@media(max-width:760px){
  .site-nav{position:fixed;inset-inline:12px;top:64px;background:rgba(10,12,16,.94);backdrop-filter:blur(14px);border-radius:14px;padding:12px;flex-direction:column;gap:4px}
  .site-nav a{padding:12px 14px;border-radius:10px;background:rgba(255,255,255,.05)}
  .hdr-toggle{display:block}
  .hdr-phone span{display:none}
  .hdr-book{padding:8px 14px;font-size:.85rem}
}

/* ---- footer ---- */
.site-footer{background:linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.15));padding:44px 24px 24px;margin-top:60px;border-top:1px solid var(--border)}
.ft-grid{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px}
.ft-brand{font-family:var(--font-heading);font-weight:800;font-size:1.25rem;margin-bottom:10px}
.ft-line{color:var(--muted);font-size:.95rem;margin:4px 0}
.ft-line a{color:inherit}
.ft-h{font-weight:700;font-size:.9rem;margin-bottom:10px;letter-spacing:.04em}
.ft-hours{list-style:none;color:var(--muted);font-size:.9rem}
.ft-hours li{padding:3px 0}
.ft-btn{display:block;padding:11px 16px;border-radius:10px;text-align:center;font-weight:600;margin-top:8px;border:1px solid var(--border);color:var(--fg);background:var(--card)}
.ft-btn.wa{background:#25D366;color:#fff;border-color:#25D366}
.ft-btn:hover{transform:translateY(-1px)}
.ft-fine{max-width:1100px;margin:32px auto 0;padding-top:20px;border-top:1px solid var(--border);color:var(--muted2);font-size:.8rem;text-align:center}
@media(max-width:760px){.ft-grid{grid-template-columns:1fr;gap:24px}}

/* ---- FABs (only WA and call, no map) ---- */
.fab{position:fixed;bottom:20px;width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 20px rgba(0,0,0,.35);z-index:35;transition:transform .15s}
.fab:hover{transform:translateY(-2px) scale(1.05)}
.fab.wa{inset-inline-start:20px;background:#25D366}
.fab.call{inset-inline-start:82px;background:var(--accent)}
.fab svg{width:26px;height:26px;fill:#fff}
.fab.call svg{fill:var(--accent-contrast,#fff)}

/* ---- shared bits used across layouts ---- */
.cta{display:inline-flex;align-items:center;gap:8px;background:var(--accent);color:var(--accent-contrast);padding:14px 30px;border-radius:var(--cta-radius,999px);font-weight:var(--cta-weight,700);font-size:1rem;transition:transform .15s,box-shadow .15s;box-shadow:0 8px 24px rgba(0,0,0,.25)}
.cta:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.32)}
.cta.ghost{background:transparent;color:inherit;border:1.5px solid currentColor;box-shadow:none}
.pill{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);padding:6px 12px;border-radius:999px;font-size:.82rem;font-weight:600;backdrop-filter:blur(8px)}
.stars{color:#f59e0b;letter-spacing:2px}
.container{max-width:1200px;margin:0 auto;padding:0 24px}
.hgroup{margin-bottom:28px}
.eyebrow{font-size:.78rem;font-weight:800;letter-spacing:.14em;color:var(--accent);text-transform:uppercase;margin-bottom:8px}
.h2{font-size:clamp(1.7rem,3.5vw,2.4rem);font-weight:800}
.lead{font-size:1.05rem;color:var(--muted);max-width:640px;margin-top:8px}
`;

/** showcase archetype: photo-forward, alternating bands, magazine feel. */
export const SHOWCASE_CSS = `
.arc-showcase .hero{position:relative;min-height:82vh;display:flex;align-items:flex-end;padding:120px 24px 60px;color:#fff;overflow:hidden}
.arc-showcase .hero .bg{position:absolute;inset:0;object-fit:cover;z-index:0}
.arc-showcase .hero .scrim{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,.25) 50%,rgba(0,0,0,.65) 100%)}
.arc-showcase .hero .inner{position:relative;z-index:2;max-width:1200px;width:100%;margin:0 auto}
.arc-showcase .hero .tag{color:#fff;background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.25)}
.arc-showcase .hero h1{font-size:clamp(2.6rem,6.5vw,5rem);font-weight:800;max-width:12ch;margin:18px 0 12px;text-shadow:0 4px 30px rgba(0,0,0,.4)}
.arc-showcase .hero .sub{font-size:clamp(1.05rem,1.6vw,1.35rem);opacity:.92;max-width:52ch;margin-bottom:26px}
.arc-showcase .hero .cta-row{display:flex;gap:12px;flex-wrap:wrap}
.arc-showcase .band{padding:64px 0}
.arc-showcase .band.tight{padding:44px 0}
.arc-showcase .band.alt{background:linear-gradient(180deg,var(--card),transparent)}
.arc-showcase .band.full{background:var(--card);border-block:1px solid var(--border)}
.arc-showcase .about-grid{display:grid;grid-template-columns:1.4fr .9fr;gap:56px;align-items:start}
.arc-showcase .pullquote{font-family:var(--font-heading);font-size:clamp(1.5rem,2.4vw,2rem);line-height:1.35;color:var(--fg)}
.arc-showcase .pullquote:before{content:"“";font-size:3em;line-height:0;color:var(--accent);margin-inline-end:.15em;vertical-align:-0.5em}
.arc-showcase .stats{display:grid;grid-template-columns:1fr;gap:18px}
.arc-showcase .stat{padding:16px 20px;border-inline-start:3px solid var(--accent);background:var(--card)}
.arc-showcase .stat .n{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:1.9rem;font-weight:700;color:var(--accent);line-height:1}
.arc-showcase .stat .l{font-size:.85rem;color:var(--muted);margin-top:4px}
.arc-showcase .svc-list{display:grid;grid-template-columns:repeat(2,1fr);gap:32px 48px}
.arc-showcase .svc-item{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:start}
.arc-showcase .svc-num{font-family:'JetBrains Mono',ui-monospace,monospace;color:var(--accent);font-weight:700;font-size:.9rem;padding-top:6px;letter-spacing:.05em}
.arc-showcase .svc-t{font-weight:700;font-size:1.1rem;margin-bottom:4px}
.arc-showcase .svc-d{color:var(--muted);font-size:.95rem;line-height:1.6}
.arc-showcase .gal-grid{display:grid;grid-template-columns:2fr 1fr 1fr;grid-template-rows:180px 180px;gap:14px}
.arc-showcase .gal-grid a{border-radius:14px;overflow:hidden;background:var(--card)}
.arc-showcase .gal-grid a:nth-child(1){grid-row:1/3}
.arc-showcase .gal-grid img{width:100%;height:100%;object-fit:cover}
.arc-showcase .rev-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.arc-showcase .rev-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:26px}
.arc-showcase .rev-card p{color:var(--muted);line-height:1.65;font-style:italic;margin:10px 0 14px}
.arc-showcase .rev-card .who{font-size:.85rem;color:var(--muted2)}
.arc-showcase .info-split{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start}
.arc-showcase .info-split .map{width:100%;height:280px;border:0;border-radius:14px;background:var(--card)}
.arc-showcase .info-block h3{font-size:1.1rem;margin-bottom:14px}
.arc-showcase .info-block ul{list-style:none}
.arc-showcase .info-block li{padding:8px 0;border-bottom:1px dashed var(--border);color:var(--muted);display:flex;justify-content:space-between}
@media(max-width:820px){
  .arc-showcase .hero{min-height:70vh;padding:100px 20px 40px}
  .arc-showcase .about-grid,.arc-showcase .info-split{grid-template-columns:1fr;gap:28px}
  .arc-showcase .svc-list{grid-template-columns:1fr;gap:24px}
  .arc-showcase .gal-grid{grid-template-columns:1fr 1fr;grid-template-rows:160px 160px 160px}
  .arc-showcase .gal-grid a:nth-child(1){grid-row:1/2;grid-column:1/-1}
}
`;

/** authority archetype: split hero with a booking card, deep in-page structure. */
export const AUTHORITY_CSS = `
.arc-authority .hero{position:relative;padding:110px 24px 80px;color:#fff;overflow:hidden;min-height:640px;display:flex;align-items:center}
.arc-authority .hero .bg{position:absolute;inset:0;z-index:0}
.arc-authority .hero .scrim{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,.55) 100%)}
.arc-authority .hero .inner{position:relative;z-index:2;max-width:1200px;width:100%;margin:0 auto;display:grid;grid-template-columns:1.15fr .85fr;gap:56px;align-items:center}
.arc-authority .hero .tag{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.22);color:#fff}
.arc-authority .hero h1{font-size:clamp(2.2rem,5vw,3.6rem);font-weight:800;max-width:16ch;margin:16px 0 14px}
.arc-authority .hero .sub{font-size:clamp(1rem,1.4vw,1.2rem);opacity:.92;max-width:44ch;margin-bottom:22px;line-height:1.6}
.arc-authority .trust-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:26px}
.arc-authority .cta-row{display:flex;gap:12px;flex-wrap:wrap}
.arc-authority .book{background:rgba(255,255,255,.98);color:var(--fg);border-radius:22px;padding:26px 24px;box-shadow:0 30px 60px rgba(0,0,0,.35);position:relative}
.arc-authority .book h3{font-size:1.05rem;margin-bottom:14px;color:var(--fg)}
.arc-authority .book .row{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:1px solid #eee;font-size:.92rem;color:#374151}
.arc-authority .book .row:last-of-type{border-bottom:0}
.arc-authority .book .row b{color:#111}
.arc-authority .book .btns{display:grid;gap:8px;margin-top:16px}
.arc-authority .book .btns a{padding:12px 16px;border-radius:12px;font-weight:700;text-align:center;font-size:.95rem}
.arc-authority .book .btns .wa{background:#25D366;color:#fff}
.arc-authority .book .btns .tel{background:var(--accent);color:var(--accent-contrast)}
.arc-authority .section{padding:70px 0}
.arc-authority .section.tight{padding:48px 0}
.arc-authority .band-alt{background:var(--card);border-block:1px solid var(--border)}
.arc-authority .svc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.arc-authority .svc-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:26px;position:relative}
.arc-authority .svc-card .n{position:absolute;top:20px;inset-inline-end:22px;font-family:'JetBrains Mono',ui-monospace,monospace;color:var(--accent);opacity:.55;font-weight:700}
.arc-authority .svc-card h3{font-size:1.12rem;margin-bottom:8px;padding-inline-end:38px}
.arc-authority .svc-card p{color:var(--muted);font-size:.95rem;line-height:1.65}
.arc-authority .why-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.arc-authority .why-card{padding:24px;border-radius:14px;background:linear-gradient(135deg,var(--card),transparent);border:1px solid var(--border)}
.arc-authority .why-card .lbl{color:var(--accent);font-weight:800;font-size:.85rem;letter-spacing:.08em;margin-bottom:6px;text-transform:uppercase}
.arc-authority .why-card .txt{font-size:1.05rem;font-weight:600}
.arc-authority .faq-item{border-bottom:1px solid var(--border);padding:6px 0}
.arc-authority .faq-q{width:100%;text-align:start;padding:20px 8px;font-weight:700;font-size:1.02rem;display:flex;justify-content:space-between;align-items:center;gap:16px}
.arc-authority .faq-q:after{content:"+";color:var(--accent);font-size:1.5rem;font-weight:400;transition:transform .2s}
.arc-authority .faq-item.is-open .faq-q:after{transform:rotate(45deg)}
.arc-authority .faq-a{max-height:0;overflow:hidden;transition:max-height .3s ease;color:var(--muted);line-height:1.7}
.arc-authority .faq-item.is-open .faq-a{max-height:400px;padding:0 8px 20px}
.arc-authority .info-split{display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start}
.arc-authority .info-split .map{width:100%;height:320px;border:0;border-radius:14px;background:var(--card)}
.arc-authority .info-block ul{list-style:none}
.arc-authority .info-block li{padding:10px 0;border-bottom:1px dashed var(--border);color:var(--muted);display:flex;justify-content:space-between}
.arc-authority .rev-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.arc-authority .rev-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:24px}
.arc-authority .rev-card p{color:var(--muted);font-style:italic;line-height:1.65;margin:8px 0 12px}
.arc-authority .rev-card .who{font-size:.85rem;color:var(--muted2)}
@media(max-width:820px){
  .arc-authority .hero{padding:100px 20px 40px;min-height:auto}
  .arc-authority .hero .inner{grid-template-columns:1fr;gap:32px}
  .arc-authority .svc-grid,.arc-authority .why-grid,.arc-authority .info-split{grid-template-columns:1fr}
}
`;

/** local archetype: booking-forward, compact hero, price-list services. */
export const LOCAL_CSS = `
.arc-local .hero{position:relative;padding:110px 24px 60px;min-height:520px;display:flex;align-items:center;color:#fff;overflow:hidden}
.arc-local .hero .bg{position:absolute;inset:0;z-index:0}
.arc-local .hero .scrim{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(0,0,0,.2) 0%,rgba(0,0,0,.55) 100%)}
.arc-local .hero .inner{position:relative;z-index:2;max-width:1200px;width:100%;margin:0 auto;text-align:center}
.arc-local .hero .tag{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.24);color:#fff}
.arc-local .hero h1{font-size:clamp(2.4rem,6vw,4.2rem);font-weight:800;margin:18px 0 12px;max-width:20ch;margin-inline:auto}
.arc-local .hero .sub{font-size:clamp(1rem,1.5vw,1.2rem);opacity:.92;max-width:44ch;margin:0 auto 24px}
.arc-local .hero .cta-row{display:flex;gap:12px;flex-wrap:wrap;justify-content:center}
.arc-local .hero .cta.big{padding:18px 36px;font-size:1.05rem}
.arc-local .status-bar{background:var(--card);border-block:1px solid var(--border);padding:18px 24px}
.arc-local .status-inner{max-width:1100px;margin:0 auto;display:flex;flex-wrap:wrap;gap:24px;align-items:center;justify-content:space-around;font-size:.95rem}
.arc-local .status-inner b{color:var(--accent);font-weight:700}
.arc-local .status-inner .live{font-weight:800}
.arc-local .status-inner .live.open{color:#16a34a}
.arc-local .status-inner .live.closed{color:#dc2626}
.arc-local .section{padding:60px 0}
.arc-local .section.tight{padding:40px 0}
.arc-local .price-list{display:grid;grid-template-columns:repeat(2,1fr);gap:0 48px;background:var(--card);border-radius:18px;padding:8px 32px;border:1px solid var(--border)}
.arc-local .price-item{padding:22px 0;border-bottom:1px dashed var(--border);display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:baseline}
.arc-local .price-item:last-child,.arc-local .price-item:nth-last-child(2){border-bottom:0}
.arc-local .price-item .num{font-family:'JetBrains Mono',ui-monospace,monospace;color:var(--accent);font-weight:700;font-size:.9rem;letter-spacing:.05em}
.arc-local .price-item .title{font-weight:700;font-size:1.05rem}
.arc-local .price-item .desc{grid-column:2;color:var(--muted);font-size:.9rem;line-height:1.6;margin-top:4px}
.arc-local .price-item .cta-inline{color:var(--accent);font-weight:700;font-size:.9rem;white-space:nowrap}
.arc-local .why-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;text-align:center}
.arc-local .why-strip .w{padding:24px 12px}
.arc-local .why-strip .w .n{color:var(--accent);font-size:1.5rem;margin-bottom:8px}
.arc-local .why-strip .w .t{font-weight:700}
.arc-local .gal-strip{display:flex;gap:14px;overflow-x:auto;padding-bottom:8px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}
.arc-local .gal-strip::-webkit-scrollbar{display:none}
.arc-local .gal-strip a{flex:0 0 320px;height:220px;border-radius:14px;overflow:hidden;scroll-snap-align:start;background:var(--card)}
.arc-local .gal-strip img{width:100%;height:100%;object-fit:cover}
.arc-local .rev-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}
.arc-local .rev-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px}
.arc-local .rev-card p{color:var(--muted);font-style:italic;line-height:1.6;margin:8px 0 12px;font-size:.95rem}
.arc-local .rev-card .who{font-size:.82rem;color:var(--muted2)}
.arc-local .info-split{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}
.arc-local .info-split .map{width:100%;height:280px;border:0;border-radius:14px;background:var(--card)}
.arc-local .info-split ul{list-style:none}
.arc-local .info-split li{padding:8px 0;border-bottom:1px dashed var(--border);color:var(--muted);display:flex;justify-content:space-between}
@media(max-width:820px){
  .arc-local .hero{padding:100px 20px 40px;min-height:auto}
  .arc-local .price-list{grid-template-columns:1fr;padding:8px 20px}
  .arc-local .why-strip{grid-template-columns:repeat(2,1fr)}
  .arc-local .info-split{grid-template-columns:1fr}
}
`;

export const ARCHETYPE_CSS = {
  showcase: SHOWCASE_CSS,
  authority: AUTHORITY_CSS,
  local: LOCAL_CSS,
};
