import { Button } from "@/components/ui/button";
import Image from "next/image";
import { getDictionary } from '@/lib/dictionaries';
import { socialLinks } from '@/lib/config';
import { Github, Linkedin, Mail, Instagram, ChevronDown, Code2, Database, Server, Phone } from "lucide-react";
import Link from 'next/link';
import { Reveal, RevealStagger, RevealItem } from '@/components/ui/reveal';
import { getProjectPosts } from "@/lib/posts";

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
  return (
    <>
      {/* Navbar is rendered from layout */}
      <main className="flex-1 w-full min-w-0 flex flex-col px-6 sm:px-6 md:px-8">
        {/* HERO */}
        <section className="w-full max-w-6xl mx-auto pt-10 md:pt-16 pb-12 md:pb-16 text-center">
          <Reveal className="flex flex-col items-center gap-6" y={10} duration={0.45}>
            <Image
              src="/profile.png"
              alt="photo de profil"
              width={160}
              height={160}
              className="rounded-full border-4 border-blue-500/70 shadow-xl object-cover"
              priority
            />
            <Reveal y={6} delay={0.1} duration={0.4}>
              <p className="text-sm uppercase tracking-widest text-primary">{dict.home.hero.hello}</p>
              <h1 className="mt-2 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight title">
                {dict.home.hero.title_prefix}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">Pasche Killian</span>
                <br className="hidden sm:block" /> {dict.home.hero.title_suffix}
              </h1>
              <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">
                {dict.home.hero.tagline}
              </p>
            </Reveal>
            {/* Skill badges */}
            <RevealStagger className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {[
                { name: 'GitHub', Icon: Github, color: 'border-border text-foreground' },
                { name: 'HTML', Icon: Code2, color: 'border-border text-foreground' },
                { name: 'CSS', Icon: Code2, color: 'border-border text-foreground' },
                { name: 'JavaScript', Icon: Code2, color: 'border-border text-foreground' },
                { name: 'React', Icon: Code2, color: 'border-border text-foreground' },
                { name: 'Node', Icon: Server, color: 'border-border text-foreground' },
              ].map(({ name, Icon, color }) => (
                <RevealItem key={name}>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${color} bg-surface-alt/70 backdrop-blur text-sm`}>
                    <Icon className="size-4" /> {name}
                  </span>
                </RevealItem>
              ))}
            </RevealStagger>
            <div className="mt-2 animate-bounce text-blue-300/80">
              <a href="#projects" aria-label={dict.a11y?.goToProjects ?? 'Go to projects'}>
                <ChevronDown className="size-6" />
              </a>
            </div>
          </Reveal>
        </section>

        {/* Projets */}
        <section id="projects" className="w-full max-w-6xl mx-auto py-8 md:py-12">
          <div className="flex items-end justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold">{dict.home.sections.projects_featured}</h2>
            <Link href={`/${lang}/projects`} className="text-sm underline text-primary">{dict.home.sections.projects_all}</Link>
          </div>
          <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredProjects.map((project, idx) => {
              const borders = [
                'border-rose-500/50',
                'border-blue-500/50',
                'border-yellow-400/60',
                'border-emerald-400/60',
                'border-purple-500/60',
                'border-cyan-400/60',
              ];
              const border = borders[idx % borders.length];
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
                    className={`group rounded-xl overflow-hidden bg-surface-alt/70 dark:bg-surface-alt/40 backdrop-blur border ${border} shadow transition-transform hover:-translate-y-1 hover:shadow-lg`}
                  >
                    <div className="aspect-video relative">
                      {p.image ? (
                        <Image src={imageSrc} alt={p.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-neutral-400 text-xs">
                          {dict.home?.sections?.projects_featured || 'No image'}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-300 transition-colors">{p.title}</h3>
                      {p.summary && <p className="text-sm text-muted-foreground line-clamp-3">{p.summary}</p>}
                    </div>
                  </a>
                </RevealItem>
              );
            })}
          </RevealStagger>
        </section>

        {/* Service */}
        <section className="w-full max-w-6xl mx-auto py-8 md:py-12">
          <h2 className="text-2xl sm:text-3xl font-bold">{dict.home.services.title}</h2>
          <p className="text-muted-foreground mt-1 mb-6">{dict.home.services.subtitle}</p>
          <RevealStagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: dict.home.services.items.web.title, desc: dict.home.services.items.web.desc, Icon: Code2, color: 'text-sky-300 border-sky-400/50' },
              { title: dict.home.services.items.api.title, desc: dict.home.services.items.api.desc, Icon: Database, color: 'text-emerald-300 border-emerald-400/50' },
              { title: dict.home.services.items.devops.title, desc: dict.home.services.items.devops.desc, Icon: Server, color: 'text-violet-300 border-violet-400/50' },
            ].map(({ title, desc, Icon, color }) => (
              <RevealItem key={title}>
                <div className={`rounded-xl bg-surface-alt/70 dark:bg-surface-alt/30 backdrop-blur border ${color} p-5 shadow`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`p-2 rounded-lg border ${color} bg-surface-alt/70 dark:bg-surface-alt/40 `}><Icon className="size-5" /></span>
                    <h3 className="text-lg font-semibold">{title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </section>

        {/* Contact */}
        <section className="w-full max-w-6xl mx-auto py-8 md:py-12">
          <h2 className="text-2xl sm:text-3xl font-bold">{dict.home.contact.title}</h2>
          <RevealStagger className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Instagram', href: socialLinks.instagram, Icon: Instagram },
              { name: 'GitHub', href: socialLinks.github, Icon: Github },
              { name: dict.home.contact.email, href: socialLinks.email, Icon: Mail },
              { name: 'Tel', href: socialLinks.telephone, Icon: Phone },

            ].map(({ name, href, Icon }) => (
              <RevealItem key={name}>
                <a href={href} target={name === 'E-mail' ? undefined : '_blank'} rel="noreferrer noopener" className="group flex items-center justify-between gap-3 rounded-xl bg-surface-alt/70 dark:bg-surface-alt/30 backdrop-blur border border-border p-4 shadow hover:border-primary/60">
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-lg border border-border bg-surface-muted"><Icon className="size-5" /></span>
                    <span className="font-medium">{name}</span>
                  </div>
                  <ChevronDown className="size-5 rotate-[-90deg] text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              </RevealItem>
            ))}
          </RevealStagger>
        </section>
      </main>
    </>
  );
}
