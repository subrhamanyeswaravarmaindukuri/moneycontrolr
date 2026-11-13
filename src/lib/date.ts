export const APP_TIMEZONE = "Asia/Kolkata";

const YMD_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Returns today's calendar date as YYYY-MM-DD in Asia/Kolkata (IST) by default,
 * preventing server UTC midnight drift from shifting Indian student budgets by 1 day.
 */
export function getTodayYMD(
  referenceDate: Date = new Date(),
  timeZone: string = APP_TIMEZONE
): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(referenceDate);

  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
}

/**
 * Parses a strict YYYY-MM-DD string into a UTC midnight Date, returning null if invalid
 * or if the calendar date does not exist (e.g. 2026-02-31).
 */
export function parseYMDToUTCDate(ymd: unknown): Date | null {
  if (typeof ymd !== "string") return null;
  const match = YMD_REGEX.exec(ymd.trim());
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }
  return utc;
}

export function isValidDateYMD(ymd: unknown): ymd is string {
  return parseYMDToUTCDate(ymd) !== null;
}

/**
 * Adds or subtracts whole calendar days on a validated YYYY-MM-DD string using pure UTC date math.
 */
export function addDaysYMD(ymd: string, deltaDays: number): string {
  const base = parseYMDToUTCDate(ymd);
  if (!base) {
    throw new Error(`Invalid YYYY-MM-DD date string: ${ymd}`);
  }
  const shifted = new Date(base.getTime() + deltaDays * 86_400_000);
  const y = shifted.getUTCFullYear();
  const m = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const d = String(shifted.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Computes the inclusive billing cycle bounds for the current month in IST.
 */
export function getCurrentMonthBoundsYMD(
  referenceDate: Date = new Date(),
  timeZone: string = APP_TIMEZONE
): {
  todayYMD: string;
  startDate: string;
  endDate: string;
  year: number;
  month: number;
  daysInMonth: number;
  dayOfMonth: number;
} {
  const todayYMD = getTodayYMD(referenceDate, timeZone);
  const [yStr, mStr, dStr] = todayYMD.split("-");
  const year = Number(yStr);
  const month = Number(mStr);
  const dayOfMonth = Number(dStr);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  return {
    todayYMD,
    startDate: `${yStr}-${mStr}-01`,
    endDate: `${yStr}-${mStr}-${String(daysInMonth).padStart(2, "0")}`,
    year,
    month,
    daysInMonth,
    dayOfMonth,
  };
}

/**
 * Validates that a transaction date is a real calendar date within a sensible window
 * (from 2020-01-01 through 1 year ahead of today in IST).
 */
export function validateTransactionDateYMD(
  raw: unknown,
  referenceDate: Date = new Date()
): { valid: boolean; date: string; error?: string } {
  if (typeof raw !== "string" || !parseYMDToUTCDate(raw.trim())) {
    return { valid: false, date: "", error: "Please select a valid date (YYYY-MM-DD)." };
  }

  const normalized = raw.trim();
  const maxAllowed = addDaysYMD(getTodayYMD(referenceDate), 366);
  if (normalized < "2020-01-01" || normalized > maxAllowed) {
    return {
      valid: false,
      date: normalized,
      error: "Date must be between 2020-01-01 and 1 year from today.",
    };
  }

  return { valid: true, date: normalized };
}

