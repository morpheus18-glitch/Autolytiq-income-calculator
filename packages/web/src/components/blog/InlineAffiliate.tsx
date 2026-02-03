import { ExternalLink, Star, Check } from "lucide-react";
import { analytics } from "@/lib/analytics";

interface InlineAffiliateProps {
  name: string;
  description: string;
  url: string;
  tag?: string;
  rating?: number;
  features?: string[];
  sourcePage?: string;
  variant?: 'compact' | 'detailed' | 'minimal';
}

export function InlineAffiliate({
  name,
  description,
  url,
  tag,
  rating,
  features,
  sourcePage = '/blog',
  variant = 'compact',
}: InlineAffiliateProps) {
  const handleClick = () => {
    analytics.affiliateClick(name, 'blog', url, sourcePage);
  };

  if (variant === 'minimal') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-primary hover:underline"
      >
        {name}
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="my-6 p-6 rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-lg">{name}</h4>
              {tag && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              )}
            </div>
            {rating && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-1">{rating}/5</span>
              </div>
            )}
          </div>
        </div>

        <p className="text-muted-foreground mb-4">{description}</p>

        {features && features.length > 0 && (
          <div className="mb-4">
            <ul className="grid sm:grid-cols-2 gap-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Visit {name}
          <ExternalLink className="h-4 w-4" />
        </a>

        <p className="text-[10px] text-muted-foreground/50 mt-3">
          Affiliate link - we may earn a commission
        </p>
      </div>
    );
  }

  // Compact variant (default)
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className="group flex items-center gap-4 my-4 p-4 rounded-lg border border-border/50 hover:border-primary/30 bg-card transition-all"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold group-hover:text-primary transition-colors">
            {name}
          </span>
          {tag && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {tag}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
      </div>
      <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </a>
  );
}

// Pre-configured affiliate mentions for common products
export function CreditKarmaInline({ sourcePage }: { sourcePage?: string }) {
  return (
    <InlineAffiliate
      name="Credit Karma"
      description="Free credit scores, reports & monitoring"
      url="https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202"
      tag="Free"
      sourcePage={sourcePage}
    />
  );
}

export function SoFiInline({ sourcePage, type = 'banking' }: { sourcePage?: string; type?: 'banking' | 'loans' }) {
  if (type === 'loans') {
    return (
      <InlineAffiliate
        name="SoFi Personal Loans"
        description="Low rates, no fees, unemployment protection"
        url="https://www.sofi.com/personal-loans"
        tag="No Fees"
        sourcePage={sourcePage}
      />
    );
  }
  return (
    <InlineAffiliate
      name="SoFi"
      description="High-yield savings up to 4.00% APY with direct deposit"
      url="https://www.sofi.com/banking"
      tag="4.00% APY"
      sourcePage={sourcePage}
    />
  );
}

export function YNABInline({ sourcePage }: { sourcePage?: string }) {
  return (
    <InlineAffiliate
      name="YNAB"
      description="Best-in-class budgeting app with envelope method"
      url="https://www.ynab.com"
      tag="Top Pick"
      sourcePage={sourcePage}
    />
  );
}

export function LendingTreeInline({ sourcePage, type = 'mortgage' }: { sourcePage?: string; type?: 'mortgage' | 'auto' | 'personal' }) {
  const urls = {
    mortgage: 'https://www.lendingtree.com/home/mortgage/',
    auto: 'https://www.lendingtree.com/auto',
    personal: 'https://www.lendingtree.com/personal',
  };
  const descriptions = {
    mortgage: 'Compare mortgage rates from multiple lenders',
    auto: 'Compare auto loan rates from multiple lenders',
    personal: 'Compare personal loan rates from multiple lenders',
  };
  return (
    <InlineAffiliate
      name="LendingTree"
      description={descriptions[type]}
      url={urls[type]}
      tag="Compare"
      sourcePage={sourcePage}
    />
  );
}
