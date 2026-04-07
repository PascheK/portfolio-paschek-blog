import "@/styles/globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { CustomCursor } from "@/components/ui/custom-cursor";

/**
 * Root layout — provides <html><body>, ThemeProvider and CustomCursor for the
 * whole app, including app/not-found.tsx (which Next.js renders here for all
 * unmatched URLs).
 */
export const metadata: Metadata = {
  title: "Not found",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen font-sans flex flex-col bg-code-grid text-foreground transition-colors"
      >
        <ThemeProvider>
          <CustomCursor />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
