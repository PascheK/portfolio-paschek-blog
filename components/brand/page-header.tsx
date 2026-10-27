import React from "react";

/**
 * Header shared by every top-level page: eyebrow → h1 → lead → actions.
 * Exactly one <h1> per page (see /brand.md → DO).
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={`pt-12 pb-10 md:pt-16 ${className}`}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h1 className="t-h1">{title}</h1>
      {description && <p className="t-lead mt-3 max-w-2xl">{description}</p>}
      {children && <div className="mt-6">{children}</div>}
    </header>
  );
}
