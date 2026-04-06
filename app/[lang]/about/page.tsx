import Image from "next/image";
import { getDictionary } from "@/lib/dictionaries";
import { metaData } from "@/lib/config";
import { Reveal, RevealScale, RevealX, RevealBounce, RevealStagger, RevealItem } from "@/components/ui/reveal";
import { Timeline } from "@/components/ui/timeline";
import { Download } from "lucide-react";

export const dynamic = "force-static";

const skillCategoryColors: Record<string, string> = {
  frontend: "text-sky-400 border-sky-500/40 bg-sky-500/10",
  backend: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  devops: "text-violet-400 border-violet-500/40 bg-violet-500/10",
};

export default async function AboutPage({ params }: { params: Promise<{ lang: "en" | "fr" }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const experiences: Array<{ title: string; org: string; period: string; description: string; type?: string }> =
    dict?.about?.experiences ?? [];
  const skillCategories: Record<string, string[]> = dict?.about?.skills?.categories ?? {};
  const skillCategoryLabels: Record<string, string> = dict?.about?.skillsCategories ?? {};
  const education: Array<{ degree: string; school: string; year: string }> =
    dict?.about?.education?.items ?? [];
  const cvUrl: string = dict?.about?.cvUrl ?? "/cv.pdf";

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 pb-16">
      <div className="max-w-6xl mx-auto">

        {/* ── INTRO ──────────────────────────────────────────────── */}
        <RevealScale scale={0.88} duration={0.65} className="flex flex-col items-center text-center gap-4 mb-12">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-br from-blue-500/25 via-purple-500/15 to-emerald-500/15 scale-150" />
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-primary/40 shadow-2xl ring-4 ring-primary/10">
              <Image
                src="/profile.png"
                alt={(dict?.about?.profileAlt || "Profile photo of {{name}}")
                  .replace("{{name}}", metaData.name)}
                fill
                className="object-cover"
                sizes="144px"
                priority
              />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold title">
              {dict?.about?.title ?? (lang === "fr" ? "À propos de moi" : "About me")}
            </h1>
            {dict?.about?.tagline && (
              <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
                {dict.about.tagline}
              </p>
            )}
          </div>
        </RevealScale>

        {/* ── MAIN LAYOUT ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start">

          {/* Left: Timeline — slides from left */}
          <div>
            <RevealX from="left" duration={0.5} className="mb-5">
              <h2 className="text-xl font-semibold">
                {dict?.about?.experienceTitle ?? (lang === "fr" ? "Parcours / Expérience" : "Experience")}
              </h2>
            </RevealX>
            <RevealX from="left" duration={0.55} delay={0.05}>
              <Timeline items={experiences} />
            </RevealX>
          </div>

          {/* Right: Skills + Education + CV — slides from right */}
          <div className="flex flex-col gap-5">

            {/* Skills grouped by category */}
            <RevealX from="right" duration={0.5}>
              <div className="rounded-2xl border border-border bg-surface-alt/60 backdrop-blur p-5 shadow-sm">
                <h2 className="text-base font-semibold mb-4">
                  {dict?.about?.skills?.title ?? (lang === "fr" ? "Compétences" : "Skills")}
                </h2>
                <div className="flex flex-col gap-4">
                  {Object.entries(skillCategories).map(([category, skills]) => (
                    <div key={category}>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${skillCategoryColors[category]?.split(' ')[0] ?? 'text-muted-foreground'}`}>
                        {skillCategoryLabels[category] ?? category}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${skillCategoryColors[category] ?? 'border-border text-foreground bg-surface-alt'}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealX>

            {/* Education */}
            <RevealX from="right" duration={0.5} delay={0.08}>
              <div className="rounded-2xl border border-border bg-surface-alt/60 backdrop-blur p-5 shadow-sm">
                <h2 className="text-base font-semibold mb-3">
                  {dict?.about?.education?.title ?? (lang === "fr" ? "Formation" : "Education")}
                </h2>
                <div className="flex flex-col gap-3">
                  {education.map((ed, idx) => (
                    <div key={idx} className="rounded-xl border border-border bg-surface/60 p-3">
                      <div className="font-medium text-sm text-foreground">{ed.degree}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{ed.school}</div>
                      <div className="text-xs text-muted-foreground/70 mt-0.5">{ed.year}</div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealX>

            {/* Download CV — bounce pop */}
            <RevealBounce delay={0.15}>
              <a
                href={cvUrl}
                download
                className="flex items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 hover:bg-primary/15 text-primary px-5 py-3 font-semibold text-sm transition-all shadow-sm hover:shadow-md"
              >
                <Download className="size-4" />
                {dict?.about?.downloadCV ?? (lang === "fr" ? "Télécharger mon CV" : "Download my CV")}
              </a>
            </RevealBounce>
          </div>
        </div>
      </div>
    </section>
  );
}
