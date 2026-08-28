# Vendored prompt library — provenance and caveats

Source: https://github.com/nomaan5541/motionsites-prompt-collection
Commit: `2a8c639aff9007999afb4243db3e0fec28bb4a31`
License: MIT, `Copyright (c) 2026 Nomaan Khan` — see `LICENSE` in this directory.

These are natural-language design specifications used by `src/design/three/`
as the source material for the 3D (React + Vite) export. They describe layout,
palette, typography, motion and Three.js scene parameters; they contain no
third-party source code.

## What was and was not copied

Only files whose front matter says `premium: false` were vendored — 50 of the
upstream repository's 470. Files marked `premium: true`, and the whole
`Pro prompts/` directory, were deliberately excluded.

## Caveat worth knowing before you rely on this

The upstream repository is named after, and mirrors the catalogue of, the paid
service at motionsites.ai. Its files carry that service's `premium` flags and
reference its CDN (`strvid.nyc3.cdn.digitaloceanspaces.com`), so the MIT grant
above is asserted by the upstream author over content that may originate
elsewhere. Upstream ships `DMCA.md` and `FAIR_USE_NOTICE.md`, which is itself a
signal that the provenance has been contested.

Excluding the `premium: true` files is a deliberate hedge, not a legal
clearance. If that is not good enough for your use, the mapping in
`src/design/three/presets.js` is the only place these files are referenced —
swapping in prompts you wrote or bought is a one-file change.
