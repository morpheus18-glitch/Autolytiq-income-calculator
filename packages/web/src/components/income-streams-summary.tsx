import { motion } from "framer-motion";
import { TrendingUp, Shield, PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  type IncomeStream,
  type IncomeType,
  INCOME_TYPE_LABELS,
  calculateTotalAnnual,
  calculateReliableIncome,
  calculateIncomeByType,
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
  if (streams.length === 0) {
    return null;
  }

  const totalAnnual = calculateTotalAnnual(streams);
  const reliableIncome = calculateReliableIncome(streams);
  const byType = calculateIncomeByType(streams);
  const reliabilityPercent = totalAnnual > 0 ? (reliableIncome / totalAnnual) * 100 : 0;

  // Generate pie chart data
  const pieData = Object.entries(byType)
    .filter(([, amount]) => amount > 0)
    .map(([type, amount]) => ({
      type: type as IncomeType,
      amount,
      percent: (amount / totalAnnual) * 100,
      color: TYPE_COLORS[type as IncomeType],
    }))
    .sort((a, b) => b.amount - a.amount);

  // Create SVG pie chart
  const renderPieChart = () => {
    if (pieData.length === 0) return null;

    let currentAngle = 0;
    const radius = 40;
    const center = 50;

    const segments = pieData.map((segment) => {
      const angle = (segment.percent / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      // Calculate arc path
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const d = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

      return (
        <path
          key={segment.type}
          d={d}
          fill={segment.color}
          className="transition-all hover:opacity-80"
        />
      );
    });

    return (
      <svg viewBox="0 0 100 100" className="w-24 h-24">
        {segments}
        {/* Inner circle for donut effect */}
        <circle cx={center} cy={center} r={20} className="fill-background" />
      </svg>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-3 gap-6">
            {/* Total Annual */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">Total Annual</span>
              </div>
              <div className="text-3xl font-bold mono-value text-primary">
                {formatCurrency(totalAnnual)}
              </div>
              <div className="text-sm text-muted-foreground">
                {formatCurrency(totalAnnual / 12)}/month
              </div>
            </div>

            {/* Reliable Income */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Shield className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-sm text-muted-foreground">Reliable Income</span>
              </div>
              <div className="text-3xl font-bold mono-value text-green-500">
                {formatCurrency(reliableIncome)}
              </div>
              <div className="text-sm text-muted-foreground">
                {reliabilityPercent.toFixed(0)}% of total
              </div>
            </div>

            {/* Income Composition */}
            <div className="flex items-center gap-4 justify-center sm:justify-end">
              {renderPieChart()}
              <div className="space-y-1">
                {pieData.slice(0, 4).map((segment) => (
                  <div key={segment.type} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-muted-foreground">
                      {INCOME_TYPE_LABELS[segment.type]}
                    </span>
                    <span className="font-medium">{segment.percent.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reliability Bar */}
          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span>Income Reliability Score</span>
              <span className="font-medium text-foreground">{reliabilityPercent.toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${reliabilityPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  reliabilityPercent >= 80 ? "bg-green-500" :
                  reliabilityPercent >= 60 ? "bg-yellow-500" : "bg-orange-500"
                )}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {reliabilityPercent >= 80
                ? "Excellent! Your income is highly stable and reliable."
                : reliabilityPercent >= 60
                ? "Good stability. Consider adding more stable income sources."
                : "Variable income. Lenders may count less of your total when evaluating loans."}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
