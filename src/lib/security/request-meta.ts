import { headers } from "next/headers";
import { hashRateLimitKey } from "./rate-limit";

/**
 * Derives a hashed rate-limit key from the request's client IP headers and a scope prefix.
 */
export async function getClientIpRateKey(scope: string, extra?: string): Promise<string> {
  let ip = "unknown";
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const realIp = headerList.get("x-real-ip");
    ip = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || "unknown";
  } catch {
    ip = "unknown";
  }

  const normalizedExtra = extra ? `:${extra.trim().toLowerCase()}` : "";
  return `${scope}:${hashRateLimitKey(`${ip}${normalizedExtra}`)}`;
}

/**
 * Reads safe origin headers when running in local development.
 */
export async function getRequestHostHeaders(): Promise<{
  hostHeader: string | null;
  protoHeader: string | null;
}> {
  try {
    const headerList = await headers();
    return {
      hostHeader: headerList.get("host"),
      protoHeader: headerList.get("x-forwarded-proto"),
    };
  } catch {
    return { hostHeader: null, protoHeader: null };
  }
}

