import { getDictionary } from "@/lib/dictionaries";
import { Reveal } from "@/components/ui/reveal";
import { PageHeader } from "@/components/brand/page-header";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Uses",
  description: "Tools, apps and hardware I use daily.",
};

export default async function UsesPage({ params }: { params: Promise<{ lang: "en" | "fr" }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const uses = dict?.uses;

  if (!uses) return null;

  const sections = Object.entries(uses.sections) as [
    string,
    { title: string; items: { name: string; desc: string }[] }
  ][];

  return (
    <div className="container-page pb-8">
      <PageHeader eyebrow="Uses" title={uses.title} description={uses.tagline} />

      <div className="grid gap-5 md:grid-cols-2">
        {sections.map(([key, section]) => (
          <Reveal key={key} className="h-full">
            <section aria-labelledby={`uses-${key}`} className="card h-full p-5">
              <h2 id={`uses-${key}`} className="eyebrow mb-4">{section.title}</h2>
              <ul className="divide-y divide-border">
                {section.items.map((item) => (
                  <li key={item.name} className="py-3 first:pt-0 last:pb-0">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
