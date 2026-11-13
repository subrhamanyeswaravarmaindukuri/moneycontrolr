import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";
import { requireVerifiedUser } from "@/lib/security/server-auth";

export const metadata: Metadata = {
  title: "Budget Onboarding",
  robots: NOINDEX_ROBOTS,
};

export const dynamic = "force-dynamic";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireVerifiedUser("/onboarding");
  return children;
}

