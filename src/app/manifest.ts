import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MoneyControlr — Daily Allowance & Expense Tracker",
    short_name: "MoneyControlr",
    description:
      "Take control of your money. Calculate daily safe-to-spend limits, track college expenses, and stay on budget.",
    start_url: "/",
    display: "standalone",
    background_color: "#EAF4EE",
    theme_color: "#145C43",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
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
