import type { Metadata } from "next";
import { buildPublicMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPublicMetadata({
  title: "Log In",
  description:
    "Log in to MoneyControlr to check your daily safe-to-spend limit, record expenses, and stay on top of your monthly budget.",
  path: "/login",
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

