import React from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, Copy, Download } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";

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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
      className="flex flex-col p-4 rounded-xl bg-secondary/30 border border-border/50"
    >
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
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
          backgroundColor: theme === "dark" ? "#09090b" : "#ffffff",
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
      className="bg-card glass-card rounded-xl shadow-2xl overflow-hidden border border-primary/20"
    >
      <div className="bg-primary/10 p-4 border-b border-primary/10 flex justify-between items-center">
        <h3 className="font-semibold text-primary flex items-center gap-2">
          <Check className="h-4 w-4" /> Projection Ready
        </h3>
        <div className="text-xs font-mono text-primary/80 bg-primary/10 px-2 py-1 rounded">
          {results.daysWorked} Days (from{" "}
          {format(results.effectiveStartDate, "MMM d")})
        </div>
      </div>

      <div className="p-4 grid grid-cols-1 gap-3">
        <motion.div
          className="p-5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm font-medium opacity-90">
            Projected Annual Income
          </div>
          <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tighter mt-1">
            <Counter value={results.annual} />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-3">
          <ResultRow
            label="Monthly"
            value={results.monthly}
            subtext="(Normalized)"
            delay={0.1}
          />
          <ResultRow label="Weekly" value={results.weekly} delay={0.2} />
        </div>

        <ResultRow label="Daily Average" value={results.daily} delay={0.3} />
      </div>

      <div className="p-4 bg-muted/30 border-t border-border/50 flex gap-2">
        <Button
          className="flex-1"
          variant="outline"
          onClick={() => handleShare("copy")}
        >
          <Copy className="mr-2 h-4 w-4" /> Copy Text
        </Button>
        <Button
          className="flex-1"
          variant="secondary"
          onClick={() => handleShare("image")}
        >
          <Download className="mr-2 h-4 w-4" /> Save Image
        </Button>
      </div>
    </motion.div>
  );
}
