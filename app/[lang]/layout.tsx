import "@/styles/globals.css";
import type { Metadata } from "next";
import { Navbar } from "@/components/nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "@/components/footer";
import { metaData } from "@/lib/config";
import { getDictionary } from "@/lib/dictionaries";
import { Suspense } from "react";
import { Loader } from "@/components/ui/loader";
import PageTransition from "@/components/ui/page-transition";
import { ThemeProvider } from "@/components/ui/theme-provider";

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
