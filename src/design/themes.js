/**
 * Design themes for generated sites. Ported from the mercator project's
 * `base44/shared/styleThemes.ts` so BizSite builds real sites instead of the
 * one hardcoded layout it used to emit.
 *
 * Nine themes. Each one is pure data: a palette, a Google Fonts link and a
 * block of CSS overrides. The chosen theme is injected as CSS variables on
 * `:root` plus its override block, so `buildSite` never branches on style.
 *
 * Every theme loads a Hebrew-capable face (Heebo, Frank Ruhl Libre, Rubik,
 * Assistant); Latin display faces are secondary fallbacks only.
 */

export const STYLE_THEMES = {
  minimal: {
    label: '🤍 מינימליסטי',
    vars: `--bg:#ffffff;--fg:#111111;--muted:#555;--muted2:#999;--card:#fafafa;--border:#ececec;--accent:#111111;--accent-contrast:#fff;--contact-bg:#111111;--contact-fg:#fff;--input-bg:#f5f5f5;--input-fg:#111;--input-border:#ddd;--radius:8px;--sec-pad:80px;--h1-weight:300;--font-heading:'Heebo';--font-body:'Heebo';--cta-radius:2px;--cta-weight:500;--reveal-dur:.7s;--reveal-ease:cubic-bezier(0.16,1,0.3,1)`,
    fontsLink: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700&display=swap" rel="stylesheet">`,
    overrides: `body{letter-spacing:.01em}.hero h1{font-weight:300;letter-spacing:-.02em}.section h2{font-weight:500;letter-spacing:-.01em}.section h2::after{display:none}.cta{box-shadow:none;border:1px solid var(--fg);background:transparent;color:var(--fg)}.cta.outline{border-color:var(--muted)}.hero .cta{border-color:rgba(255,255,255,.9);color:#fff;background:transparent}.hero .tag{background:transparent;border:1px solid rgba(255,255,255,.5)}.cs-viewport,.single-photo{box-shadow:none;border:1px solid var(--border);border-radius:8px}.review{box-shadow:none;border-radius:8px}.mi{box-shadow:none}`,
  },
  luxury: {
    label: '👑 יוקרתי',
    vars: `--bg:#0a0a0a;--fg:#e8e0d0;--muted:#a89a82;--muted2:#7a7060;--card:#141210;--border:#2a2418;--accent:#c9a24a;--accent-contrast:#0a0a0a;--contact-bg:#000;--contact-fg:#c9a24a;--input-bg:#1a1612;--input-fg:#e8e0d0;--input-border:#3a3220;--radius:2px;--sec-pad:90px;--h1-weight:400;--font-heading:'Frank Ruhl Libre','Cormorant Garamond',serif;--font-body:'Heebo',sans-serif;--cta-radius:1px;--cta-weight:600;--reveal-dur:1s;--reveal-ease:cubic-bezier(0.16,1,0.3,1)`,
    fontsLink: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;500;700&family=Heebo:wght@300;400;500;600&family=Cormorant+Garamond:wght@400;500;600&display=swap" rel="stylesheet">`,
    overrides: `body{letter-spacing:.02em}.hero h1{font-weight:400;letter-spacing:.01em}.section h2{font-weight:400;letter-spacing:.04em}.section h2::after{background:var(--accent);height:1px;width:40px}.cta{background:transparent;color:var(--accent);border:1px solid var(--accent);box-shadow:none;font-weight:600;letter-spacing:.08em;text-transform:uppercase;font-size:.95rem}.cta.outline{border-color:var(--accent)}.hero .tag{background:rgba(201,162,74,.12);border:1px solid rgba(201,162,74,.4);color:var(--accent)}.cs-viewport,.single-photo{box-shadow:0 10px 40px rgba(0,0,0,.5);border:1px solid var(--border)}.contact a{color:var(--accent)}`,
  },
  modern: {
    label: '🚀 מודרני',
    vars: `--bg:#ffffff;--fg:#1a1a1a;--muted:#555;--muted2:#999;--card:#f6f7f9;--border:#eee;--accent:#2563eb;--accent-contrast:#fff;--contact-bg:#111827;--contact-fg:#fff;--input-bg:#1f2937;--input-fg:#fff;--input-border:#334155;--radius:16px;--sec-pad:60px;--h1-weight:800;--font-heading:'Heebo';--font-body:'Heebo';--cta-radius:999px;--cta-weight:700;--reveal-dur:.6s;--reveal-ease:cubic-bezier(0.16,1,0.3,1)`,
    fontsLink: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&display=swap" rel="stylesheet">`,
    overrides: `body{letter-spacing:0}.hero h1{font-weight:800;letter-spacing:-.02em}.cta{box-shadow:0 8px 24px rgba(0,0,0,.18)}.cs-viewport,.single-photo,.review{box-shadow:0 10px 30px rgba(0,0,0,.1)}`,
  },
  business: {
    label: '💼 עסקי',
    vars: `--bg:#ffffff;--fg:#1e293b;--muted:#475569;--muted2:#94a3b8;--card:#f8fafc;--border:#e2e8f0;--accent:#1d4ed8;--accent-contrast:#fff;--contact-bg:#1e293b;--contact-fg:#f1f5f9;--input-bg:#f1f5f9;--input-fg:#1e293b;--input-border:#cbd5e1;--radius:8px;--sec-pad:64px;--h1-weight:700;--font-heading:'Heebo';--font-body:'Heebo';--cta-radius:6px;--cta-weight:600;--reveal-dur:.5s;--reveal-ease:ease`,
    fontsLink: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=swap" rel="stylesheet">`,
    overrides: `body{letter-spacing:0}.hero h1{font-weight:700;letter-spacing:-.01em}.cta{box-shadow:0 4px 14px rgba(29,78,216,.3)}.section h2{font-weight:700}.cs-viewport,.single-photo{box-shadow:0 6px 20px rgba(15,23,42,.12)}.review{box-shadow:none}`,
  },
  creative: {
    label: '🎨 יצירתי',
    vars: `--bg:#fffbeb;--fg:#1a1a2e;--muted:#555;--muted2:#9a9aae;--card:#ffffff;--border:#fde68a;--accent:#8b5cf6;--accent-contrast:#fff;--contact-bg:#1a1a2e;--contact-fg:#fef3c7;--input-bg:#fef3c7;--input-fg:#1a1a2e;--input-border:#fde68a;--radius:24px;--sec-pad:56px;--h1-weight:800;--font-heading:'Rubik','Poppins',sans-serif;--font-body:'Heebo',sans-serif;--cta-radius:999px;--cta-weight:700;--reveal-dur:.6s;--reveal-ease:cubic-bezier(0.34,1.56,0.64,1)`,
    fontsLink: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Rubik:wght@500;600;700;800&family=Heebo:wght@400;500;600&family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet">`,
    overrides: `body{letter-spacing:0}.hero h1{font-weight:800;letter-spacing:-.03em}.section h2{font-weight:800;letter-spacing:-.02em}.cta{background:linear-gradient(135deg,#8b5cf6,#ec4899);box-shadow:0 8px 24px rgba(139,92,246,.4);font-weight:700}.cta.outline{background:transparent;border:2px solid #8b5cf6;color:#8b5cf6}.hero .tag{background:linear-gradient(135deg,rgba(139,92,246,.2),rgba(236,72,153,.2));border:1px solid rgba(139,92,246,.4)}.cs-viewport,.single-photo{border-radius:24px;box-shadow:0 12px 36px rgba(139,92,246,.2)}.review,.mi{border-radius:20px;box-shadow:0 6px 20px rgba(0,0,0,.06)}.section h2::after{background:linear-gradient(90deg,#8b5cf6,#ec4899);height:5px;border-radius:3px}`,
  },
  nature: {
    label: '🌿 טבעי',
    vars: `--bg:#faf8f1;--fg:#2d3b2d;--muted:#5a6b5a;--muted2:#8a9a8a;--card:#f3f0e6;--border:#e3e0d2;--accent:#4d7c3f;--accent-contrast:#fff;--contact-bg:#3b4a32;--contact-fg:#f3f0e6;--input-bg:#f3f0e6;--input-fg:#2d3b2d;--input-border:#d9d5c5;--radius:20px;--sec-pad:70px;--h1-weight:600;--font-heading:'Frank Ruhl Libre','Lora',serif;--font-body:'Heebo',sans-serif;--cta-radius:999px;--cta-weight:600;--reveal-dur:.9s;--reveal-ease:ease-out`,
    fontsLink: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;600;700&family=Heebo:wght@400;500;600&family=Lora:wght@500;600&display=swap" rel="stylesheet">`,
    overrides: `body{letter-spacing:.005em}.hero h1{font-weight:600;letter-spacing:0}.section h2{font-weight:600}.section h2::after{background:var(--accent);height:3px;width:48px;border-radius:3px}.cta{box-shadow:0 6px 18px rgba(77,124,63,.25);font-weight:600}.cs-viewport,.single-photo{border-radius:24px;box-shadow:0 8px 28px rgba(77,124,63,.12)}.review,.mi{border-radius:20px;box-shadow:0 4px 16px rgba(77,124,63,.08)}.hero .tag{background:rgba(77,124,63,.15);border:1px solid rgba(77,124,63,.3)}`,
  },
  hitech: {
    label: '⚡ הייטק',
    vars: `--bg:#0a0f1e;--fg:#e2e8f0;--muted:#94a3b8;--muted2:#64748b;--card:rgba(30,41,59,.6);--border:rgba(148,163,184,.2);--accent:#38bdf8;--accent-contrast:#0a0f1e;--contact-bg:#060a14;--contact-fg:#e2e8f0;--input-bg:rgba(15,23,42,.8);--input-fg:#e2e8f0;--input-border:rgba(56,189,248,.3);--radius:12px;--sec-pad:64px;--h1-weight:700;--font-heading:'Rubik','Space Grotesk',sans-serif;--font-body:'Assistant','Space Grotesk',sans-serif;--cta-radius:8px;--cta-weight:600;--reveal-dur:.5s;--reveal-ease:cubic-bezier(0.16,1,0.3,1)`,
    fontsLink: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&family=Assistant:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">`,
    overrides: `body{letter-spacing:0}.hero h1{font-weight:700;letter-spacing:-.01em}.section h2{font-weight:700;letter-spacing:.02em}.section h2::after{background:linear-gradient(90deg,#38bdf8,#a78bfa);height:3px;box-shadow:0 0 12px #38bdf8}.cta{background:linear-gradient(135deg,#38bdf8,#a78bfa);box-shadow:0 0 20px rgba(56,189,248,.5);font-weight:600}.cta.outline{background:transparent;border:1px solid #38bdf8;color:#38bdf8;box-shadow:0 0 12px rgba(56,189,248,.3)}.hero .tag{background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.4);backdrop-filter:blur(8px)}.cs-viewport,.single-photo{background:rgba(30,41,59,.5);border:1px solid rgba(56,189,248,.2);backdrop-filter:blur(10px);box-shadow:0 0 30px rgba(56,189,248,.15)}.review,.mi{background:rgba(30,41,59,.5);border:1px solid rgba(148,163,184,.2);backdrop-filter:blur(8px)}.map{filter:invert(.9) hue-rotate(180deg)}`,
  },
  dark: {
    label: '🖤 כהה',
    vars: `--bg:#0a0a0a;--fg:#fafafa;--muted:#a3a3a3;--muted2:#737373;--card:#181818;--border:#2e2e2e;--accent:#fafafa;--accent-contrast:#0a0a0a;--contact-bg:#050505;--contact-fg:#fafafa;--input-bg:#1a1a1a;--input-fg:#fafafa;--input-border:#3a3a3a;--radius:12px;--sec-pad:64px;--h1-weight:700;--font-heading:'Heebo';--font-body:'Heebo';--cta-radius:8px;--cta-weight:700;--reveal-dur:.6s;--reveal-ease:ease`,
    fontsLink: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=swap" rel="stylesheet">`,
    overrides: `body{letter-spacing:0}.hero h1{font-weight:700;letter-spacing:-.02em}.section h2{font-weight:700}.cta{box-shadow:0 6px 20px rgba(255,255,255,.15)}.cta.outline{color:var(--fg);border-color:var(--fg)}.hero .tag{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.25)}.cs-viewport,.single-photo{box-shadow:0 8px 30px rgba(0,0,0,.6)}.review,.mi{box-shadow:none}.map{filter:invert(.92) grayscale(.2)}`,
  },
  premium: {
    label: '✨ פרימיום',
    vars: `--bg:#0c0c0c;--fg:#ededed;--muted:#b0b0b0;--muted2:#808080;--card:#161616;--border:#2a2a2a;--accent:#d4af37;--accent-contrast:#0c0c0c;--contact-bg:#050505;--contact-fg:#d4af37;--input-bg:#1a1a1a;--input-fg:#ededed;--input-border:#3a3a3a;--radius:12px;--sec-pad:80px;--h1-weight:600;--font-heading:'Frank Ruhl Libre','Playfair Display',serif;--font-body:'Heebo',sans-serif;--cta-radius:4px;--cta-weight:600;--reveal-dur:1.1s;--reveal-ease:cubic-bezier(0.16,1,0.3,1)`,
    fontsLink: `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;600;700&family=Heebo:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet">`,
    overrides: `body{letter-spacing:.01em}.hero h1{font-weight:600;letter-spacing:.005em}.section h2{font-weight:600;letter-spacing:.03em}.section h2::after{background:linear-gradient(90deg,#d4af37,#c0c0c0);height:2px;width:50px}.cta{background:linear-gradient(135deg,#d4af37,#b8932f);color:#0c0c0c;font-weight:600;box-shadow:0 8px 28px rgba(212,175,55,.35);letter-spacing:.04em}.cta.outline{background:transparent;border:1px solid #d4af37;color:#d4af37;box-shadow:none}.hero .tag{background:rgba(212,175,55,.12);border:1px solid rgba(212,175,55,.4);color:#d4af37}.cs-viewport,.single-photo{box-shadow:0 16px 50px rgba(0,0,0,.6);border:1px solid rgba(212,175,55,.2)}.review,.mi{background:linear-gradient(145deg,#161616,#1a1a1a);border:1px solid rgba(212,175,55,.15)}.contact a{color:#d4af37}`,
  },
};

export function getTheme(key) {
  return STYLE_THEMES[key] || STYLE_THEMES.modern;
}