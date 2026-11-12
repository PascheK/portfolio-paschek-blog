import type { MetadataRoute } from "next";
import { abs, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/brand", "/api/"] }],
    sitemap: abs("/sitemap.xml"),
    host: siteUrl,
  };
}
