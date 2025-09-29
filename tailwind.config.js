/** @type {import('tailwindcss').Config} */
module.exports = {
  // We'll manage dark mode via a data attribute on <html data-theme="dark"> for finer control
  darkMode: ["attribute", "data-theme"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{mdx,md}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: "var(--color-card)",
        'card-foreground': "var(--color-card-foreground)",
        popover: "var(--color-popover)",
        'popover-foreground': "var(--color-popover-foreground)",
        primary: "var(--color-primary)",
        'primary-foreground': "var(--color-primary-foreground)",
        secondary: "var(--color-secondary)",
        'secondary-foreground': "var(--color-secondary-foreground)",
        muted: "var(--color-muted)",
        'muted-foreground': "var(--color-muted-foreground)",
        accent: "var(--color-accent)",
        'accent-foreground': "var(--color-accent-foreground)",
        destructive: "var(--color-destructive)",
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        surface: "var(--color-surface)",
        'surface-alt': "var(--color-surface-alt)",
        'surface-muted': "var(--color-surface-muted)",
        'surface-accent': "var(--color-surface-accent)"
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
