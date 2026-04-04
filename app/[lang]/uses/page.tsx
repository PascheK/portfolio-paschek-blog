import { getDictionary } from "@/lib/dictionaries";
import { Reveal, RevealStagger, RevealItem } from "@/components/ui/reveal";
import { Terminal, Cpu, AppWindow, Layers } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Uses",
  description: "Tools, apps and hardware I use daily.",
};

const sectionIcons: Record<string, React.ElementType> = {
  editor: Terminal,
  hardware: Cpu,
  apps: AppWindow,
  stack: Layers,
};

const sectionColors: Record<string, string> = {
  editor: "text-sky-400 border-sky-500/40 bg-sky-500/10",
  hardware: "text-violet-400 border-violet-500/40 bg-violet-500/10",
  apps: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10",
  stack: "text-amber-400 border-amber-500/40 bg-amber-500/10",
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
    <section className="w-full px-4 sm:px-6 md:px-8 pb-16">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <Reveal className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold title mb-2">{uses.title}</h1>
          <p className="text-muted-foreground">{uses.tagline}</p>
        </Reveal>

        {/* Sections grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map(([key, section]) => {
            const Icon = sectionIcons[key] ?? Layers;
            const color = sectionColors[key] ?? "text-primary border-primary/40 bg-primary/10";

            return (
              <Reveal key={key}>
                <div className="rounded-2xl border border-border bg-surface-alt/60 backdrop-blur p-5 shadow-sm h-full">
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`p-2 rounded-xl border ${color}`}>
                      <Icon className="size-4" />
                    </span>
                    <h2 className="text-base font-semibold">{section.title}</h2>
                  </div>

                  {/* Items */}
                  <RevealStagger className="flex flex-col gap-3">
                    {section.items.map((item) => (
                      <RevealItem key={item.name}>
                        <div className="rounded-xl border border-border bg-surface/60 px-4 py-3">
                          <p className="font-medium text-sm text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                      </RevealItem>
                    ))}
                  </RevealStagger>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
