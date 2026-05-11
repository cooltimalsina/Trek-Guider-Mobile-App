/**
 * Resolves trek / hero images for React Native `Image`, mirroring web
 * `media-display-url` + `normalizeImageMetadata` behavior: prefer direct URLs,
 * then build an absolute Next.js media proxy URL when only S3 keys exist.
 */

const ALLOWED_KEY_PREFIX = /^(trips|destinations|guides|content|users|bookings)\//;

function str(v: unknown): string {
  return typeof v === "string" && v.trim() ? v.trim() : "";
}

function isSafeObjectKey(key: string): boolean {
  if (!key || key.length > 512 || key.includes("..")) return false;
  return ALLOWED_KEY_PREFIX.test(key);
}

/** `/api/media-asset/trips/...` — same path shape as Trek-Guider web `src/app/api/media-asset/[[...segments]]/route.ts`. */
export function buildWebMediaAssetUrl(webBaseUrl: string, s3Key: string): string | undefined {
  const base = webBaseUrl.replace(/\/+$/, "");
  const key = s3Key.trim();
  if (!base || !isSafeObjectKey(key)) return undefined;
  const encoded = key
    .split("/")
    .filter(Boolean)
    .map((seg) => encodeURIComponent(seg))
    .join("/");
  return `${base}/api/media-asset/${encoded}`;
}

/** Turn relative site paths into absolute URLs when `webBaseUrl` is set. */
export function absolutizeMediaUrl(url: string, webBaseUrl?: string): string {
  const u = url.trim();
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("//")) return `https:${u}`;
  const base = webBaseUrl?.replace(/\/+$/, "");
  if (u.startsWith("/") && base) return `${base}${u}`;
  return u;
}

function urlFromImageObject(o: Record<string, unknown>, webBaseUrl?: string): string | undefined {
  const direct =
    str(o.url) ||
    str(o.cdnUrl) ||
    str(o.cdn_url) ||
    str((o as { imageUrl?: string }).imageUrl);
  if (direct) return absolutizeMediaUrl(direct, webBaseUrl);

  const key =
    str(o.s3Key) ||
    str(o.s3_key) ||
    str((o as { imageKey?: string }).imageKey) ||
    str((o as { image_key?: string }).image_key);
  if (key && webBaseUrl) {
    const proxied = buildWebMediaAssetUrl(webBaseUrl, key);
    if (proxied) return proxied;
  }
  return undefined;
}

/** Best hero/cover/gallery image URL for a public trek row (list or GET-by-id payload). */
export function resolveTrekHeroCoverUrl(raw: Record<string, unknown>, webBaseUrl?: string): string | undefined {
  const hero = raw.heroImage;
  if (hero && typeof hero === "object" && !Array.isArray(hero)) {
    const u = urlFromImageObject(hero as Record<string, unknown>, webBaseUrl);
    if (u) return u;
  }

  const cover = str(raw.coverImage);
  if (cover) return absolutizeMediaUrl(cover, webBaseUrl);

  const gal = raw.galleryImages;
  if (Array.isArray(gal) && gal.length > 0) {
    const first = gal[0];
    if (first && typeof first === "object" && !Array.isArray(first)) {
      const u = urlFromImageObject(first as Record<string, unknown>, webBaseUrl);
      if (u) return u;
    }
  }

  const thumb = str(raw.thumbnailUrl) || str(raw.imageUrl);
  if (thumb) return absolutizeMediaUrl(thumb, webBaseUrl);

  return undefined;
}
