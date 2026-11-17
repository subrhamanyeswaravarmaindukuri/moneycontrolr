import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--primary-rgb) / <alpha-value>)",
          hover: "rgb(var(--primary-hover-rgb) / <alpha-value>)",
          light: "rgb(var(--primary-light-rgb) / <alpha-value>)",
          subtle: "rgb(var(--primary-subtle-rgb) / <alpha-value>)",
        },
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        apptext: {
          DEFAULT: "rgb(var(--text-rgb) / <alpha-value>)",
          muted: "rgb(var(--text-muted-rgb) / <alpha-value>)",
          light: "rgb(var(--text-light-rgb) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border-rgb) / <alpha-value>)",
          subtle: "rgb(var(--border-subtle-rgb) / <alpha-value>)",
        },
        status: {
          danger: "rgb(var(--status-danger-rgb) / <alpha-value>)",
          dangerLight: "rgb(var(--status-danger-light-rgb) / <alpha-value>)",
          success: "rgb(var(--status-success-rgb) / <alpha-value>)",
          successLight: "rgb(var(--status-success-light-rgb) / <alpha-value>)",
          warning: "rgb(var(--status-warning-rgb) / <alpha-value>)",
          warningLight: "rgb(var(--status-warning-light-rgb) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)",
        cardHover: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)",
      },
      borderRadius: {
        card: "1rem", // 16px
        btn: "0.75rem", // 12px
      },
    },
  },
  plugins: [],
};

export default config;
