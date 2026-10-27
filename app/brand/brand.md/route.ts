import { readBrandMarkdown } from "@/lib/brand";

export const dynamic = "force-static";

export function GET() {
  return new Response(readBrandMarkdown(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
