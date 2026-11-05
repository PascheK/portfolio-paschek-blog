import { unstable_cache } from "next/cache";

/**
 * Videos of the YouTube channel, fetched automatically on the server and cached for 30 minutes.
 *
 * Configure with env vars (Vercel + .env):
 *  - YOUTUBE_CHANNEL   handle ("@PascheK"), channel ID ("UC…") or channel URL. Defaults to @PascheK.
 *  - YOUTUBE_API_KEY   optional YouTube Data API v3 key. With it: every video, exact dates, durations, views,
 *                      descriptions. Without it: the ~30 latest videos read from the public channel page
 *                      (best effort), then the public RSS feed as a last resort.
 */
export const YOUTUBE_CHANNEL = process.env.YOUTUBE_CHANNEL || "@PascheK";
const API_KEY = process.env.YOUTUBE_API_KEY ?? "";

export type Video = {
  id: string;
  title: string;
  description?: string;
  /** ISO date, when known (API / RSS). */
  publishedAt?: string;
  /** Human text such as "2 days ago", when only the page is available. */
  publishedText?: string;
  durationText?: string;
  /** Number (API / RSS) or a short text such as "1.5M" (page). */
  views?: number | string;
};

type ChannelRef = { kind: "id" | "handle"; value: string; url: string };

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

/** Accepts "@handle", "handle", "UC…", or any youtube.com channel URL. */
export function parseChannel(raw: string): ChannelRef | null {
  const s = raw.trim();
  if (!s) return null;
  const id = /(?:^|\/channel\/)(UC[\w-]{22})(?:[/?#]|$)/.exec(s)?.[1];
  if (id) return { kind: "id", value: id, url: `https://www.youtube.com/channel/${id}` };
  const handle = /@([\w.\-]+)/.exec(s)?.[1] ?? (/^[\w.\-]+$/.test(s) ? s : null);
  if (!handle) return null;
  return { kind: "handle", value: handle, url: `https://www.youtube.com/@${handle}` };
}

const isoDuration = (iso?: string) => {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso ?? "");
  if (!m) return undefined;
  const h = Number(m[1] ?? 0), mn = Number(m[2] ?? 0), sc = Number(m[3] ?? 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(mn)}:${pad(sc)}` : `${mn}:${pad(sc)}`;
};

// ── 1. Official Data API (needs a key) ─────────────────────────────────────────
async function viaApi(ref: ChannelRef): Promise<Video[]> {
  const api = async (path: string, params: Record<string, string>) => {
    const qs = new URLSearchParams({ ...params, key: API_KEY });
    const res = await fetch(`https://www.googleapis.com/youtube/v3/${path}?${qs}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`YouTube API ${path}: ${res.status}`);
    return res.json();
  };

  let channelId = ref.kind === "id" ? ref.value : "";
  if (!channelId) {
    const r = await api("channels", { part: "id", forHandle: `@${ref.value}` });
    channelId = r.items?.[0]?.id ?? "";
    if (!channelId) throw new Error("Channel not found");
  }
  const uploads = "UU" + channelId.slice(2);

  const ids: string[] = [];
  let pageToken = "";
  do {
    const r = await api("playlistItems", {
      part: "contentDetails", maxResults: "50", playlistId: uploads, ...(pageToken ? { pageToken } : {}),
    });
    for (const it of r.items ?? []) if (it.contentDetails?.videoId) ids.push(it.contentDetails.videoId);
    pageToken = r.nextPageToken ?? "";
  } while (pageToken && ids.length < 300);

  const out: Video[] = [];
  for (let i = 0; i < ids.length; i += 50) {
    const r = await api("videos", { part: "snippet,contentDetails,statistics", id: ids.slice(i, i + 50).join(",") });
    for (const v of r.items ?? []) {
      out.push({
        id: v.id,
        title: v.snippet?.title ?? "",
        description: v.snippet?.description ?? "",
        publishedAt: v.snippet?.publishedAt,
        durationText: isoDuration(v.contentDetails?.duration),
        views: v.statistics?.viewCount ? Number(v.statistics.viewCount) : undefined,
      });
    }
  }
  return out.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}

// ── 2. Public channel page (no key, best effort: YouTube can change its markup) ─
async function viaPage(ref: ChannelRef, lang: string): Promise<Video[]> {
  const base = ref.kind === "id" ? `https://www.youtube.com/channel/${ref.value}` : ref.url;
  const res = await fetch(`${base}/videos?hl=${lang}`, {
    cache: "no-store",
    headers: { "User-Agent": UA, "Accept-Language": lang, Cookie: "SOCS=CAI; CONSENT=PENDING+999" },
  });
  if (!res.ok) throw new Error(`channel page: ${res.status}`);
  const html = await res.text();
  const raw = /var ytInitialData = (\{[\s\S]*?\});<\/script>/.exec(html)?.[1];
  if (!raw) throw new Error("ytInitialData not found");
  const data = JSON.parse(raw);

  const out: Video[] = [];
  const seen = new Set<string>();
  const walk = (o: any) => {
    if (!o || typeof o !== "object") return;
    if (Array.isArray(o)) return o.forEach(walk);
    const lv = o.lockupViewModel;
    if (lv?.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" && lv.contentId && !seen.has(lv.contentId)) {
      seen.add(lv.contentId);
      const meta = lv.metadata?.lockupMetadataViewModel;
      const parts: string[] = (meta?.metadata?.contentMetadataViewModel?.metadataRows ?? [])
        .flatMap((r: any) => (r.metadataParts ?? []).map((p: any) => p.text?.content))
        .filter(Boolean);
      const badge = JSON.stringify(lv.contentImage ?? {}).match(/"thumbnailBadgeViewModel":\{"text":"([\d:]+)"/)?.[1];
      out.push({
        id: lv.contentId,
        title: meta?.title?.content ?? "",
        views: parts[0],
        publishedText: parts[1],
        durationText: badge,
      });
    }
    const vr = o.videoRenderer; // older markup
    if (vr?.videoId && !seen.has(vr.videoId)) {
      seen.add(vr.videoId);
      out.push({
        id: vr.videoId,
        title: vr.title?.runs?.[0]?.text ?? "",
        views: vr.viewCountText?.simpleText,
        publishedText: vr.publishedTimeText?.simpleText,
        durationText: vr.lengthText?.simpleText,
      });
    }
    Object.values(o).forEach(walk);
  };
  walk(data);
  return out;
}

// ── 3. RSS (latest ~15; YouTube sometimes answers 404, hence last) ─────────────
const decode = (s: string) =>
  s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, "&");

async function viaRss(ref: ChannelRef): Promise<Video[]> {
  let channelId = ref.kind === "id" ? ref.value : "";
  if (!channelId) {
    const html = await (await fetch(ref.url, { cache: "no-store", headers: { "User-Agent": UA, Cookie: "SOCS=CAI" } })).text();
    channelId = /channel_id=(UC[\w-]{22})/.exec(html)?.[1] ?? "";
  }
  if (!channelId) throw new Error("channel id not found");
  const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, { cache: "no-store", headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`rss: ${res.status}`);
  const xml = await res.text();
  const tag = (e: string, t: string) => new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`).exec(e)?.[1];
  const out: Video[] = [];
  const re = /<entry>([\s\S]*?)<\/entry>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const e = m[1];
    const id = tag(e, "yt:videoId");
    if (!id) continue;
    out.push({
      id,
      title: decode(tag(e, "title") ?? ""),
      description: decode(tag(e, "media:description") ?? ""),
      publishedAt: tag(e, "published"),
      views: Number(/<media:statistics views="(\d+)"/.exec(e)?.[1] ?? NaN) || undefined,
    });
  }
  return out;
}

async function load(channel: string, lang: string): Promise<Video[]> {
  const ref = parseChannel(channel);
  if (!ref) return [];
  const attempts: (() => Promise<Video[]>)[] = [];
  if (API_KEY) attempts.push(() => viaApi(ref));
  attempts.push(() => viaPage(ref, lang), () => viaRss(ref));
  for (const run of attempts) {
    try {
      const v = await run();
      if (v.length) return v;
    } catch (e) {
      console.warn("[youtube]", (e as Error).message);
    }
  }
  throw new Error("no video source worked"); // thrown so that unstable_cache does not store an empty result
}

const cached = unstable_cache(load, ["youtube-videos"], { revalidate: 1800 });

export async function getVideos(lang: "en" | "fr"): Promise<Video[]> {
  if (!YOUTUBE_CHANNEL) return [];
  try {
    return await cached(YOUTUBE_CHANNEL, lang);
  } catch {
    return [];
  }
}

export const channelUrl = () => parseChannel(YOUTUBE_CHANNEL)?.url ?? "";
export const hasVideos = () => !!parseChannel(YOUTUBE_CHANNEL);
