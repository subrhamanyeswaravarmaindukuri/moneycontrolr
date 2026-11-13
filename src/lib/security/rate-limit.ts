import { createHash } from "node:crypto";

export interface RateLimiterOptions {
  windowMs: number;
  maxAttempts: number;
  minIntervalMs?: number;
  maxEntries?: number;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfterSeconds: number;
  remainingAttempts: number;
}

/**
 * Computes a short privacy-safe key hash from an IP address, email, or composite key
 * so raw user identifiers are never stored in memory keys or logs.
 */
export function hashRateLimitKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex").slice(0, 24);
}

/**
 * In-memory sliding-window rate limiter for single-instance/warm server actions.
 * Works as an application defense-in-depth layer alongside Supabase Auth rate controls.
 */
export function createRateLimiter({
  windowMs,
  maxAttempts,
  minIntervalMs = 0,
  maxEntries = 1000,
}: RateLimiterOptions) {
  const store = new Map<string, number[]>();

  function pruneExpired(key: string, nowMs: number): number[] {
    const existing = store.get(key) ?? [];
    const recent = existing.filter((ts) => nowMs - ts < windowMs);
    if (recent.length === 0) {
      store.delete(key);
    } else {
      store.set(key, recent);
    }
    return recent;
  }

  return {
    check(key: string, nowMs: number = Date.now()): RateLimitCheckResult {
      const recent = pruneExpired(key, nowMs);

      if (minIntervalMs > 0 && recent.length > 0) {
        const lastAttempt = recent[recent.length - 1];
        const elapsed = nowMs - lastAttempt;
        if (elapsed < minIntervalMs) {
          return {
            allowed: false,
            retryAfterSeconds: Math.max(1, Math.ceil((minIntervalMs - elapsed) / 1000)),
            remainingAttempts: Math.max(0, maxAttempts - recent.length),
          };
        }
      }

      if (recent.length >= maxAttempts) {
        const oldest = recent[0];
        const retryMs = Math.max(1000, windowMs - (nowMs - oldest));
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil(retryMs / 1000)),
          remainingAttempts: 0,
        };
      }

      const updated = [...recent, nowMs];
      store.set(key, updated);

      if (store.size > maxEntries) {
        const oldestKey = store.keys().next().value;
        if (oldestKey !== undefined) {
          store.delete(oldestKey);
        }
      }

      return {
        allowed: true,
        retryAfterSeconds: 0,
        remainingAttempts: Math.max(0, maxAttempts - updated.length),
      };
    },

    reset(key?: string) {
      if (key === undefined) {
        store.clear();
      } else {
        store.delete(key);
      }
    },
  };
}

