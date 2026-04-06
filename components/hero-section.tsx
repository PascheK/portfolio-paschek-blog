'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

type SkillGroup = {
  label: string;
  skills: string[];
  color: string;
};

interface HeroSectionProps {
  hello: string;
  titlePrefix: string;
  titleSuffix: string;
  tagline: string;
  scrollLabel: string;
  skillGroups: SkillGroup[];
}

export function HeroSection({
  hello,
  titlePrefix,
  titleSuffix,
  tagline,
  scrollLabel,
  skillGroups,
}: HeroSectionProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Profile glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.82 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full blur-2xl bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-emerald-500/20 scale-125" />
          <Image
            src="/profile.png"
            alt="photo de profil"
            width={160}
            height={160}
            className="relative rounded-full border-2 border-primary/50 shadow-2xl object-cover ring-4 ring-primary/10"
            priority
          />
        </div>
      </motion.div>

      {/* Title — clip-path wipe on mount */}
      <motion.div
        initial={{ clipPath: "inset(100% 0% 0% 0%)", opacity: 0 }}
        animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
        transition={{ duration: 0.65, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <p className="text-sm uppercase tracking-widest text-primary font-medium">{hello}</p>
        <h1 className="mt-2 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight title">
          {titlePrefix}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400">
            Pasche Killian
          </span>
          <br className="hidden sm:block" /> {titleSuffix}
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground">{tagline}</p>
      </motion.div>

      {/* Skill badges — staggered spring on mount */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 sm:gap-2.5"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.04, delayChildren: 0.5 } },
        }}
      >
        {skillGroups.map(({ label, skills, color }) =>
          skills.map((skill) => (
            <motion.span
              key={skill}
              variants={{
                hidden: { opacity: 0, scale: 0.6 },
                show: {
                  opacity: 1,
                  scale: 1,
                  transition: { type: "spring", stiffness: 420, damping: 22 },
                },
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${color} backdrop-blur text-xs font-medium`}
            >
              {skill}
            </motion.span>
          ))
        )}
      </motion.div>

      <motion.div
        className="mt-2 text-primary/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        <a href="#stats" aria-label={scrollLabel} className="animate-bounce block">
          <ChevronDown className="size-6" />
        </a>
      </motion.div>
    </div>
  );
}
