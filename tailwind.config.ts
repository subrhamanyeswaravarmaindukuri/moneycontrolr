import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#145C43",
          hover: "#0f4532",
          light: "#E1EFE7",
          subtle: "#F0F7F3",
        },
        background: "#EAF4EE",
        surface: "#FFFFFF",
        apptext: {
          DEFAULT: "#252D29",
          muted: "#5E6C64",
          light: "#8C9B93",
        },
        border: {
          DEFAULT: "#D8E6DE",
          subtle: "#E9F1EC",
        },
        status: {
          danger: "#D92D20",
          dangerLight: "#FEF3F2",
          success: "#079455",
          successLight: "#ECFDF3",
          warning: "#DC6803",
          warningLight: "#FEF0C7",
        },
      },
      fontFamily: {
        sans: ["'Inter'", "system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(20, 92, 67, 0.05)",
        card: "0 1px 3px 0 rgba(20, 92, 67, 0.06), 0 1px 2px -1px rgba(20, 92, 67, 0.06)",
        cardHover: "0 4px 6px -1px rgba(20, 92, 67, 0.08), 0 2px 4px -2px rgba(20, 92, 67, 0.06)",
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

