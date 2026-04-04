import Image from "next/image";
import { getDictionary } from '@/lib/dictionaries';
import { socialLinks } from '@/lib/config';
import { Github, Mail, Instagram, ChevronDown, Code2, Database, Server, Phone, Layers, Clock, Cpu, Coffee } from "lucide-react";
import Link from 'next/link';
import { Reveal, RevealStagger, RevealItem } from '@/components/ui/reveal';
import { AnimatedCounter } from '@/components/ui/animated-counter';
import { getProjectPosts } from "@/lib/posts";
import Snowfalling from "@/components/Snowfalling";
import { ContactForm } from "@/components/contact-form";

function parseTags(raw?: string | string[]): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  const t = raw.trim();
  if (t.startsWith('[')) {
    try {
      const arr = JSON.parse(t);
      if (Array.isArray(arr)) return arr.map(String);
    } catch {}
  }
  return t.split(',').map((s) => s.trim()).filter(Boolean);
}

export default async function Page({
  params,
}: {
  params: Promise<{ lang: 'en' | 'fr' }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const posts = getProjectPosts(lang).sort((a, b) => {
    const da = a.metadata.publishedAt ? new Date(a.metadata.publishedAt).getTime() : 0;
    const db = b.metadata.publishedAt ? new Date(b.metadata.publishedAt).getTime() : 0;
    return db - da;
  });
  const featuredProjects = posts.slice(0, 3);

  const skillGroups = [
    { label: 'Frontend', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'], color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' },
    { label: 'Backend', skills: ['Node.js', 'Express.js', 'Java', 'Spring Boot'], color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    { label: 'DevOps', skills: ['Docker', 'CI/CD', 'Vercel', 'PostgreSQL'], color: 'text-violet-400 border-violet-500/40 bg-violet-500/10' },
  ];

  return (
    <>
      <Snowfalling />
      <main className="flex-1 w-full min-w-0 flex flex-col px-6 sm:px-6 md:px-8">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="w-full max-w-6xl mx-auto pt-10 md:pt-16 pb-12 md:pb-16 text-center">
          <Reveal className="flex flex-col items-center gap-6" y={10} duration={0.45}>
            {/* Profile glow */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-emerald-500/20 scale-125" />
              <Image
                src="/profile.png"
                alt="photo de profil"
                width={160}
                height={160}
                className="relative rounded-full border-2 border-primary/50 shadow-2xl object-cover ring-4 ring-primary/10"
                priority
              />
            </div>

            <Reveal y={6} delay={0.1} duration={0.4}>
              <p className="text-sm uppercase tracking-widest text-primary font-medium">{dict.home.hero.hello}</p>
              <h1 className="mt-2 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight title">
                {dict.home.hero.title_prefix}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">Pasche Killian</span>
                <br className="hidden sm:block" /> {dict.home.hero.title_suffix}
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
                {dict.home.hero.tagline}
              </p>
            </Reveal>

            {/* Skill badges grouped by category */}
            <RevealStagger className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
              {skillGroups.map(({ label, skills, color }) =>
                skills.map(skill => (
                  <RevealItem key={skill}>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${color} backdrop-blur text-xs font-medium`}>
                      {skill}
                    </span>
                  </RevealItem>
                ))
              )}
            </RevealStagger>

            <div className="mt-2 animate-bounce text-primary/60">
              <a href="#stats" aria-label={dict.a11y?.goToProjects ?? 'Scroll down'}>
                <ChevronDown className="size-6" />
              </a>
            </div>
          </Reveal>
        </section>

        {/* ── STATS ────────────────────────────────────────────── */}
        <section id="stats" className="w-full max-w-6xl mx-auto py-6 md:py-10">
          <RevealStagger className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <RevealItem>
              <AnimatedCounter to={posts.length} suffix="+" label={dict.home.stats.projects} icon={<Layers className="size-5" />} />
            </RevealItem>
            <RevealItem>
              <AnimatedCounter to={3} suffix="+" label={dict.home.stats.years} icon={<Clock className="size-5" />} />
            </RevealItem>
            <RevealItem>
              <AnimatedCounter to={14} label={dict.home.stats.technologies} icon={<Cpu className="size-5" />} />
            </RevealItem>
            <RevealItem>
              <AnimatedCounter to={999} suffix="+" label={dict.home.stats.coffees} icon={<Coffee className="size-5" />} />
            </RevealItem>
          </RevealStagger>
        </section>

        {/* ── FEATURED PROJECTS ────────────────────────────────── */}
        <section id="projects" className="w-full max-w-6xl mx-auto py-8 md:py-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold">{dict.home.sections.projects_featured}</h2>
            <Link href={`/${lang}/projects`} className="text-sm underline text-primary hover:text-primary/80 transition-colors">{dict.home.sections.projects_all}</Link>
          </div>
          <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProjects.map((project, idx) => {
              const borders = [
                { border: 'border-rose-500/50', glow: 'hover:shadow-rose-500/10' },
                { border: 'border-blue-500/50', glow: 'hover:shadow-blue-500/10' },
                { border: 'border-yellow-400/60', glow: 'hover:shadow-yellow-400/10' },
                { border: 'border-emerald-400/60', glow: 'hover:shadow-emerald-400/10' },
                { border: 'border-purple-500/60', glow: 'hover:shadow-purple-500/10' },
                { border: 'border-cyan-400/60', glow: 'hover:shadow-cyan-400/10' },
              ];
              const { border, glow } = borders[idx % borders.length];
              const p = project.metadata;
              const imageSrc = p.image ?? '/opengraph-image.png';
              const href = p.url || `/${lang}/projects/${project.slug}`;
              const isExternal = Boolean(p.url);
              return (
                <RevealItem key={project.slug}>
                  <a
                    href={href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noreferrer noopener' : undefined}
                    className={`group rounded-2xl overflow-hidden bg-surface-alt/70 dark:bg-surface-alt/40 backdrop-blur border ${border} shadow-lg ${glow} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl flex flex-col`}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      {p.image ? (
                        <Image src={imageSrc} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-surface-alt via-muted to-surface flex items-center justify-center">
                          <Code2 className="size-10 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <h3 className="text-base font-semibold group-hover:text-primary transition-colors">{p.title}</h3>
                      {p.summary && <p className="text-sm text-muted-foreground line-clamp-2">{p.summary}</p>}
                      {parseTags(p.tags).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-auto pt-2">
                          {parseTags(p.tags).slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </a>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </section>

        {/* ── SERVICES ─────────────────────────────────────────── */}
        <section className="w-full max-w-6xl mx-auto py-8 md:py-12">
          <Reveal>
            <h2 className="text-2xl sm:text-3xl font-bold">{dict.home.services.title}</h2>
            <p className="text-muted-foreground mt-1 mb-6">{dict.home.services.subtitle}</p>
          </Reveal>
          <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: dict.home.services.items.web.title, desc: dict.home.services.items.web.desc, Icon: Code2, color: 'text-sky-300 border-sky-400/50 bg-sky-500/10' },
              { title: dict.home.services.items.api.title, desc: dict.home.services.items.api.desc, Icon: Database, color: 'text-emerald-300 border-emerald-400/50 bg-emerald-500/10' },
              { title: dict.home.services.items.devops.title, desc: dict.home.services.items.devops.desc, Icon: Server, color: 'text-violet-300 border-violet-400/50 bg-violet-500/10' },
            ].map(({ title, desc, Icon, color }) => (
              <RevealItem key={title}>
                <div className={`rounded-2xl bg-surface-alt/70 dark:bg-surface-alt/30 backdrop-blur border ${color} p-6 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className={`inline-flex p-3 rounded-xl border ${color} mb-4`}>
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </section>

        {/* ── CONTACT ──────────────────────────────────────────── */}
        <section className="w-full max-w-6xl mx-auto py-8 md:py-16">
          <Reveal className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold">{dict.home.contact.title}</h2>
            {dict.home.contact.subtitle && (
              <p className="text-muted-foreground mt-1">{dict.home.contact.subtitle}</p>
            )}
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left: form */}
            <Reveal>
              <div className="rounded-2xl border border-border bg-surface-alt/50 backdrop-blur p-6 shadow-sm">
                <ContactForm dict={dict.home.contact.form} />
              </div>
            </Reveal>

            {/* Right: social links */}
            <Reveal delay={0.1}>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground font-medium">
                  {dict.home.contact.social}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: 'Instagram', href: socialLinks.instagram, Icon: Instagram, color: 'border-pink-500/40 hover:border-pink-400/60 hover:bg-pink-500/5' },
                    { name: 'GitHub', href: socialLinks.github, Icon: Github, color: 'border-border hover:border-primary/40 hover:bg-primary/5' },
                    { name: dict.home.contact.email, href: socialLinks.email, Icon: Mail, color: 'border-blue-500/40 hover:border-blue-400/60 hover:bg-blue-500/5' },
                    { name: 'Tel', href: socialLinks.telephone, Icon: Phone, color: 'border-emerald-500/40 hover:border-emerald-400/60 hover:bg-emerald-500/5' },
                  ].map(({ name, href, Icon, color }) => (
                    <a
                      key={name}
                      href={href}
                      target={href.startsWith('mailto') || href.startsWith('tel') ? undefined : '_blank'}
                      rel="noreferrer noopener"
                      className={`group flex items-center gap-3 rounded-xl bg-surface-alt/60 backdrop-blur border ${color} p-4 transition-all duration-200`}
                    >
                      <span className="p-2 rounded-lg border border-border bg-surface-muted">
                        <Icon className="size-4" />
                      </span>
                      <span className="font-medium text-sm">{name}</span>
                      <ChevronDown className="size-4 ml-auto rotate-[-90deg] text-muted-foreground group-hover:text-foreground transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

      </main>
    </>
  );
}
