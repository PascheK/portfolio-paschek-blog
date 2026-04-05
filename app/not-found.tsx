import Link from "next/link";

/**
 * Root-level not-found — catches 404s that occur before or outside the [lang] segment
 * (e.g. /unknown-path before i18n redirect, or deep unknown routes).
 * Kept as a Server Component so it works reliably in the root layout context.
 */
export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#0a0a0f",
          color: "#e2e8f0",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div
          style={{
            fontSize: "clamp(6rem, 20vw, 12rem)",
            fontWeight: 900,
            lineHeight: 1,
            background: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "1.5rem",
            opacity: 0.9,
          }}
        >
          404
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
          Page not found
        </h1>
        <p style={{ color: "#94a3b8", marginBottom: "2rem", maxWidth: "24rem" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/en"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 1.25rem",
            borderRadius: "0.75rem",
            border: "1px solid rgba(99,102,241,0.4)",
            background: "rgba(99,102,241,0.1)",
            color: "#a5b4fc",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
          }}
        >
          ← Back to home
        </Link>
      </body>
    </html>
  );
}
