"use client";

import React from "react";
import Link from "next/link";
import { FaGithub, FaInstagram, FaRss } from "react-icons/fa6";
import { TbMailFilled } from "react-icons/tb";
import { socialLinks, availability } from "@/lib/config";
import { useParams } from "next/navigation";
import { Logo } from "@/components/brand/logo";

const YEAR = new Date().getFullYear();

export default function Footer({ dict }: { dict?: any }) {
  const params = useParams();
  const lang = (params?.lang as string) ?? "en";
  const isFr = lang === "fr";

  const f = dict?.footer;
  const availabilityLabel = isFr ? availability.labelFr : availability.labelEn;

  const quickLinks = [
    { href: `/${lang}`, label: f?.links?.home ?? (isFr ? "Accueil" : "Home") },
    { href: `/${lang}/blog`, label: f?.links?.blog ?? "Blog" },
    { href: `/${lang}/projects`, label: f?.links?.projects ?? (isFr ? "Projets" : "Projects") },
    { href: `/${lang}/about`, label: f?.links?.about ?? (isFr ? "À propos" : "About") },
    { href: `/${lang}/uses`, label: f?.links?.uses ?? "Uses" },
  ];

  const connect = [
    { href: socialLinks.github, label: "GitHub", icon: FaGithub, external: true },
    { href: socialLinks.instagram, label: "Instagram", icon: FaInstagram, external: true },
    { href: socialLinks.email, label: dict?.home?.contact?.email ?? "E-mail", icon: TbMailFilled, external: false },
    { href: `/${lang}/feed/rss.xml`, label: f?.rss ?? "RSS", icon: FaRss, external: true },
  ];

  return (
    <footer className="mt-24 w-full border-t border-border">
      <div className="container-page py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1fr]">

          {/* Identity */}
          <div className="flex flex-col items-start gap-4">
            <Logo href={`/${lang}`} size={32} label={`PascheK — ${isFr ? "accueil" : "home"}`} />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {f?.tagline ?? "Full-stack developer building fast, accessible web products."}
            </p>
            {availability.available && (
              <p className="inline-flex items-center gap-2 text-sm text-foreground">
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                {availabilityLabel}
              </p>
            )}
          </div>

          {/* Navigate */}
          <nav aria-label={isFr ? "Pied de page" : "Footer"}>
            <p className="eyebrow mb-4">{f?.quickLinks ?? "Navigate"}</p>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="link-quiet text-sm rounded-sm">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Connect */}
          <div>
            <p className="eyebrow mb-4">{f?.connect ?? "Connect"}</p>
            <ul className="flex flex-col gap-2.5">
              {connect.map(({ href, label, icon: Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="link-quiet inline-flex items-center gap-2 text-sm rounded-sm"
                  >
                    <Icon className="size-4" aria-hidden /> {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {YEAR} PascheK — {f?.copyright ?? "All rights reserved."}</p>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('shortcuts:toggle'))}
            className="hidden items-center gap-2 rounded-md text-left transition-colors duration-150 hover:text-foreground sm:inline-flex"
          >
            <kbd className="rounded border border-border-strong px-1.5 py-0.5 text-[10px]">?</kbd>
            {isFr ? "Raccourcis clavier" : "Keyboard shortcuts"}
          </button>
        </div>
      </div>
    </footer>
  );
}
