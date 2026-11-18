import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  buildPublicMetadata,
  getProductionSiteUrl,
  isProductionDomainConfigured,
  NOINDEX_ROBOTS,
} from "../src/lib/seo/metadata.ts";
import { buildStructuredData, buildFaqStructuredData } from "../src/lib/seo/structured-data.ts";
import sitemap from "../src/app/sitemap.ts";
import robots from "../src/app/robots.ts";
import {
  CONTACT_LIMITS,
  escapeHtml,
  validateContactSubmission,
} from "../src/lib/contact/validation.ts";

console.log("==========================================");
console.log("RUNNING SEO, METADATA & CONTACT TESTS");
console.log("==========================================");

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

try {
  // 1. Localhost & empty URL safeguards
  delete process.env.NEXT_PUBLIC_SITE_URL;
  assert.strictEqual(getProductionSiteUrl(), null);
  assert.strictEqual(isProductionDomainConfigured(), false);

  for (const devUrl of [
    "http://localhost:5000",
    "https://localhost:3000",
    "http://127.0.0.1:5000",
    "http://0.0.0.0:5000",
    "http://[::1]:5000",
    "http://moneycontrolr.local",
    "ftp://moneycontrolr.com",
    "not a url",
  ]) {
    process.env.NEXT_PUBLIC_SITE_URL = devUrl;
    assert.strictEqual(
      getProductionSiteUrl(),
      null,
      `Expected dev/invalid URL to be rejected: ${devUrl}`
    );
    assert.strictEqual(isProductionDomainConfigured(), false);
  }

  // Metadata, sitemap, robots, and JSON-LD must disable indexing and leak zero localhost URLs
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:5000";
  const devMetadata = buildPublicMetadata({
    title: "Features",
    description: "Explore MoneyControlr features.",
    path: "/features",
  });
  assert.deepStrictEqual(devMetadata.robots, NOINDEX_ROBOTS);
  assert.strictEqual(devMetadata.alternates, undefined);
  assert.strictEqual(
    JSON.stringify(devMetadata).toLowerCase().includes("localhost"),
    false,
    "Dev metadata leaked localhost"
  );
  assert.strictEqual(
    buildStructuredData({
      pageTitle: "Features",
      pageDescription: "Desc",
      pagePath: "/features",
    }),
    null
  );
  assert.deepStrictEqual(sitemap(), []);
  assert.deepStrictEqual(robots(), {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  });
  console.log("[PASS] Localhost / unconfigured domain safely blocks indexing and emits zero localhost URLs");

  // 2. Production domain normalization & indexing
  process.env.NEXT_PUBLIC_SITE_URL = "https://moneycontrolr.example.org/";
  assert.strictEqual(getProductionSiteUrl(), "https://moneycontrolr.example.org");
  assert.strictEqual(isProductionDomainConfigured(), true);

  process.env.NEXT_PUBLIC_SITE_URL = "moneycontrolr.example.org";
  assert.strictEqual(getProductionSiteUrl(), "https://moneycontrolr.example.org");

  const prodMetadata = buildPublicMetadata({
    title: "About",
    description: "Student-first money control.",
    path: "/about",
  });
  assert.deepStrictEqual(prodMetadata.robots, {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  });
  assert.strictEqual(
    prodMetadata.alternates?.canonical,
    "https://moneycontrolr.example.org/about"
  );

  const jsonLd = buildStructuredData({
    pageTitle: "About MoneyControlr – Built for Student Finance",
    pageDescription: "About description",
    pagePath: "/about",
  });
  assert.ok(jsonLd);
  // @graph contains: Organization, WebSite, WebApplication, WebPage, BreadcrumbList
  assert.strictEqual(jsonLd["@graph"].length, 5);
  const webAppNode = jsonLd["@graph"].find((n: any) => n["@type"] === "WebApplication");
  assert.ok(webAppNode, "Missing WebApplication entity in JSON-LD");
  assert.strictEqual(webAppNode.applicationCategory, "FinanceApplication");

  const breadcrumbNode = jsonLd["@graph"].find((n: any) => n["@type"] === "BreadcrumbList");
  assert.ok(breadcrumbNode, "Missing BreadcrumbList in subpage JSON-LD");
  assert.strictEqual(breadcrumbNode.itemListElement.length, 2);

  // 3. Sitemap URL Validation
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);
  assert.deepStrictEqual(urls, [
    "https://moneycontrolr.example.org",
    "https://moneycontrolr.example.org/calculator",
    "https://moneycontrolr.example.org/features",
    "https://moneycontrolr.example.org/guide",
    "https://moneycontrolr.example.org/about",
    "https://moneycontrolr.example.org/contact",
  ]);
  for (const privateSlug of ["/dashboard", "/transactions", "/budgets", "/onboarding", "/verify-email", "/signup", "/login"]) {
    assert.strictEqual(
      urls.some((u) => u.includes(privateSlug)),
      false,
      `Private or auth route leaked into sitemap: ${privateSlug}`
    );
  }

  // 4. Verify FAQPage Schema generation for rich search snippets
  const faqJsonLd = buildFaqStructuredData({
    pageTitle: "Calculator | MoneyControlr",
    pageDescription: "Daily allowance calculator",
    pagePath: "/calculator",
    faqs: [
      { question: "How does it work?", answer: "It divides monthly allowance by days." },
    ],
  });
  assert.ok(faqJsonLd);
  assert.strictEqual(faqJsonLd["@graph"].length, 6);
  const faqNode = faqJsonLd["@graph"].find((n: any) => n["@type"] === "FAQPage");
  assert.ok(faqNode, "Missing FAQPage node in FAQ structured data");
  assert.strictEqual((faqNode as any).mainEntity.length, 1);

  // 5. Verify Favicon Asset Files on disk
  const publicDir = path.resolve(process.cwd(), "public");
  for (const iconFile of [
    "favicon.ico",
    "favicon-48x48.png",
    "favicon-96x96.png",
    "favicon-192x192.png",
    "apple-touch-icon.png",
    "icon-512x512.png",
  ]) {
    assert.strictEqual(
      fs.existsSync(path.join(publicDir, iconFile)),
      true,
      `Expected favicon asset to exist: public/${iconFile}`
    );
  }
  console.log("[PASS] Production domain enables canonicals, OG URLs, JSON-LD, sitemap, favicons and robots allowlist");

  // 6. Contact Form Validation and Sanitization (Edge Cases)
  assert.strictEqual(escapeHtml("<script>alert(1)</script>"), "&lt;script&gt;alert(1)&lt;/script&gt;");
  assert.strictEqual(escapeHtml("Tom & Jerry \"quotes\" 'single'"), "Tom &amp; Jerry &quot;quotes&quot; &#39;single&#39;");

  const validSubmission = validateContactSubmission({
    name: "Aarav Sharma",
    email: "aarav.student@college.edu",
    subject: "Account & Verification Support",
    message: "I verified my college email but need help setting my billing cycle start day.",
    website: "",
    formRenderedAt: Date.now() - 5000,
  });
  assert.strictEqual(validSubmission.valid, true);
  if (validSubmission.valid && validSubmission.sanitized) {
    assert.strictEqual(validSubmission.sanitized.name, "Aarav Sharma");
    assert.strictEqual(validSubmission.sanitized.email, "aarav.student@college.edu");
    assert.strictEqual(validSubmission.sanitized.subject, "Account & Verification Support");
  }

  // Honeypot spam trap triggered
  const botSubmission = validateContactSubmission({
    name: "Spam Bot",
    email: "spambot@example.com",
    subject: "Other Inquiries",
    message: "Buy cheap backlinks now!",
    website: "http://spam.url",
    formRenderedAt: Date.now() - 10000,
  });
  assert.strictEqual(botSubmission.valid, false);

  // Rapid submit (< 2 seconds) bot trap
  const fastSubmission = validateContactSubmission({
    name: "Fast Bot",
    email: "fast@example.com",
    subject: "Other Inquiries",
    message: "Fast form submission payload",
    website: "",
    formRenderedAt: Date.now() - 500,
  });
  assert.strictEqual(fastSubmission.valid, false);

  // Message too short
  const shortMessage = validateContactSubmission({
    name: "Student",
    email: "student@example.com",
    subject: "Bug Report",
    message: "Help",
    website: "",
    formRenderedAt: Date.now() - 4000,
  });
  assert.strictEqual(shortMessage.valid, false);
  assert.ok(shortMessage.fieldErrors?.message);

  // Invalid email format
  const invalidEmail = validateContactSubmission({
    name: "Student",
    email: "not-an-email",
    subject: "Bug Report",
    message: "This is a valid length bug report message that should pass the length check.",
    website: "",
    formRenderedAt: Date.now() - 4000,
  });
  assert.strictEqual(invalidEmail.valid, false);
  assert.ok(invalidEmail.fieldErrors?.email);

  console.log("[PASS] Contact validation, HTML escaping, honeypot, and timing checks verified");
  console.log("==========================================");
  console.log("ALL SEO & CONTACT TESTS PASSED");
  console.log("==========================================");
} finally {
  if (originalSiteUrl !== undefined) {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  } else {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  }
}
