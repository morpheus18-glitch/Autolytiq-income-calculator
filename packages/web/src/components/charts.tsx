import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  showLegend?: boolean;
  className?: string;
}

export function PieChart({ data, size = 160, showLegend = true, className }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;

  let cumulativePercent = 0;
  const segments = data.map((item) => {
    const percent = (item.value / total) * 100;
    const startPercent = cumulativePercent;
    cumulativePercent += percent;
    return { ...item, percent, startPercent };
  });

  // Create conic gradient
  const gradientStops = segments
    .map((seg) => `${seg.color} ${seg.startPercent}% ${seg.startPercent + seg.percent}%`)
    .join(", ");

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="relative shrink-0"
        style={{ width: size, height: size }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `conic-gradient(${gradientStops})`,
          }}
        />
        {/* Center hole for donut effect */}
        <div
          className="absolute inset-0 m-auto rounded-full bg-background"
          style={{ width: size * 0.55, height: size * 0.55 }}
        />
      </motion.div>

      {showLegend && (
        <div className="flex flex-col gap-1.5">
          {segments.map((seg, i) => (
            <motion.div
              key={seg.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-muted-foreground">{seg.label}</span>
              <span className="font-mono font-medium ml-auto">{seg.percent.toFixed(0)}%</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

interface BarChartProps {
  data: { label: string; value: number; color?: string; sublabel?: string }[];
  maxValue?: number;
  showValues?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export function BarChart({
  data,
  maxValue,
  showValues = true,
  formatValue = (v) => v.toLocaleString(),
  className,
}: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value));
  if (max === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {data.map((item, i) => {
        const percent = (item.value / max) * 100;
        return (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              {item.sublabel && (
                <span className="text-xs text-muted-foreground/70">{item.sublabel}</span>
              )}
            </div>
            <div className="h-6 bg-secondary/30 rounded-md overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                className="h-full rounded-md"
                style={{ backgroundColor: item.color || "hsl(var(--primary))" }}
              />
              {showValues && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-mono font-medium">
                  {formatValue(item.value)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface AmortizationChartProps {
  principal: number;
  monthlyPayment: number;
  annualRate: number;
  termMonths: number;
  className?: string;
}

export function AmortizationChart({
  principal,
  monthlyPayment,
  annualRate,
  termMonths,
  className,
}: AmortizationChartProps) {
  if (principal <= 0 || monthlyPayment <= 0) return null;

  const monthlyRate = annualRate / 100 / 12;
  const schedule: { month: number; principal: number; interest: number; balance: number }[] = [];

  let balance = principal;
  for (let month = 1; month <= termMonths && balance > 0; month++) {
    const interest = balance * monthlyRate;
    const principalPayment = Math.min(monthlyPayment - interest, balance);
    balance = Math.max(0, balance - principalPayment);

    // Sample every 6 months for display
    if (month % 6 === 0 || month === 1 || month === termMonths) {
      schedule.push({
        month,
        principal: principal - balance,
        interest: (monthlyPayment * month) - (principal - balance),
        balance,
      });
    }
  }

  const totalPaid = monthlyPayment * termMonths;
  const totalInterest = totalPaid - principal;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Principal vs Interest breakdown */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-4 bg-secondary/30 rounded-full overflow-hidden flex">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(principal / totalPaid) * 100}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-primary"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totalInterest / totalPaid) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-full bg-yellow-500"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
          <span className="text-muted-foreground">Principal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />
          <span className="text-muted-foreground">Interest</span>
        </div>
      </div>

      {/* Balance over time */}
      <div className="h-24 flex items-end gap-1">
        {schedule.map((point, i) => {
          const height = (point.balance / principal) * 100;
          return (
            <motion.div
              key={point.month}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="flex-1 bg-primary/60 rounded-t-sm relative group cursor-pointer hover:bg-primary transition-colors"
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  Mo {point.month}: ${point.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Month 1</span>
        <span>Month {termMonths}</span>
      </div>
    </div>
  );
}

interface ComparisonBarProps {
  label: string;
  value: number;
  compareValue: number;
  formatValue?: (value: number) => string;
  higherIsBetter?: boolean;
  className?: string;
}

export function ComparisonBar({
  label,
  value,
  compareValue,
  formatValue = (v) => `$${v.toLocaleString()}`,
  higherIsBetter = false,
  className,
}: ComparisonBarProps) {
  const max = Math.max(value, compareValue);
  const diff = value - compareValue;
  const isBetter = higherIsBetter ? diff > 0 : diff < 0;

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-mono", isBetter ? "text-emerald-500" : "text-yellow-500")}>
          {diff > 0 ? "+" : ""}{formatValue(diff)}
        </span>
      </div>
      <div className="flex gap-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          className="h-5 bg-primary rounded-sm flex items-center justify-end px-2"
        >
          <span className="text-xs font-mono text-primary-foreground">{formatValue(value)}</span>
        </motion.div>
      </div>
      <div className="flex gap-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(compareValue / max) * 100}%` }}
          className="h-5 bg-muted rounded-sm flex items-center justify-end px-2"
        >
          <span className="text-xs font-mono">{formatValue(compareValue)}</span>
        </motion.div>
      </div>
    </div>
  );
}

// Animated counter for numbers
interface AnimatedNumberProps {
  value: number;
  duration?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

export function AnimatedNumber({
  value,
  duration = 1,
  formatValue = (v) => v.toLocaleString(),
  className,
}: AnimatedNumberProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      key={value}
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {formatValue(value)}
      </motion.span>
    </motion.span>
  );
}
