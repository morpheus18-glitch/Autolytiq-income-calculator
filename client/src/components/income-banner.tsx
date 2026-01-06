import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckIcon, IncomeIcon, ArrowRightIcon, ResetIcon } from "@/components/icons";
import { useIncome, formatCurrency } from "@/lib/use-income";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface IncomeBannerProps {
  className?: string;
  showCTA?: boolean;
  ctaText?: string;
  ctaHref?: string;
  variant?: "compact" | "full";
}

/**
 * Banner that shows when income data has been detected from the calculator.
 * Makes the data flow visible to users.
 */
export function IncomeBanner({
  className,
  showCTA = true,
  ctaText = "Plan Your Budget",
  ctaHref = "/smart-money",
  variant = "compact",
}: IncomeBannerProps) {
  const { income, hasIncome, refreshIncome } = useIncome();

  if (!hasIncome || !income) return null;

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center justify-between gap-3 p-3 rounded-lg",
          "bg-primary/5 border border-primary/20",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-full bg-primary/10">
            <CheckIcon className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Income detected: </span>
            <span className="font-semibold text-primary">
              {formatCurrency(income.grossMonthly)}/mo
            </span>
          </div>
        </div>
        {showCTA && (
          <Link href={ctaHref}>
            <Button size="sm" variant="ghost" className="gap-1 text-xs h-7">
              {ctaText}
              <ArrowRightIcon className="h-3 w-3" />
            </Button>
          </Link>
        )}
      </motion.div>
    );
  }

  // Full variant with more details
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-4 rounded-xl",
        "bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 mt-0.5">
            <IncomeIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">Income from Calculator</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Connected
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Annual: </span>
                <span className="font-mono font-semibold">{formatCurrency(income.grossAnnual)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Monthly: </span>
                <span className="font-mono font-semibold">{formatCurrency(income.grossMonthly)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max Auto: </span>
                <span className="font-mono font-semibold text-primary">{formatCurrency(income.maxAutoPayment)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max Rent: </span>
                <span className="font-mono font-semibold text-primary">{formatCurrency(income.maxRent)}</span>
              </div>
            </div>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={refreshIncome}
          title="Refresh income data"
        >
          <ResetIcon className="h-4 w-4" />
        </Button>
      </div>
      {showCTA && (
        <div className="mt-3 pt-3 border-t border-primary/10">
          <Link href={ctaHref}>
            <Button size="sm" className="w-full gap-2">
              {ctaText}
              <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Inline text showing detected income - for use in forms
 */
export function IncomeDetectedText({ className }: { className?: string }) {
  const { income, hasIncome } = useIncome();

  if (!hasIncome || !income) return null;

  return (
    <span className={cn("text-xs text-muted-foreground", className)}>
      Using your calculated income of{" "}
      <Link href="/" className="text-primary hover:underline">
        {formatCurrency(income.grossAnnual)}/year
      </Link>
    </span>
  );
}

/**
 * No income CTA - prompts user to calculate income first
 */
export function NoIncomeCTA({ className }: { className?: string }) {
  const { hasIncome } = useIncome();

  if (hasIncome) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "flex items-center justify-between gap-3 p-3 rounded-lg",
        "bg-secondary/50 border border-border/50",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <IncomeIcon className="h-4 w-4" />
        Calculate your income for personalized results
      </div>
      <Link href="/">
        <Button size="sm" variant="outline" className="gap-1 text-xs h-7">
          Calculate Income
          <ArrowRightIcon className="h-3 w-3" />
        </Button>
      </Link>
    </motion.div>
  );
}
