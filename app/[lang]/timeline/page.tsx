import { getDictionary } from "@/lib/dictionaries";
import { Reveal } from "@/components/ui/reveal";
import { Briefcase, GraduationCap, Rocket, Star } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Timeline",
  description: "My journey — education, work and projects over the years.",
};

// ── Timeline data ────────────────────────────────────────────────────────────
// Edit this array to update your timeline. Each entry can be one of:
//   type: 'work' | 'education' | 'project' | 'milestone'
type EventType = "work" | "education" | "project" | "milestone";

interface TimelineEvent {
  year: string;
  type: EventType;
  title: string;
  org?: string;
  location?: string;
  description: string;
  tags?: string[];
  current?: boolean;
}

const TIMELINE_EN: TimelineEvent[] = [
  {
    year: "2025 – now",
    type: "work",
    title: "Full-Stack Developer",
    org: "Freelance",
    description:
      "Building web applications and digital products for various clients. Focus on React, Next.js and modern backend stacks.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
    current: true,
  },
  {
    year: "2024",
    type: "project",
    title: "portfolio-paschek-blog",
    description:
      "Designed and built this portfolio from scratch — multilingual, dark mode, MDX blog, custom admin panel with block editor.",
    tags: ["Next.js 15", "MDX", "Framer Motion"],
  },
  {
    year: "2023",
    type: "work",
    title: "Developer Intern",
    org: "Tech Company",
    location: "France",
    description:
      "Worked on internal tooling and customer-facing features. Gained hands-on experience in agile teams and CI/CD pipelines.",
    tags: ["React", "Node.js", "Docker"],
  },
  {
    year: "2022",
    type: "project",
    title: "Divin — Design Agency",
    description:
      "Co-founded a small creative studio delivering websites and brand identities for local businesses.",
    tags: ["Freelance", "Branding", "Webflow"],
  },
  {
    year: "2021",
    type: "education",
    title: "Computer Science Degree",
    org: "University",
    location: "France",
    description:
      "Studied algorithms, software engineering, networks and databases. Graduated with honours.",
    tags: ["Java", "SQL", "Linux", "Algorithms"],
  },
  {
    year: "2019",
    type: "milestone",
    title: "First line of code",
    description:
      "Built my first website with HTML & CSS just to see if I could. Got hooked immediately — never looked back.",
  },
];

const TIMELINE_FR: TimelineEvent[] = [
  {
    year: "2025 – auj.",
    type: "work",
    title: "Développeur Full-Stack",
    org: "Freelance",
    description:
      "Création d'applications web et de produits numériques pour divers clients. Focus sur React, Next.js et les stacks backend modernes.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
    current: true,
  },
  {
    year: "2024",
    type: "project",
    title: "portfolio-paschek-blog",
    description:
      "Conception et développement de ce portfolio from scratch — multilingue, mode sombre, blog MDX, panel admin avec éditeur de blocs.",
    tags: ["Next.js 15", "MDX", "Framer Motion"],
  },
  {
    year: "2023",
    type: "work",
    title: "Développeur Stagiaire",
    org: "Entreprise Tech",
    location: "France",
    description:
      "Travail sur des outils internes et des fonctionnalités client. Expérience en équipes agiles et pipelines CI/CD.",
    tags: ["React", "Node.js", "Docker"],
  },
  {
    year: "2022",
    type: "project",
    title: "Divin — Studio Créatif",
    description:
      "Co-fondateur d'un petit studio créatif livrant sites web et identités visuelles pour des entreprises locales.",
    tags: ["Freelance", "Branding", "Webflow"],
  },
  {
    year: "2021",
    type: "education",
    title: "Licence Informatique",
    org: "Université",
    location: "France",
    description:
      "Étude des algorithmes, du génie logiciel, des réseaux et des bases de données. Diplômé avec mention.",
    tags: ["Java", "SQL", "Linux", "Algorithmes"],
  },
  {
    year: "2019",
    type: "milestone",
    title: "Première ligne de code",
    description:
      "Créé mon premier site en HTML & CSS juste pour voir si je pouvais. Accroché immédiatement — jamais regardé en arrière.",
  },
];

// ── Config per type ───────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  EventType,
  { icon: React.ElementType; color: string; bgDot: string; label: { en: string; fr: string } }
> = {
  work: {
    icon: Briefcase,
    color: "text-sky-400 border-sky-500/40 bg-sky-500/[0.09]",
    bgDot: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]",
    label: { en: "Work", fr: "Emploi" },
  },
  education: {
    icon: GraduationCap,
    color: "text-violet-400 border-violet-500/40 bg-violet-500/[0.09]",
    bgDot: "bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.6)]",
    label: { en: "Education", fr: "Formation" },
  },
  project: {
    icon: Rocket,
    color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/[0.09]",
    bgDot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    label: { en: "Project", fr: "Projet" },
  },
  milestone: {
    icon: Star,
    color: "text-amber-400 border-amber-500/40 bg-amber-500/[0.09]",
    bgDot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    label: { en: "Milestone", fr: "Étape" },
  },
};

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isFr = lang === "fr";

  const events = isFr ? TIMELINE_FR : TIMELINE_EN;

  const title = isFr ? "Mon Parcours" : "My Journey";
  const subtitle = isFr
    ? "Formations, expériences et projets qui m'ont façonné."
    : "Education, work and projects that shaped who I am.";

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ────────────────────────────────────────────────────── */}
        <Reveal className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold title leading-tight mb-3">
            {title}
          </h1>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </Reveal>

        {/* ── Timeline ──────────────────────────────────────────────────── */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" />

          <div className="flex flex-col gap-0">
            {events.map((event, idx) => {
              const config = TYPE_CONFIG[event.type];
              const Icon = config.icon;
              const typeLabel = config.label[lang] ?? config.label.en;

              return (
                <Reveal
                  key={idx}
                  className="relative pl-12 pb-10 last:pb-0"
                >
                  {/* Dot on the line */}
                  <div
                    className={`absolute left-[10px] top-[5px] w-[17px] h-[17px] rounded-full border-2 border-background ${config.bgDot} flex items-center justify-center`}
                  >
                    {event.current && (
                      <span className="absolute inset-0 rounded-full animate-ping opacity-40 bg-current" />
                    )}
                  </div>

                  {/* Card */}
                  <div className="group rounded-2xl border border-border bg-surface-alt/50 backdrop-blur hover:border-border/80 hover:bg-surface-alt/80 transition-all duration-300 overflow-hidden">
                    {/* Card header */}
                    <div className="flex flex-wrap items-start justify-between gap-2 px-5 pt-4 pb-3">
                      <div className="flex flex-col gap-1 min-w-0">
                        {/* Year + type badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-primary/70 font-semibold">
                            {event.year}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${config.color}`}
                          >
                            <Icon className="size-2.5" />
                            {typeLabel}
                            {event.current && (
                              <span className="ml-0.5 w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            )}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className="text-base font-bold text-foreground leading-snug">
                          {event.title}
                        </h2>

                        {/* Org + location */}
                        {(event.org || event.location) && (
                          <p className="text-xs text-muted-foreground">
                            {[event.org, event.location].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="px-5 pb-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>

                      {/* Tags */}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {event.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md border border-border bg-surface/60 text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
