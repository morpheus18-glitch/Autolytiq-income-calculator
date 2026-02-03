import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, ChevronDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CalculationRecord {
  id: string;
  date: string;
  annualIncome: number;
  monthlyIncome: number;
  weeklyIncome: number;
  daysWorked: number;
  ytdIncome: number;
}

const STORAGE_KEY = "calculation-history";
const MAX_HISTORY = 5;

export function useCalculationHistory() {
  const [history, setHistory] = useState<CalculationRecord[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const addToHistory = (record: Omit<CalculationRecord, "id" | "date">) => {
    const newRecord: CalculationRecord = {
      ...record,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    setHistory((prev) => {
      // Remove duplicates (same annual income within 1%)
      const filtered = prev.filter(
        (r) => Math.abs(r.annualIncome - record.annualIncome) / r.annualIncome > 0.01
      );
      const updated = [newRecord, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, addToHistory, clearHistory };
}

interface CalculationHistoryProps {
  className?: string;
  onSelect?: (record: CalculationRecord) => void;
}

export function CalculationHistory({ className, onSelect }: CalculationHistoryProps) {
  const { history, clearHistory } = useCalculationHistory();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (history.length === 0) {
    return null;
  }

  return (
    <div className={cn("p-4 rounded-xl bg-card border border-border", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Recent Calculations</span>
          <span className="text-xs text-muted-foreground">({history.length})</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {history.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelect?.(record)}
                  className={cn(
                    "p-3 rounded-lg bg-secondary/30 border border-border/50",
                    onSelect && "cursor-pointer hover:border-primary/30 transition-colors"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(record.annualIncome)}
                        <span className="text-xs font-normal text-muted-foreground ml-1">/year</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(record.monthlyIncome)}/mo
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(record.date)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {record.daysWorked} days worked
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearHistory();
                  setIsExpanded(false);
                }}
                className="w-full text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Clear History
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
