/**
 * Runs the LLM path.
 *
 * Callers pass a `ctx` (the same object buildSite consumes) plus the
 * Cloudflare Workers AI binding. On success returns
 * `{ok:true, html, source:'llm', neurons}`. On any failure -
 * missing binding, quota, error, unsafe output - returns
 * `{ok:false, reason}` so the caller can fall back to the template.
 *
 * There is no throw path. Fallback must always be possible.
 */

import { buildPromptMessages } from './prompt.js';
import { clean } from './sanitize.js';

const MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';

export async function generateSite({ ctx, ai }) {
  if (!ai || typeof ai.run !== 'function') {
    return { ok: false, reason: 'no_ai_binding' };
  }

  let response;
  try {
    response = await ai.run(MODEL, {
      messages: buildPromptMessages(ctx),
      // Full page comfortably fits in 6k tokens; leaves room for the model
      // to think without truncating a valid document mid-tag.
      max_tokens: 6000,
      // Deterministic-ish: lower temperature keeps the LLM from wandering
      // off the design tokens.
      temperature: 0.4,
    });
  } catch (err) {
    return { ok: false, reason: `ai_error: ${String(err?.message || err).slice(0, 200)}` };
  }

  const text =
    response?.response ??
    response?.result?.response ??
    response?.output_text ??
    (typeof response === 'string' ? response : '');

  if (!text) return { ok: false, reason: 'no_text_in_response' };

  const cleaned = clean(text);
  if (!cleaned.ok) return { ok: false, reason: cleaned.reason };

  return {
    ok: true,
    html: cleaned.html,
    source: 'llm',
    model: MODEL,
    // Workers AI returns usage in the response envelope on paid; free tier
    // sometimes omits it. Best-effort surface.
    neurons: response?.usage?.total_tokens || response?.usage?.completion_tokens || null,
  };
}
