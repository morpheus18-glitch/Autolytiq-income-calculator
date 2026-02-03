import { useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Shield, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/charts";
import {
  type IncomeStream,
  type IncomeType,
  calculateTotalAnnual,
  calculateReliableIncome,
  calculateIncomeByType,
  INCOME_TYPE_LABELS,
  formatCurrency,
} from "@/lib/income-calculations";

interface IncomeStreamsSummaryProps {
  streams: IncomeStream[];
  className?: string;
}

const TYPE_COLORS: Record<IncomeType, string> = {
  w2: "#3b82f6",
  freelance: "#a855f7",
  gig: "#f97316",
  rental: "#22c55e",
  "side-hustle": "#ec4899",
  other: "#6b7280",
};

export function IncomeStreamsSummary({ streams, className }: IncomeStreamsSummaryProps) {
  const totalAnnual = useMemo(() => calculateTotalAnnual(streams), [streams]);
  const reliableIncome = useMemo(() => calculateReliableIncome(streams), [streams]);
  const incomeByType = useMemo(() => calculateIncomeByType(streams), [streams]);

  const monthlyTotal = totalAnnual / 12;
  const monthlyReliable = reliableIncome / 12;
  const reliabilityPercent = totalAnnual > 0 ? (reliableIncome / totalAnnual) * 100 : 0;

  // Create pie chart data
  const pieData = useMemo(() => {
    const data: { type: IncomeType; amount: number; percent: number; color: string }[] = [];
    Object.entries(incomeByType).forEach(([type, amount]) => {
      if (amount > 0) {
        data.push({
          type: type as IncomeType,
          amount,
          percent: totalAnnual > 0 ? (amount / totalAnnual) * 100 : 0,
          color: TYPE_COLORS[type as IncomeType],
        });
      }
    });
    return data.sort((a, b) => b.amount - a.amount);
  }, [incomeByType, totalAnnual]);

  if (streams.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-6", className)}
    >
      {/* Primary Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Total Annual */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Annual</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mono-value text-primary">
            <AnimatedNumber value={totalAnnual} formatValue={formatCurrency} />
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {formatCurrency(monthlyTotal)}/month
          </div>
        </div>

        {/* Reliable Income */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium text-muted-foreground">Reliable Income</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mono-value text-emerald-500">
            <AnimatedNumber value={reliableIncome} formatValue={formatCurrency} />
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {formatCurrency(monthlyReliable)}/month ({reliabilityPercent.toFixed(0)}% of total)
          </div>
        </div>

        {/* Stream Count */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <PieChart className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-muted-foreground">Income Sources</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold mono-value text-blue-500">
            {streams.length}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {pieData.length} {pieData.length === 1 ? "type" : "types"} of income
          </div>
        </div>
      </div>

      {/* Income Composition */}
      {pieData.length > 0 && (
        <div className="p-5 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Income Composition</span>
          </div>

          {/* Visual Bar */}
          <div className="flex h-4 rounded-full overflow-hidden mb-4">
            {pieData.map((item, index) => (
              <motion.div
                key={item.type}
                initial={{ width: 0 }}
                animate={{ width: `${item.percent}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                style={{ backgroundColor: item.color }}
                className="h-full"
              />
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {pieData.map((item) => (
              <div key={item.type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium truncate">
                    {INCOME_TYPE_LABELS[item.type]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(item.amount)} ({item.percent.toFixed(0)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What Lenders See */}
      <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-purple-500/20 shrink-0">
            <Shield className="h-4 w-4 text-purple-500" />
          </div>
          <div>
            <div className="text-sm font-medium mb-1">What Lenders See</div>
            <div className="text-xs text-muted-foreground">
              Lenders typically use reliability-weighted income when evaluating loans. Based on your income mix, they'd likely consider{" "}
              <span className="font-semibold text-purple-500">{formatCurrency(reliableIncome)}</span>{" "}
              as your qualifying annual income, or{" "}
              <span className="font-semibold text-purple-500">{formatCurrency(monthlyReliable)}/month</span>.
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Compact summary for use in other pages
 */
export function IncomeStreamsSummaryCompact({ streams, className }: IncomeStreamsSummaryProps) {
  const totalAnnual = useMemo(() => calculateTotalAnnual(streams), [streams]);
  const reliableIncome = useMemo(() => calculateReliableIncome(streams), [streams]);

  if (streams.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      <div>
        <span className="text-muted-foreground">Total: </span>
        <span className="font-mono font-semibold">{formatCurrency(totalAnnual)}/yr</span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div>
        <span className="text-muted-foreground">Reliable: </span>
        <span className="font-mono font-semibold text-primary">{formatCurrency(reliableIncome)}/yr</span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div>
        <span className="text-muted-foreground">{streams.length} streams</span>
      </div>
    </div>
  );
}
