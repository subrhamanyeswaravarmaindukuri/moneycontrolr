import type { Metadata } from "next";
import { NOINDEX_ROBOTS } from "@/lib/seo/metadata";

export const metadata: Metadata = {
  title: "Account Settings",
  robots: NOINDEX_ROBOTS,
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

