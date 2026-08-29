/**
 * HTML cleanup for LLM-generated pages.
 *
 * LLM output is untrusted input the same way a user's paste is untrusted.
 * This runs before we serve it: strips script tags, event handlers, and any
 * iframe that isn't the whitelisted Google Maps embed. We then check the
 * result actually looks like a full HTML document; anything that comes back
 * with less than ~4KB or without an <html> tag has probably been shredded
 * by the sanitizer and the caller should fall back to the template.
 *
 * This is not a general-purpose HTML sanitizer. It targets the shapes an
 * instructed LLM actually produces (fenced code, extra prose, occasional
 * script tag despite instructions not to), plus the obvious XSS classes.
 */

const MIN_HTML_BYTES = 4000;

const MAP_HOST_ALLOW = /^https?:\/\/(www\.)?google\.com\/maps\/embed\??/;

/** Pull the HTML document out of whatever the LLM wrapped it in. */
export function unwrap(text) {
  if (!text) return '';
  let s = String(text).trim();

  // ```html … ``` code fences.
  const fence = s.match(/```(?:html)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();

  // Some models add "Here is the site:" before the doctype.
  const doc = s.match(/<!doctype[\s\S]*<\/html>/i) || s.match(/<html[\s\S]*<\/html>/i);
  if (doc) s = doc[0];

  return s.trim();
}

/**
 * Strip dangerous constructs from an HTML string.
 * Returns cleaned HTML - the caller decides whether to serve it.
 */
export function sanitize(html) {
  if (!html) return '';
  let s = String(html);

  // Every <script>…</script>, including CDATA-ish and multi-line.
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '');
  // Self-closing / never-closing script tags.
  s = s.replace(/<script\b[^>]*\/?>/gi, '');

  // Every on*="…" and on*='…' and on*=unquoted attribute anywhere.
  s = s.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '');
  s = s.replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '');
  s = s.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '');

  // javascript: and data:text/html URLs. data: images are fine.
  s = s.replace(/(\s(?:href|src|action|formaction)\s*=\s*['"]?)\s*javascript:/gi, '$1about:blank?blocked=');
  s = s.replace(/(\s(?:href|src)\s*=\s*['"])data:text\/html[^'"]*(['"])/gi, '$1about:blank$2');

  // Iframes: keep only the Google Maps embed; drop anything else.
  s = s.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, tag => {
    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    return src && MAP_HOST_ALLOW.test(src[1]) ? tag : '';
  });
  s = s.replace(/<iframe\b[^>]*\/?>/gi, tag => {
    const src = tag.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    return src && MAP_HOST_ALLOW.test(src[1]) ? tag : '';
  });

  // form action=javascript:… we already covered; drop <object>/<embed>.
  s = s.replace(/<(object|embed|applet|meta[^>]*http-equiv[^>]*refresh)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  s = s.replace(/<(object|embed|applet)\b[^>]*\/?>/gi, '');

  // Force RTL/Hebrew on the root element, whichever way the LLM wrote it.
  s = s.replace(/<html\b[^>]*>/i, m => {
    let out = m;
    if (!/\blang\s*=/i.test(out)) out = out.replace(/<html\b/i, '<html lang="he"');
    if (!/\bdir\s*=/i.test(out)) out = out.replace(/<html\b/i, '<html dir="rtl"');
    return out;
  });

  return s;
}

/** True if the sanitized output still looks like a full page we can serve. */
export function looksLikePage(html) {
  if (!html || html.length < MIN_HTML_BYTES) return false;
  if (!/<html\b/i.test(html) || !/<\/html>/i.test(html)) return false;
  if (!/<body\b/i.test(html)) return false;
  return true;
}

/**
 * The full pipeline: unwrap fences, sanitize, verdict.
 * Returns `{ok: true, html}` or `{ok: false, reason}`.
 */
export function clean(rawText) {
  const unwrapped = unwrap(rawText);
  if (!unwrapped) return { ok: false, reason: 'empty' };
  const cleaned = sanitize(unwrapped);
  if (!looksLikePage(cleaned)) {
    return { ok: false, reason: `too_short_or_malformed (${cleaned.length}b)` };
  }
  return { ok: true, html: cleaned };
}
