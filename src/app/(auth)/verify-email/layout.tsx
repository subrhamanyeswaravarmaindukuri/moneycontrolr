import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Verify Email",
  robots: NOINDEX_ROBOTS,
};

export default function VerifyEmailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

