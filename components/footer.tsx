"use client";

import React from "react";
import {
  FaGithub,
  FaInstagram,
  FaRss,
} from "react-icons/fa6";
import { TbMailFilled } from "react-icons/tb";
import { metaData, socialLinks } from "@/lib/config";

const YEAR = new Date().getFullYear();

function SocialLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
      <Icon />
    </a>
  );
}

function SocialLinks({ dict }: { dict?: any }) {
  return (
    <div className="flex text-lg gap-3.5 float-right transition-opacity duration-300 hover:opacity-90">
      <SocialLink href={socialLinks.github} icon={FaGithub} label="GitHub" />
      <SocialLink href={socialLinks.instagram} icon={FaInstagram} label="Instagram" />
      <SocialLink href={socialLinks.email} icon={TbMailFilled} label={dict?.home?.contact?.email ?? 'E-mail'} />
      <a href="/rss.xml" target="_self" aria-label="RSS" title="RSS">
        <FaRss />
      </a>
    </div>
  );
}

export default function Footer({ dict }: { dict?: any }) {
  return (
    <small className="block lg:mt-24 mt-16 text-[#D4D4D4]">
      <time>© {YEAR}</time>{" "}
      <a
        className="no-underline"
        href={socialLinks.github}
        target="_blank"
        rel="noopener noreferrer"
      >
        {metaData.title}
      </a>
      <style jsx>{`
        @media screen and (max-width: 480px) {
          article {
            padding-top: 2rem;
            padding-bottom: 4rem;
          }
        }
      `}</style>
      <SocialLinks dict={dict} />
    </small>
  );
}
