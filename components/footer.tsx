"use client";

import React from "react";
import Link from "next/link";
import { FaGithub, FaInstagram, FaRss } from "react-icons/fa6";
import { TbMailFilled } from "react-icons/tb";
import { metaData, socialLinks, availability } from "@/lib/config";
import { useParams } from "next/navigation";

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

  return (
    <footer className="w-full mt-16 lg:mt-24 border-t border-border bg-surface-alt/30 backdrop-blur">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

          {/* Col 1 – Identity */}
          <div className="flex flex-col gap-3">
            <Link
              href={`/${lang}`}
              className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-400 to-pink-400 w-fit"
            >
              {metaData.name}
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {f?.tagline ?? "Full-stack developer passionate about crafting fast, accessible and beautiful web experiences."}
            </p>
            {availability.available && (
              <span className="inline-flex items-center gap-1.5 w-fit text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {availabilityLabel}
              </span>
            )}
          </div>

          {/* Col 2 – Quick links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {f?.quickLinks ?? "Quick links"}
            </p>
            <ul className="flex flex-col gap-2">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 – Connect */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {f?.connect ?? "Connect"}
            </p>
            <div className="flex flex-col gap-2">
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaGithub className="size-4" /> GitHub
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaInstagram className="size-4" /> Instagram
              </a>
              <a
                href={socialLinks.email}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <TbMailFilled className="size-4" /> {dict?.home?.contact?.email ?? "E-mail"}
              </a>
              <a
                href="/rss.xml"
                target="_self"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <FaRss className="size-4" /> {f?.rss ?? "RSS Feed"}
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {YEAR} {metaData.name} — {f?.copyright ?? "All rights reserved."}</span>
          <span>Built with Next.js & Tailwind CSS</span>
        </div>
      </div>
    </footer>
  );
}
