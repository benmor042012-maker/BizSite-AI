# BizSite AI

Static site on Cloudflare Workers, with a Worker endpoint that scans real
businesses via the Google Places API (New).

The map colours each business by its web presence — that's the whole point of
the tool:

| Status  | Label     | Meaning                                        |
|---------|-----------|------------------------------------------------|
| `gold`  | אין אתר   | No website at all — the prime lead             |
| `red`   | אתר חלש   | Only a Facebook/Instagram/aggregator page      |
| `green` | אתר טוב   | Has a real site of its own                     |

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

Returns `{city, count, fetchedAt, businesses[]}`. Without `cat` it scans all 13
categories concurrently. Results are cached for 24 hours because every miss is
a billed Places request per category; `refresh=1` bypasses the cache.

## Develop and deploy

```sh
npm run dev      # local server at http://localhost:8787
npm test         # unit tests for the Places adapter
npm run deploy   # wrangler deploy
```
