import { getDictionary } from "@/lib/dictionaries";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";
import {
  Target, FolderGit2, BookOpen, Headphones, Smile, ExternalLink,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Now",
  description: "What I'm currently working on, learning and enjoying.",
};

const SECTION_CONFIG: Record<
  string,
  { icon: React.ElementType; color: string; dot: string }
> = {
  focus:    { icon: Target,      color: "text-sky-400 border-sky-500/30 bg-sky-500/[0.08]",      dot: "bg-sky-400" },
  projects: { icon: FolderGit2,  color: "text-violet-400 border-violet-500/30 bg-violet-500/[0.08]", dot: "bg-violet-400" },
  learning: { icon: BookOpen,    color: "text-amber-400 border-amber-500/30 bg-amber-500/[0.08]",   dot: "bg-amber-400" },
  reading:  { icon: BookOpen,    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/[0.08]", dot: "bg-emerald-400" },
  enjoying: { icon: Smile,       color: "text-pink-400 border-pink-500/30 bg-pink-500/[0.08]",      dot: "bg-pink-400" },
};

const SECTION_ORDER = ["focus", "projects", "learning", "reading", "enjoying"];

export default async function NowPage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const now = dict?.now;
  if (!now) return null;

  const sections = SECTION_ORDER.map((key) => ({
    key,
    data: now[key as keyof typeof now] as { label: string; items: string[] } | undefined,
    config: SECTION_CONFIG[key],
  })).filter((s) => s.data && Array.isArray(s.data.items));

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <Reveal className="mb-12">
          <div className="flex flex-col gap-4">
            {/* Updated badge */}
            <span className="inline-flex items-center gap-1.5 w-fit text-xs font-medium px-2.5 py-1 rounded-full border border-primary/30 bg-primary/[0.07] text-primary/80">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {now.updated}
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold title leading-tight">
              {now.title}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {now.subtitle}
            </p>
          </div>
        </Reveal>

        {/* ── Sections ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          {sections.map(({ key, data, config }) => {
            const Icon = config.icon;
            return (
              <Reveal key={key}>
                <div className="rounded-2xl border border-border bg-surface-alt/50 backdrop-blur overflow-hidden">
                  {/* Section header */}
                  <div className={`flex items-center gap-3 px-5 py-3.5 border-b border-border`}>
                    <span className={`p-1.5 rounded-lg border ${config.color}`}>
                      <Icon className="size-3.5" />
                    </span>
                    <span className="text-sm font-semibold text-foreground">
                      {data!.label}
                    </span>
                  </div>

                  {/* Items */}
                  <RevealStagger className="flex flex-col divide-y divide-border">
                    {data!.items.map((item, i) => (
                      <RevealItem key={i}>
                        <div className="flex items-start gap-3 px-5 py-3.5 group">
                          <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${config.dot} opacity-60`} />
                          <span className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                            {item}
                          </span>
                        </div>
                      </RevealItem>
                    ))}
                  </RevealStagger>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* ── Nownow footer ───────────────────────────────────────────────── */}
        <Reveal className="mt-12">
          <p className="text-xs text-muted-foreground/50 text-center flex items-center justify-center gap-1.5">
            {now.nownow}
            <a
              href="https://nownownow.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 hover:text-primary transition-colors"
            >
              nownownow.com
              <ExternalLink className="size-2.5" />
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
