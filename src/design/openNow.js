/**
 * "Open now" computed from the Places `regularOpeningHours.periods`, in
 * Asia/Jerusalem rather than the Worker's UTC clock. Ported from mercator's
 * `buildWebsite/entry.ts`.
 *
 * Returns true/false, or null when the data can't answer it — the badge is
 * omitted in that case rather than guessing.
 */
export function computeOpenNow(periods, now = new Date()) {
  if (!Array.isArray(periods) || !periods.length) return null;
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jerusalem', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(now);
    const get = t => Number(parts.find(p => p.type === t)?.value);
    const wdMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const nowDay = wdMap[parts.find(p => p.type === 'weekday').value];
    let hour = get('hour');
    if (hour === 24) hour = 0;
    const nowMin = hour * 60 + get('minute');

    for (const per of periods) {
      const o = per.open, c = per.close;
      if (!o || !c) continue;
      const openMin = o.hour * 60 + o.minute;
      const closeMin = c.hour * 60 + c.minute;
      if (o.day === c.day) {
        if (nowDay === o.day && nowMin >= openMin && nowMin < closeMin) return true;
      } else {
        // Spans midnight - open on the opening day, or before closing the next.
        if ((nowDay === o.day && nowMin >= openMin) || (nowDay === c.day && nowMin < closeMin)) return true;
      }
    }
    return false;
  } catch {
    return null;
  }
}
