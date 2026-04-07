/**
 * Segment-level not-found — rendered only when notFound() is explicitly called
 * from within an [lang] page (e.g. a missing blog slug).
 * For all other 404s, Next.js uses app/not-found.tsx (root level).
 */
export { default } from "@/app/not-found";
