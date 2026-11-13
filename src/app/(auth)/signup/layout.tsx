import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your MoneyControlr account to track daily expenses and calculate your dynamic monthly allowance.",
  robots: NOINDEX_ROBOTS,
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

