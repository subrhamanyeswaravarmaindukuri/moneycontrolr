import { buildStructuredData } from "@/lib/seo/structured-data";

interface JsonLdProps {
  pageTitle?: string;
  pageDescription?: string;
  pagePath?: string;
  data?: object | null;
}

export function JsonLd(props: JsonLdProps) {
  const data =
    props.data !== undefined
      ? props.data
      : props.pageTitle && props.pageDescription && props.pagePath
        ? buildStructuredData({
            pageTitle: props.pageTitle,
            pageDescription: props.pageDescription,
            pagePath: props.pagePath,
          })
        : null;

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

