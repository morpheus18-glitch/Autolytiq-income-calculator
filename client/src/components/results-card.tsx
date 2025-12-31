import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, Copy, Download, TrendingUp } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export interface CalculationResults {
  daysWorked: number;
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
  effectiveStartDate: Date;
}

interface ResultsCardProps {
  results: CalculationResults;
  resultsRef: React.RefObject<HTMLDivElement | null>;
}

function Counter({ value }: { value: number }) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return <>{formatter.format(value)}</>;
}

function ResultRow({
  label,
  value,
  subtext,
  delay,
}: {
  label: string;
  value: number;
  subtext?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card"
    >
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-xl font-bold mono-value text-foreground">
          <Counter value={value} />
        </span>
        {subtext && (
          <span className="text-xs text-muted-foreground">{subtext}</span>
        )}
      </div>
    </motion.div>
  );
}

export function ResultsCard({ results, resultsRef }: ResultsCardProps) {
  const { theme } = useTheme();

  const handleShare = async (type: "copy" | "image") => {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });

    const text =
      `Income Calculator Results:\n\n` +
      `Days Worked: ${results.daysWorked} (from ${format(results.effectiveStartDate, "MMM d, yyyy")})\n` +
      `Daily: ${formatter.format(results.daily)}\n` +
      `Weekly: ${formatter.format(results.weekly)}\n` +
      `Monthly: ${formatter.format(results.monthly)}\n` +
      `Annual: ${formatter.format(results.annual)}\n\n` +
      `Calculated via Income Calculator`;

    if (type === "copy") {
      navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Results ready to share.",
      });
    } else {
      if (!resultsRef.current) return;
      try {
        const dataUrl = await toPng(resultsRef.current, {
          cacheBust: true,
          backgroundColor: theme === "dark" ? "#050505" : "#ffffff",
        });
        const link = document.createElement("a");
        link.download = "income-projection.png";
        link.href = dataUrl;
        link.click();
        toast({
          title: "Image generated",
          description: "Result image downloaded.",
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to generate image.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      ref={resultsRef}
      className="glass-card rounded-xl shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary/10 dark:bg-primary/5 p-4 border-b border-primary/20 flex justify-between items-center">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="dark:neon-text">Projection Ready</span>
        </h3>
        <div className="text-xs font-mono text-primary/80 bg-primary/10 px-2 py-1 rounded-md">
          {results.daysWorked} Days
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Hero Annual Income */}
        <motion.div
          className="hero-stat text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Projected Annual Income
          </div>
          <div className="text-4xl sm:text-5xl font-bold mono-value text-primary dark:neon-text">
            <Counter value={results.annual} />
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Based on {results.daysWorked} days from{" "}
            {format(results.effectiveStartDate, "MMM d, yyyy")}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <ResultRow
            label="Monthly"
            value={results.monthly}
            delay={0.1}
          />
          <ResultRow label="Weekly" value={results.weekly} delay={0.15} />
        </div>

        <ResultRow label="Daily Average" value={results.daily} delay={0.2} />
      </div>

      {/* Actions */}
      <div className="p-4 bg-muted/20 border-t border-border/30 flex gap-2">
        <Button
          className="flex-1 elite-button"
          variant="outline"
          onClick={() => handleShare("copy")}
        >
          <Copy className="mr-2 h-4 w-4" /> Copy
        </Button>
        <Button
          className="flex-1 elite-button"
          variant="secondary"
          onClick={() => handleShare("image")}
        >
          <Download className="mr-2 h-4 w-4" /> Save
        </Button>
      </div>
    </motion.div>
  );
}
