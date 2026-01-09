import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  type?: "website" | "article";
  keywords?: string;
  structuredData?: object;
}

export function SEO({
  title,
  description,
  canonical,
  type = "website",
  keywords,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    // Update document title
    const fullTitle = `${title} | Autolytiq`;
    document.title = fullTitle;

    // Helper to update or create meta tags
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic meta tags
    setMeta("description", description);
    if (keywords) setMeta("keywords", keywords);

    // Open Graph
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:type", type, true);
    if (canonical) {
      setMeta("og:url", canonical, true);
    }

    // Twitter
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);

    // Canonical link
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // Structured data
    if (structuredData) {
      const existingScript = document.querySelector('script[data-seo="page"]');
      if (existingScript) {
        existingScript.remove();
      }
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-seo", "page");
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    // Cleanup
    return () => {
      const pageScript = document.querySelector('script[data-seo="page"]');
      if (pageScript) pageScript.remove();
    };
  }, [title, description, canonical, type, keywords, structuredData]);

  return null;
}

// Pre-built structured data generators
export const createCalculatorSchema = (name: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name,
  description,
  url,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Autolytiq",
  },
});

export const createArticleSchema = (
  title: string,
  description: string,
  url: string,
  datePublished: string
) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: title,
  description,
  url,
  datePublished,
  dateModified: new Date().toISOString().split("T")[0],
  author: {
    "@type": "Organization",
    name: "Autolytiq",
  },
  publisher: {
    "@type": "Organization",
    name: "Autolytiq",
    logo: {
      "@type": "ImageObject",
      url: "https://autolytiqs.com/favicon.svg",
    },
  },
});

export const createBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const createHowToSchema = (
  name: string,
  description: string,
  steps: { name: string; text: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "HowTo",
  name,
  description,
  step: steps.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    name: step.name,
    text: step.text,
  })),
});

export const createFAQSchema = (
  faqs: { question: string; answer: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});
