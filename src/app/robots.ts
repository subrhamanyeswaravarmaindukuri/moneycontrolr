import type { MetadataRoute } from "next";
import { getProductionSiteUrl } from "../lib/seo/metadata.ts";

/**
 * Generates /robots.txt dynamically.
 * - While no verified production domain is configured, blocks indexing to protect preview/dev environments.
 * - Once NEXT_PUBLIC_SITE_URL is configured, permits crawling of high-value public pages while disallowing private and utility routes.
 * Note: Authentication & authorization are always enforced separately by middleware and server actions.
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getProductionSiteUrl();

  if (!siteUrl) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/features", "/calculator", "/guide", "/about", "/contact"],
      disallow: [
        "/dashboard",
        "/transactions",
        "/budgets",
        "/onboarding",
        "/settings",
        "/verify-email",
        "/forgot-password",
        "/reset-password",
        "/auth/",
        "/login",
        "/signup",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
