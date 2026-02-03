import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calculator, PiggyBank, Home, Car, ChevronRight, Target, Sparkles, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completedDescription: string;
  href: string;
  icon: typeof Calculator;
  storageKey: string;
  checkCompletion: () => boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "income",
    label: "Calculate Income",
    description: "Know your true annual earnings",
    completedDescription: "Annual income calculated",
    href: "/calculator",
    icon: Calculator,
    storageKey: "income-calc-state",
    checkCompletion: () => {
      try {
        const data = localStorage.getItem("income-calc-state");
        if (!data) return false;
        const parsed = JSON.parse(data);
        // Check if they have actual income data entered
        return !!(parsed.ytdIncome && parseFloat(parsed.ytdIncome) > 0);
      } catch {
        return false;
      }
    },
  },
  {
    id: "budget",
    label: "Set Budget",
    description: "Apply the 50/30/20 rule",
    completedDescription: "Budget plan created",
    href: "/smart-money",
    icon: PiggyBank,
    storageKey: "smart-money-state",
    checkCompletion: () => {
      try {
        const data = localStorage.getItem("smart-money-state");
        if (!data) return false;
        const parsed = JSON.parse(data);
        // Check if they have income entered on smart money page
        return !!(parsed.annualIncome && parseFloat(parsed.annualIncome) > 0);
      } catch {
        return false;
      }
    },
  },
  {
    id: "housing",
    label: "Check Housing",
    description: "Know what rent you can afford",
    completedDescription: "Housing budget set",
    href: "/housing",
    icon: Home,
    storageKey: "housing-calc-state",
    checkCompletion: () => {
      try {
        const data = localStorage.getItem("housing-calc-state");
        if (!data) return false;
        const parsed = JSON.parse(data);
        return !!(parsed.monthlyIncome && parseFloat(parsed.monthlyIncome) > 0);
      } catch {
        return false;
      }
    },
  },
  {
    id: "auto",
    label: "Check Auto",
    description: "Know your max car payment",
    completedDescription: "Auto budget calculated",
    href: "/auto",
    icon: Car,
    storageKey: "auto-page-state",
    checkCompletion: () => {
      try {
        const data = localStorage.getItem("auto-page-state");
        if (!data) return false;
        const parsed = JSON.parse(data);
        return !!(parsed.monthlyIncome && parseFloat(parsed.monthlyIncome) > 0);
      } catch {
        return false;
      }
    },
  },
];

const PROGRESS_KEY = "financial-checklist-progress";

export function FinancialChecklist({ className }: { className?: string }) {
  const [location] = useLocation();
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Check completion status for all items
  const checkAllCompletions = useCallback(() => {
    const completed: string[] = [];
    CHECKLIST_ITEMS.forEach((item) => {
      if (item.checkCompletion()) {
        completed.push(item.id);
      }
    });
    return completed;
  }, []);

  // Initial load and periodic check
  useEffect(() => {
    const completed = checkAllCompletions();
    setCompletedItems(completed);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
  }, [checkAllCompletions]);

  // Re-check when navigating back to check for updates
  useEffect(() => {
    const handleFocus = () => {
      const completed = checkAllCompletions();
      const prevCount = completedItems.length;
      setCompletedItems(completed);
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));

      // Show celebration when all complete
      if (completed.length === CHECKLIST_ITEMS.length && prevCount < CHECKLIST_ITEMS.length) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    };

    window.addEventListener("focus", handleFocus);

    // Also check on storage changes (for when data is saved)
    const handleStorage = () => {
      const completed = checkAllCompletions();
      setCompletedItems(completed);
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
    };

    window.addEventListener("storage", handleStorage);

    // Check periodically while on page (for real-time updates)
    const interval = setInterval(handleStorage, 2000);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, [checkAllCompletions, completedItems.length]);

  // Reset progress
  const handleReset = () => {
    CHECKLIST_ITEMS.forEach((item) => {
      localStorage.removeItem(item.storageKey);
    });
    localStorage.removeItem(PROGRESS_KEY);
    setCompletedItems([]);
  };

  const completedCount = completedItems.length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercent = (completedCount / totalCount) * 100;
  const nextItem = CHECKLIST_ITEMS.find((item) => !completedItems.includes(item.id));

  return (
    <div className={cn("p-5 rounded-xl bg-card border border-border relative overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <span className="text-sm font-semibold">Your Financial Picture</span>
        </div>
        {completedCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-medium">{completedCount} of {totalCount} complete</span>
          <span className="font-mono">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full transition-colors",
              progressPercent === 100 ? "bg-emerald-500" : "bg-primary"
            )}
          />
        </div>
      </div>

      {/* Next Step Highlight */}
      {nextItem && completedCount < totalCount && (
        <Link href={nextItem.href}>
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/15 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <nextItem.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-primary font-medium mb-0.5">Next Step</div>
                <div className="text-sm font-semibold">{nextItem.label}</div>
                <div className="text-xs text-muted-foreground">{nextItem.description}</div>
              </div>
              <ChevronRight className="h-5 w-5 text-primary" />
            </div>
          </motion.div>
        </Link>
      )}

      {/* Checklist items */}
      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item, index) => {
          const isCompleted = completedItems.includes(item.id);
          const isCurrent = location === item.href;
          const isNext = nextItem?.id === item.id;

          return (
            <Link key={item.id} href={item.href}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer",
                  isCompleted
                    ? "bg-emerald-500/5 border border-emerald-500/20"
                    : isNext
                    ? "bg-primary/5 border border-primary/20 hover:bg-primary/10"
                    : "hover:bg-secondary/50 border border-transparent",
                  isCurrent && "ring-2 ring-primary/30"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : "bg-secondary border-2 border-border"
                  )}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Check className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isCompleted ? "text-emerald-600 dark:text-emerald-400" : ""
                    )}
                  >
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {isCompleted ? item.completedDescription : item.description}
                  </div>
                </div>
                {!isCompleted && (
                  <ChevronRight className={cn(
                    "h-4 w-4 transition-colors",
                    isNext ? "text-primary" : "text-muted-foreground"
                  )} />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Completion celebration */}
      <AnimatePresence>
        {(completedCount === totalCount || showCelebration) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-4 p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-primary/10 border border-emerald-500/20 text-center"
          >
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 mb-2">
              <Sparkles className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Financial Picture Complete!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You've mapped out your full financial picture
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
