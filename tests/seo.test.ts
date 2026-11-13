import assert from "node:assert";
import {
  buildPublicMetadata,
  getProductionSiteUrl,
  isProductionDomainConfigured,
  NOINDEX_ROBOTS,
} from "../src/lib/seo/metadata.ts";
import { buildStructuredData } from "../src/lib/seo/structured-data.ts";
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
    pageTitle: "About | MoneyControlr",
    pageDescription: "About description",
    pagePath: "/about",
  });
  assert.ok(jsonLd);
  assert.strictEqual(jsonLd["@graph"].length, 3);
  assert.strictEqual(
    jsonLd["@graph"][2].url,
    "https://moneycontrolr.example.org/about"
  );

  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);
  assert.deepStrictEqual(urls, [
    "https://moneycontrolr.example.org",
    "https://moneycontrolr.example.org/features",
    "https://moneycontrolr.example.org/about",
    "https://moneycontrolr.example.org/contact",
    "https://moneycontrolr.example.org/login",
  ]);
  for (const privateSlug of ["/dashboard", "/transactions", "/budgets", "/onboarding", "/verify-email", "/signup"]) {
    assert.strictEqual(
      urls.some((u) => u.includes(privateSlug)),
      false,
      `Private route leaked into sitemap: ${privateSlug}`
    );
  }

  const prodRobots = robots();
  assert.strictEqual(
    prodRobots.sitemap,
    "https://moneycontrolr.example.org/sitemap.xml"
  );
  console.log("[PASS] Production domain enables canonicals, OG URLs, JSON-LD, sitemap, and robots allowlist");

  // 3. Contact form server validation, escaping, and spam protection
  const now = 1_700_000_010_000;
  const renderedValid = now - (CONTACT_LIMITS.MIN_FILL_DURATION_MS + 1000);

  const validContact = validateContactSubmission(
    {
      name: "  Aarav Sharma ",
      email: "AARAV@College.EDU ",
      subject: "Daily allowance question",
      message: "Hello team, how does rollover work after a weekend overspend?",
      website: "",
      formRenderedAt: renderedValid,
    },
    now
  );
  assert.strictEqual(validContact.valid, true);
  assert.strictEqual(validContact.sanitized?.email, "aarav@college.edu");

  const honeypotTrap = validateContactSubmission(
    {
      name: "Bot",
      email: "bot@spam.org",
      subject: "Promo",
      message: "Check out this link right away please.",
      website: "https://spam.invalid",
      formRenderedAt: renderedValid,
    },
    now
  );
  assert.strictEqual(honeypotTrap.valid, false);
  assert.strictEqual(honeypotTrap.isSpamSignal, true);

  const tooFastBot = validateContactSubmission(
    {
      name: "Fast Bot",
      email: "fast@bot.org",
      subject: "Automated inquiry",
      message: "Submitted in 200ms without typing anything naturally.",
      website: "",
      formRenderedAt: now - 200,
    },
    now
  );
  assert.strictEqual(tooFastBot.valid, false);
  assert.strictEqual(tooFastBot.isSpamSignal, true);

  const badFields = validateContactSubmission(
    {
      name: "A",
      email: "invalid-email\r\nBcc:evil@x.com",
      subject: "Hi",
      message: "short",
      website: "",
      formRenderedAt: renderedValid,
    },
    now
  );
  assert.strictEqual(badFields.valid, false);
  assert.ok(badFields.fieldErrors?.name);
  assert.ok(badFields.fieldErrors?.email);
  assert.ok(badFields.fieldErrors?.subject);
  assert.ok(badFields.fieldErrors?.message);

  assert.strictEqual(
    escapeHtml(`<script>alert("xss & 'test'")</script>`),
    "&lt;script&gt;alert(&quot;xss &amp; &#39;test&#39;&quot;)&lt;/script&gt;"
  );
  console.log("[PASS] Contact validation, HTML escaping, honeypot, and timing checks verified");
  console.log("ALL SEO & CONTACT TESTS PASSED");
} finally {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }
}
