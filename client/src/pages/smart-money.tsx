import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  Wallet,
  DollarSign,
  Calculator as CalcIcon,
  ChevronLeft,
  PiggyBank,
  Home,
  Car,
  ShoppingCart,
  Utensils,
  Heart,
  Zap,
  Smartphone,
  Plane,
  GraduationCap,
  TrendingUp,
  Info,
  BookOpen,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Target,
  Coffee,
} from "lucide-react";
import { Link } from "wouter";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MoneyInput } from "@/components/money-input";

const STORAGE_KEY = "smart-money-state";

// Tax brackets for 2024 (simplified federal only)
const TAX_BRACKETS_2024 = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

const FICA_RATE = 0.0765; // Social Security (6.2%) + Medicare (1.45%)
const STANDARD_DEDUCTION_2024 = 14600; // Single filer

function calculateFederalTax(income: number): number {
  const taxableIncome = Math.max(0, income - STANDARD_DEDUCTION_2024);
  let tax = 0;
  let remainingIncome = taxableIncome;

  for (const bracket of TAX_BRACKETS_2024) {
    if (remainingIncome <= 0) break;
    const taxableInBracket = Math.min(remainingIncome, bracket.max - bracket.min);
    tax += taxableInBracket * bracket.rate;
    remainingIncome -= taxableInBracket;
  }

  return tax;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

// 50/30/20 Budget Categories
const BUDGET_NEEDS = [
  { icon: Home, label: "Housing", percent: 0.25, tip: "Rent/mortgage should be ~25-30% of take-home" },
  { icon: Zap, label: "Utilities", percent: 0.05, tip: "Electric, gas, water, internet" },
  { icon: ShoppingCart, label: "Groceries", percent: 0.10, tip: "Essential food and household items" },
  { icon: Car, label: "Transportation", percent: 0.10, tip: "Car payment, gas, insurance, transit" },
];

const BUDGET_WANTS = [
  { icon: Utensils, label: "Dining Out", percent: 0.05, tip: "Restaurants and takeout" },
  { icon: Smartphone, label: "Subscriptions", percent: 0.05, tip: "Streaming, apps, memberships" },
  { icon: Plane, label: "Travel/Fun", percent: 0.10, tip: "Vacations and entertainment" },
  { icon: Coffee, label: "Personal", percent: 0.10, tip: "Shopping, hobbies, etc." },
];

const BUDGET_SAVINGS = [
  { icon: PiggyBank, label: "Emergency Fund", percent: 0.10, tip: "3-6 months expenses goal" },
  { icon: TrendingUp, label: "Investments", percent: 0.05, tip: "401k, IRA, brokerage" },
  { icon: Target, label: "Goals", percent: 0.05, tip: "House, car, education, etc." },
];

const MONEY_TIPS = [
  {
    icon: PiggyBank,
    title: "Pay Yourself First",
    description: "Set up automatic transfers to savings on payday. What you don't see, you won't spend.",
  },
  {
    icon: AlertTriangle,
    title: "Build an Emergency Fund",
    description: "Aim for 3-6 months of expenses. Start with $1,000 as a mini goal.",
  },
  {
    icon: TrendingUp,
    title: "Capture Employer Match",
    description: "Contribute enough to get your full 401k match. It's free money!",
  },
  {
    icon: Heart,
    title: "Tackle High-Interest Debt",
    description: "Credit card debt first. The average rate is 20%+ - that's an expensive loan.",
  },
];

function SmartMoney() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Income inputs
  const [annualIncome, setAnnualIncome] = useState("");
  const [stateTaxRate, setStateTaxRate] = useState("5");
  const [retirement401k, setRetirement401k] = useState("6");
  const [healthInsurance, setHealthInsurance] = useState("200");

  // Budget view
  const [budgetView, setBudgetView] = useState<"monthly" | "weekly" | "daily">("monthly");
  const [showBudgetDetails, setShowBudgetDetails] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Try to get income from main calculator
    try {
      const mainCalcState = localStorage.getItem("income-calc-state");
      if (mainCalcState) {
        const parsed = JSON.parse(mainCalcState);
        if (parsed.ytdIncome && parsed.startDate && parsed.checkDate) {
          const start = new Date(parsed.startDate);
          const check = new Date(parsed.checkDate);
          const yearStart = new Date(check.getFullYear(), 0, 1);
          const effectiveStart = start < yearStart ? yearStart : start;
          const days = Math.floor((check.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          if (days > 0) {
            const daily = parseFloat(parsed.ytdIncome) / days;
            const annual = daily * 365;
            setAnnualIncome(Math.round(annual).toString());
          }
        }
      }
    } catch (e) {
      console.error("Failed to load income data", e);
    }
  }, []);

  // Calculations
  const gross = parseFloat(annualIncome) || 0;
  const stateTax = parseFloat(stateTaxRate) / 100 || 0.05;
  const retirement = parseFloat(retirement401k) / 100 || 0.06;
  const healthMonthly = parseFloat(healthInsurance) || 200;

  // Tax calculations
  const federalTax = calculateFederalTax(gross);
  const ficaTax = gross * FICA_RATE;
  const stateTaxAmount = gross * stateTax;
  const retirement401kAmount = gross * retirement;
  const healthAnnual = healthMonthly * 12;

  const totalDeductions = federalTax + ficaTax + stateTaxAmount + retirement401kAmount + healthAnnual;
  const netAnnual = gross - totalDeductions;
  const netMonthly = netAnnual / 12;
  const netWeekly = netAnnual / 52;
  const netDaily = netAnnual / 365;

  const effectiveTaxRate = gross > 0 ? (federalTax + ficaTax + stateTaxAmount) / gross : 0;

  // Budget amounts based on view
  const getViewAmount = (amount: number) => {
    switch (budgetView) {
      case "weekly": return amount / 52;
      case "daily": return amount / 365;
      default: return amount / 12;
    }
  };

  const viewLabel = budgetView === "weekly" ? "Weekly" : budgetView === "daily" ? "Daily" : "Monthly";

  // 50/30/20 calculation
  const needsAmount = netAnnual * 0.50;
  const wantsAmount = netAnnual * 0.30;
  const savingsAmount = netAnnual * 0.20;

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="mr-1">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold tracking-tight dark:neon-text">Smart Money</h1>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/blog">
              <Button variant="ghost" size="icon">
                <BookOpen className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Master Your <span className="text-primary">Money</span>
          </h2>
          <p className="text-muted-foreground">
            See where your paycheck goes and plan your budget
          </p>
        </div>

        {/* Income Input Card */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Income & Deductions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Annual Gross Income</Label>
                <MoneyInput
                  value={annualIncome}
                  onChange={setAnnualIncome}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  State Tax Rate
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your state income tax rate (0% for TX, FL, etc.)</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={stateTaxRate}
                    onChange={(e) => setStateTaxRate(e.target.value.replace(/[^\d.]/g, ""))}
                    className="w-full h-11 px-3 pr-7 rounded-lg border bg-background font-mono text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                    placeholder="5"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">401k Contribution</Label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={retirement401k}
                    onChange={(e) => setRetirement401k(e.target.value.replace(/[^\d.]/g, ""))}
                    className="w-full h-11 px-3 pr-7 rounded-lg border bg-background font-mono text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                    placeholder="6"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Health Insurance/mo</Label>
                <MoneyInput
                  value={healthInsurance}
                  onChange={setHealthInsurance}
                  className="h-11"
                />
              </div>
            </div>

            {/* Income Breakdown */}
            {gross > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4 border-t border-border/50"
              >
                {/* Take Home Pay Hero */}
                <div className="hero-stat text-center mb-4">
                  <div className="text-sm text-muted-foreground mb-1">Take-Home Pay</div>
                  <div className="text-3xl font-bold mono-value text-primary neon-text">
                    {formatCurrency(netMonthly)}/mo
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(netAnnual)}/year • {formatCurrency(netWeekly)}/week
                  </div>
                </div>

                {/* Pre vs Post Tax */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="stat-card text-center">
                    <div className="text-xs text-muted-foreground">Gross Annual</div>
                    <div className="text-xl font-bold mono-value mt-1">{formatCurrency(gross)}</div>
                  </div>
                  <div className="stat-card text-center">
                    <div className="text-xs text-muted-foreground">Effective Tax Rate</div>
                    <div className="text-xl font-bold mono-value mt-1 text-yellow-500">
                      {formatPercent(effectiveTaxRate)}
                    </div>
                  </div>
                </div>

                {/* Deduction Breakdown */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Deductions Breakdown</div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="text-xs text-muted-foreground">Federal Tax</div>
                      <div className="font-mono font-bold text-red-400">{formatCurrency(federalTax)}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="text-xs text-muted-foreground">FICA</div>
                      <div className="font-mono font-bold text-orange-400">{formatCurrency(ficaTax)}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="text-xs text-muted-foreground">State Tax</div>
                      <div className="font-mono font-bold text-yellow-400">{formatCurrency(stateTaxAmount)}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-xs text-muted-foreground">401k</div>
                      <div className="font-mono font-bold text-emerald-400">{formatCurrency(retirement401kAmount)}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-xs text-muted-foreground">Health Ins.</div>
                      <div className="font-mono font-bold text-blue-400">{formatCurrency(healthAnnual)}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Budget Planner */}
        {netAnnual > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="glass-card border-none shadow-xl mb-6">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CalcIcon className="h-5 w-5 text-primary" />
                    50/30/20 Budget Planner
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex rounded-lg border border-border/50 overflow-hidden">
                      {(["monthly", "weekly", "daily"] as const).map((view) => (
                        <button
                          key={view}
                          onClick={() => setBudgetView(view)}
                          className={cn(
                            "px-3 py-1 text-xs font-medium transition-colors",
                            budgetView === view
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-secondary/50"
                          )}
                        >
                          {view.charAt(0).toUpperCase() + view.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 50/30/20 Overview */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <div className="text-2xl font-bold text-emerald-400">50%</div>
                    <div className="text-sm font-medium">Needs</div>
                    <div className="text-lg font-mono font-bold mt-1">
                      {formatCurrency(getViewAmount(needsAmount))}
                    </div>
                    <div className="text-xs text-muted-foreground">{viewLabel}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center">
                    <div className="text-2xl font-bold text-blue-400">30%</div>
                    <div className="text-sm font-medium">Wants</div>
                    <div className="text-lg font-mono font-bold mt-1">
                      {formatCurrency(getViewAmount(wantsAmount))}
                    </div>
                    <div className="text-xs text-muted-foreground">{viewLabel}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-primary/10 border border-primary/30 text-center">
                    <div className="text-2xl font-bold text-primary">20%</div>
                    <div className="text-sm font-medium">Savings</div>
                    <div className="text-lg font-mono font-bold mt-1">
                      {formatCurrency(getViewAmount(savingsAmount))}
                    </div>
                    <div className="text-xs text-muted-foreground">{viewLabel}</div>
                  </div>
                </div>

                {/* Toggle Details */}
                <button
                  type="button"
                  onClick={() => setShowBudgetDetails(!showBudgetDetails)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <ChevronRight className={cn("h-4 w-4 transition-transform", showBudgetDetails && "rotate-90")} />
                  {showBudgetDetails ? "Hide" : "Show"} category breakdown
                </button>

                <AnimatePresence>
                  {showBudgetDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden space-y-4"
                    >
                      {/* Needs */}
                      <div>
                        <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                          <Home className="h-4 w-4" />
                          Needs (50%)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {BUDGET_NEEDS.map((item) => (
                            <Tooltip key={item.label}>
                              <TooltipTrigger asChild>
                                <div className="p-3 rounded-lg bg-card border border-border/50 cursor-help">
                                  <item.icon className="h-4 w-4 text-emerald-400 mb-1" />
                                  <div className="text-xs text-muted-foreground">{item.label}</div>
                                  <div className="font-mono font-bold text-sm">
                                    {formatCurrency(getViewAmount(netAnnual * item.percent))}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.tip}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>

                      {/* Wants */}
                      <div>
                        <h3 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Wants (30%)
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {BUDGET_WANTS.map((item) => (
                            <Tooltip key={item.label}>
                              <TooltipTrigger asChild>
                                <div className="p-3 rounded-lg bg-card border border-border/50 cursor-help">
                                  <item.icon className="h-4 w-4 text-blue-400 mb-1" />
                                  <div className="text-xs text-muted-foreground">{item.label}</div>
                                  <div className="font-mono font-bold text-sm">
                                    {formatCurrency(getViewAmount(netAnnual * item.percent))}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.tip}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>

                      {/* Savings */}
                      <div>
                        <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                          <PiggyBank className="h-4 w-4" />
                          Savings & Investments (20%)
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {BUDGET_SAVINGS.map((item) => (
                            <Tooltip key={item.label}>
                              <TooltipTrigger asChild>
                                <div className="p-3 rounded-lg bg-card border border-border/50 cursor-help">
                                  <item.icon className="h-4 w-4 text-primary mb-1" />
                                  <div className="text-xs text-muted-foreground">{item.label}</div>
                                  <div className="font-mono font-bold text-sm">
                                    {formatCurrency(getViewAmount(netAnnual * item.percent))}
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{item.tip}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Money Tips */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Smart Money Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {MONEY_TIPS.map((tip) => (
                <div key={tip.title} className="p-4 rounded-lg bg-card border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <tip.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{tip.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {netAnnual > 0 && (
          <Card className="glass-card border-none shadow-xl mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Quick Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="stat-card text-center">
                  <div className="text-xs text-muted-foreground">Daily Budget</div>
                  <div className="text-lg font-bold mono-value mt-1">{formatCurrency(netDaily)}</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-xs text-muted-foreground">Hourly Rate</div>
                  <div className="text-lg font-bold mono-value mt-1">{formatCurrency(gross / 2080)}</div>
                  <div className="text-xs text-muted-foreground">(40hr weeks)</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-xs text-muted-foreground">Max Rent (30%)</div>
                  <div className="text-lg font-bold mono-value mt-1 text-primary">{formatCurrency(netMonthly * 0.30)}</div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-xs text-muted-foreground">Emergency Goal</div>
                  <div className="text-lg font-bold mono-value mt-1 text-emerald-400">{formatCurrency(netMonthly * 6)}</div>
                  <div className="text-xs text-muted-foreground">(6 months)</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <CalcIcon className="h-4 w-4" />
              Income Calculator
            </Button>
          </Link>
          <Link href="/housing" className="flex-1">
            <Button className="w-full gap-2">
              <Home className="h-4 w-4" />
              Housing Affordability
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Autolytiq. Tax estimates are approximate.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SmartMoney;
