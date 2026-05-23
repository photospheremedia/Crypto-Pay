import Script from "next/script";

interface JsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>;
}

/**
 * Component to render JSON-LD structured data for SEO
 * Place this in your page components for rich search results
 * 
 * @example
 * <JsonLd data={getOrganizationJsonLd()} />
 * <JsonLd data={getProductJsonLd(product)} />
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
      strategy="afterInteractive"
    />
  );
}

/**
 * Component to render multiple JSON-LD blocks
 * Useful when a page needs multiple structured data types
 * 
 * @example
 * <JsonLdMultiple data={[
 *   getOrganizationJsonLd(),
 *   getBreadcrumbJsonLd(breadcrumbs),
 *   getProductJsonLd(product),
 * ]} />
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function JsonLdMultiple({ data }: { data: Array<any> }) {
  return (
    <>
      {data.map((item, index) => (
        <Script
          key={index}
          id={`json-ld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item),
          }}
          strategy="afterInteractive"
        />
      ))}
    </>
  );
}
