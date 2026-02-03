import { useEffect } from "react";

// Organization schema - used site-wide
export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Autolytiq",
  "url": "https://autolytiqs.com",
  "logo": "https://autolytiqs.com/logo.png",
  "sameAs": [
    "https://twitter.com/autolytiq",
    "https://facebook.com/autolytiq"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "url": "https://autolytiqs.com/contact"
  }
};

// Website schema with search action
export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Autolytiq",
  "url": "https://autolytiqs.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://autolytiqs.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

// Helper to inject JSON-LD script
function useJsonLd(schema: object, id: string) {
  useEffect(() => {
    const existingScript = document.getElementById(id);
    if (existingScript) {
      existingScript.textContent = JSON.stringify(schema);
      return;
    }

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schema, id]);
}

// Props interfaces
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface HowToStep {
  name: string;
  text: string;
  url?: string;
}

interface SoftwareAppProps {
  name: string;
  description: string;
  url: string;
  category?: string;
  rating?: number;
  ratingCount?: number;
}

interface ArticleProps {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
}

// Breadcrumb Schema Component
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url,
    })),
  };

  useJsonLd(schema, "breadcrumb-schema");
  return null;
}

// FAQ Schema Component
export function FAQSchema({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };

  useJsonLd(schema, "faq-schema");
  return null;
}

// HowTo Schema Component - great for calculator pages
export function HowToSchema({
  name,
  description,
  steps,
  totalTime,
  image
}: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
  image?: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": name,
    "description": description,
    ...(totalTime && { "totalTime": totalTime }),
    ...(image && { "image": image }),
    "step": steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.url && { "url": step.url }),
    })),
  };

  useJsonLd(schema, "howto-schema");
  return null;
}

// Software Application Schema - for calculator tools
export function SoftwareAppSchema({
  name,
  description,
  url,
  category = "FinanceApplication",
  rating,
  ratingCount,
}: SoftwareAppProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": name,
    "description": description,
    "url": url,
    "applicationCategory": category,
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
    ...(rating && ratingCount && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": rating.toString(),
        "ratingCount": ratingCount.toString(),
        "bestRating": "5",
        "worstRating": "1",
      },
    }),
  };

  useJsonLd(schema, "software-schema");
  return null;
}

// Article Schema - for blog posts
export function ArticleSchema({
  headline,
  description,
  url,
  datePublished,
  dateModified,
  author = "Autolytiq Team",
  image,
}: ArticleProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": headline,
    "description": description,
    "url": url,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Person",
      "name": author,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Autolytiq",
      "logo": {
        "@type": "ImageObject",
        "url": "https://autolytiqs.com/logo.png",
      },
    },
    ...(image && {
      "image": {
        "@type": "ImageObject",
        "url": image,
      },
    }),
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url,
    },
  };

  useJsonLd(schema, "article-schema");
  return null;
}

// Financial Calculator Schema - combines HowTo + Software
export function FinancialCalculatorSchema({
  name,
  description,
  url,
  howToSteps,
}: {
  name: string;
  description: string;
  url: string;
  howToSteps?: HowToStep[];
}) {
  return (
    <>
      <SoftwareAppSchema
        name={name}
        description={description}
        url={url}
        category="FinanceApplication"
        rating={4.8}
        ratingCount={1247}
      />
      {howToSteps && (
        <HowToSchema
          name={`How to use the ${name}`}
          description={`Step-by-step guide to using our free ${name.toLowerCase()}.`}
          steps={howToSteps}
          totalTime="PT2M"
        />
      )}
    </>
  );
}

// Comparison/Review Schema - for best-of and comparison pages
export function ComparisonSchema({
  name,
  description,
  url,
  items,
}: {
  name: string;
  description: string;
  url: string;
  items: Array<{ name: string; rating?: number; description?: string }>;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": name,
    "description": description,
    "url": url,
    "numberOfItems": items.length,
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": item.name,
        ...(item.description && { "description": item.description }),
        ...(item.rating && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": item.rating.toString(),
            "bestRating": "5",
            "reviewCount": "100",
          },
        }),
      },
    })),
  };

  useJsonLd(schema, "comparison-schema");
  return null;
}

// Combined schemas for the main layout
export function GlobalSchemas() {
  useJsonLd(ORGANIZATION_SCHEMA, "org-schema");
  useJsonLd(WEBSITE_SCHEMA, "website-schema");
  return null;
}
