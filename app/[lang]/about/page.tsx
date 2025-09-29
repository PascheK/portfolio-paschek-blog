import Image from "next/image";
import { getDictionary } from "@/lib/dictionaries";
import { metaData } from "@/lib/config";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";

export const dynamic = "force-static";

export default async function AboutPage({ params }: { params: Promise<{ lang: "en" | "fr" }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  const experiences: Array<{ title: string; org: string; period: string; description: string }> =
    dict?.about?.experiences ?? [];
  const skills: string[] = dict?.about?.skills?.items ?? [];
  const education: Array<{ degree: string; school: string; year: string }> =
    dict?.about?.education?.items ?? [];
  const cvUrl: string = dict?.about?.cvUrl ?? "/cv.pdf";

  return (
    <section className="w-full px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Intro */}
        <Reveal className="flex flex-col items-center text-center gap-4 mb-10">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border border-border shadow bg-surface-alt">
            <Image
              src="/profile.png"
              alt={(dict?.about?.profileAlt || "Profile photo of {{name}}")
                .replace("{{name}}", metaData.name)}
              fill
              className="object-cover"
              sizes="128px"
              priority
            />
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
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Experience */}
          <Reveal>
            <div className="rounded-xl border border-border bg-surface-alt/60 backdrop-blur p-5 h-full">
              <h2 className="text-xl font-semibold mb-3">
                {dict?.about?.experienceTitle ?? (lang === "fr" ? "Parcours / Expérience" : "Experience")}
              </h2>
              <RevealStagger className="flex flex-col gap-3">
                {experiences.map((exp: any, idx: number) => (
                  <RevealItem key={idx}>
                    <div className="rounded-lg border border-border bg-surface/60 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                        <div className="font-medium text-foreground">
                          {exp.title} <span className="text-muted-foreground">· {exp.org}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{exp.period}</div>
                      </div>
                      {exp.description && (
                        <p className="mt-1 text-sm text-muted-foreground/90">{exp.description}</p>
                      )}
                    </div>
                  </RevealItem>
                ))}
              </RevealStagger>
            </div>
          </Reveal>

          {/* Skills */}
          <Reveal>
            <div className="rounded-xl border border-border bg-surface-alt/60 backdrop-blur p-5 h-full">
              <h2 className="text-xl font-semibold mb-3">
                {dict?.about?.skills?.title ?? (lang === "fr" ? "Compétences" : "Skills")}
              </h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm border border-border"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Education */}
          <Reveal>
            <div className="rounded-xl border border-border bg-surface-alt/60 backdrop-blur p-5 h-full">
              <h2 className="text-xl font-semibold mb-3">
                {dict?.about?.education?.title ?? (lang === "fr" ? "Formation" : "Education")}
              </h2>
              <div className="flex flex-col gap-3">
                {education.map((ed, idx) => (
                  <div key={idx} className="rounded-lg border border-border bg-surface/60 p-4">
                    <div className="font-medium text-foreground">{ed.degree}</div>
                    <div className="text-sm text-muted-foreground/90">{ed.school}</div>
                    <div className="text-xs text-muted-foreground/70">{ed.year}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Download CV */}
          <Reveal>
            <div className="rounded-xl border border-border bg-surface-alt/60 backdrop-blur p-5 h-full flex items-center justify-center">
              <a
                href={cvUrl}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-primary-foreground hover:brightness-110 transition-colors shadow"
                download
              >
                {dict?.about?.downloadCV ?? (lang === "fr" ? "Télécharger mon CV" : "Download my CV")}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
