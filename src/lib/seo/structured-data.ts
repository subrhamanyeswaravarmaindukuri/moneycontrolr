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
 * Generates Schema.org JSON-LD (@graph of Organization, WebSite, WebPage, WebApplication, Breadcrumbs).
 * Strictly returns null if no verified non-localhost production domain is configured.
 * Contains only verified factual product information (no fabricated addresses, phones, or fake ratings).
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

  const graph: any[] = [
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
          name: "Student Daily Allowance Calculator",
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
          name: "Student Budgeting Guide",
          description: "Complete Guide to Managing College Allowances & Daily Limits",
          url: `${siteUrl}/guide`,
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
      "@type": "WebApplication",
      "@id": `${siteUrl}/#app`,
      name: SITE_NAME,
      url: siteUrl,
      applicationCategory: "FinanceApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      description: HOMEPAGE_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
      featureList: [
        "Dynamic Daily Safe-to-Spend Allowance Calculation",
        "Automatic Rollover Balancing for Under-spending and Overspending",
        "Student 50/30/20 Budget Allocation",
        "Recurring Monthly Commitments & Bills Manager",
        "Zero Floating-Point Paise Precision",
        "Multi-Tenant PostgreSQL Row-Level Security",
      ],
      screenshot: `${siteUrl}/images/moneycontrolr-logo.jpg`,
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
  ];

  if (normalizedPath !== "/") {
    graph.push({
      "@type": "BreadcrumbList",
      "@id": `${pageUrl}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: pageTitle,
          item: pageUrl,
        },
      ],
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
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
