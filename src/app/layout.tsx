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
import { ThemeProvider } from "@/components/theme/theme-provider";

const productionUrl = getProductionSiteUrl();

export const metadata: Metadata = {
  ...(productionUrl ? { metadataBase: new URL(productionUrl) } : {}),
  title: {
    default: HOMEPAGE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: HOMEPAGE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
      { url: "/favicon-192x192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512x512.png", type: "image/png", sizes: "512x512" },
      { url: "/images/mc-emblem.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
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
              alt: "MoneyControlr — Student Expense Tracker & Budget Planner",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#145C43" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1310" },
  ],
};

const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('moneycontrolr-theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(!t&&d)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="font-sans antialiased bg-background text-apptext min-h-screen flex flex-col">
        <ThemeProvider>
          <PwaInstallBanner />
          <div className="flex-1 flex flex-col">{children}</div>
        </ThemeProvider>
      </body>
    </html>
  );
}
