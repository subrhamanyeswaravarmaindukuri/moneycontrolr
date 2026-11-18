import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MoneyControlr — Daily Allowance & Expense Tracker",
    short_name: "MoneyControlr",
    description:
      "Track college expenses, manage your daily allowance, plan your budget and understand where your money goes. Stay in control of your spending with MoneyControlr.",
    start_url: "/",
    display: "standalone",
    background_color: "#EAF4EE",
    theme_color: "#145C43",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/images/mc-emblem.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
