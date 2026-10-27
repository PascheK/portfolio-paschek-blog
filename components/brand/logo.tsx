import Link from "next/link";

/** PascheK logo tile. File: /public/brand/paschek-logo.svg (see /brand.md → Logo). */
export function LogoMark({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/paschek-logo.svg"
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-md ${className}`}
    />
  );
}

/** Tile + "PascheK" wordmark, linking home. */
export function Logo({
  href,
  size = 28,
  label = "PascheK — home",
  className = "",
}: {
  href: string;
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`inline-flex items-center gap-2.5 rounded-md text-foreground ${className}`}
    >
      <LogoMark size={size} />
      <span className="text-[15px] font-semibold tracking-[-0.01em]">PascheK</span>
    </Link>
  );
}
