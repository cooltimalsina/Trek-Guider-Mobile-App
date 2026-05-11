/** Format YYYY-MM-DD (or ISO prefix) as MM/DD/YYYY for US-style display. */
export function formatIsoDateUs(iso: string | undefined): string {
  if (!iso) return "";
  const ymd = iso.slice(0, 10);
  const parts = ymd.split("-").map((p) => Number(p));
  const [y, m, d] = parts;
  if (!y || !m || !d || Number.isNaN(y)) return iso;
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${pad(m)}/${pad(d)}/${y}`;
}

/** Always show from — to, e.g. 05/07/2026 - 05/15/2026 */
export function formatDateRangeUs(start?: string, end?: string): string {
  const s = formatIsoDateUs(start);
  const e = formatIsoDateUs(end) || s;
  if (!s) return e || "";
  return `${s} - ${e}`;
}

/** e.g. Jun 12 – Jun 16, 2026 */
export function formatDateRangeLong(start?: string, end?: string, locale = "en-US"): string {
  if (!start) return "";
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const s = new Date(`${start.slice(0, 10)}T12:00:00Z`);
  const endStr = end?.slice(0, 10) ?? start.slice(0, 10);
  const e = new Date(`${endStr}T12:00:00Z`);
  if (Number.isNaN(s.getTime())) return start;
  if (s.getTime() === e.getTime() || Number.isNaN(e.getTime())) {
    return s.toLocaleDateString(locale, opts);
  }
  const left = s.toLocaleDateString(locale, { month: "short", day: "numeric" });
  const right = e.toLocaleDateString(locale, opts);
  return `${left} – ${right}`;
}

