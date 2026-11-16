import {
  getProductionSiteUrl,
  HOMEPAGE_DESCRIPTION,
  SITE_NAME,
} from "./metadata.ts";

export interface StructuredDataInput {
  siteUrl?: string | null;
  pageTitle: string;
  pageDescription: string;
  pagePath: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Generates Schema.org JSON-LD (@graph of Organization, WebSite, and WebPage).
 * Strictly returns null if no verified non-localhost production domain is configured.
 * Contains only verified product information (no fabricated addresses, phones, or ratings).
 */
export function buildStructuredData({
  siteUrl = getProductionSiteUrl(),
  pageTitle,
  pageDescription,
  pagePath,
}: StructuredDataInput) {
  if (!siteUrl) {
    return null;
  }

  const normalizedPath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  const pageUrl = `${siteUrl}${normalizedPath === "/" ? "" : normalizedPath}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: SITE_NAME,
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/moneycontrolr-logo.jpg`,
          width: 1024,
          height: 745,
        },
        description: HOMEPAGE_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: SITE_NAME,
        description: HOMEPAGE_DESCRIPTION,
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
        inLanguage: "en",
        hasPart: [
          {
            "@type": "WebPage",
            name: "Daily Allowance Calculator",
            description: "Student Daily Allowance & 50/30/20 Budget Calculator",
            url: `${siteUrl}/calculator`,
          },
          {
            "@type": "WebPage",
            name: "Features",
            description: "MoneyControlr Features & Dynamic Daily Limit Engine",
            url: `${siteUrl}/features`,
          },
          {
            "@type": "WebPage",
            name: "About Us",
            description: "Student-First Financial Discipline & Philosophy",
            url: `${siteUrl}/about`,
          },
          {
            "@type": "WebPage",
            name: "Contact Support",
            description: "Get Help & Direct Student Inquiries",
            url: `${siteUrl}/contact`,
          },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: pageTitle,
        description: pageDescription,
        isPartOf: {
          "@id": `${siteUrl}/#website`,
        },
        about: {
          "@id": `${siteUrl}/#organization`,
        },
        inLanguage: "en",
      },
    ],
  };
}

/**
 * Builds Schema.org JSON-LD including an FAQPage entity for rich search snippet rankings.
 */
export function buildFaqStructuredData({
  siteUrl = getProductionSiteUrl(),
  pageTitle,
  pageDescription,
  pagePath,
  faqs,
}: StructuredDataInput & { faqs: readonly FaqItem[] }) {
  if (!siteUrl) {
    return null;
  }

  const base = buildStructuredData({ siteUrl, pageTitle, pageDescription, pagePath });
  if (!base) {
    return null;
  }

  const normalizedPath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  const pageUrl = `${siteUrl}${normalizedPath === "/" ? "" : normalizedPath}`;

  const faqEntity = {
    "@type": "FAQPage",
    "@id": `${pageUrl}/#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return {
    ...base,
    "@graph": [...base["@graph"], faqEntity],
  };
}


