import { motion } from "framer-motion";
import { Star, Check, X, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import type { Product } from "@/data/comparisons";
import { WinnerBadge } from "./WinnerBadge";

interface ProductCardProps {
  product: Product;
  categorySlug: string;
  isWinner?: boolean;
  isRunnerUp?: boolean;
  rank: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating
              ? "text-yellow-500 fill-yellow-500"
              : star - 0.5 <= rating
              ? "text-yellow-500 fill-yellow-500/50"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="text-sm font-medium ml-1">{rating}</span>
    </div>
  );
}

export function ProductCard({
  product,
  categorySlug,
  isWinner,
  isRunnerUp,
  rank,
}: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + rank * 0.05 }}
    >
      <Card
        className={`glass-card shadow-lg overflow-hidden transition-all ${
          isWinner
            ? "border-2 border-emerald-500/50 bg-emerald-500/5"
            : isRunnerUp
            ? "border-2 border-blue-500/30 bg-blue-500/5"
            : "border-none"
        }`}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-muted-foreground/50">
                  #{rank}
                </span>
                <h3 className="text-xl font-bold">{product.name}</h3>
                {isWinner && <WinnerBadge type="winner" />}
                {isRunnerUp && <WinnerBadge type="runner-up" />}
              </div>
              <StarRating rating={product.rating} />
            </div>
            <div className="text-right">
              {product.pricing.model === "free" ? (
                <div className="text-lg font-bold text-emerald-500">Free</div>
              ) : product.pricing.model === "freemium" ? (
                <div>
                  <div className="text-sm text-emerald-500 font-medium">Free tier</div>
                  <div className="text-xs text-muted-foreground">{product.pricing.price}</div>
                </div>
              ) : (
                <div className="text-lg font-bold">{product.pricing.price}</div>
              )}
              {product.pricing.freeTrialDays && (
                <div className="text-xs text-muted-foreground">
                  {product.pricing.freeTrialDays}-day free trial
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-muted-foreground mb-4">{product.description}</p>

          {/* Best For Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.bestFor.map((item) => (
              <span
                key={item}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
              >
                Best for: {item}
              </span>
            ))}
          </div>

          {/* Pros & Cons */}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-semibold text-emerald-500 mb-2">Pros</h4>
              <ul className="space-y-1">
                {product.pros.slice(0, expanded ? undefined : 3).map((pro) => (
                  <li key={pro} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-destructive mb-2">Cons</h4>
              <ul className="space-y-1">
                {product.cons.slice(0, expanded ? undefined : 3).map((con) => (
                  <li key={con} className="flex items-start gap-2 text-sm">
                    <X className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Expand/Collapse */}
          {(product.pros.length > 3 || product.cons.length > 3) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-primary hover:underline mb-4"
            >
              {expanded ? (
                <>
                  Show less <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show more <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          )}

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={() =>
                analytics.affiliateClick(
                  product.name,
                  categorySlug,
                  product.affiliateUrl,
                  `/best/${categorySlug}`
                )
              }
              className="flex-1"
            >
              <Button
                className="w-full group"
                variant={isWinner ? "default" : "outline"}
              >
                Visit {product.name}
                <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </a>
            <a
              href={product.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Learn more
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Compact version for sidebar or quick lists
export function ProductCardCompact({
  product,
  categorySlug,
  rank,
}: {
  product: Product;
  categorySlug: string;
  rank: number;
}) {
  return (
    <a
      href={product.affiliateUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() =>
        analytics.affiliateClick(
          product.name,
          categorySlug,
          product.affiliateUrl,
          `/best/${categorySlug}`
        )
      }
      className="group flex items-center gap-3 p-3 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all"
    >
      <span className="text-lg font-bold text-muted-foreground/50">#{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="font-medium group-hover:text-primary transition-colors truncate">
          {product.name}
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-muted-foreground">
            {product.pricing.model === "free" ? "Free" : product.pricing.price}
          </span>
        </div>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}
