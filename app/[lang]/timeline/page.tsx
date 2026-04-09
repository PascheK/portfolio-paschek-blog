import { getDictionary } from "@/lib/dictionaries";
import { Reveal } from "@/components/ui/reveal";
import { Briefcase, GraduationCap, Rocket, Star } from "lucide-react";
import { TimelineClient, type TimelineEvent } from "./timeline-client";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Timeline",
  description: "My journey — education, work and projects over the years.",
};

<<<<<<< HEAD
// ── Timeline data — edit here to update your story ───────────────────────────
const TIMELINE_EN: TimelineEvent[] = [
  {
    year: "2025 – present",
    startYear: 2025,
    type: "work",
    current: true,
    title: "Full-Stack Developer",
    org: "Freelance",
    description:
      "Building web applications and digital products for clients. Focus on React, Next.js and modern backend stacks. Combining design sensibility with engineering rigour.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind", "Node.js"],
  },
  {
    year: "2024 – present",
    startYear: 2024,
    type: "project",
    current: true,
    title: "portfolio-paschek-blog",
    description:
      "Designed and built this portfolio from scratch — multilingual (EN/FR), MDX blog, custom admin panel with a Notion-style block editor, aurora background, custom cursor.",
    tags: ["Next.js 15", "MDX", "Framer Motion", "Tailwind", "GitHub API"],
    url: "https://github.com/PascheK/portfolio-paschek-blog",
  },
  {
    year: "2023",
    startYear: 2023,
    type: "work",
    title: "Developer Intern",
    org: "Tech Company",
    location: "France",
    description:
      "Worked on internal tooling and customer-facing features in an agile team. Gained hands-on experience with CI/CD pipelines, code review practices and production deployments.",
    tags: ["React", "Node.js", "Docker", "PostgreSQL"],
  },
  {
    year: "2022",
    startYear: 2022,
    type: "project",
    title: "Divin — Creative Studio",
    description:
      "Co-founded a small creative studio delivering websites and brand identities for local businesses. Handled client relations, design and front-end development.",
    tags: ["Freelance", "Branding", "Webflow", "Figma"],
    url: "https://divin.fr",
  },
  {
    year: "2021",
    startYear: 2021,
    type: "education",
    title: "Computer Science Degree",
    org: "University",
    location: "France",
    description:
      "Studied algorithms, software engineering, networks and databases. Built several group projects including a web app and a compiler. Graduated with honours.",
    tags: ["Java", "SQL", "Linux", "Algorithms", "Networks"],
  },
  {
    year: "2019",
    startYear: 2019,
    type: "milestone",
    title: "First line of code",
    description:
      "Built my first website with HTML & CSS just to see if I could. Got hooked immediately — never looked back. That curiosity turned into a full-blown passion.",
  },
];

const TIMELINE_FR: TimelineEvent[] = [
  {
    year: "2025 – auj.",
    startYear: 2025,
    type: "work",
    current: true,
    title: "Développeur Full-Stack",
    org: "Freelance",
    description:
      "Création d'applications web et de produits numériques pour des clients. Focus sur React, Next.js et les stacks backend modernes. Allier sens du design et rigueur technique.",
    tags: ["Next.js", "React", "TypeScript", "Tailwind", "Node.js"],
  },
  {
    year: "2024 – auj.",
    startYear: 2024,
    type: "project",
    current: true,
    title: "portfolio-paschek-blog",
    description:
      "Conception et développement de ce portfolio from scratch — multilingue (EN/FR), blog MDX, panel admin avec éditeur de blocs style Notion, fond aurora, curseur personnalisé.",
    tags: ["Next.js 15", "MDX", "Framer Motion", "Tailwind", "GitHub API"],
    url: "https://github.com/PascheK/portfolio-paschek-blog",
  },
  {
    year: "2023",
    startYear: 2023,
    type: "work",
    title: "Développeur Stagiaire",
    org: "Entreprise Tech",
    location: "France",
    description:
      "Travail sur des outils internes et des fonctionnalités client en équipe agile. Expérience concrète sur les pipelines CI/CD, les code reviews et les déploiements en production.",
    tags: ["React", "Node.js", "Docker", "PostgreSQL"],
  },
  {
    year: "2022",
    startYear: 2022,
    type: "project",
    title: "Divin — Studio Créatif",
    description:
      "Co-fondateur d'un petit studio créatif livrant sites web et identités visuelles pour des entreprises locales. Gestion clients, design et développement front-end.",
    tags: ["Freelance", "Branding", "Webflow", "Figma"],
    url: "https://divin.fr",
  },
  {
    year: "2021",
    startYear: 2021,
    type: "education",
    title: "Licence Informatique",
    org: "Université",
    location: "France",
    description:
      "Étude des algorithmes, du génie logiciel, des réseaux et des bases de données. Plusieurs projets de groupe dont une application web et un compilateur. Diplômé avec mention.",
    tags: ["Java", "SQL", "Linux", "Algorithmes", "Réseaux"],
  },
  {
    year: "2019",
    startYear: 2019,
    type: "milestone",
    title: "Première ligne de code",
    description:
      "Créé mon premier site en HTML & CSS juste pour voir si je pouvais. Accroché immédiatement — jamais regardé en arrière. Cette curiosité s'est transformée en passion.",
  },
];

// ── Stats ─────────────────────────────────────────────────────────────────────
const STATS = {
  en: [
    { label: "Years coding",  value: "6+" },
    { label: "Projects",      value: "10+" },
    { label: "Technologies",  value: "15+" },
    { label: "Cups of coffee", value: "∞" },
  ],
  fr: [
    { label: "Ans de code",   value: "6+" },
    { label: "Projets",       value: "10+" },
    { label: "Technologies",  value: "15+" },
    { label: "Cafés bus",     value: "∞" },
  ],
};

const TYPE_ICONS = { work: Briefcase, education: GraduationCap, project: Rocket, milestone: Star };

=======
const STATS = {
  en: [
    { label: "Years coding",   value: "6+" },
    { label: "Projects",       value: "10+" },
    { label: "Technologies",   value: "15+" },
    { label: "Cups of coffee", value: "∞"  },
  ],
  fr: [
    { label: "Ans de code",  value: "6+"  },
    { label: "Projets",      value: "10+" },
    { label: "Technologies", value: "15+" },
    { label: "Cafés bus",    value: "∞"   },
  ],
};

>>>>>>> origin/main
export default async function TimelinePage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { lang } = await params;
<<<<<<< HEAD
  const isFr    = lang === "fr";
  const events  = isFr ? TIMELINE_FR : TIMELINE_EN;
  const stats   = STATS[lang];
=======
  const dict    = await getDictionary(lang);
  const isFr    = lang === "fr";

  // Read events from the dictionary (editable via admin)
  const timelineDict = (dict as any)?.timeline;
  const events: TimelineEvent[] = timelineDict?.events ?? [];

  const stats = STATS[lang];
>>>>>>> origin/main

  const title    = isFr ? "Mon Parcours"    : "My Journey";
  const subtitle = isFr
    ? "Formations, expériences et projets qui m'ont façonné."
    : "Education, work and projects that shaped who I am.";

  const labels = {
<<<<<<< HEAD
    work:       isFr ? "Emploi"    : "Work",
    education:  isFr ? "Formation" : "Education",
    project:    isFr ? "Projet"    : "Project",
    milestone:  isFr ? "Étape"     : "Milestone",
    current:    isFr ? "En cours"  : "Current",
=======
    work:      isFr ? "Emploi"    : "Work",
    education: isFr ? "Formation" : "Education",
    project:   isFr ? "Projet"    : "Project",
    milestone: isFr ? "Étape"     : "Milestone",
    current:   isFr ? "En cours"  : "Current",
>>>>>>> origin/main
  };

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 pb-24">
      <div className="max-w-2xl mx-auto">

<<<<<<< HEAD
        {/* ── Header ────────────────────────────────────────────────────── */}
        <Reveal className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold title leading-tight mb-3">
            {title}
          </h1>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </Reveal>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
=======
        {/* Header */}
        <Reveal className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold title leading-tight mb-3">{title}</h1>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </Reveal>

        {/* Stats */}
>>>>>>> origin/main
        <Reveal className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat, i) => {
              const icons = [Briefcase, Rocket, GraduationCap, Star];
              const Icon = icons[i];
              const colors = [
                "text-sky-400 bg-sky-500/[0.08] border-sky-500/20",
                "text-emerald-400 bg-emerald-500/[0.08] border-emerald-500/20",
                "text-violet-400 bg-violet-500/[0.08] border-violet-500/20",
                "text-amber-400 bg-amber-500/[0.08] border-amber-500/20",
              ];
              return (
                <div key={i} className={`rounded-xl border p-4 text-center ${colors[i]}`}>
                  <Icon className="size-4 mx-auto mb-2 opacity-70" />
                  <p className="text-2xl font-black">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </Reveal>

<<<<<<< HEAD
        {/* ── Interactive client timeline ────────────────────────────────── */}
=======
        {/* Interactive timeline */}
>>>>>>> origin/main
        <TimelineClient events={events} lang={lang} labels={labels} />

      </div>
    </section>
  );
}
