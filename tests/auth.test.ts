import assert from "node:assert";
import {
  classifyLoginFailure,
  isValidUuid,
  resolveTrustedOrigin,
  sanitizeRedirectPath,
  validateDisplayName,
  validateEmail,
  validateOtpCode,
  validatePassword,
} from "../src/lib/security/auth-validation.ts";
import { createRateLimiter, hashRateLimitKey } from "../src/lib/security/rate-limit.ts";
import { hasConfiguredSupabaseEnv } from "../src/lib/security/supabase-config.ts";
import { NOINDEX_ROBOTS } from "../src/lib/seo/metadata.ts";
import robots from "../src/app/robots.ts";

console.log("==========================================");
console.log("RUNNING SECURITY & AUTHENTICATION TESTS");
console.log("==========================================");

// 1. Email & Display Name validation
for (const email of [
  "student@college.edu",
  "alex.smith@university.ac.in",
  "user123@gmail.com",
  "name.surname+tag@domain.co",
]) {
  assert.strictEqual(validateEmail(email).valid, true, `Valid email failed: ${email}`);
}

for (const badEmail of [
  "notanemail",
  "student@",
  "@college.edu",
  "student@domain",
  "student@domain.",
  "student @college.edu",
  "a@b.com\r\nBcc:evil@x.com",
  "",
]) {
  assert.strictEqual(validateEmail(badEmail).valid, false, `Bad email accepted: ${badEmail}`);
}

assert.strictEqual(validateDisplayName("  Alex   Morgan  ").name, "Alex Morgan");
assert.strictEqual(validateDisplayName("A").valid, false);
assert.strictEqual(validateDisplayName("A".repeat(81)).valid, false);
console.log("[PASS] Email & display name sanitization/validation checks");

// 2. Strong 12+ Password complexity & blocklist checks
for (const weakPw of [
  "12345",
  "Short1!",
  "lowercaseonly12!",
  "UPPERCASEONLY12!",
  "NoSpecialChar123",
  "NoDigitsHere!@#",
  "password1234",
  "Student!123alex", // contains email local part "alex"
]) {
  const res = validatePassword(weakPw, { email: "alex@college.edu" });
  assert.strictEqual(res.valid, false, `Weak password accepted: ${weakPw}`);
}

const strongRes = validatePassword("Campus#Wallet92!", { email: "alex@college.edu" });
assert.strictEqual(strongRes.valid, true, `Strong password rejected: ${strongRes.message}`);
console.log("[PASS] 12+ character strong password & weak-password blocklist verified");

// 3. Numeric Email OTP validation (6- to 8+ digits)
assert.deepStrictEqual(validateOtpCode("123456"), { valid: true, token: "123456" });
assert.deepStrictEqual(validateOtpCode("1234 5678"), { valid: true, token: "12345678" });
assert.strictEqual(validateOtpCode("12345").valid, false);
assert.strictEqual(validateOtpCode("12ab56").valid, false);
assert.strictEqual(validateOtpCode("").valid, false);
console.log("[PASS] Email OTP code parser supports 6- and 8-digit tokens strictly");

// 4. Open Redirect protection
for (const evilTarget of [
  "https://evil.com/phish",
  "http://localhost:5000",
  "//evil.com",
  "/\\evil.com",
  "/%2fevil.com",
  "/%5cevil.com",
  "javascript:alert(1)",
  "/unknown-path",
  "/dashboard\r\nLocation: https://evil.com",
  "",
  null,
]) {
  assert.strictEqual(
    sanitizeRedirectPath(evilTarget, "/dashboard"),
    "/dashboard",
    `Open redirect payload was not blocked: ${String(evilTarget)}`
  );
}

assert.strictEqual(sanitizeRedirectPath("/transactions/new", "/dashboard"), "/transactions/new");
assert.strictEqual(sanitizeRedirectPath("/settings?tab=security", "/dashboard"), "/settings?tab=security");
assert.strictEqual(sanitizeRedirectPath("/budgets", "/dashboard"), "/budgets");
assert.strictEqual(sanitizeRedirectPath("/reset-password", "/onboarding"), "/reset-password");
console.log("[PASS] Open Redirect prevention blocks external/encoded payloads cleanly");

// 5. Trusted origin & Host-header poisoning prevention
assert.strictEqual(
  resolveTrustedOrigin({
    nodeEnv: "production",
    siteUrl: "https://moneycontrolr.site",
    hostHeader: "attacker.example",
  }),
  "https://moneycontrolr.site"
);
assert.strictEqual(
  resolveTrustedOrigin({
    nodeEnv: "production",
    siteUrl: null,
    vercelUrl: "moneycontrolr-preview.vercel.app",
    hostHeader: "attacker.example",
  }),
  "https://moneycontrolr-preview.vercel.app"
);
assert.strictEqual(
  resolveTrustedOrigin({
    nodeEnv: "development",
    siteUrl: "http://localhost:5000",
    hostHeader: "attacker.example",
  }),
  "http://localhost:5000"
);
assert.strictEqual(
  resolveTrustedOrigin({
    nodeEnv: "production",
    siteUrl: "http://localhost:5000",
    vercelEnv: null,
    hostHeader: "attacker.example",
  }),
  "http://localhost:5000"
);
assert.strictEqual(
  resolveTrustedOrigin({
    nodeEnv: "production",
    siteUrl: "http://localhost:5000",
    vercelEnv: "1",
    hostHeader: "attacker.example",
  }),
  "https://moneycontrolr.site"
);
console.log("[PASS] Trusted origin resolution ignores spoofed Host headers");

// 6. Rate limiter sliding window + minInterval cooldown
const limiter = createRateLimiter({ windowMs: 60_000, maxAttempts: 3, minIntervalMs: 10_000 });
const k = hashRateLimitKey("203.0.113.9:student@college.edu");
assert.strictEqual(limiter.check(k, 1_000).allowed, true);
assert.strictEqual(limiter.check(k, 5_000).allowed, false); // violates 10s min interval
assert.strictEqual(limiter.check(k, 12_000).allowed, true);
assert.strictEqual(limiter.check(k, 25_000).allowed, true);
assert.strictEqual(limiter.check(k, 40_000).allowed, false); // hits maxAttempts = 3 in window
assert.strictEqual(limiter.check(k, 75_000).allowed, true); // first entry expired after 60s
console.log("[PASS] Sliding-window & cooldown rate limiter verified");

// 7. Anti-enumeration classification, UUID checks & Fail-closed Supabase env guard
assert.strictEqual(classifyLoginFailure("email_not_confirmed", "Email not confirmed"), "EMAIL_NOT_CONFIRMED");
assert.strictEqual(classifyLoginFailure("invalid_credentials", "User not found"), "INVALID_CREDENTIALS");
assert.strictEqual(isValidUuid("550e8400-e29b-41d4-a716-446655440000"), true);
assert.strictEqual(isValidUuid("not-a-uuid"), false);
assert.strictEqual(
  hasConfiguredSupabaseEnv("https://placeholder-project.supabase.co", "placeholder-anon-key"),
  false
);
assert.strictEqual(
  hasConfiguredSupabaseEnv("https://curqebmtfzsnnjonmllm.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid"),
  true
);

// 8. Robots protection includes private account & recovery paths when prod domain is set
const prevSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
try {
  process.env.NEXT_PUBLIC_SITE_URL = "https://moneycontrolr.site";
  const r = robots();
  const disallow = Array.isArray(r.rules) ? [] : (r.rules.disallow ?? []);
  assert.ok(Array.isArray(disallow));
  for (const priv of ["/settings", "/forgot-password", "/reset-password", "/dashboard"]) {
    assert.ok(disallow.includes(priv), `Missing disallow for private route ${priv}`);
  }
  assert.strictEqual(NOINDEX_ROBOTS && typeof NOINDEX_ROBOTS === "object", true);
} finally {
  if (prevSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = prevSiteUrl;
}
console.log("[PASS] Anti-enumeration, fail-closed env guard, UUIDs, and robots disallow verified");

console.log("==========================================");
console.log("ALL SECURITY & AUTH TESTS PASSED (100%)");
console.log("==========================================");
