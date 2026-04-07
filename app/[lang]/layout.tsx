import type { Metadata } from "next";
import { Navbar } from "@/components/nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/footer";
import { metaData, socialLinks } from "@/lib/config";
import { getDictionary } from "@/lib/dictionaries";
import { getBlogPosts, getProjectPosts } from "@/lib/posts";
import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";
import PageTransition from "@/components/ui/page-transition";
import { BackToTop } from "@/components/ui/back-to-top";
import { AuroraBackground } from "@/components/ui/aurora";
import { SmoothScrollProvider } from "@/components/ui/smooth-scroll-provider";
import { HtmlLang } from "@/components/ui/html-lang";

function parseTags(raw?: string) {
  if (!raw) return [] as string[];
  const t = raw.trim();
  if (t.startsWith("[")) {
    try {
      const arr = JSON.parse(t);
      if (Array.isArray(arr)) return arr.map(String);
    } catch { /* noop */ }
  }
  return t.split(",").map((s) => s.trim()).filter(Boolean);
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fr' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    metadataBase: new URL(metaData.baseUrl),
    title: {
      default: metaData.title,
      template: `%s | ${metaData.title}`,
    },
    description: metaData.description,
    openGraph: {
      images: metaData.ogImage,
      title: metaData.title,
      description: metaData.description,
      url: metaData.baseUrl,
      siteName: metaData.name,
      locale: lang === 'fr' ? 'fr_FR' : 'en_US',
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: { icon: "/favicon.ico" },
    alternates: {
      types: {
        "application/rss+xml": `/${lang}/feed/rss.xml`,
        "application/atom+xml": `/${lang}/feed/atom.xml`,
        "application/feed+json": `/${lang}/feed/feed.json`,
      },
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const resolvedParams = await params;
  const lang = resolvedParams.lang === 'fr' ? 'fr' : 'en';
  const dict = await getDictionary(lang);
  const blogPosts = getBlogPosts(lang).map((p) => ({
    id: `blog-${p.slug}`,
    title: p.metadata.title,
    href: `/${lang}/blog/${p.slug}`,
    subtitle: p.metadata.summary,
    keywords: parseTags(p.metadata.tags),
  }));
  const projectPosts = getProjectPosts(lang).map((p) => ({
    id: `project-${p.slug}`,
    title: p.metadata.title,
    href: `/${lang}/projects/${p.slug}`,
    subtitle: p.metadata.summary,
    keywords: parseTags(p.metadata.tags),
  }));
  const navItems = [
    { id: 'nav-home',     title: lang === 'fr' ? 'Accueil' : 'Home',     href: `/${lang}` },
    { id: 'nav-blog',     title: dict.nav.blog,                            href: `/${lang}/blog` },
    { id: 'nav-projects', title: dict.nav.projects,                        href: `/${lang}/projects` },
    { id: 'nav-about',   title: dict.nav.about,                            href: `/${lang}/about` },
    { id: 'nav-uses',      title: dict.nav.uses      ?? 'Uses',      href: `/${lang}/uses` },
    { id: 'nav-now',       title: dict.nav.now       ?? 'Now',       href: `/${lang}/now` },
    { id: 'nav-timeline',  title: dict.nav.timeline  ?? 'Timeline',  href: `/${lang}/timeline` },
    { id: 'nav-photos',    title: dict.nav.photos    ?? 'Photos',    href: `/${lang}/photos` },
  ];

  return (
    <>
      <HtmlLang lang={lang} />
      <AuroraBackground />
      <SmoothScrollProvider>
        <Suspense fallback={<div className="h-14 flex items-center justify-center"><Loader size={20} /></div>}>
          <Navbar
            dict={dict}
            lang={lang}
            paletteNavItems={navItems}
            paletteContentItems={[...blogPosts, ...projectPosts]}
            paletteLabels={dict.palette}
            cvHref="/documents/kp_cv.pdf"
            contactHref={socialLinks.email}
          />
        </Suspense>
        <Suspense fallback={<Loader size={28} />}>
          <PageTransition>{children}</PageTransition>
        </Suspense>
        <Footer dict={dict} />
        <BackToTop />
        <Analytics />
        <SpeedInsights />
      </SmoothScrollProvider>
    </>
  );
}
