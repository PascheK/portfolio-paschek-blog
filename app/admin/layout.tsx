import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { metaData } from "@/lib/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: `%s | Admin — ${metaData.name}` },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground font-sans">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
