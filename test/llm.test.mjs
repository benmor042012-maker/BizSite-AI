/**
 * LLM path: sanitizer hardness, prompt shape, generator fallback contract.
 * The sanitizer tests are the security ones - they must not regress.
 */
import { unwrap, sanitize, looksLikePage, clean } from '../src/design/llm/sanitize.js';
import { buildPromptMessages, _debug } from '../src/design/llm/prompt.js';
import { generateSite } from '../src/design/llm/generate.js';
import { getBrief } from '../src/design/categories.js';
import { getTheme } from '../src/design/themes.js';

let fail = 0;
const eq = (got, want, label) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (!ok) { fail++; console.log(`FAIL ${label}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`); }
  else console.log(`ok   ${label}`);
};
const ok = (cond, label) => eq(!!cond, true, label);
const has = (haystack, needle, label) => ok(haystack.includes(needle), label);
const nope = (haystack, needle, label) => ok(!haystack.includes(needle), label);

// --- unwrap ---------------------------------------------------------------
eq(unwrap(''), '', 'unwrap empty');
eq(unwrap('  \n  '), '', 'unwrap whitespace');
has(unwrap('Here is your site:\n```html\n<!doctype html><html><body>x</body></html>\n```'), '<body>x</body>', 'unwrap strips fence + preamble');
has(unwrap('<!doctype html><html><body>x</body></html>\nsome trailing prose'), '</html>', 'unwrap trims trailing prose');
has(unwrap('```\n<html><body>x</body></html>\n```'), '<html>', 'unwrap fenced without lang');

// --- sanitize XSS ---------------------------------------------------------
nope(sanitize('<html><body><script>alert(1)</script>x</body></html>'), '<script', 'strips script tags');
nope(sanitize('<html><body><script src="//evil.com/x.js"></script></body></html>'), 'evil', 'strips script with src');
nope(sanitize('<html><body><SCRIPT>alert(1)</SCRIPT></body></html>'), 'SCRIPT', 'case-insensitive script strip');
nope(sanitize('<html><body><img src=x onerror="alert(1)"></body></html>'), 'onerror', 'strips onerror');
nope(sanitize('<html><body><a href="javascript:alert(1)">x</a></body></html>'), 'javascript:alert', 'strips javascript: URLs');
nope(sanitize('<html><body><a href="data:text/html,<script>alert(1)</script>">x</a></body></html>'), 'data:text/html', 'strips data:text/html URLs');
nope(sanitize('<html><body><iframe src="https://evil.example/"></iframe></body></html>'), 'evil.example', 'drops non-map iframe');
has(sanitize('<html><body><iframe src="https://www.google.com/maps/embed?q=x" title="מפה"></iframe></body></html>'), 'google.com/maps/embed', 'keeps Google Maps iframe');
nope(sanitize('<html><body><object data="evil"></object><embed src="evil"></body></html>'), 'evil', 'strips object/embed');

// RTL/lang injection.
has(sanitize('<html><body>x</body></html>'), 'lang="he"', 'forces lang=he when missing');
has(sanitize('<html><body>x</body></html>'), 'dir="rtl"', 'forces dir=rtl when missing');
has(sanitize('<html lang="en" dir="ltr"><body>x</body></html>'), 'lang="en"', 'keeps existing lang');

// --- looksLikePage --------------------------------------------------------
eq(looksLikePage(''), false, 'empty is not a page');
eq(looksLikePage('<html><body>tiny</body></html>'), false, 'tiny is not a page');
ok(looksLikePage('<html><body>' + 'x'.repeat(5000) + '</body></html>'), 'big html + body is a page');
eq(looksLikePage('<div>' + 'x'.repeat(5000) + '</div>'), false, 'div without html is not a page');

// --- clean pipeline -------------------------------------------------------
const cleanOk = clean('```html\n<!doctype html><html><head><title>ok</title></head><body>' + 'x'.repeat(5000) + '<script>alert(1)</script></body></html>\n```');
ok(cleanOk.ok, 'clean unwraps + sanitizes + passes verdict');
nope(cleanOk.html, '<script', 'clean output has no script tag');
eq(clean('').ok, false, 'clean empty -> not ok');
eq(clean('some garbage without html at all').ok, false, 'clean prose -> not ok');
const cleanEvil = clean('<!doctype html><html><body>' + 'x'.repeat(5000) + '<iframe src="https://evil.example/"></iframe></body></html>');
ok(cleanEvil.ok, 'clean passes when only the iframe is stripped');
nope(cleanEvil.html, 'evil.example', 'stripped iframe stays out');

// --- prompt shape ---------------------------------------------------------
const ctx = {
  name: 'מרפאת שיניים ד״ר לוי', city: 'נתניה', address: 'הרצל 5, נתניה',
  phone: '09-8123456', waLink: 'https://wa.me/9728123456?text=שלום',
  telLink: 'tel:09-8123456', rating: 4.8, reviewCount: 132,
  about: 'מרפאה עם ציוד חדיש.', openNow: true,
  hoursLines: ['יום ראשון: 09:00–18:00'],
  reviews: [{ author: 'דנה', rating: 5, text: 'צוות מעולה', date: 'מאי 2025' }],
  photos: ['/api/photo?name=places/x/1'],
  mapUrl: 'https://www.google.com/maps?q=x&output=embed',
  mapLink: 'https://www.google.com/maps/search/?api=1&query=x',
  brief: getBrief('dentist'),
  theme: getTheme('business'),
};
const msgs = buildPromptMessages(ctx);
eq(msgs.length, 2, 'prompt has system + user');
eq(msgs[0].role, 'system', 'first message is system');
eq(msgs[1].role, 'user', 'second message is user');
has(msgs[1].content, 'מרפאת שיניים ד״ר לוי', 'user prompt carries the real name');
has(msgs[1].content, '09-8123456', 'user prompt carries the real phone');
has(msgs[1].content, 'צוות מעולה', 'user prompt carries the real review text');
has(msgs[0].content, 'dir="rtl"', 'system prompt requires dir=rtl on <html>');
has(msgs[0].content, 'lorem ipsum', 'system prompt names lorem ipsum as forbidden');
has(msgs[0].content, 'אל תמציא', 'system prompt bans invention');
const debug = _debug(ctx);
ok(debug.system.length > 800 && debug.user.length > 400, 'both messages are substantive');

// A brief without whyUs must not throw.
const bareCtx = { ...ctx, brief: getBrief('barber') };
ok(buildPromptMessages(bareCtx)[1].content.length > 0, 'prompt builds without whyUs');

// --- generator contract ---------------------------------------------------
// No binding -> soft fail, never throw.
const noBind = await generateSite({ ctx, ai: null });
eq(noBind.ok, false, 'generator: null ai -> ok:false');
eq(noBind.reason, 'no_ai_binding', 'generator: reason names the missing binding');

// AI throws -> caught, soft fail.
const throwBind = { run: async () => { throw new Error('boom'); } };
const errRes = await generateSite({ ctx, ai: throwBind });
eq(errRes.ok, false, 'generator: throwing ai -> ok:false');
ok(errRes.reason.startsWith('ai_error'), 'generator: reason names the error');

// AI returns empty -> soft fail.
const emptyBind = { run: async () => ({ response: '' }) };
eq((await generateSite({ ctx, ai: emptyBind })).reason, 'no_text_in_response', 'generator: empty response');

// AI returns garbage -> sanitizer rejects, soft fail.
const garbageBind = { run: async () => ({ response: 'lol not html' }) };
ok(!(await generateSite({ ctx, ai: garbageBind })).ok, 'generator: garbage -> ok:false');

// AI returns a real-shaped page -> success, script tag stripped.
const goodBind = { run: async () => ({
  response: '<!doctype html><html><head><title>ok</title></head><body>' +
    'שלום '.repeat(1000) + '<script>alert(1)</script></body></html>',
  usage: { total_tokens: 4200 },
}) };
const good = await generateSite({ ctx, ai: goodBind });
eq(good.ok, true, 'generator: real-shaped page -> ok');
eq(good.source, 'llm', 'generator: source is llm');
eq(good.neurons, 4200, 'generator: surfaces reported tokens');
nope(good.html, '<script', 'generator output is sanitized');
has(good.html, 'lang="he"', 'generator output has lang=he');
has(good.html, 'dir="rtl"', 'generator output has dir=rtl');

// LLM wraps in a fence -> unwrap works through the generator too.
const fenceBind = { run: async () => ({
  response: '```html\n<!doctype html><html><body>' + 'x'.repeat(5000) + '</body></html>\n```',
}) };
ok((await generateSite({ ctx, ai: fenceBind })).ok, 'generator: unwraps a fenced response');

console.log(fail ? `\n${fail} FAILURE(S)` : '\nall assertions passed');
process.exit(fail ? 1 : 0);
