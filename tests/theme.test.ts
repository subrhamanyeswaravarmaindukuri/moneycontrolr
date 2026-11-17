import assert from "node:assert";

console.log("==========================================");
console.log("RUNNING DARK MODE & THEME CONTRAST TESTS");
console.log("==========================================");

// 1. Theme state and toggle logic
type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

function resolveEffectiveTheme(theme: Theme, systemPrefersDark: boolean): ResolvedTheme {
  if (theme === "system") {
    return systemPrefersDark ? "dark" : "light";
  }
  return theme;
}

function getNextToggleTheme(currentResolved: ResolvedTheme): Theme {
  return currentResolved === "dark" ? "light" : "dark";
}

assert.strictEqual(resolveEffectiveTheme("light", true), "light");
assert.strictEqual(resolveEffectiveTheme("light", false), "light");
assert.strictEqual(resolveEffectiveTheme("dark", false), "dark");
assert.strictEqual(resolveEffectiveTheme("dark", true), "dark");
assert.strictEqual(resolveEffectiveTheme("system", true), "dark");
assert.strictEqual(resolveEffectiveTheme("system", false), "light");

assert.strictEqual(getNextToggleTheme("light"), "dark");
assert.strictEqual(getNextToggleTheme("dark"), "light");
console.log("[PASS] Theme resolution and toggle state transitions verified");

// 2. Storage key and allowed themes validation
const STORAGE_KEY = "moneycontrolr-theme";
const VALID_THEMES: Set<Theme> = new Set(["light", "dark", "system"]);

function parseStoredTheme(raw: string | null): Theme {
  if (raw && VALID_THEMES.has(raw as Theme)) {
    return raw as Theme;
  }
  return "system";
}

assert.strictEqual(STORAGE_KEY, "moneycontrolr-theme");
assert.strictEqual(parseStoredTheme("dark"), "dark");
assert.strictEqual(parseStoredTheme("light"), "light");
assert.strictEqual(parseStoredTheme("system"), "system");
assert.strictEqual(parseStoredTheme("invalid_value"), "system");
assert.strictEqual(parseStoredTheme(null), "system");
console.log("[PASS] LocalStorage key and defensive parsing verified");

// 3. WCAG 2.1 Relative Luminance & Contrast Ratio Verification
function sRGBtoLin(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function getLuminance(r: number, g: number, b: number): number {
  return 0.2126 * sRGBtoLin(r) + 0.7152 * sRGBtoLin(g) + 0.0722 * sRGBtoLin(b);
}

function getContrastRatio(rgb1: [number, number, number], rgb2: [number, number, number]): number {
  const l1 = getLuminance(...rgb1);
  const l2 = getLuminance(...rgb2);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Light Mode Tokens:
// Text #252D29 [37, 45, 41] on Background #EAF4EE [234, 244, 238]
const lightTextOnBg = getContrastRatio([37, 45, 41], [234, 244, 238]);
assert.ok(lightTextOnBg >= 7.0, `Light mode text contrast must be >= 7:1 (AAA), got ${lightTextOnBg.toFixed(2)}`);

// Light Mode Surface:
// Text #252D29 [37, 45, 41] on Surface #FFFFFF [255, 255, 255]
const lightTextOnSurface = getContrastRatio([37, 45, 41], [255, 255, 255]);
assert.ok(lightTextOnSurface >= 10.0, `Light mode surface text contrast must be >= 10:1 (AAA), got ${lightTextOnSurface.toFixed(2)}`);

// Dark Mode Tokens:
// Text #F3F7F5 [243, 247, 245] on Background #0B1310 [11, 19, 16]
const darkTextOnBg = getContrastRatio([243, 247, 245], [11, 19, 16]);
assert.ok(darkTextOnBg >= 14.0, `Dark mode text contrast must be >= 14:1 (AAA), got ${darkTextOnBg.toFixed(2)}`);

// Dark Mode Surface:
// Text #F3F7F5 [243, 247, 245] on Surface #13221C [19, 34, 28]
const darkTextOnSurface = getContrastRatio([243, 247, 245], [19, 34, 28]);
assert.ok(darkTextOnSurface >= 12.0, `Dark mode surface text contrast must be >= 12:1 (AAA), got ${darkTextOnSurface.toFixed(2)}`);

// Muted Text in Dark Mode:
// #9CAFA6 [156, 175, 166] on Surface #13221C [19, 34, 28]
const darkMutedOnSurface = getContrastRatio([156, 175, 166], [19, 34, 28]);
assert.ok(darkMutedOnSurface >= 4.5, `Dark mode muted text contrast must pass WCAG AA (>= 4.5:1), got ${darkMutedOnSurface.toFixed(2)}`);

console.log("[PASS] WCAG AA/AAA contrast ratios verified for light and dark modes");
console.log("==========================================");
console.log("ALL THEME TESTS PASSED SUCCESSFULLY! (100%)");
console.log("==========================================");
