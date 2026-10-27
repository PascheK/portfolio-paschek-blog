import Image from "next/image";
import { getDictionary } from "@/lib/dictionaries";
import { metaData, socialLinks, availability } from "@/lib/config";
import { Reveal } from "@/components/ui/reveal";
import { TimelineClient, type TimelineEvent } from "@/app/[lang]/timeline/timeline-client";
import { StatGrid } from "@/components/brand/stat-grid";
import { Download, Mail, MapPin, ExternalLink, Github } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "About",
  description: "Full-stack developer.",
};

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
    <div className="container-page">

      {/* ── Intro ───────────────────────────────────────────── */}
      <header className="pt-12 pb-14 md:pt-16 md:pb-20">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-10">
          <Image
            src="/profile.png"
            alt={(about.profileAlt ?? "Profile photo of {{name}}").replace("{{name}}", metaData.name)}
            width={160}
            height={160}
            priority
            className="size-28 shrink-0 rounded-xl border border-border object-cover sm:size-36"
          />
          <div>
            <p className="eyebrow mb-4">{about.title}</p>
            <h1 className="t-h1">{metaData.name}</h1>
            <p className="t-lead mt-3 max-w-xl">{about.tagline}</p>

            <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {availability.available && (
                <li className="inline-flex items-center gap-2 text-foreground">
                  <span className="size-1.5 rounded-full bg-success" aria-hidden />
                  {isFr ? availability.labelFr : availability.labelEn}
                </li>
              )}
              <li className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" aria-hidden /> {(dict.now?.status as any)?.location ?? "Switzerland"}
              </li>
              <li>
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-quiet inline-flex items-center gap-1.5 rounded-sm"
                >
                  <Github className="size-4" aria-hidden /> GitHub
                  <ExternalLink className="size-3" aria-hidden />
                </a>
              </li>
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={socialLinks.email} className="btn btn-primary">
                <Mail aria-hidden /> {contact.cta ?? (isFr ? "Me contacter" : "Contact me")}
              </a>
              <a href={cvUrl} download className="btn btn-secondary">
                <Download aria-hidden /> {about.downloadCV ?? "Download CV"}
              </a>
            </div>
          </div>
        </div>
      </header>

      {stats.length > 0 && <StatGrid stats={stats} label={isFr ? "Chiffres clés" : "Key figures"} />}

      {/* ── Bio ─────────────────────────────────────────────── */}
      {bio.length > 0 && (
        <section className="section" aria-label={isFr ? "Biographie" : "Biography"}>
          <Reveal className="max-w-2xl space-y-5 text-[1.0625rem] leading-relaxed">
            {bio.map((paragraph: string, i: number) => (
              <p key={i} className={i === 0 ? "text-foreground" : "text-muted-foreground"}>{paragraph}</p>
            ))}
          </Reveal>
        </section>
      )}

      {/* ── Experience ──────────────────────────────────────── */}
      {timelineEvents.length > 0 && (
        <section aria-labelledby="experience-title" className="section border-t border-border">
          <h2 id="experience-title" className="t-h2 mb-8">
            {about.timeline?.title ?? (isFr ? "Expériences & Projets" : "Experience & Projects")}
          </h2>
          <TimelineClient events={timelineEvents} lang={lang} labels={timelineLabels} />
        </section>
      )}

      {/* ── Skills ──────────────────────────────────────────── */}
      <section aria-labelledby="skills-title" className="section border-t border-border">
        <h2 id="skills-title" className="t-h2 mb-8">
          {about.skills?.title ?? (isFr ? "Compétences" : "Skills")}
        </h2>
        <dl className="grid gap-8 sm:grid-cols-3">
          {Object.entries(skillCategories as Record<string, string[]>).map(([cat, skills]) => (
            <div key={cat}>
              <dt className="eyebrow mb-4">{skillCatLabels[cat] ?? cat}</dt>
              <dd>
                <ul className="flex flex-wrap gap-1.5">
                  {skills.map((skill) => (
                    <li key={skill} className="tag">{skill}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Education + Languages ───────────────────────────── */}
      {(education.length > 0 || languages.items?.length > 0) && (
        <section className="section border-t border-border">
          <div className="grid gap-14 md:grid-cols-2">
            {education.length > 0 && (
              <div>
                <h2 id="education-title" className="t-h2 mb-8">
                  {about.education?.title ?? (isFr ? "Formation" : "Education")}
                </h2>
                <ul className="flex flex-col gap-3" aria-labelledby="education-title">
                  {education.map((ed: any, i: number) => (
                    <li key={i} className="card p-5">
                      <p className="t-h3">{ed.degree}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{ed.school}</p>
                      <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{ed.year}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {languages.items?.length > 0 && (
              <div>
                <h2 id="languages-title" className="t-h2 mb-8">{languages.title}</h2>
                <ul className="flex flex-col gap-5" aria-labelledby="languages-title">
                  {languages.items.map((l: any, i: number) => (
                    <li key={i}>
                      <div className="mb-2 flex items-baseline justify-between">
                        <span className="text-sm font-medium">{l.name}</span>
                        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{l.level}</span>
                      </div>
                      <div className="h-1 overflow-hidden rounded-full bg-surface-alt" aria-hidden>
                        <div className="h-full rounded-full bg-primary" style={{ width: `${l.bar}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Values ──────────────────────────────────────────── */}
      {values.items?.length > 0 && (
        <section aria-labelledby="values-title" className="section border-t border-border">
          <h2 id="values-title" className="t-h2 mb-8">{values.title}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {values.items.map((val: any, i: number) => (
              <li key={i} className="card h-full p-5">
                <p className="eyebrow mb-3">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="t-h3 mb-2">{val.label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{val.desc}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ── Contact CTA ─────────────────────────────────────── */}
      {contact.title && (
        <section aria-labelledby="about-contact-title" className="section border-t border-border">
          <div className="card flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div className="max-w-xl">
              <h2 id="about-contact-title" className="t-h2">{contact.title}</h2>
              <p className="t-lead mt-3">{contact.desc}</p>
            </div>
            <a href={socialLinks.email} className="btn btn-primary shrink-0">
              <Mail aria-hidden /> {contact.cta}
            </a>
          </div>
        </section>
      )}
    </div>
  );
}
