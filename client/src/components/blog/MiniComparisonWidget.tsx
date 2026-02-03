import { Star, ExternalLink, Trophy, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analytics } from "@/lib/analytics";

interface ComparisonProduct {
  name: string;
  description: string;
  url: string;
  tag?: string;
  rating?: number;
  price?: string;
  isWinner?: boolean;
}

interface MiniComparisonWidgetProps {
  title: string;
  products: ComparisonProduct[];
  sourcePage?: string;
  showLearnMore?: string; // Link to full comparison
}

export function MiniComparisonWidget({
  title,
  products,
  sourcePage = '/blog',
  showLearnMore,
}: MiniComparisonWidgetProps) {
  return (
    <Card className="my-6 glass-card border-none shadow-lg overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-2">
          {products.map((product, index) => (
            <a
              key={product.name}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() => analytics.affiliateClick(product.name, 'blog-widget', product.url, sourcePage)}
              className={`group flex items-center gap-3 p-3 rounded-lg transition-all ${
                product.isWinner
                  ? 'bg-emerald-500/10 border-2 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-card border border-border/50 hover:border-primary/30'
              }`}
            >
              <div className="text-lg font-bold text-muted-foreground/50">#{index + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium group-hover:text-primary transition-colors truncate">
                    {product.name}
                  </span>
                  {product.isWinner && (
                    <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                      Best
                    </span>
                  )}
                  {product.tag && !product.isWinner && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                      {product.tag}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {product.rating && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= product.rating!
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  {product.price && (
                    <span className="text-xs text-muted-foreground">{product.price}</span>
                  )}
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          ))}
        </div>

        {showLearnMore && (
          <a
            href={showLearnMore}
            className="block text-center text-sm text-primary hover:underline mt-3 pt-3 border-t border-border/30"
          >
            See full comparison →
          </a>
        )}

        <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
          Affiliate links - we may earn a commission
        </p>
      </CardContent>
    </Card>
  );
}

// Pre-configured comparison widgets
export function BudgetingAppsWidget({ sourcePage }: { sourcePage?: string }) {
  return (
    <MiniComparisonWidget
      title="Best Budgeting Apps"
      sourcePage={sourcePage}
      showLearnMore="/best/budgeting-apps"
      products={[
        {
          name: 'YNAB',
          url: 'https://www.ynab.com',
          rating: 4.8,
          price: '$14.99/mo',
          isWinner: true,
        },
        {
          name: 'Mint (Credit Karma)',
          url: 'https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202',
          rating: 4.3,
          price: 'Free',
          tag: 'Free',
        },
        {
          name: 'EveryDollar',
          url: 'https://www.everydollar.com',
          rating: 4.2,
          price: 'Freemium',
        },
      ]}
    />
  );
}

export function HighYieldSavingsWidget({ sourcePage }: { sourcePage?: string }) {
  return (
    <MiniComparisonWidget
      title="Best High-Yield Savings"
      sourcePage={sourcePage}
      showLearnMore="/best/high-yield-savings"
      products={[
        {
          name: 'SoFi',
          url: 'https://www.sofi.com/banking',
          rating: 4.8,
          tag: '4.00% APY',
          isWinner: true,
        },
        {
          name: 'Marcus',
          url: 'https://www.marcus.com',
          rating: 4.6,
          tag: '4.00% APY',
        },
        {
          name: 'Ally',
          url: 'https://www.ally.com',
          rating: 4.5,
          tag: '3.85% APY',
        },
      ]}
    />
  );
}

export function CreditMonitoringWidget({ sourcePage }: { sourcePage?: string }) {
  return (
    <MiniComparisonWidget
      title="Best Free Credit Monitoring"
      sourcePage={sourcePage}
      showLearnMore="/best/credit-monitoring"
      products={[
        {
          name: 'Credit Karma',
          url: 'https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202',
          rating: 4.7,
          price: 'Free',
          isWinner: true,
        },
        {
          name: 'Experian',
          url: 'https://www.experian.com/consumer-products/free-credit-report.html',
          rating: 4.5,
          price: 'Freemium',
          tag: 'FICO',
        },
      ]}
    />
  );
}

export function InvestingAppsWidget({ sourcePage }: { sourcePage?: string }) {
  return (
    <MiniComparisonWidget
      title="Best Investment Apps"
      sourcePage={sourcePage}
      showLearnMore="/best/investment-apps"
      products={[
        {
          name: 'Fidelity',
          url: 'https://www.fidelity.com',
          rating: 4.9,
          price: 'Free',
          isWinner: true,
        },
        {
          name: 'Robinhood',
          url: 'https://join.robinhood.com',
          rating: 4.3,
          price: 'Free',
          tag: 'Free Stock',
        },
        {
          name: 'Betterment',
          url: 'https://www.betterment.com',
          rating: 4.4,
          price: '0.25%/yr',
          tag: 'Robo-Advisor',
        },
      ]}
    />
  );
}
