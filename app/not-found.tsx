import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <>
      <header className="border-b border-border">
        <div className="container-page flex h-16 items-center">
          <Logo href="/en" />
        </div>
      </header>

      <main id="main" className="container-page flex flex-1 flex-col justify-center py-24">
        <p className="eyebrow mb-6">Error 404</p>
        <h1 className="t-display max-w-2xl">Page not found</h1>
        <p className="t-lead mt-6 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/en" className="btn btn-primary">
            Back to home
            <ArrowRight aria-hidden />
          </Link>
          <Link href="/en/blog" className="btn btn-secondary">
            Read the blog
          </Link>
          <Link href="/en/projects" className="btn btn-ghost">
            See projects
          </Link>
        </div>
      </main>
    </>
  );
}
