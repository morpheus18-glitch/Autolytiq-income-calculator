/**
 * Affiliate Block Component
 *
 * Shows recommended tools/products in reports.
 * Feature-flagged - only shows when affiliateBlockEnabled is true.
 */

import { ExternalLink } from 'lucide-react';
import { useAffiliateOffers, useMonetizationFlags } from '@/hooks/use-monetization';

interface AffiliateBlockProps {
  income?: number;
  reportId?: string;
  className?: string;
}

export function AffiliateBlock({ income, reportId, className = '' }: AffiliateBlockProps) {
  const { flags, loading: flagsLoading } = useMonetizationFlags();
  const { offers, loading: offersLoading } = useAffiliateOffers(income);

  // Don't render if affiliate block is disabled
  if (flagsLoading || !flags?.affiliateBlockEnabled) {
    return null;
  }

  // Don't render while loading or if no offers
  if (offersLoading || offers.length === 0) {
    return null;
  }

  const handleClick = (slug: string) => {
    // Track click by redirecting through our tracking endpoint
    const trackUrl = `/r/${slug}${reportId ? `?reportId=${reportId}` : ''}`;
    window.open(trackUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`rounded-xl border bg-card/50 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <span>Recommended Tools</span>
        </h3>
      </div>

      {/* Offers */}
      <div className="p-4 space-y-3">
        {offers.map((offer) => (
          <button
            key={offer.slug}
            onClick={() => handleClick(offer.slug)}
            className="w-full text-left p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="font-medium text-sm group-hover:text-primary transition-colors">
                  {offer.title}
                </div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {offer.description}
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5" />
            </div>
          </button>
        ))}
      </div>

      {/* Disclosure */}
      <div className="px-4 py-2 border-t bg-muted/20">
        <p className="text-[10px] text-muted-foreground">
          Affiliate disclosure: We may earn a commission if you sign up through these links, at no extra cost to you.
        </p>
      </div>
    </div>
  );
}

/**
 * Inline Affiliate Link Component
 * For embedding single affiliate links within content
 */
interface AffiliateInlineLinkProps {
  slug: string;
  children: React.ReactNode;
  reportId?: string;
  className?: string;
}

export function AffiliateInlineLink({
  slug,
  children,
  reportId,
  className = '',
}: AffiliateInlineLinkProps) {
  const { flags } = useMonetizationFlags();

  if (!flags?.affiliateBlockEnabled) {
    return <>{children}</>;
  }

  const trackUrl = `/r/${slug}${reportId ? `?reportId=${reportId}` : ''}`;

  return (
    <a
      href={trackUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`text-primary hover:underline ${className}`}
    >
      {children}
    </a>
  );
}
