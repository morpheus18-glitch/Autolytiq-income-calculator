import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, Wallet, Target, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { transactionApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface SpendingSummary {
  needs: number;
  wants: number;
  savings: number;
  total: number;
}

interface BudgetProgressProps {
  monthlyIncome: number;
  className?: string;
  refreshTrigger?: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDaysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getDayOfMonth(date: Date): number {
  return date.getDate();
}

function getDaysRemaining(date: Date): number {
  return getDaysInMonth(date) - getDayOfMonth(date);
}

/**
 * Budget Progress Bars - Shows actual spending vs planned budget
 */
export function BudgetProgressBars({ monthlyIncome, className, refreshTrigger }: BudgetProgressProps) {
  const { user } = useAuth();
  const [spending, setSpending] = useState<SpendingSummary>({ needs: 0, wants: 0, savings: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // Calculate 50/30/20 budget amounts
  const budgets = {
    needs: monthlyIncome * 0.5,
    wants: monthlyIncome * 0.3,
    savings: monthlyIncome * 0.2,
    total: monthlyIncome,
  };

  useEffect(() => {
    async function fetchSpending() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const endDate = now.toISOString().split("T")[0];

        const { data: response } = await transactionApi.summary(startDate, endDate);

        const summary = response?.summary || {};
        setSpending({
          needs: summary.needs?.total || 0,
          wants: summary.wants?.total || 0,
          savings: summary.savings?.total || 0,
          total: (summary.needs?.total || 0) + (summary.wants?.total || 0) + (summary.savings?.total || 0),
        });
      } catch (error) {
        console.error("Failed to fetch spending:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSpending();
  }, [user, refreshTrigger]);

  const categories = [
    {
      name: "Needs",
      spent: spending.needs,
      budget: budgets.needs,
      color: "emerald",
      bgColor: "bg-emerald-500",
      textColor: "text-emerald-500",
      icon: Target,
    },
    {
      name: "Wants",
      spent: spending.wants,
      budget: budgets.wants,
      color: "blue",
      bgColor: "bg-blue-500",
      textColor: "text-blue-500",
      icon: Wallet,
    },
    {
      name: "Savings",
      spent: spending.savings,
      budget: budgets.savings,
      color: "amber",
      bgColor: "bg-amber-500",
      textColor: "text-amber-500",
      icon: TrendingUp,
    },
  ];

  const now = new Date();
  const dayOfMonth = getDayOfMonth(now);
  const daysInMonth = getDaysInMonth(now);
  const monthProgress = (dayOfMonth / daysInMonth) * 100;

  return (
    <Card className={cn("glass-card border-none shadow-xl", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Budget vs. Actual
          </CardTitle>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Day {dayOfMonth} of {daysInMonth}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Month progress indicator */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Month Progress</span>
            <span>{Math.round(monthProgress)}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-muted-foreground/30 transition-all duration-500"
              style={{ width: `${monthProgress}%` }}
            />
          </div>
        </div>

        {/* Category progress bars */}
        {categories.map((cat) => {
          const percent = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
          const isOverBudget = percent > 100;
          const isOnTrack = percent <= monthProgress;
          const remaining = Math.max(0, cat.budget - cat.spent);

          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <cat.icon className={cn("h-4 w-4", cat.textColor)} />
                  <span className="text-sm font-medium">{cat.name}</span>
                  {isOverBudget ? (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Over
                    </span>
                  ) : isOnTrack ? (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      On track
                    </span>
                  ) : (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Ahead
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className={cn("font-mono text-sm font-semibold", isOverBudget && "text-red-500")}>
                    {formatCurrency(cat.spent)}
                  </span>
                  <span className="text-muted-foreground text-sm"> / {formatCurrency(cat.budget)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                {/* Month progress marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-foreground/20 z-10"
                  style={{ left: `${Math.min(monthProgress, 100)}%` }}
                />
                {/* Spent bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percent, 100)}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    isOverBudget ? "bg-red-500" : cat.bgColor
                  )}
                />
                {/* Overage indicator */}
                {isOverBudget && (
                  <div className="absolute inset-0 bg-red-500/20 animate-pulse" />
                )}
              </div>

              {/* Remaining text */}
              <div className="text-xs text-muted-foreground">
                {isOverBudget ? (
                  <span className="text-red-500">
                    {formatCurrency(cat.spent - cat.budget)} over budget
                  </span>
                ) : (
                  <span>{formatCurrency(remaining)} remaining</span>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Total summary */}
        <div className="pt-3 border-t border-border/50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Spent</span>
            <div>
              <span className={cn(
                "font-mono text-lg font-bold",
                spending.total > budgets.total ? "text-red-500" : "text-primary"
              )}>
                {formatCurrency(spending.total)}
              </span>
              <span className="text-muted-foreground text-sm"> / {formatCurrency(budgets.total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Safe to Spend Today - Dynamic daily allowance
 */
export function SafeToSpendCard({ monthlyIncome, className, refreshTrigger }: BudgetProgressProps) {
  const { user } = useAuth();
  const [spending, setSpending] = useState<SpendingSummary>({ needs: 0, wants: 0, savings: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpending() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
        const endDate = now.toISOString().split("T")[0];

        const { data: response } = await transactionApi.summary(startDate, endDate);

        const summary = response?.summary || {};
        setSpending({
          needs: summary.needs?.total || 0,
          wants: summary.wants?.total || 0,
          savings: summary.savings?.total || 0,
          total: (summary.needs?.total || 0) + (summary.wants?.total || 0) + (summary.savings?.total || 0),
        });
      } catch (error) {
        console.error("Failed to fetch spending:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSpending();
  }, [user, refreshTrigger]);

  const now = new Date();
  const daysRemaining = getDaysRemaining(now) + 1; // Include today
  const daysInMonth = getDaysInMonth(now);

  // Calculate remaining budget for "wants" (discretionary spending)
  const wantsBudget = monthlyIncome * 0.3;
  const wantsRemaining = Math.max(0, wantsBudget - spending.wants);

  // Safe to spend per day = remaining wants budget / days remaining
  const safeToSpendDaily = daysRemaining > 0 ? wantsRemaining / daysRemaining : 0;

  // Calculate spending velocity
  const daysPassed = getDayOfMonth(now);
  const expectedSpendingByNow = (wantsBudget / daysInMonth) * daysPassed;
  const spendingDiff = spending.wants - expectedSpendingByNow;
  const isAhead = spendingDiff > 0;
  const velocityPercent = expectedSpendingByNow > 0
    ? Math.abs(spendingDiff / expectedSpendingByNow) * 100
    : 0;

  // Determine status
  const isHealthy = safeToSpendDaily >= (wantsBudget / daysInMonth);
  const isCritical = safeToSpendDaily < (wantsBudget / daysInMonth) * 0.5;

  return (
    <Card className={cn("glass-card border-none shadow-xl", className)}>
      <CardContent className="p-6">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            Safe to Spend Today
          </div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "text-4xl font-bold font-mono",
              isCritical ? "text-red-500" : isHealthy ? "text-emerald-500" : "text-amber-500"
            )}
          >
            {formatCurrency(safeToSpendDaily)}
          </motion.div>
          <div className="text-sm text-muted-foreground mt-1">
            for discretionary spending
          </div>

          {/* Velocity indicator */}
          <div className={cn(
            "mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
            isAhead
              ? "bg-amber-500/10 text-amber-500"
              : "bg-emerald-500/10 text-emerald-500"
          )}>
            {isAhead ? (
              <>
                <TrendingUp className="h-3 w-3" />
                Spending {Math.round(velocityPercent)}% faster than pace
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3" />
                {Math.round(velocityPercent)}% under pace
              </>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <div className="text-lg font-bold font-mono">{daysRemaining}</div>
              <div className="text-xs text-muted-foreground">Days Left</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono text-primary">
                {formatCurrency(wantsRemaining)}
              </div>
              <div className="text-xs text-muted-foreground">Wants Budget Left</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold font-mono">
                {formatCurrency(spending.wants)}
              </div>
              <div className="text-xs text-muted-foreground">Spent This Month</div>
            </div>
          </div>

          {/* Advice */}
          {isCritical && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-left"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <div className="text-xs text-red-400">
                  <strong>Budget Alert:</strong> You're spending faster than your budget allows.
                  Consider skipping non-essential purchases for the next few days.
                </div>
              </div>
            </motion.div>
          )}

          {isHealthy && !isCritical && spending.wants > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-left"
            >
              <div className="flex items-start gap-2">
                <Flame className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div className="text-xs text-emerald-400">
                  <strong>On Track:</strong> You're pacing well within your budget.
                  Keep it up!
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Combined Budget Dashboard
 */
export function BudgetDashboard({ monthlyIncome, className, refreshTrigger }: BudgetProgressProps) {
  return (
    <div className={cn("grid gap-4 lg:grid-cols-2", className)}>
      <SafeToSpendCard monthlyIncome={monthlyIncome} refreshTrigger={refreshTrigger} />
      <BudgetProgressBars monthlyIncome={monthlyIncome} refreshTrigger={refreshTrigger} />
    </div>
  );
}
