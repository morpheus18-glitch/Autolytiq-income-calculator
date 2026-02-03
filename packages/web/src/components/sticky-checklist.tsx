import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Calculator, PiggyBank, Home, Car, ChevronRight, ChevronDown, ChevronUp, Target, Sparkles, X } from "lucide-react";
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
const CHECKLIST_COLLAPSED_KEY = "financial-checklist-collapsed";

// Pages where the sticky checklist should appear
const CHECKLIST_PAGES = ["/calculator", "/smart-money", "/housing", "/auto"];

export function StickyChecklist() {
  const [location] = useLocation();
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if we should show on this page
  const shouldShow = CHECKLIST_PAGES.includes(location);

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

  // Initial mount
  useEffect(() => {
    setMounted(true);
    // Load collapsed state
    const collapsed = localStorage.getItem(CHECKLIST_COLLAPSED_KEY);
    if (collapsed === "true") {
      setIsCollapsed(true);
    }
  }, []);

  // Check completion on mount and when location changes
  useEffect(() => {
    const completed = checkAllCompletions();
    setCompletedItems(completed);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));
  }, [checkAllCompletions, location]);

  // Poll for changes every second while on a calculator page
  useEffect(() => {
    if (!shouldShow) return;

    const checkForUpdates = () => {
      const completed = checkAllCompletions();
      const prevCount = completedItems.length;

      if (JSON.stringify(completed) !== JSON.stringify(completedItems)) {
        setCompletedItems(completed);
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed));

        // Show celebration when all complete
        if (completed.length === CHECKLIST_ITEMS.length && prevCount < CHECKLIST_ITEMS.length) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }
      }
    };

    const interval = setInterval(checkForUpdates, 1000);
    return () => clearInterval(interval);
  }, [checkAllCompletions, completedItems, shouldShow]);

  // Toggle collapsed state
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem(CHECKLIST_COLLAPSED_KEY, String(newState));
  };

  // Don't render on non-calculator pages or before mount
  if (!mounted || !shouldShow) return null;

  const completedCount = completedItems.length;
  const totalCount = CHECKLIST_ITEMS.length;
  const progressPercent = (completedCount / totalCount) * 100;
  const nextItem = CHECKLIST_ITEMS.find((item) => !completedItems.includes(item.id));
  const allComplete = completedCount === totalCount;

  return (
    <>
      {/* Desktop: Fixed sidebar on right */}
      <div className="hidden lg:block fixed right-4 top-24 z-40 w-72">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card/95 backdrop-blur-sm border border-border rounded-xl shadow-lg overflow-hidden"
        >
          {/* Header - always visible */}
          <button
            onClick={toggleCollapsed}
            className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-lg",
                allComplete ? "bg-emerald-500/20" : "bg-primary/10"
              )}>
                {allComplete ? (
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Target className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold">Your Financial Picture</div>
                <div className="text-xs text-muted-foreground">
                  {allComplete ? "Complete!" : `${completedCount}/${totalCount} done`}
                </div>
              </div>
            </div>
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Progress bar - always visible */}
          <div className="px-4 pb-2">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  allComplete ? "bg-emerald-500" : "bg-primary"
                )}
              />
            </div>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-2">
                  {CHECKLIST_ITEMS.map((item, index) => {
                    const isCompleted = completedItems.includes(item.id);
                    const isCurrent = location === item.href;
                    const isNext = nextItem?.id === item.id;
                    const Icon = item.icon;

                    return (
                      <Link key={item.id} href={item.href}>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer",
                            isCompleted
                              ? "bg-emerald-500/10 border border-emerald-500/30"
                              : isCurrent
                              ? "bg-primary/10 border border-primary/30 ring-2 ring-primary/20"
                              : isNext
                              ? "bg-primary/5 border border-primary/20 hover:bg-primary/10"
                              : "hover:bg-secondary/50 border border-transparent"
                          )}
                        >
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                              isCompleted
                                ? "bg-emerald-500 text-white"
                                : isCurrent
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary border border-border"
                            )}
                          >
                            {isCompleted ? (
                              <Check className="h-3.5 w-3.5" />
                            ) : (
                              <span className="text-[10px] font-bold">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                "text-sm font-medium",
                                isCompleted && "text-emerald-600 dark:text-emerald-400",
                                isCurrent && !isCompleted && "text-primary"
                              )}
                            >
                              {item.label}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {isCompleted ? item.completedDescription : item.description}
                            </div>
                          </div>
                          {!isCompleted && !isCurrent && (
                            <ChevronRight className={cn(
                              "h-4 w-4 flex-shrink-0",
                              isNext ? "text-primary" : "text-muted-foreground"
                            )} />
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}

                  {/* Celebration */}
                  {showCelebration && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/20 to-primary/20 border border-emerald-500/30 text-center"
                    >
                      <Sparkles className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        All Complete!
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Mobile: Fixed bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
        <div className="bg-card/95 backdrop-blur-sm border-t border-border shadow-lg">
          {/* Collapsed mobile view */}
          {isCollapsed ? (
            <button
              onClick={toggleCollapsed}
              className="w-full p-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  allComplete ? "bg-emerald-500/20" : "bg-primary/10"
                )}>
                  {allComplete ? (
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Target className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-semibold">Your Financial Picture</div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          allComplete ? "bg-emerald-500" : "bg-primary"
                        )}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{completedCount}/{totalCount}</span>
                  </div>
                </div>
              </div>
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            </button>
          ) : (
            /* Expanded mobile view */
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1.5 rounded-lg",
                    allComplete ? "bg-emerald-500/20" : "bg-primary/10"
                  )}>
                    {allComplete ? (
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Target className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <span className="text-sm font-semibold">Your Financial Picture</span>
                </div>
                <button onClick={toggleCollapsed} className="p-1">
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              {/* Horizontal checklist for mobile */}
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
                {CHECKLIST_ITEMS.map((item, index) => {
                  const isCompleted = completedItems.includes(item.id);
                  const isCurrent = location === item.href;
                  const isNext = nextItem?.id === item.id;
                  const Icon = item.icon;

                  return (
                    <Link key={item.id} href={item.href}>
                      <div
                        className={cn(
                          "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-all",
                          isCompleted
                            ? "bg-emerald-500/10 border border-emerald-500/30"
                            : isCurrent
                            ? "bg-primary/10 border border-primary/30"
                            : isNext
                            ? "bg-primary/5 border border-primary/20"
                            : "bg-secondary/50 border border-border"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                            isCompleted
                              ? "bg-emerald-500 text-white"
                              : isCurrent
                              ? "bg-primary text-primary-foreground"
                              : "bg-background border border-border"
                          )}
                        >
                          {isCompleted ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <span className="text-[9px] font-bold">{index + 1}</span>
                          )}
                        </div>
                        <span className={cn(
                          "text-xs font-medium whitespace-nowrap",
                          isCompleted && "text-emerald-600 dark:text-emerald-400",
                          isCurrent && !isCompleted && "text-primary"
                        )}>
                          {item.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
