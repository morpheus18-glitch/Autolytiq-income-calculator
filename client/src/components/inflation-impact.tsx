import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingDown, ChevronDown, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { InfoIcon } from "@/components/icons";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { calculateInflationImpact, formatCurrency, formatPercent } from "@/lib/income-calculations";

interface InflationImpactProps {
  income: number;
  title?: string;
  subtitle?: string;
  defaultRate?: number;
  defaultExpanded?: boolean;
  variant?: "full" | "compact";
  className?: string;
}

const PRESET_RATES = [
  { value: 0.02, label: "2%" },
  { value: 0.03, label: "3%" },
  { value: 0.04, label: "4%" },
  { value: 0.05, label: "5%" },
];

const PROJECTION_YEARS = [1, 3, 5, 10];

export function InflationImpact({
  income,
  title = "Inflation Impact",
  subtitle = "See how inflation erodes your purchasing power over time",
  defaultRate = 0.03,
  defaultExpanded = false,
  variant = "full",
  className,
}: InflationImpactProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [inflationRate, setInflationRate] = useState(defaultRate);
  const [customRate, setCustomRate] = useState("");

  const effectiveRate = customRate ? parseFloat(customRate) / 100 : inflationRate;

  const projections = useMemo(
    () => calculateInflationImpact(income, effectiveRate, PROJECTION_YEARS),
    [income, effectiveRate]
  );

  const handleCustomRateChange = (value: string) => {
    const cleaned = value.replace(/[^\d.]/g, "");
    if ((cleaned.match(/\./g) || []).length <= 1) {
      setCustomRate(cleaned);
    }
  };

  if (income <= 0) return null;

  if (variant === "compact") {
    return (
      <div className={cn("p-4 rounded-xl bg-card border border-border", className)}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium">Inflation Impact ({formatPercent(effectiveRate * 100, 0)}/yr)</span>
        </div>
        <div className="flex gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">5 years: </span>
            <span className="font-mono text-orange-500">-{formatPercent(projections[2].percentLoss)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">10 years: </span>
            <span className="font-mono text-red-500">-{formatPercent(projections[3].percentLoss)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border overflow-hidden", className)}>
      {/* Header - Collapsible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/15 hover:to-red-500/15 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/20">
            <TrendingDown className="h-5 w-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <ChevronDown className={cn(
          "h-5 w-5 text-muted-foreground transition-transform",
          isExpanded && "rotate-180"
        )} />
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-card">
              {/* Inflation Rate Selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Annual Inflation Rate
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[220px]">
                      <p>Historical US inflation averages ~3% per year. Recent years have seen higher rates. Choose a rate that reflects your expectations.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="flex gap-2">
                  {PRESET_RATES.map((rate) => (
                    <button
                      key={rate.value}
                      type="button"
                      onClick={() => {
                        setInflationRate(rate.value);
                        setCustomRate("");
                      }}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border",
                        inflationRate === rate.value && !customRate
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
                      )}
                    >
                      {rate.label}
                    </button>
                  ))}
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={customRate}
                      onChange={(e) => handleCustomRateChange(e.target.value)}
                      placeholder="Custom"
                      className={cn(
                        "w-full h-full px-3 pr-6 rounded-lg border text-sm font-medium focus:ring-2 focus:ring-primary/30 outline-none",
                        customRate
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/30 border-border/50"
                      )}
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Projection Table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-secondary/30">
                      <th className="py-2 px-3 text-left font-medium text-muted-foreground">Year</th>
                      <th className="py-2 px-3 text-right font-medium text-muted-foreground">Purchasing Power</th>
                      <th className="py-2 px-3 text-right font-medium text-muted-foreground">Loss</th>
                      <th className="py-2 px-3 text-right font-medium text-muted-foreground">Raise Needed</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border/50 bg-primary/5">
                      <td className="py-2.5 px-3 font-medium">Today</td>
                      <td className="py-2.5 px-3 text-right font-mono text-primary">{formatCurrency(income)}</td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">-</td>
                      <td className="py-2.5 px-3 text-right text-muted-foreground">-</td>
                    </tr>
                    {projections.map((projection, index) => {
                      const lossColor = projection.percentLoss < 10
                        ? "text-yellow-500"
                        : projection.percentLoss < 20
                          ? "text-orange-500"
                          : "text-red-500";

                      return (
                        <tr key={projection.year} className="border-t border-border/50">
                          <td className="py-2.5 px-3 font-medium">Year {projection.year}</td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            {formatCurrency(projection.purchasingPower)}
                          </td>
                          <td className={cn("py-2.5 px-3 text-right font-mono", lossColor)}>
                            -{formatPercent(projection.percentLoss)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-500">
                            +{formatPercent(projection.raiseNeeded)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Visual Chart */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Purchasing Power Decline</div>
                <div className="relative h-8 bg-secondary/30 rounded-lg overflow-hidden">
                  {projections.map((projection, index) => {
                    const width = (projection.purchasingPower / income) * 100;
                    const colors = [
                      "bg-yellow-500",
                      "bg-orange-500",
                      "bg-orange-600",
                      "bg-red-500",
                    ];

                    return (
                      <motion.div
                        key={projection.year}
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className={cn(
                          "absolute top-0 left-0 h-full",
                          colors[index],
                          index > 0 && "opacity-0"
                        )}
                        style={{ zIndex: projections.length - index }}
                      />
                    );
                  })}

                  {/* Markers */}
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium text-white mix-blend-difference">
                    <span>100%</span>
                    <span>{formatPercent(100 - projections[projections.length - 1].percentLoss, 0)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Today</span>
                  <span>Year {PROJECTION_YEARS[PROJECTION_YEARS.length - 1]}</span>
                </div>
              </div>

              {/* Warning Message */}
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    At {formatPercent(effectiveRate * 100, 0)} annual inflation, you'd need a{" "}
                    <span className="font-semibold text-emerald-500">
                      {formatPercent(projections[2].raiseNeeded)} raise
                    </span>{" "}
                    in 5 years just to maintain your current purchasing power.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Inline inflation summary for use in results sections
 */
export function InflationSummaryInline({ income, rate = 0.03, className }: {
  income: number;
  rate?: number;
  className?: string;
}) {
  const projections = useMemo(
    () => calculateInflationImpact(income, rate, [5, 10]),
    [income, rate]
  );

  if (income <= 0) return null;

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <TrendingDown className="h-4 w-4 text-orange-500" />
      <span className="text-muted-foreground">Inflation ({formatPercent(rate * 100, 0)}/yr):</span>
      <span className="font-mono text-orange-500">-{formatPercent(projections[0].percentLoss)}</span>
      <span className="text-muted-foreground">in 5 yrs,</span>
      <span className="font-mono text-red-500">-{formatPercent(projections[1].percentLoss)}</span>
      <span className="text-muted-foreground">in 10 yrs</span>
    </div>
  );
}
