"use client";

import React from "react";
import { usePathname } from "next/navigation";

/**
 * <main> landmark of every localized page. Entering a route fades the content
 * in (opacity only, 200ms) — see `.page-enter` in globals.css.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <main
      id="main"
      key={pathname}
      className="page-enter flex-1 w-full min-w-0 flex flex-col"
    >
      {children}
    </main>
  );
}
