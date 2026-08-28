/**
 * 3D export — emits a complete React + Vite project as a file map.
 *
 * The flat builder writes one HTML string, which is all a Worker can serve
 * directly. The MotionSites prompts assume React 18, Vite, TypeScript, Tailwind,
 * Framer Motion and React Three Fiber, so the 3D path produces a real project
 * the user unzips and runs instead. Everything is template-driven: the business
 * data comes from Places, the look comes from the category's preset.
 *
 * The originating prompt ships as PROMPT.md so the same design can be taken to
 * Lovable, Cursor or Claude for variants this scaffold does not cover.
 */

import { getBrief } from '../categories.js';
import { getPreset } from './presets.js';

/**
 * Latin-safe directory and npm package name.
 *
 * `\w` is ASCII-only, so stripping non-word characters turns any all-Hebrew
 * name into the empty string and every export would land in the same folder.
 * Hebrew letters are transliterated instead, which keeps names distinct and
 * recognisable (מסעדת הים -> `msedt-hym`).
 */
const HE_LATIN = {
  א: '', ב: 'b', ג: 'g', ד: 'd', ה: 'h', ו: 'v', ז: 'z', ח: 'ch', ט: 't', י: 'y',
  כ: 'k', ך: 'k', ל: 'l', מ: 'm', ם: 'm', נ: 'n', ן: 'n', ס: 's', ע: '', פ: 'p',
  ף: 'f', צ: 'tz', ץ: 'tz', ק: 'k', ר: 'r', ש: 'sh', ת: 't',
};

export function slugify(name) {
  const latin = String(name || '')
    .replace(/[\u0590-\u05FF]/g, ch => (ch in HE_LATIN ? HE_LATIN[ch] : ''))
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return latin || 'business';
}

const j = v => JSON.stringify(v, null, 2);

/** Geometry element per preset. Kept as JSX text so no runtime import is needed. */
const GEOMETRY_JSX = {
  torus: '<torusGeometry args={[1.6, 0.55, 32, 96]} />',
  torusKnot: '<torusKnotGeometry args={[1.3, 0.42, 160, 32]} />',
  sphere: '<sphereGeometry args={[1.9, 64, 64]} />',
  box: '<boxGeometry args={[2.4, 2.4, 2.4]} />',
  icosahedron: '<icosahedronGeometry args={[2, 1]} />',
  octahedron: '<octahedronGeometry args={[2.1, 0]} />',
  plane: '<planeGeometry args={[4, 2.6, 32, 32]} />',
};

/**
 * @param {object} o
 * @param {object} o.lead    business record from the map.
 * @param {object|null} o.place raw Places detail.
 * @param {string} o.promptText contents of the vendored prompt, or ''.
 * @returns {{files: Record<string,string>, dir: string, preset: object}}
 */
export function buildScaffold({ lead, place, promptText = '' }) {
  const brief = getBrief(lead.cat);
  const preset = getPreset(brief.three);
  const dir = `${slugify(lead.name)}-3d`;

  const business = {
    name: place?.displayName?.text || lead.name,
    category: brief.label,
    city: lead.cityLabel || lead.city || '',
    address: place?.formattedAddress || lead.addr || '',
    phone: place?.nationalPhoneNumber || lead.phone || '',
    whatsapp: String(place?.internationalPhoneNumber || lead.phone || '').replace(/\D/g, ''),
    rating: typeof place?.rating === 'number' ? place.rating : (lead.rating || 0),
    reviewCount: place?.userRatingCount || 0,
    about: place?.editorialSummary?.text || brief.copy.about,
    cta: brief.cta,
    whatsappMessage: brief.wa,
    valueProps: brief.copy.valueProps,
    services: brief.copy.services,
    hours: place?.regularOpeningHours?.weekdayDescriptions || [],
    reviews: lead.reviews || [],
  };

  const files = {};
  const put = (path, content) => { files[`${dir}/${path}`] = content; };

  put('package.json', j({
    name: slugify(lead.name) + '-3d',
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: { dev: 'vite', build: 'tsc -b && vite build', preview: 'vite preview' },
    dependencies: {
      '@react-three/drei': '^9.114.0',
      '@react-three/fiber': '^8.17.10',
      'framer-motion': '^11.11.0',
      'lucide-react': '^0.454.0',
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      three: '^0.169.0',
    },
    devDependencies: {
      '@types/react': '^18.3.12',
      '@types/react-dom': '^18.3.1',
      '@types/three': '^0.169.0',
      '@vitejs/plugin-react': '^4.3.3',
      autoprefixer: '^10.4.20',
      postcss: '^8.4.47',
      tailwindcss: '^3.4.14',
      typescript: '^5.6.3',
      vite: '^5.4.10',
    },
  }));

  put('vite.config.ts', `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({ plugins: [react()] });
`);

  put('tsconfig.json', j({
    compilerOptions: {
      target: 'ES2020', useDefineForClassFields: true,
      lib: ['ES2020', 'DOM', 'DOM.Iterable'], module: 'ESNext',
      skipLibCheck: true, moduleResolution: 'bundler',
      allowImportingTsExtensions: true, resolveJsonModule: true,
      isolatedModules: true, noEmit: true, jsx: 'react-jsx',
      strict: true, noUnusedLocals: true, noUnusedParameters: true,
    },
    include: ['src'],
  }));

  put('tailwind.config.js', `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '${preset.bg}',
        brand: '${preset.primary}',
        brand2: '${preset.secondary}',
      },
    },
  },
  plugins: [],
};
`);

  put('postcss.config.js', `export default { plugins: { tailwindcss: {}, autoprefixer: {} } };\n`);

  put('index.html', `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${business.name} — ${business.category}${business.city ? ` ב${business.city}` : ''}</title>
    <meta name="description" content="${business.about.replace(/"/g, '&quot;').slice(0, 150)}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

  put('src/index.css', `@tailwind base;
@tailwind components;
@tailwind utilities;

:root { color-scheme: dark; }
html, body, #root { height: 100%; }
body {
  margin: 0;
  background: ${preset.bg};
  color: #fff;
  font-family: 'Heebo', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
/* The 3D scene is decorative; honour a reduced-motion preference. */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}
`);

  put('src/main.tsx', `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`);

  put('src/data/business.ts', `/**
 * Real data pulled from this business's Google Places profile at export time.
 * Regenerate from BizSite rather than hand-editing, so the site keeps matching
 * what Google shows.
 */
export const business = ${j(business)} as const;

export type Business = typeof business;
`);

  put('src/components/Hero3D.tsx', `import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import type { Mesh } from 'three';

/**
 * The category's 3D signature. Preset: "${brief.three}" (${preset.label}).
 * Derived from the MotionSites specification in PROMPT.md.
 */
function Shape() {
  const ref = useRef<Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.y += delta * ${preset.rotationSpeed};
    ref.current.rotation.x += delta * ${(preset.rotationSpeed / 3).toFixed(3)};
  });
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={${preset.floatAmplitude}}>
      <mesh ref={ref}>
        ${GEOMETRY_JSX[preset.geometry] || GEOMETRY_JSX.sphere}
        <meshStandardMaterial
          color="${preset.primary}"
          metalness={${preset.metalness}}
          roughness={${preset.roughness}}
          envMapIntensity={1.4}
        />
      </mesh>
    </Float>
  );
}

/** Static starfield. Positions are generated once, not per frame. */
function Particles() {
  const count = ${preset.particleCount};
  const positions = useRef<Float32Array>();
  if (!positions.current) {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) arr[i] = (Math.random() - 0.5) * 34;
    positions.current = arr;
  }
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.035} color="${preset.secondary}" transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 9], fov: 45 }}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['${preset.bg}']} />
        <fog attach="fog" args={['${preset.bg}', ${preset.fog[0]}, ${preset.fog[1]}]} />
        <ambientLight intensity={0.25} />
        <pointLight position={[10, 10, 10]} intensity={1.6} color="${preset.primary}" />
        <pointLight position={[-10, -8, -10]} intensity={1.1} color="${preset.secondary}" />
        <directionalLight position={[0, 5, 5]} intensity={1.4} />
        <Suspense fallback={null}>
          <Shape />
          <Particles />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
`);

  put('src/components/HeroContent.tsx', `import { motion } from 'framer-motion';
import { Phone, MessageCircle, Star } from 'lucide-react';
import { business } from '../data/business';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function HeroContent() {
  const wa = business.whatsapp
    ? \`https://wa.me/\${business.whatsapp}?text=\${encodeURIComponent(business.whatsappMessage)}\`
    : '';

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 text-center md:px-8"
    >
      {business.rating > 0 && (
        <motion.span
          variants={item}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur-md"
        >
          <Star className="h-4 w-4 fill-brand text-brand" />
          {business.rating.toFixed(1)}
          {business.reviewCount > 0 && \` · \${business.reviewCount} ביקורות בגוגל\`}
        </motion.span>
      )}

      <motion.h1 variants={item} className="text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
        {business.name}
      </motion.h1>

      <motion.p variants={item} className="mt-4 text-lg font-light text-white/70 md:text-xl">
        {business.category}
        {business.city && \` · \${business.city}\`}
      </motion.p>

      <motion.p variants={item} className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/60">
        {business.about}
      </motion.p>

      <motion.div variants={item} className="mt-9 flex flex-wrap items-center justify-center gap-3">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 font-bold text-ink transition hover:-translate-y-0.5"
          >
            <MessageCircle className="h-5 w-5" />
            {business.cta}
          </a>
        )}
        {business.phone && (
          <a
            href={\`tel:\${business.phone}\`}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-semibold transition hover:bg-white/10"
          >
            <Phone className="h-5 w-5" />
            {business.phone}
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}
`);

  put('src/components/Sections.tsx', `import { motion } from 'framer-motion';
import { Check, MapPin, Clock } from 'lucide-react';
import { business } from '../data/business';

const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="mx-auto max-w-5xl px-6 py-20"
    >
      <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl">{title}</h2>
      {children}
    </motion.section>
  );
}

export default function Sections() {
  return (
    <>
      <div className="flex flex-wrap justify-center gap-3 border-y border-white/10 px-6 py-8">
        {business.valueProps.map((p) => (
          <span key={p} className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm">
            <Check className="h-4 w-4 text-brand" />
            {p}
          </span>
        ))}
      </div>

      <Section title="השירותים שלנו">
        <div className="grid gap-5 md:grid-cols-3">
          {business.services.map((s, i) => (
            <div key={s} className="rounded-2xl border border-white/10 bg-white/5 p-7 text-center backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand font-bold text-ink">
                {i + 1}
              </div>
              <p className="font-semibold">{s}</p>
            </div>
          ))}
        </div>
      </Section>

      {business.reviews.length > 0 && (
        <Section title="מה הלקוחות אומרים">
          <div className="grid gap-5 md:grid-cols-3">
            {business.reviews.map((r, i) => (
              <blockquote key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <div className="mb-3 tracking-widest text-brand">{'★'.repeat(Math.round(r.rating))}</div>
                <p className="italic leading-relaxed text-white/70">{r.text}</p>
                <footer className="mt-4 text-sm text-white/40">— {r.author} · Google</footer>
              </blockquote>
            ))}
          </div>
        </Section>
      )}

      {business.hours.length > 0 && (
        <Section title="שעות פתיחה">
          <ul className="mx-auto max-w-md">
            {business.hours.map((h) => (
              <li key={h} className="flex items-center gap-3 border-b border-white/10 py-3 text-white/70">
                <Clock className="h-4 w-4 shrink-0 text-brand" />
                {h}
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="פרטים ויצירת קשר">
        <div className="space-y-3 text-center text-lg text-white/80">
          {business.address && (
            <p className="flex items-center justify-center gap-2">
              <MapPin className="h-5 w-5 text-brand" />
              {business.address}
            </p>
          )}
          {business.phone && (
            <p>
              <a className="hover:text-brand" href={\`tel:\${business.phone}\`}>
                {business.phone}
              </a>
            </p>
          )}
        </div>
      </Section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/35">
        {business.name} · נתונים מ-Google Places · נבנה ב-BizSite AI
      </footer>
    </>
  );
}
`);

  put('src/App.tsx', `import Hero3D from './components/Hero3D';
import HeroContent from './components/HeroContent';
import Sections from './components/Sections';

export default function App() {
  return (
    <main>
      <section className="relative min-h-screen overflow-hidden">
        <Hero3D />
        <HeroContent />
      </section>
      <Sections />
    </main>
  );
}
`);

  put('README.md', `# ${business.name} — אתר תלת-ממד

נוצר אוטומטית ב-BizSite AI מנתוני Google Places אמיתיים.

- **קטגוריה:** ${business.category}
- **ערכת תנועה:** \`${brief.three}\` — ${preset.label}

## הרצה

\`\`\`bash
npm install
npm run dev
\`\`\`

## מבנה

| קובץ | תפקיד |
|---|---|
| \`src/data/business.ts\` | נתוני העסק. הפקה מחדש מ-BizSite עדיפה על עריכה ידנית. |
| \`src/components/Hero3D.tsx\` | סצנת React Three Fiber לפי ערכת הקטגוריה. |
| \`src/components/HeroContent.tsx\` | שכבת הטקסט מעל הסצנה. |
| \`src/components/Sections.tsx\` | שירותים, ביקורות, שעות ויצירת קשר. |
| \`PROMPT.md\` | המפרט שממנו נגזר העיצוב — להדבקה ב-Lovable / Cursor / Claude לוריאציות. |

## וריאציות

\`PROMPT.md\` הוא מפרט עיצוב מלא. הדביקו אותו בכלי AI לבניית קוד יחד עם
\`src/data/business.ts\`, ובקשו וריאציה — הנתונים נשארים אמיתיים והעיצוב משתנה.
`);

  put('PROMPT.md', promptText || `# מפרט העיצוב לא נטען

הקובץ ${preset.prompt} לא נמצא ב-vendor/motionsites-prompts/prompts/ בזמן הייצוא.
`);

  put('.gitignore', 'node_modules\ndist\n.DS_Store\n');

  return { files, dir, preset, brief };
}
