/**
 * Builds the system + user messages sent to the LLM.
 *
 * The Places record and the category brief are both real. The copy pack from
 * categories.js is passed as a *starting point*, not a mandate - the model
 * may rewrite freely to fit this specific business, but the safety rules
 * forbid inventing facts (like "20 years experience") and forbid stock
 * placeholders.
 *
 * The system prompt owns:
 *   - the role,
 *   - the hard output contract (single HTML document, no scripts, RTL),
 *   - the design tokens (colors + fonts) from the resolved theme so the
 *     model doesn't drift off-brand.
 *
 * The user prompt owns:
 *   - the real business data as structured JSON,
 *   - the brief as a starting point,
 *   - explicit "do not invent" list keyed to what is / is not present.
 */

/** Distil the theme into two lines the LLM can actually use. */
function themeDigest(theme) {
  // theme.vars is a CSS-var string; pluck the semantic tokens.
  const grab = k => {
    const m = new RegExp(`--${k}\\s*:\\s*([^;]+)`).exec(theme.vars);
    return m ? m[1].trim() : '';
  };
  return {
    label: theme.label,
    background: grab('bg'),
    foreground: grab('fg'),
    accent: grab('accent'),
    accentContrast: grab('accent-contrast'),
    fontHeading: grab('font-heading'),
    fontBody: grab('font-body'),
  };
}

function systemMessage(theme) {
  const t = themeDigest(theme);
  return `אתה מעצב ומפתח בכיר. אתה מייצר עמוד נחיתה מלא לעסק מקומי בישראל.

חוקי פלט (הפרה = הפלט נזרק):
- מסמך HTML יחיד ומלא: <!doctype html> עד </html>.
- <html lang="he" dir="rtl">.
- כל ה-CSS inline ב-<style> אחד ב-<head>. בלי קישורים חיצוניים חוץ מגוגל פונטס.
- אין <script> בכלל. שום JavaScript. אנימציות רק CSS.
- אין on*= handlers.
- אין iframe חוץ מ-Google Maps embed.
- טקסט בעברית בלבד.
- ללא lorem ipsum, ללא "לורם איפסום", ללא placeholder של תוכן.

חוקי אמת (הפרה = פוגעת בעסק אמיתי, אל תעשה):
- השתמש רק בעובדות שקיבלת בקלט. אל תמציא סטטיסטיקות ("20 שנות ניסיון"),
  שנת ייסוד, שמות עובדים, פרסים, או מספרי לקוחות.
- אם שדה חסר, אל תמלא אותו במידה — פשוט השמט את הסקשן.
- ביקורות בעמוד — רק אלה שקיבלת. אל תוסיף ביקורות בדויות.
- אל תשתמש בתמונות סטוק. הסתמך על התמונות שסופקו לך; אם אין תמונות, השתמש
  ברקע מעוצב (CSS gradient / mesh) במקום.

עקרונות עיצוב:
- אתה בונה אתר לקטגוריה ספציפית של עסק — התאם את המבנה, השפה והטון.
  מסעדה שונה מקליניקה שונה ממוסך.
- הפריסה צריכה להיות עשירה ומעניינת, לא רק hero + services + contact.
  שקול: split heroes, full-bleed bands, אסימטריה, ציטוטים גדולים, טבלאות
  השוואה, אקורדיון שאלות ותשובות, גריד תמונות אסימטרי, marquees.
- טיפוגרפיה גדולה ובוטחת. hero h1 בין 3.5rem ל-6rem.
- שימוש חכם ב-white-space. ריווח שנועד להנחות את העין, לא להעלים תוכן.
- תבנית צבע יסוד: רקע ${t.background}, טקסט ${t.foreground}, אקצנט ${t.accent}
  (על אקצנט: ${t.accentContrast}). אתה יכול להוסיף גוונים נוספים באותה משפחה.
- פונטים: כותרת ${t.fontHeading}, גוף ${t.fontBody}. השתמש בהם עקבית.
- מעברי מקטעים נעימים — לא חתכים חדים או רצועות ריקות.
- responsive: העמוד עובד ב-320px רוחב ומעלה.

הפלט: HTML מלא בלבד. שום טקסט לפני, שום טקסט אחרי, שום markdown fence.`;
}

function userMessage(ctx) {
  const brief = ctx.brief;
  const payload = {
    business: {
      name: ctx.name,
      categoryLabel: brief.label,
      category: brief.schemaType,
      city: ctx.city || null,
      address: ctx.address || null,
      phone: ctx.phone || null,
      whatsappLink: ctx.waLink || null,
      telLink: ctx.telLink || null,
      rating: ctx.rating || null,
      reviewCount: ctx.reviewCount || null,
      aboutFromGoogle: ctx.about || null,
      openNow: typeof ctx.openNow === 'boolean' ? ctx.openNow : null,
    },
    hours: ctx.hoursLines || [],
    reviews: (ctx.reviews || []).map(r => ({
      author: r.author, rating: r.rating, text: r.text, date: r.date,
    })),
    photos: ctx.photos || [],
    mapUrl: ctx.mapUrl || null,
    mapLink: ctx.mapLink || null,
    brief: {
      cta: brief.cta,
      layoutHint: brief.layout,
      copy: brief.copy,
    },
  };

  const missing = [
    !ctx.about && 'aboutFromGoogle',
    !ctx.rating && 'rating',
    !(ctx.reviews || []).length && 'reviews',
    !(ctx.photos || []).length && 'photos',
    !(ctx.hoursLines || []).length && 'hours',
    !ctx.address && 'address',
  ].filter(Boolean);

  return `נתוני העסק והנחיות העיצוב:

\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\`

שדות שחסרים ואסור להמציא (השמט את הסקשן הרלוונטי במקום):
${missing.length ? missing.map(m => '- ' + m).join('\n') : '- (אין)'}

הנחיות אחרונות:
- brief.copy הוא נקודת התחלה. שכתב חופשי כדי שיתאים לעסק הזה בשמו, אבל שמור
  על המשמעות ואל תסטה לעובדות שלא סופקו.
- קישורי CTA: השתמש ב-whatsappLink ו-telLink כמו שהם. שם הכפתור: brief.cta.
- תמונות: אם photos ריק, אל תשים <img src="..."> ריק. השתמש ב-CSS gradient
  ל-hero ולסקשנים ויזואליים.
- קטגוריה: brief.category ("${brief.schemaType}"). בנה עמוד שמרגיש כמו אתר
  אמיתי של ${brief.label}. חשוב איזה מבנה, שפה וטון מתאימים דווקא לזה.
- החזר HTML מלא בלבד. בלי הסבר, בלי fence.`;
}

/** Build the messages array for @cf/meta/llama-3.3-70b-instruct-fp8-fast. */
export function buildPromptMessages(ctx) {
  return [
    { role: 'system', content: systemMessage(ctx.theme) },
    { role: 'user', content: userMessage(ctx) },
  ];
}

/** Handy for tests: expose the system + user text without wrapping. */
export function _debug(ctx) {
  return { system: systemMessage(ctx.theme), user: userMessage(ctx) };
}
