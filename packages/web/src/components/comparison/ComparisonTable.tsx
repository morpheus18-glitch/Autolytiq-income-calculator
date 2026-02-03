import { motion } from "framer-motion";
import { Check, X, Minus, Star, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import type { Category, Product } from "@/data/comparisons";

interface ComparisonTableProps {
  category: Category;
  onProductClick?: (product: Product) => void;
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-emerald-500 mx-auto" />
    ) : (
      <X className="h-5 w-5 text-destructive/50 mx-auto" />
    );
  }
  if (value === "Premium" || value === "Premium only" || value === "Plus only") {
    return <span className="text-xs text-yellow-500 font-medium">{value}</span>;
  }
  return <span className="text-xs font-medium">{value}</span>;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3 w-3 ${
            star <= rating
              ? "text-yellow-500 fill-yellow-500"
              : star - 0.5 <= rating
              ? "text-yellow-500 fill-yellow-500/50"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}</span>
    </div>
  );
}

export function ComparisonTable({ category, onProductClick }: ComparisonTableProps) {
  const { products, comparisonFeatures, winner, runnerUp } = category;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="glass-card border-none shadow-xl overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            Quick Comparison
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {products.length} products
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground w-[140px]">
                    Feature
                  </th>
                  {products.map((product) => (
                    <th
                      key={product.id}
                      className={`p-4 text-center ${
                        product.id === winner
                          ? "bg-emerald-500/5"
                          : product.id === runnerUp
                          ? "bg-blue-500/5"
                          : ""
                      }`}
                    >
                      <div className="space-y-1">
                        {product.id === winner && (
                          <span className="inline-block text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-medium">
                            Best Overall
                          </span>
                        )}
                        {product.id === runnerUp && (
                          <span className="inline-block text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                            Runner Up
                          </span>
                        )}
                        <div className="font-semibold text-sm">{product.name}</div>
                        <StarRating rating={product.rating} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Pricing Row */}
                <tr className="border-b border-border/30 bg-muted/30">
                  <td className="p-4 text-sm font-medium">Pricing</td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className={`p-4 text-center ${
                        product.id === winner
                          ? "bg-emerald-500/5"
                          : product.id === runnerUp
                          ? "bg-blue-500/5"
                          : ""
                      }`}
                    >
                      <div className="text-xs">
                        {product.pricing.model === "free" ? (
                          <span className="text-emerald-500 font-semibold">Free</span>
                        ) : product.pricing.model === "freemium" ? (
                          <div>
                            <span className="text-emerald-500 font-semibold">Free</span>
                            <span className="text-muted-foreground"> / </span>
                            <span>{product.pricing.price}</span>
                          </div>
                        ) : (
                          <span>{product.pricing.price}</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Feature Rows */}
                {comparisonFeatures.map((feature, index) => (
                  <tr
                    key={feature}
                    className={index % 2 === 0 ? "" : "bg-muted/20"}
                  >
                    <td className="p-4 text-sm">{feature}</td>
                    {products.map((product) => (
                      <td
                        key={product.id}
                        className={`p-4 text-center ${
                          product.id === winner
                            ? "bg-emerald-500/5"
                            : product.id === runnerUp
                            ? "bg-blue-500/5"
                            : ""
                        }`}
                      >
                        <FeatureValue
                          value={product.features[feature] ?? false}
                        />
                      </td>
                    ))}
                  </tr>
                ))}

                {/* CTA Row */}
                <tr className="border-t border-border/50">
                  <td className="p-4"></td>
                  {products.map((product) => (
                    <td
                      key={product.id}
                      className={`p-4 text-center ${
                        product.id === winner
                          ? "bg-emerald-500/5"
                          : product.id === runnerUp
                          ? "bg-blue-500/5"
                          : ""
                      }`}
                    >
                      <a
                        href={product.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={() =>
                          analytics.affiliateClick(
                            product.name,
                            category.slug,
                            product.affiliateUrl,
                            `/best/${category.slug}`
                          )
                        }
                      >
                        <Button
                          size="sm"
                          variant={product.id === winner ? "default" : "outline"}
                          className="w-full"
                        >
                          Visit Site
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
