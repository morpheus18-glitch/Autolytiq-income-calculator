import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, Calculator, PiggyBank, Home, Car, ChevronRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: typeof Calculator;
  storageKey: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "income",
    label: "Calculate Income",
    description: "Know your true annual earnings",
    href: "/calculator",
    icon: Calculator,
    storageKey: "income-calc-state",
  },
  {
    id: "budget",
    label: "Set Budget",
    description: "Apply the 50/30/20 rule",
    href: "/smart-money",
    icon: PiggyBank,
    storageKey: "budget-planner-visited",
  },
  {
    id: "housing",
    label: "Check Housing",
    description: "Know what rent you can afford",
    href: "/housing",
    icon: Home,
    storageKey: "housing-calc-visited",
  },
  {
    id: "auto",
    label: "Check Auto",
    description: "Know your max car payment",
    href: "/auto",
    icon: Car,
    storageKey: "auto-calc-visited",
  },
];

const STORAGE_KEY = "financial-checklist-progress";

export function FinancialChecklist({ className }: { className?: string }) {
  const [location] = useLocation();
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  // Load completed items from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setCompletedItems(JSON.parse(saved));
      } catch {
        setCompletedItems([]);
      }
    }

    // Also check individual storage keys for completion
    const completed: string[] = [];
    CHECKLIST_ITEMS.forEach((item) => {
      const data = localStorage.getItem(item.storageKey);
      if (data) {
        // For income calculator, check if there's actual data
        if (item.id === "income") {
          try {
            const parsed = JSON.parse(data);
            if (parsed.ytdIncome) {
              completed.push(item.id);
            }
          } catch {
            // Not valid JSON, ignore
          }
        } else {
          completed.push(item.id);
        }
      }
    });

    if (completed.length > 0) {
      setCompletedItems((prev) => {
        const merged = Array.from(new Set([...prev, ...completed]));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      });
    }
  }, []);

  // Track page visits
  useEffect(() => {
    const pageToItem: Record<string, string> = {
      "/smart-money": "budget",
      "/housing": "housing",
      "/auto": "auto",
    };

    const itemId = pageToItem[location];
    if (itemId && !completedItems.includes(itemId)) {
      const storageKey = CHECKLIST_ITEMS.find(i => i.id === itemId)?.storageKey;
      if (storageKey) {
        localStorage.setItem(storageKey, "visited");
      }
      setCompletedItems((prev) => {
        const updated = [...prev, itemId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [location, completedItems]);

  const completedCount = completedItems.length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercent = (completedCount / totalCount) * 100;

  return (
    <div className={cn("p-4 rounded-xl bg-card border border-border", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Target className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Your Financial Picture</span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>{completedCount} of {totalCount} complete</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-primary rounded-full"
          />
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => {
          const isCompleted = completedItems.includes(item.id);
          const isCurrent = location === item.href;

          return (
            <Link key={item.id} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer",
                  isCompleted
                    ? "bg-primary/5"
                    : "hover:bg-secondary/50",
                  isCurrent && "ring-1 ring-primary/30"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary border border-border"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <item.icon className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isCompleted && "text-muted-foreground line-through"
                    )}
                  >
                    {item.label}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </div>
                </div>
                {!isCompleted && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {completedCount === totalCount && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20 text-center"
        >
          <p className="text-sm font-medium text-primary">
            You've completed your financial picture!
          </p>
        </motion.div>
      )}
    </div>
  );
}
