import type { Metadata } from "next";

export const SITE_NAME = "MoneyControlr";
export const SITE_TAGLINE = "Student Expense Tracker & Budget Planner";
export const HOMEPAGE_TITLE = "MoneyControlr – Student Expense Tracker & Budget Planner";
export const HOMEPAGE_DESCRIPTION =
  "Track college expenses, manage your daily allowance, plan your budget and understand where your money goes. Stay in control of your spending with MoneyControlr.";

/**
 * Returns the verified production site URL from NEXT_PUBLIC_SITE_URL.
 * Strictly returns null for empty, invalid, or localhost/loopback addresses
 * so localhost URLs never leak into production SEO tags, sitemaps, or JSON-LD.
 */
export function getProductionSiteUrl(rawOverride?: string | null): string | null {
  const raw = (rawOverride !== undefined ? rawOverride : process.env.NEXT_PUBLIC_SITE_URL)?.trim();
  if (!raw || /\s/.test(raw)) return null;

  const candidate = raw.includes("://")
    ? raw
    : raw.includes(".")
      ? `https://${raw}`
      : "";
  if (!candidate) return null;

  try {
    const parsed = new URL(candidate);
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "[::1]" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      !hostname.includes(".")
    ) {
      return null;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

export function isProductionDomainConfigured(): boolean {
  return getProductionSiteUrl() !== null;
}

/**
 * Robots policy reused across private / authenticated / utility pages.
 */
export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

/**
 * Builds consistent SEO metadata for public indexable pages.
 */
export function buildPublicMetadata({
  title,
  description,
  path,
  useAbsoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  useAbsoluteTitle?: boolean;
}): Metadata {
  const productionUrl = getProductionSiteUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = productionUrl ? `${productionUrl}${normalizedPath === "/" ? "" : normalizedPath}` : undefined;
  const ogImageUrl = productionUrl ? `${productionUrl}/images/moneycontrolr-logo.jpg` : undefined;

  return {
    title: useAbsoluteTitle ? { absolute: title } : title,
    description,
    ...(canonicalUrl
      ? {
          alternates: {
            canonical: canonicalUrl,
          },
        }
      : {}),
    robots: productionUrl
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
          },
        }
      : NOINDEX_ROBOTS,
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      locale: "en_US",
      ...(canonicalUrl ? { url: canonicalUrl } : {}),
      ...(ogImageUrl
        ? {
            images: [
              {
                url: ogImageUrl,
                width: 1024,
                height: 745,
                alt: "MoneyControlr — Student Expense Tracker & Budget Planner",
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImageUrl ? { images: [ogImageUrl] } : {}),
    },
  };
}
