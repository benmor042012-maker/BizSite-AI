# BizSite AI

Static site on Cloudflare Workers. It scans real businesses via the Google
Places API (New), then builds each one a complete marketing site from that same
Places record — either a flat single-file page or a React + Three.js project you
download and run.

The map colours each business by its web presence — that's the whole point of
the tool:

| Status  | Label     | Meaning                                        |
|---------|-----------|------------------------------------------------|
| `gold`  | אין אתר   | No website at all — the prime lead             |
| `red`   | אתר חלש   | Only a Facebook/Instagram/aggregator page      |
| `green` | אתר טוב   | Has a real site of its own                     |

## Two paths, one endpoint

`/api/site` serves a generated site through one of two paths:

- **AI path** (default when `env.AI` binding is present) — Cloudflare Workers
  AI runs `@cf/meta/llama-3.3-70b-instruct-fp8-fast` with a rich prompt built
  from the business's Places record, the resolved theme, and the category
  brief. The model writes the entire HTML document. Output is sanitised
  (scripts, event handlers and non-Google-Maps iframes are stripped) and
  verified before being served. Falls back silently to the template path on
  any of: quota, error, or unsafe output.

- **Template path** (`?llm=0`, or automatic fallback) — three deterministic
  layout archetypes (`showcase` / `authority` / `local`) driven by
  per-category briefs. Zero cost, milliseconds to render, always works.

The `X-BizSite-Source` response header names which path served the request
(`llm` or `template`). The frontend surfaces this as a badge in the style bar.

### What "free" means

Cloudflare Workers AI includes a free tier of 10,000 neurons/day. A single
Llama 3.3 70B site build runs ~40–80 neurons, so the free tier fits roughly
120–250 unique site generations per day, cached for 30 days each. No card,
no key, no external API — the model runs inside the Worker.

There is no Anthropic key involved anywhere. No paid API of any kind.

## The design system



Every trade gets its own design, not a shared template. `src/design/categories.js`
holds one **brief** per category — 21 of them — and each brief picks:

- one of nine themes in `src/design/themes.js` (palette, Hebrew-capable fonts,
  spacing, button style, reveal timing),
- an accent and hero gradient, the call to action that converts for that trade,
  and its prefilled WhatsApp opener,
- which sections appear and in what order, and whether the hero uses a real
  Google photo or the category gradient,
- its schema.org type for the JSON-LD block,
- a 3D preset in `src/design/three/presets.js` for the React export.

A restaurant gets dark serif luxury with a photo hero and a gallery; a dental
clinic gets clinical blues, a gradient hero and no gallery. Adding a trade means
adding one record — `places.js` derives its search categories from the same
briefs, so a category can never exist on the map without a design to build it.

Nothing on a generated page is invented. Copy, photos, reviews and opening hours
come from the business's Places record; a section with no data is dropped rather
than filled in, and the per-brief copy pack is only a fallback.

### 3D export

`POST /api/site3d` returns a zip containing a full React 18 + Vite + TypeScript +
Tailwind + Framer Motion + React Three Fiber project, with the business's real
data in `src/data/business.ts` and a hero scene built from the category's preset.
`npm install && npm run dev` and it runs.

The presets are derived from the design specifications vendored in
`vendor/motionsites-prompts/` — **read the `NOTICE.md` there for provenance and
its caveats before relying on them.** Each export also ships its source spec as
`PROMPT.md`, so the same design can be handed to Lovable, Cursor or Claude for
variants the scaffold does not cover.

## Connecting your Google Places API key

The key is a **server-side secret**. It lives in the Worker, never in the page,
so it is never sent to browsers and never committed.

1. In the [Google Cloud console](https://console.cloud.google.com/), enable
   **Places API (New)** on your project and create an API key.
2. Restrict the key to the Places API (New) under *API restrictions*.
   Do **not** set an HTTP-referrer restriction — the calls come from the
   Worker, not the browser, so a referrer restriction would block them.
   Application restrictions can't usefully be IP-based either, since Workers
   egress from many addresses.
3. Store it as a Worker secret:

   ```sh
   npx wrangler secret put GOOGLE_PLACES_API_KEY
   ```

   Paste the key at the prompt. For local development, copy
   `.dev.vars.example` to `.dev.vars` and put the key there — `.dev.vars` is
   gitignored.

Without the key the site still works: the map falls back to the bundled seed
dataset and labels itself `נתוני הדגמה` (demo data).

## API

`GET /api/businesses?city=<netanya|telaviv|haifa>[&cat=<category>][&refresh=1]`

Returns `{city, count, fetchedAt, businesses[]}`. Without `cat` it scans all 21
categories concurrently. Results are cached for 24 hours because every miss is
a billed Places request per category; `refresh=1` bypasses the cache.

`GET /api/site?placeId=<id>&cat=<category>[&style=<theme>][&name=&addr=&phone=&city=&rating=][&refresh=1]`

Returns the finished site as a standalone HTML document. `style` overrides the
brief's default theme; the resolved theme and section list come back in the
`X-BizSite-Meta` header. Cached for 24 hours.

`GET /api/photo?name=places/<id>/photos/<ref>[&w=<100..1600>]`

Proxies one Places photo. Generated pages only ever reference this route, so the
API key stays on the server. The resource name is pattern-checked so the route
can't be used as an open proxy, and the width is clamped.

`POST /api/site3d?placeId=<id>&cat=<category>[&name=&addr=&phone=&city=&rating=]`

Returns the React + Vite project as a zip download.

`GET /api/design`

Returns the category briefs and theme labels. The frontend builds its filter
pills and theme picker from this, so the UI and the builder can never disagree
about which trades exist.

## Develop and deploy

```sh
npm run dev      # local server at http://localhost:8787
npm test         # Places adapter, design layer, and the Worker end to end
npm run deploy   # wrangler deploy
```
