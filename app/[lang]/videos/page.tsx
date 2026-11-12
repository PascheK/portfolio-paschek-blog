import type { Metadata } from "next";
import { pageMeta, isoDuration, type Lang } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { ArrowUpRight, Youtube } from "lucide-react";
import { getVideos, channelUrl, hasVideos, type Video } from "@/lib/youtube";
import { PageHeader } from "@/components/brand/page-header";
import { VideoPlayer } from "@/components/brand/video-player";
import { videoMeta } from "@/components/brand/video-card";

// Refreshed automatically (the data itself is cached 30 min in lib/youtube.ts).
export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ lang: Lang }> }): Promise<Metadata> {
  const { lang } = await params;
  const isFr = lang === "fr";
  const meta = pageMeta({
    lang,
    path: "/videos",
    title: isFr ? "Vidéos et devlogs" : "Videos & devlogs",
    description: isFr ? "Devlogs et vidéos de la chaîne PascheK : développement de jeu, Blender et création en public." : "Devlogs and videos from the PascheK channel: game development, Blender and building in public.",
  });
  // An empty page (channel not set up / unreachable) must not be indexed.
  return (await getVideos(lang)).length ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function VideosPage({ params }: { params: Promise<{ lang: "en" | "fr" }> }) {
  const { lang } = await params;
  const isFr = lang === "fr";
  const locale = isFr ? "fr-FR" : "en-US";
  const videos = await getVideos(lang);
  const channel = channelUrl();
  const configured = hasVideos();

  const t = {
    title: isFr ? "Vidéos et devlogs" : "Videos & devlogs",
    desc: isFr ? "Mes devlogs et mes vidéos, mis à jour automatiquement depuis YouTube." : "My devlogs and videos, updated automatically from YouTube.",
    subscribe: isFr ? "S'abonner sur YouTube" : "Subscribe on YouTube",
    latest: isFr ? "Dernière vidéo" : "Latest video",
    more: isFr ? "Toutes les vidéos" : "All videos",
    watch: isFr ? "Regarder sur YouTube" : "Watch on YouTube",
    play: isFr ? "Lire la vidéo" : "Play video",
    views: isFr ? "vues" : "views",
    soon: isFr ? "Les vidéos arrivent bientôt." : "Videos are coming soon.",
    unavailable: isFr ? "Impossible de charger les vidéos pour le moment. Réessaie plus tard, ou ouvre la chaîne directement." : "Videos can't be loaded right now. Try again later, or open the channel directly.",
  };

  const meta = (v: Video) => videoMeta(v, locale, t.views);

  const [latest, ...rest] = videos;

  // VideoObject needs an exact uploadDate, which only the API source provides.
  const videoLd = videos
    .filter((v) => v.publishedAt)
    .map((v) => ({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: v.title,
      description: v.description || v.title,
      thumbnailUrl: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
      uploadDate: v.publishedAt,
      duration: isoDuration(v.durationText),
      embedUrl: `https://www.youtube.com/embed/${v.id}`,
      contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
      inLanguage: lang,
    }));

  return (
    <div className="container-page pb-8">
      {videoLd.length > 0 && <JsonLd data={videoLd} />}
      <PageHeader
        eyebrow={videos.length ? `${videos.length} ${isFr ? (videos.length > 1 ? "vidéos" : "vidéo") : videos.length > 1 ? "videos" : "video"}` : "YouTube"}
        title={t.title}
        description={t.desc}
      >
        {channel && (
          <a href={`${channel}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            <Youtube aria-hidden />
            {t.subscribe}
          </a>
        )}
      </PageHeader>

      {!videos.length && (
        <p role="status" className="py-12 text-muted-foreground">
          {configured ? t.unavailable : t.soon}
        </p>
      )}

      {latest && (
        <section aria-labelledby="latest-title" className="mb-16">
          <p className="eyebrow mb-4">{t.latest}</p>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start">
            <div className="card overflow-hidden">
              <VideoPlayer id={latest.id} title={latest.title} duration={latest.durationText} playLabel={t.play} />
            </div>
            <div>
              <h2 id="latest-title" className="t-h2">{latest.title}</h2>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                {meta(latest).join("  ·  ")}
              </p>
              {latest.description && (
                <p className="mt-4 line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {latest.description}
                </p>
              )}
              <a
                href={`https://www.youtube.com/watch?v=${latest.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link-quiet mt-5 inline-flex items-center gap-1.5 rounded-md text-sm font-medium"
              >
                {t.watch}
                <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </div>
          </div>
        </section>
      )}

      {rest.length > 0 && (
        <section aria-labelledby="all-title">
          <h2 id="all-title" className="t-h2 mb-8">{t.more}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {rest.map((v) => (
              <li key={v.id} className="h-full">
                <article className="card card-interactive flex h-full flex-col overflow-hidden">
                  <VideoPlayer id={v.id} title={v.title} duration={v.durationText} playLabel={t.play} className="border-b border-border" />
                  <div className="flex flex-1 flex-col gap-3 p-5">
                    {meta(v).length > 0 && (
                      <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                        {meta(v).join("  ·  ")}
                      </p>
                    )}
                    <h3 className="t-h3">
                      <a
                        href={`https://www.youtube.com/watch?v=${v.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-sm hover:text-primary"
                      >
                        {v.title}
                      </a>
                    </h3>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
