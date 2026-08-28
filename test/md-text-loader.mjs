/**
 * Lets `node` import *.md as a string, the way wrangler's Text module rule does
 * at build time (see the `rules` block in wrangler.jsonc). Preloaded with
 * `node --import ./test/md-text-loader.mjs` so the Worker's own module graph -
 * which pulls in the vendored design specs - can be tested outside Workers.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { registerHooks } from 'node:module';

registerHooks({
  load(url, context, nextLoad) {
    if (!url.startsWith('file:') || !url.endsWith('.md')) return nextLoad(url, context);
    const text = readFileSync(fileURLToPath(url), 'utf8');
    return {
      format: 'module',
      shortCircuit: true,
      source: `export default ${JSON.stringify(text)};`,
    };
  },
});
