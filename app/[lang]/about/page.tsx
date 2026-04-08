import Image from "next/image";
import { getDictionary } from "@/lib/dictionaries";
import { metaData, socialLinks, availability } from "@/lib/config";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";
import { TimelineClient, type TimelineEvent } from "@/app/[lang]/timeline/timeline-client";
import {
  Download, Mail, MapPin, Briefcase, Code2, Shield,
  ExternalLink, Github, Star,
} from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About",
  description: "Full-stack developer based in Switzerland.",
};

const SKILL_COLORS: Record<string, string> = {
  frontend: "text-sky-400 border-sky-500/30 bg-sky-500/[0.07]",
  backend:  "text-emerald-400 border-emerald-500/30 bg-emerald-500/[0.07]",
  devops:   "text-violet-400 border-violet-500/30 bg-violet-500/[0.07]",
};

const STAT_COLORS = [
  "text-sky-400 bg-sky-500/[0.08] border-sky-500/20",
  "text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20",
  "text-violet-400 bg-violet-500/[0.08] border-violet-500/20",
  "text-amber-400 bg-amber-500/[0.08] border-amber-500/20",
];

const STAT_ICONS = [Briefcase, Code2, Star, Shield];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { lang } = await params;
  const dict     = await getDictionary(lang);
  const about    = dict?.about as any;
  if (!about) return null;

  const isFr = lang === "fr";

  const bio: string[]          = about.bio ?? [];
  const skillCategories        = about.skills?.categories ?? {};
  const skillCatLabels         = about.skillsCategories ?? {};
  const education: any[]       = about.education?.items ?? [];
  const values: any            = about.values ?? {};
  const languages: any         = about.languages ?? {};
  const stats: any[]           = about.stats ?? [];
  const contact: any           = about.contact ?? {};
  const cvUrl: string          = about.cvUrl ?? "/cv.pdf";
  const timelineEvents: TimelineEvent[] = about.timeline?.events ?? [];

  const timelineLabels = {
    work:      isFr ? "Emploi"    : "Work",
    education: isFr ? "Formation" : "Education",
    project:   isFr ? "Projet"    : "Project",
    milestone: isFr ? "Étape"     : "Milestone",
    current:   isFr ? "En cours"  : "Current",
  };

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 pb-24">
      <div className="max-w-3xl mx-auto">

        {/* HERO */}
        <Reveal className="mb-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full blur-3xl bg-gradient-to-br from-primary/30 via-violet-500/20 to-emerald-500/15 scale-125" />
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-primary/30 shadow-2xl ring-4 ring-primary/10">
                <Image
                  src="/profile.png"
                  alt={(about.profileAlt ?? "Profile photo of {{name}}").replace("{{name}}", metaData.name)}
                  fill className="object-cover" sizes="160px" priority
                />
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-background border-2 border-background flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-3 text-center sm:text-left">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold title leading-tight">{metaData.name}</h1>
                <p className="text-base text-muted-foreground mt-1">{about.tagline}</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {availability.available && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {isFr ? availability.labelFr : availability.labelEn}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-border bg-surface-alt/60 text-muted-foreground">
                  <MapPin className="size-3 text-rose-400" /> Switzerland
                </span>
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border border-border bg-surface-alt/60 text-muted-foreground hover:text-foreground hover:border-white/20 transition-all">
                  <Github className="size-3" /> GitHub <ExternalLink className="size-2.5 opacity-50" />
                </a>
              </div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-1">
                <a href={socialLinks.email}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                  <Mail className="size-4" /> {contact.cta ?? (isFr ? "Me contacter" : "Contact me")}
                </a>
                <a href={cvUrl} download
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface-alt/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-white/20 transition-all">
                  <Download className="size-4" /> {about.downloadCV ?? "Download CV"}
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* STATS */}
        {stats.length > 0 && (
          <Reveal className="mb-12">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((stat: any, i: number) => {
                const Icon = STAT_ICONS[i] ?? Star;
                return (
                  <div key={i} className={`rounded-xl border p-4 text-center ${STAT_COLORS[i] ?? STAT_COLORS[0]}`}>
                    <Icon className="size-4 mx-auto mb-2 opacity-60" />
                    <p className="text-2xl font-black">{stat.value}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        )}

        {/* BIO */}
        {bio.length > 0 && (
          <Reveal className="mb-12">
            <div className="rounded-2xl border border-border bg-surface-alt/40 p-6 flex flex-col gap-4">
              {bio.map((paragraph: string, i: number) => (
                <p key={i} className="text-[15px] text-muted-foreground leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </Reveal>
        )}

        {/* EXPERIENCE & PROJECTS */}
        {timelineEvents.length > 0 && (
          <>
            <Reveal className="mb-4">
              <h2 className="text-xl font-bold text-foreground">
                {about.timeline?.title ?? (isFr ? "Expériences & Projets" : "Experience & Projects")}
              </h2>
            </Reveal>
            <div className="mb-12">
              <TimelineClient events={timelineEvents} lang={lang} labels={timelineLabels} />
            </div>
          </>
        )}

        {/* SKILLS */}
        <Reveal className="mb-4">
          <h2 className="text-xl font-bold text-foreground">
            {about.skills?.title ?? (isFr ? "Compétences" : "Skills")}
          </h2>
        </Reveal>
        <Reveal className="mb-12">
          <div className="rounded-2xl border border-border bg-surface-alt/40 p-6 flex flex-col gap-6">
            {Object.entries(skillCategories as Record<string, string[]>).map(([cat, skills]) => {
              const colorClass = SKILL_COLORS[cat] ?? "text-muted-foreground border-border bg-surface-alt/60";
              const [textCol] = colorClass.split(" ");
              return (
                <div key={cat}>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${textCol}`}>
                    {skillCatLabels[cat] ?? cat}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105 cursor-default ${colorClass}`}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* EDUCATION */}
        {education.length > 0 && (
          <>
            <Reveal className="mb-4">
              <h2 className="text-xl font-bold text-foreground">
                {about.education?.title ?? (isFr ? "Formation" : "Education")}
              </h2>
            </Reveal>
            <Reveal className="mb-12">
              <div className="flex flex-col gap-3">
                {education.map((ed: any, i: number) => (
                  <div key={i} className="rounded-xl border border-border bg-surface-alt/40 px-5 py-4 flex items-start gap-4 hover:border-white/15 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/[0.09] border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-violet-500/[0.14] transition-colors">
                      <span className="text-lg">🎓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{ed.degree}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{ed.school}</p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">{ed.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </>
        )}

        {/* LANGUAGES */}
        {languages.items?.length > 0 && (
          <>
            <Reveal className="mb-4">
              <h2 className="text-xl font-bold text-foreground">{languages.title}</h2>
            </Reveal>
            <Reveal className="mb-12">
              <div className="rounded-2xl border border-border bg-surface-alt/40 p-6 flex flex-col gap-5">
                {languages.items.map((l: any, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-2xl shrink-0">{l.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-foreground">{l.name}</span>
                        <span className="text-xs text-muted-foreground">{l.level}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/50"
                          style={{ width: `${l.bar}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </>
        )}

        {/* VALUES */}
        {values.items?.length > 0 && (
          <>
            <Reveal className="mb-4">
              <h2 className="text-xl font-bold text-foreground">{values.title}</h2>
            </Reveal>
            <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
              {values.items.map((val: any, i: number) => (
                <RevealItem key={i}>
                  <div className="rounded-2xl border border-border bg-surface-alt/40 p-5 hover:border-white/15 hover:bg-surface-alt/60 transition-all h-full">
                    <div className="text-2xl mb-2">{val.icon}</div>
                    <p className="text-sm font-semibold text-foreground mb-1">{val.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{val.desc}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealStagger>
          </>
        )}

        {/* CONTACT CTA */}
        {contact.title && (
          <Reveal>
            <div className="rounded-2xl border border-primary/20 bg-primary/[0.05] p-8 text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">{contact.title}</h2>
              <p className="text-sm text-muted-foreground mb-6">{contact.desc}</p>
              <a href={socialLinks.email}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                <Mail className="size-4" /> {contact.cta}
              </a>
            </div>
          </Reveal>
        )}

      </div>
    </section>
  );
}
