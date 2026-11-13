import type { MetadataRoute } from "next";
import { getProductionSiteUrl } from "../lib/seo/metadata.ts";

/**
 * Generates /sitemap.xml dynamically for search engines.
 * Strictly returns an empty sitemap when NEXT_PUBLIC_SITE_URL is unset or points to localhost,
 * preventing localhost URLs from ever appearing in sitemap output.
 * Private authenticated routes (/dashboard, /transactions, /budgets, /onboarding) are excluded.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getProductionSiteUrl();

  if (!siteUrl) {
    return [];
  }

  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/features`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
