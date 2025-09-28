import { Feed } from "feed";
import { getBlogPosts } from "@/lib/posts";
import { metaData } from "@/lib/config";
import { NextResponse } from "next/server";

export async function generateStaticParams() {
  return [
    { format: "rss.xml" },
    { format: "atom.xml" },
    { format: "feed.json" },
  ];
}

export async function GET(
  _: Request,
  { params }: { params: Promise<{ format: string; lang: 'en' | 'fr' }> }
) {
  const { format, lang } = await params;
  const validFormats = ["rss.xml", "atom.xml", "feed.json"];

  if (!validFormats.includes(format)) {
    return NextResponse.json(
      { error: "Unsupported feed format" },
      { status: 404 }
    );
  }

  const BaseUrl = (metaData.baseUrl.endsWith("/")
    ? metaData.baseUrl
    : `${metaData.baseUrl}/`) + `${lang}/`;

  const feed = new Feed({
    title: metaData.title,
    description: metaData.description,
    id: BaseUrl,
    link: BaseUrl,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${metaData.title
      }`,
    generator: "Feed for Node.js",
    feedLinks: {
      json: `${BaseUrl}feed.json`,
      atom: `${BaseUrl}atom.xml`,
      rss: `${BaseUrl}rss.xml`,
    },
  });

  // Aggregate posts from both languages to keep a single feed endpoint under the current base URL
  const allPosts = getBlogPosts(lang);

  allPosts.forEach((post) => {
    const postUrl = `${BaseUrl}blog/${post.slug}`;
    const categories = post.metadata.tags
      ? post.metadata.tags.split(",").map((tag) => tag.trim())
      : [];

    feed.addItem({
      title: post.metadata.title,
      id: postUrl,
      link: postUrl,
      description: post.metadata.summary,
      category: categories.map((tag) => ({
        name: tag,
        term: tag,
      })),
      date: new Date(post.metadata.publishedAt || new Date().toISOString()),
    });
  });

  const responseMap: Record<string, { content: string; contentType: string }> =
  {
    "rss.xml": { content: feed.rss2(), contentType: "application/xml" },
    "atom.xml": { content: feed.atom1(), contentType: "application/xml" },
    "feed.json": { content: feed.json1(), contentType: "application/json" },
  };

  const response = responseMap[format];

  return new NextResponse(response.content, {
    headers: {
      "Content-Type": response.contentType,
    },
  });
}
