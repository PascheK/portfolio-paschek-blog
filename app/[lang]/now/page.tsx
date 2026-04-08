import { getDictionary } from "@/lib/dictionaries";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";
import {
  Target, FolderGit2, BookOpen, Smile, ExternalLink,
  MapPin, Clock, Zap, Music, ArrowRight, Coffee,
} from "lucide-react";
import { availability } from "@/lib/config";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm currently working on, learning and enjoying.",
};

export default async function NowPage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const now  = dict?.now as any;
  if (!now) return null;

  const isFr      = lang === "fr";
  const status    = now.status    ?? {};
  const spotlight = now.spotlight ?? {};
  const listening = now.listening ?? {};
  const openTo    = now.openTo    ?? [];
  const ships     = now.recentShips ?? [];

  const sections = [
    { key: "focus",    icon: Target,   label: now.focus?.label,    items: now.focus?.items,    dot: "bg-sky-400",     accent: "text-sky-400",     border: "border-sky-500/20",     bg: "bg-sky-500/[0.06]"     },
    { key: "learning", icon: BookOpen, label: now.learning?.label, items: now.learning?.items, dot: "bg-amber-400",   accent: "text-amber-400",   border: "border-amber-500/20",   bg: "bg-amber-500/[0.06]"   },
    { key: "reading",  icon: BookOpen, label: now.reading?.label,  items: now.reading?.items,  dot: "bg-emerald-400", accent: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/[0.06]" },
    { key: "enjoying", icon: Smile,    label: now.enjoying?.label, items: now.enjoying?.items, dot: "bg-pink-400",    accent: "text-pink-400",    border: "border-pink-500/20",    bg: "bg-pink-500/[0.06]"    },
  ].filter((s) => s.items?.length);

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <Reveal className="mb-8">
          <div className="flex flex-col gap-3">
            <span className="inline-flex items-center gap-1.5 w-fit text-xs font-medium px-2.5 py-1 rounded-full border border-primary/30 bg-primary/[0.07] text-primary/80">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {now.updated}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold title leading-tight">{now.title}</h1>
            <p className="text-muted-foreground">{now.subtitle}</p>
          </div>
        </Reveal>

        {/* Status chips */}
        <Reveal className="mb-8">
          <div className="flex flex-wrap gap-2">
            {availability.available && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {isFr ? availability.labelFr : availability.labelEn}
              </span>
            )}
            {status.mode && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-surface-alt/60 text-muted-foreground">
                <Zap className="size-3 text-amber-400" /> {status.mode}
              </span>
            )}
            {status.location && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-surface-alt/60 text-muted-foreground">
                <MapPin className="size-3 text-rose-400" /> {status.location}
              </span>
            )}
            {status.timezone && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-surface-alt/60 text-muted-foreground">
                <Clock className="size-3 text-sky-400" /> {status.timezone}
              </span>
            )}
            {now.coffeeLabel && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-border bg-surface-alt/60 text-muted-foreground">
                <Coffee className="size-3 text-amber-300" /> {now.coffeeLabel}
              </span>
            )}
          </div>
        </Reveal>

        {/* Spotlight 2-col */}
        {(spotlight.project || spotlight.learningSpotlight) && (
          <Reveal className="mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {spotlight.project && (
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.05] p-5 flex flex-col gap-3 group hover:border-violet-500/35 hover:bg-violet-500/[0.08] transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-400">
                      <FolderGit2 className="size-3" />
                      {isFr ? "Projet phare" : "Main project"}
                    </span>
                    {spotlight.project.url && (
                      <a href={spotlight.project.url} target="_blank" rel="noopener noreferrer" className="text-violet-400/40 hover:text-violet-400 transition-colors">
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-foreground font-mono text-sm">{spotlight.project.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{spotlight.project.desc}</p>
                  </div>
                  {spotlight.project.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto pt-1">
                      {spotlight.project.tags.map((t: string) => (
                        <span key={t} className="text-[11px] px-1.5 py-0.5 rounded-md border border-violet-500/20 bg-violet-500/[0.07] text-violet-300/70 font-mono">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {spotlight.learningSpotlight && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-5 flex flex-col gap-3 group hover:border-amber-500/35 hover:bg-amber-500/[0.08] transition-all duration-300">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    <BookOpen className="size-3" />
                    {isFr ? "Apprentissage actif" : "Learning now"}
                  </span>
                  <div>
                    <p className="font-bold text-foreground text-lg">{spotlight.learningSpotlight.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{spotlight.learningSpotlight.desc}</p>
                  </div>
                  <div className="mt-auto pt-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-muted-foreground">{isFr ? "Progression" : "Progress"}</span>
                      <span className="text-[11px] font-mono font-semibold text-amber-400">{spotlight.learningSpotlight.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-amber-500/15 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${spotlight.learningSpotlight.progress}%` }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        )}

        {/* Listening */}
        {listening.track && (
          <Reveal className="mb-5">
            <div className="rounded-2xl border border-border bg-surface-alt/40 p-4 flex items-center gap-4 group hover:border-border/70 hover:bg-surface-alt/60 transition-all duration-300">
              <div className="relative shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                <div className="w-3 h-3 rounded-full bg-neutral-700 border border-white/5" />
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/[0.04]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Music className="size-3 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">{isFr ? "En écoute" : "Listening to"}</span>
                </div>
                <p className="text-sm font-semibold text-foreground truncate">{listening.track}</p>
                <p className="text-xs text-muted-foreground truncate">{listening.artist} — {listening.album}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300" style={{ width: `${listening.progress}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">{listening.progress}%</span>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* Sections */}
        <RevealStagger className="flex flex-col gap-3 mb-5">
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <RevealItem key={s.key}>
                <div className={`rounded-2xl border ${s.border} ${s.bg} overflow-hidden`}>
                  <div className="flex items-center gap-2.5 px-5 py-3 border-b border-white/[0.05]">
                    <Icon className={`size-3.5 ${s.accent}`} />
                    <span className="text-sm font-semibold text-foreground">{s.label}</span>
                  </div>
                  <div className="flex flex-col divide-y divide-white/[0.04]">
                    {s.items!.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 px-5 py-2.5">
                        <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${s.dot} opacity-50`} />
                        <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealStagger>

        {/* Recently shipped */}
        {ships.length > 0 && (
          <Reveal className="mb-5">
            <div className="rounded-2xl border border-border bg-surface-alt/40 overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border">
                <Zap className="size-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground">{isFr ? "Récemment livré" : "Recently shipped"}</span>
              </div>
              <div className="flex flex-col divide-y divide-border">
                {ships.map((ship: any, i: number) => (
                  <div key={i} className="flex items-center justify-between px-5 py-2.5 gap-4 group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ArrowRight className="size-3 text-primary/40 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                      <span className="text-sm text-muted-foreground truncate group-hover:text-foreground transition-colors">{ship.label}</span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground/50 shrink-0">{ship.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Open to */}
        {openTo.length > 0 && (
          <Reveal className="mb-12">
            <div className="rounded-2xl border border-border bg-surface-alt/40 px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">{isFr ? "Ouvert à" : "Open to"}</p>
              <div className="flex flex-wrap gap-2">
                {openTo.map((tag: string) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full border border-primary/25 bg-primary/[0.07] text-primary/80 hover:bg-primary/[0.12] hover:border-primary/40 transition-colors cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* Nownow */}
        <Reveal>
          <p className="text-xs text-muted-foreground/40 text-center flex items-center justify-center gap-1.5">
            {now.nownow}
            <a href="https://nownownow.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 hover:text-primary transition-colors">
              nownownow.com <ExternalLink className="size-2.5" />
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
