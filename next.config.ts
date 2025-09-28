
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/rss.xml",
        destination: "/feed/rss.xml",
      },
      {
        source: "/atom.xml",
        destination: "/feed/atom.xml",
      },
      {
        source: "/feed.json",
        destination: "/feed/feed.json",
      },
      {
        source: "/rss",
        destination: "/feed/rss.xml",
      },
      {
        source: "/feed",
        destination: "/feed/rss.xml",
      },
      {
        source: "/atom",
        destination: "/feed/atom.xml",
      },
      {
        source: "/json",
        destination: "/feed/feed.json",
      },
    ];
  },
  i18n: {
    locales: ['en', 'fr'],   // langues supportées
    defaultLocale: 'en',     // locale par défaut
    localeDetection: false,  // on gère la redirection via middleware
  },
};
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
});
module.exports = withMDX({
  // ...autres options Next.js...
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
});


export default nextConfig;
