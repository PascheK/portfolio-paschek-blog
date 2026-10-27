import { getDictionary } from '@/lib/dictionaries';
import { metaData, socialLinks } from '@/lib/config';
import { Github, Mail, Instagram, Phone, ArrowUpRight, Code2, Database, Server } from "lucide-react";
import { Reveal, RevealStagger, RevealItem } from '@/components/ui/reveal';
import { getBlogPosts, getProjectPosts } from "@/lib/posts";
import { ContactForm } from "@/components/contact-form";
import { HeroSection } from "@/components/hero-section";
import { SectionHeader } from "@/components/brand/section-header";
import { ContentCard } from "@/components/brand/content-card";
import { StatGrid } from "@/components/brand/stat-grid";
import { CopyButton } from "@/components/brand/copy-button";
import { SectionRail } from "@/components/brand/section-rail";
import { ReadingProgress } from "@/components/brand/reading-progress";

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

const byDateDesc = (a: { metadata: { publishedAt?: string } }, b: { metadata: { publishedAt?: string } }) => {
  const da = a.metadata.publishedAt ? new Date(a.metadata.publishedAt).getTime() : 0;
  const db = b.metadata.publishedAt ? new Date(b.metadata.publishedAt).getTime() : 0;
  return db - da;
};

export default async function Page({
  params,
}: {
  params: Promise<{ lang: 'en' | 'fr' }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const isFr = lang === 'fr';
  const locale = isFr ? 'fr-FR' : 'en-US';

  const projects = getProjectPosts(lang).sort(byDateDesc);
  const isFeatured = (p: { metadata: { featured?: string } }) => p.metadata.featured === 'true';
  // Featured case studies first (newest first), then the rest by date.
  const featuredProjects = [...projects.filter(isFeatured), ...projects.filter((p) => !isFeatured(p))].slice(0, 3);
  const latestPosts = getBlogPosts(lang).sort(byDateDesc).slice(0, 3);

  const skillGroups = [
    { label: 'Frontend', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
    { label: 'Backend', skills: ['Node.js', 'Express.js', 'Java', 'Spring Boot'] },
    { label: 'DevOps', skills: ['Docker', 'CI/CD', 'DigitalOcean', 'Vercel', 'PostgreSQL'] },
  ];

  const stats = [
    { value: `${projects.length}+`, label: dict.home.stats.projects },
    { value: '3+', label: dict.home.stats.years },
    { value: '14', label: dict.home.stats.technologies },
    { value: '999+', label: dict.home.stats.coffees },
  ];

  const services = [
    { ...dict.home.services.items.web, Icon: Code2 },
    { ...dict.home.services.items.api, Icon: Database },
    { ...dict.home.services.items.devops, Icon: Server },
  ];

  const contactLinks = [
    { name: dict.home.contact.email, href: socialLinks.email, Icon: Mail, hint: socialLinks.email.replace('mailto:', ''), copy: socialLinks.email.replace('mailto:', '') },
    { name: 'GitHub', href: socialLinks.github, Icon: Github, hint: 'github.com', copy: undefined as string | undefined },
    { name: 'Instagram', href: socialLinks.instagram, Icon: Instagram, hint: 'instagram.com', copy: undefined as string | undefined },
    { name: isFr ? 'Téléphone' : 'Phone', href: socialLinks.telephone, Icon: Phone, hint: socialLinks.telephone.replace('tel:', ''), copy: socialLinks.telephone.replace('tel:', '') },
  ];

  return (
    <div className="relative isolate overflow-x-clip">
      <div className="hero-glow" aria-hidden />
    <div className="container-page">
      <ReadingProgress />
      <SectionRail
        label={isFr ? 'Sections de la page' : 'Page sections'}
        items={[
          { id: 'intro', label: isFr ? 'Intro' : 'Intro' },
          { id: 'projects', label: isFr ? 'Projets' : 'Projects' },
          ...(latestPosts.length > 0 ? [{ id: 'blog', label: 'Articles' }] : []),
          { id: 'services', label: 'Services' },
          { id: 'contact', label: 'Contact' },
        ]}
      />

      <HeroSection
        lang={lang}
        name={metaData.name}
        hello={dict.home.hero.hello}
        titlePrefix={dict.home.hero.title_prefix}
        titleSuffix={dict.home.hero.title_suffix}
        tagline={dict.home.hero.tagline}
        skillGroups={skillGroups}
        projectsLabel={dict.home.buttons.projects}
        blogLabel={dict.home.buttons.blog}
        cvLabel={dict.about?.downloadCV ?? (isFr ? 'Télécharger mon CV' : 'Download CV')}
        cvHref="/documents/kp_cv.pdf"
        doing={dict.now?.focus?.items?.[0]}
        place={(dict.now?.status as any)?.city}
        timeZone={(dict.now?.status as any)?.timeZone}
        scrollLabel={isFr ? 'Défiler' : 'Scroll'}
        scrollNext={isFr ? 'Projets' : 'Projects'}
        scrollHref="#projects"
        buildPrefix={isFr ? 'Je construis' : 'I build'}
        buildWords={isFr ? ['des applications web', 'des apps de bureau en Rust & Tauri', 'des APIs & bases de données', "de l'infrastructure auto-hébergée", 'un jeu vidéo'] : ['web apps', 'desktop apps in Rust & Tauri', 'APIs & databases', 'self-hosted infrastructure', 'a video game']}
        skillsLabel={isFr ? 'Compétences' : 'Skills'}
        photoAlt={(dict.about?.profileAlt ?? 'Profile photo of {{name}}').replace('{{name}}', metaData.name)}
      />

      {/* ── Stats ────────────────────────────────────────────── */}
      <StatGrid stats={stats} label={isFr ? 'Chiffres clés' : 'Key figures'} />

      {/* ── Featured projects ────────────────────────────────── */}
      <section id="projects" aria-labelledby="projects-title" className="section scroll-mt-16">
        <SectionHeader
          id="projects-title"
          eyebrow={`01 / ${isFr ? 'Projets' : 'Projects'}`}
          title={dict.home.sections.projects_featured}
          href={`/${lang}/projects`}
          linkLabel={dict.home.sections.projects_all}
        />
        <RevealStagger className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {featuredProjects.map((project) => {
            const p = project.metadata;
            return (
              <RevealItem key={project.slug} className="h-full">
                <ContentCard
                  href={`/${lang}/projects/${project.slug}`}
                  meta={p.group}
                  coverLabel={p.group}
                  title={p.title}
                  summary={p.summary}
                  image={p.image}
                  imageAlt={(dict.projectsPage?.imageAlt ?? 'Cover image for {{title}}').replace('{{title}}', p.title)}
                  tags={parseTags(p.tags)}
                  fallbackLabel={p.group ?? 'Project'}
                  cta={dict.projectsPage?.details}
                />
              </RevealItem>
            );
          })}
        </RevealStagger>
      </section>

      {/* ── Latest articles ──────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section id="blog" aria-labelledby="blog-title" className="section scroll-mt-16 pt-0 md:pt-0">
          <SectionHeader
            id="blog-title"
            eyebrow={`02 / Articles`}
            title={dict.home.sections.blog}
            href={`/${lang}/blog`}
            linkLabel={dict.home.sections.blog_all}
          />
          <RevealStagger className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {latestPosts.map((post) => {
              const p = post.metadata;
              const minutes = Math.max(1, Math.round(post.content.trim().split(/\s+/).length / 200));
              return (
                <RevealItem key={post.slug} className="h-full">
                  <ContentCard
                    href={`/${lang}/blog/${post.slug}`}
                    title={p.title}
                    summary={p.summary}
                    image={p.image}
                    imageAlt={(dict.blogPage?.imageAlt ?? 'Cover image for {{title}}').replace('{{title}}', p.title)}
                    tags={parseTags(p.tags)}
                    date={p.publishedAt}
                    locale={locale}
                    meta={`${minutes} ${dict.blogPage?.readingTime ?? 'min read'}`}
                    fallbackLabel="Article"
                    cta={dict.home.blog.read}
                  />
                </RevealItem>
              );
            })}
          </RevealStagger>
        </section>
      )}

      {/* ── Services ─────────────────────────────────────────── */}
      <section id="services" aria-labelledby="services-title" className="section scroll-mt-16 border-t border-border">
        <SectionHeader
          id="services-title"
          eyebrow={`03 / Services`}
          title={dict.home.services.title}
          description={dict.home.services.subtitle}
        />
        <RevealStagger className="grid gap-4 sm:gap-5 md:grid-cols-3">
          {services.map(({ title, desc, Icon }) => (
            <RevealItem key={title} className="h-full">
              <div className="card h-full p-5">
                <span className="mb-5 inline-flex size-10 items-center justify-center rounded-lg border border-border text-muted-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="t-h3 mb-2">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
              </div>
            </RevealItem>
          ))}
        </RevealStagger>
      </section>

      {/* ── Contact ──────────────────────────────────────────── */}
      <section id="contact" aria-labelledby="contact-title" className="section scroll-mt-16 border-t border-border">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <p className="eyebrow mb-3">{`04 / Contact`}</p>
            <h2 id="contact-title" className="t-h2">{dict.home.contact.title}</h2>
            {dict.home.contact.subtitle && (
              <p className="t-lead mt-3 max-w-md">{dict.home.contact.subtitle}</p>
            )}
            <p className="eyebrow mb-3 mt-10">{dict.home.contact.social}</p>
            <ul className="divide-y divide-border border-y border-border">
              {contactLinks.map(({ name, href, Icon, hint, copy }) => (
                <li key={name} className="flex items-center gap-2">
                  <a
                    href={href}
                    {...(href.startsWith('mailto') || href.startsWith('tel') ? {} : { target: '_blank', rel: 'noreferrer noopener' })}
                    className="group flex min-w-0 flex-1 items-center gap-3 py-3.5 text-sm"
                  >
                    <Icon className="size-4 text-muted-foreground" aria-hidden />
                    <span className="font-medium">{name}</span>
                    <span className="ml-auto truncate font-mono text-xs text-muted-foreground">{hint}</span>
                    {!copy && <ArrowUpRight className="size-4 text-muted-foreground transition-colors duration-150 group-hover:text-foreground" aria-hidden />}
                  </a>
                  {copy && (
                    <CopyButton
                      value={copy}
                      label={`${isFr ? 'Copier' : 'Copy'} ${name}`}
                      copyText={isFr ? 'Copier' : 'Copy'}
                      copiedText={isFr ? 'Copié' : 'Copied'}
                    />
                  )}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="card p-5 sm:p-6">
              <ContactForm dict={dict.home.contact.form} />
            </div>
          </Reveal>
        </div>
      </section>

    </div>
    </div>
  );
}
