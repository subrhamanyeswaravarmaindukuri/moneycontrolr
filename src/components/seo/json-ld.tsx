import { buildStructuredData } from "@/lib/seo/structured-data";

interface JsonLdProps {
  pageTitle: string;
  pageDescription: string;
  pagePath: string;
}

export function JsonLd({ pageTitle, pageDescription, pagePath }: JsonLdProps) {
  const data = buildStructuredData({
    pageTitle,
    pageDescription,
    pagePath,
  });

  if (!data) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

