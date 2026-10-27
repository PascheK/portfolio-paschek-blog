import { readBrandTokens } from "@/lib/brand";

export const dynamic = "force-static";

export function GET() {
  return new Response(readBrandTokens().tokensCss, {
    headers: { "content-type": "text/css; charset=utf-8" },
  });
}
