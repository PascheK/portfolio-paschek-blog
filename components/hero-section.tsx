import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { LiveStatus } from "@/components/brand/live-status";
import { ScrollCue } from "@/components/brand/scroll-cue";
import { RotatingWords } from "@/components/brand/rotating-words";
import { SkillMarquee } from "@/components/brand/skill-marquee";

type SkillGroup = {
  label: string;
  skills: string[];
};

interface HeroSectionProps {
  lang: "en" | "fr";
  name: string;
  hello: string;
  titlePrefix: string;
  titleSuffix: string;
  tagline: string;
  skillGroups: SkillGroup[];
  projectsLabel: string;
  blogLabel: string;
  cvLabel: string;
  cvHref: string;
  photoAlt: string;
  doing?: string;
  place?: string;
  timeZone?: string;
  scrollLabel: string;
  scrollNext: string;
  scrollHref: string;
  buildPrefix: string;
  buildWords: string[];
  skillsLabel: string;
}

/**
 * Home hero. One primary CTA, two quiet ones. No animation of its own —
 * the page already fades in (see /brand.md → Motion).
 */
export function HeroSection({
  lang,
  name,
  hello,
  titlePrefix,
  titleSuffix,
  tagline,
  skillGroups,
  projectsLabel,
  blogLabel,
  cvLabel,
  cvHref,
  photoAlt,
  doing,
  place,
  timeZone,
  scrollLabel,
  scrollNext,
  scrollHref,
  buildPrefix,
  buildWords,
  skillsLabel,
}: HeroSectionProps) {
  return (
    <section
      id="intro"
      aria-labelledby="hero-title"
      className="flex min-h-[calc(100svh-4rem)] flex-col pb-10 pt-12 md:pb-12 md:pt-16"
    >
      <div className="my-auto grid gap-10 py-8 md:grid-cols-[1fr_auto] md:items-center md:gap-16">
        <div>
          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="eyebrow">{hello}</p>
            <span className="hidden h-3 w-px bg-border-strong sm:block" aria-hidden />
            <LiveStatus lang={lang} doing={doing} place={place} timeZone={timeZone} />
          </div>
          <h1 id="hero-title" className="t-display">
            {titlePrefix} <span className="mark">{name}</span>
            <br className="hidden sm:block" />{" "}
            <span className="text-muted-foreground">{titleSuffix}</span>
          </h1>
          <p className="mt-6 font-mono text-sm text-muted-foreground md:text-base">
            {buildPrefix} <RotatingWords words={buildWords} />
          </p>
          <p className="t-lead mt-4 max-w-xl">{tagline}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={`/${lang}/projects`} className="btn btn-primary">
              {projectsLabel}
              <ArrowRight aria-hidden />
            </Link>
            <Link href={`/${lang}/blog`} className="btn btn-secondary">
              {blogLabel}
            </Link>
            <a href={cvHref} download className="btn btn-ghost">
              <Download aria-hidden />
              {cvLabel}
            </a>
          </div>
        </div>

        <figure className="order-first md:order-none">
          <Image
            src="/profile.png"
            alt={photoAlt}
            width={176}
            height={176}
            priority
            className="size-28 rounded-xl border border-border object-cover md:size-44"
          />
        </figure>
      </div>

      <div className="border-t border-border pt-8">
        <SkillMarquee skills={skillGroups.flatMap((g) => g.skills)} label={skillsLabel} />
      </div>

      <div className="mt-10">
        <ScrollCue href={scrollHref} label={scrollLabel} next={scrollNext} />
      </div>
    </section>
  );
}
