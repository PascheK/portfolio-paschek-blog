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

export default async function TimelinePage({
  params,
}: {
  params: Promise<{ lang: "en" | "fr" }>;
}) {
  const { lang } = await params;
  const dict    = await getDictionary(lang);
  const isFr    = lang === "fr";

  // Read events from the dictionary (editable via admin)
  const timelineDict = (dict as any)?.timeline;
  const events: TimelineEvent[] = timelineDict?.events ?? [];

  const stats = STATS[lang];

  const title    = isFr ? "Mon Parcours"    : "My Journey";
  const subtitle = isFr
    ? "Formations, expériences et projets qui m'ont façonné."
    : "Education, work and projects that shaped who I am.";

  const labels = {
    work:      isFr ? "Emploi"    : "Work",
    education: isFr ? "Formation" : "Education",
    project:   isFr ? "Projet"    : "Project",
    milestone: isFr ? "Étape"     : "Milestone",
    current:   isFr ? "En cours"  : "Current",
  };

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 pb-24">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <Reveal className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold title leading-tight mb-3">{title}</h1>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </Reveal>

        {/* Stats */}
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

        {/* Interactive timeline */}
        <TimelineClient events={events} lang={lang} labels={labels} />

      </div>
    </section>
  );
}
