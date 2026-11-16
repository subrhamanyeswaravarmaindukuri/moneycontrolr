import type { Metadata, Viewport } from "next";
import "./globals.css";
import {
  getProductionSiteUrl,
  HOMEPAGE_DESCRIPTION,
  HOMEPAGE_TITLE,
  NOINDEX_ROBOTS,
  SITE_NAME,
} from "@/lib/seo/metadata";
import { PwaInstallBanner } from "@/components/layout/pwa-install-banner";

const productionUrl = getProductionSiteUrl();

export const metadata: Metadata = {
  ...(productionUrl ? { metadataBase: new URL(productionUrl) } : {}),
  title: {
    default: HOMEPAGE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOMEPAGE_DESCRIPTION,
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  keywords: [
    "MoneyControlr",
    "student expense tracker",
    "daily spending allowance",
    "monthly budget app",
    "college student personal finance",
    "50 30 20 budget calculator",
  ],
  robots: productionUrl
    ? {
        index: true,
        follow: true,
      }
    : NOINDEX_ROBOTS,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    locale: "en_US",
    ...(productionUrl
      ? {
          url: productionUrl,
          images: [
            {
              url: `${productionUrl}/images/moneycontrolr-logo.jpg`,
              width: 1024,
              height: 745,
              alt: "MoneyControlr — Know Your Money. Control Your Day.",
            },
          ],
        }
      : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: HOMEPAGE_TITLE,
    description: HOMEPAGE_DESCRIPTION,
    ...(productionUrl
      ? {
          images: [`${productionUrl}/images/moneycontrolr-logo.jpg`],
        }
      : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#145C43",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-apptext min-h-screen flex flex-col">
        <PwaInstallBanner />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
