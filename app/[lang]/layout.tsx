import "@/styles/globals.css";
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
import { ThemeProvider } from "@/components/ui/theme-provider";
import { CommandPalette } from "@/components/ui/command-palette";

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

export const metadata: Metadata = {
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
    locale: "en_US",
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

  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
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
    { id: 'nav-home', title: lang === 'fr' ? 'Accueil' : 'Home', href: `/${lang}` },
    { id: 'nav-blog', title: dict.nav.blog, href: `/${lang}/blog` },
    { id: 'nav-projects', title: dict.nav.projects, href: `/${lang}/projects` },
    { id: 'nav-about', title: dict.nav.about, href: `/${lang}/about` },
  ];

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link
          rel="alternate"
          type="application/rss+xml"
          href="/rss.xml"
          title="RSS Feed"
        />
        <link
          rel="alternate"
          type="application/atom+xml"
          href="/atom.xml"
          title="Atom Feed"
        />
        <link
          rel="alternate"
          type="application/feed+json"
          href="/feed.json"
          title="JSON Feed"
        />
      </head>
      <body className="antialiased min-h-screen font-sans flex flex-col bg-code-grid text-foreground transition-colors">
        <ThemeProvider>
          <CommandPalette
            navItems={navItems}
            contentItems={[...blogPosts, ...projectPosts]}
            labels={dict.palette}
            cvHref="/documents/kp_cv.pdf"
            contactHref={socialLinks.email}
          />
          <Suspense fallback={<div className="h-14 flex items-center justify-center"><Loader size={20} /></div>}>
            <Navbar dict={dict} lang={lang} />
          </Suspense>
          <Suspense fallback={<Loader size={28} />}>
            <PageTransition>{children}</PageTransition>
          </Suspense>
          <Footer dict={dict} />
          <Analytics />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
