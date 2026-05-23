// JSON-LD Structured Data for SEO
// Use these in your pages for rich Google search results

export interface OrganizationJsonLd {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  contactPoint?: {
    "@type": "ContactPoint";
    telephone: string;
    contactType: string;
    availableLanguage: string[];
  };
}

export interface LocalBusinessJsonLd {
  "@context": "https://schema.org";
  "@type": "LocalBusiness";
  name: string;
  description: string;
  url: string;
  telephone?: string;
  email?: string;
  address?: {
    "@type": "PostalAddress";
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
  };
  priceRange?: string;
  openingHours?: string[];
}

export interface ProductJsonLd {
  "@context": "https://schema.org";
  "@type": "Product";
  name: string;
  description: string;
  image: string[];
  sku?: string;
  brand?: {
    "@type": "Brand";
    name: string;
  };
  offers: {
    "@type": "Offer";
    price: number;
    priceCurrency: string;
    availability: string;
    url: string;
  };
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: number;
    reviewCount: number;
  };
}

export interface FAQJsonLd {
  "@context": "https://schema.org";
  "@type": "FAQPage";
  mainEntity: Array<{
    "@type": "Question";
    name: string;
    acceptedAnswer: {
      "@type": "Answer";
      text: string;
    };
  }>;
}

export interface BreadcrumbJsonLd {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item: string;
  }>;
}

export interface ServiceJsonLd {
  "@context": "https://schema.org";
  "@type": "Service";
  name: string;
  description: string;
  provider: {
    "@type": "Organization";
    name: string;
  };
  serviceType: string;
  areaServed?: string;
}

// Helper function to generate Organization JSON-LD
export function getOrganizationJsonLd(): OrganizationJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Restaurant Hub Solution",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://restauranthubsolution.com",
    logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://restauranthubsolution.com"}/logo.png`,
    description: "All-in-one platform for restaurant delivery management, supplies, and technology solutions",
    sameAs: [
      "https://twitter.com/restauranthub",
      "https://linkedin.com/company/restauranthub",
      "https://facebook.com/restauranthub",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-800-RESTAURANT",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };
}

// Helper function to generate Product JSON-LD
export function getProductJsonLd(product: {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  sku?: string;
  brand?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
}): ProductJsonLd {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://restauranthubsolution.com";
  
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [product.image],
    sku: product.sku,
    brand: product.brand
      ? {
          "@type": "Brand",
          name: product.brand,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: product.inStock !== false
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `${baseUrl}/shop/product/${product.id}`,
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount || 0,
        }
      : undefined,
  };
}

// Helper function to generate Service JSON-LD
export function getServiceJsonLd(service: {
  name: string;
  description: string;
  serviceType: string;
}): ServiceJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: "Restaurant Hub Solution",
    },
    serviceType: service.serviceType,
    areaServed: "Worldwide",
  };
}

// Helper function to generate Breadcrumb JSON-LD
export function getBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
): BreadcrumbJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Helper function to generate FAQ JSON-LD
export function getFAQJsonLd(
  questions: Array<{ question: string; answer: string }>
): FAQJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}
