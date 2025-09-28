import { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/posts";
import { metaData } from "@/lib/config";

const BaseUrl = metaData.baseUrl.endsWith("/")
  ? metaData.baseUrl
  : `${metaData.baseUrl}/`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const langs: ("en" | "fr")[] = ["en", "fr"];
  const blogEntries = langs.flatMap((lang) =>
    getBlogPosts(lang).map((post) => ({
      url: `${BaseUrl}${lang}/blog/${post.slug}`,
      lastModified: post.metadata.publishedAt,
    }))
  );

  const routes = langs.flatMap((lang) =>
    ["", "blog", "projects", "about"].map((route) => ({
      url: `${BaseUrl}${lang}/${route}`.replace(/\/$/, ""),
      lastModified: new Date().toISOString().split("T")[0],
    }))
  );

  return [...routes, ...blogEntries];
}
