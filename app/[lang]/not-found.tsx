'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, BookOpen, FolderOpen } from "lucide-react";
import { useParams } from "next/navigation";

export default function NotFound() {
  const params = useParams();
  const lang = (params?.lang as string) ?? 'en';

  const isFr = lang === 'fr';

  const title = isFr ? 'Page introuvable' : 'Page not found';
  const message = isFr
    ? "La page que vous recherchez n'existe pas ou a été déplacée."
    : "The page you're looking for doesn't exist or has been moved.";

  const links = [
    { href: `/${lang}`, label: isFr ? "Retour à l'accueil" : 'Back to home', Icon: Home },
    { href: `/${lang}/blog`, label: isFr ? 'Lire le blog' : 'Read the blog', Icon: BookOpen },
    { href: `/${lang}/projects`, label: isFr ? 'Voir les projets' : 'See projects', Icon: FolderOpen },
  ];

  return (
    <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center">
      {/* Big 404 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative select-none mb-6"
      >
        <span className="text-[10rem] sm:text-[14rem] font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 opacity-20">
          404
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-[10rem] sm:text-[14rem] font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 blur-sm">
          404
        </span>
        <span className="absolute inset-0 flex items-center justify-center text-[10rem] sm:text-[14rem] font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
          404
        </span>
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-3 mb-10"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground max-w-sm">{message}</p>
      </motion.div>

      {/* Quick links */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap gap-3 justify-center"
      >
        {links.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-surface-alt/70 backdrop-blur text-sm font-medium text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
          >
            <Icon className="size-4 text-primary" />
            {label}
          </Link>
        ))}
      </motion.div>
    </section>
  );
}
