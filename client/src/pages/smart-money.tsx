import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ShoppingCart, Utensils, Zap, Smartphone, Plane, Coffee, Home, Car, PiggyBank, TrendingUp, Target, AlertTriangle, Heart } from "lucide-react";
import { Link } from "wouter";

import { cn } from "@/lib/utils";
import {
  WalletIcon,
  AutolytiqLogo,
  DollarIcon,
  IncomeIcon,
  PiggyIcon,
  HousingIcon,
  AutoIcon,
  HeartIcon,
  GraduationIcon,
  TrendUpIcon,
  InfoIcon,
  BlogIcon,
  WarningIcon,
  CheckIcon,
  TargetIcon,
  ExternalLinkIcon,
  LightbulbIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MoneyInput } from "@/components/money-input";
import { SEO, createCalculatorSchema, createBreadcrumbSchema } from "@/components/seo";
import { analytics } from "@/lib/analytics";
import { PieChart, BarChart, AnimatedNumber } from "@/components/charts";
import { FAQ, BUDGET_PLANNER_FAQ } from "@/components/faq";
import { FirstTimeGuide, BUDGET_GUIDE_STEPS } from "@/components/first-time-guide";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { ProtectedInteractiveBudget } from "@/components/interactive-budget";
import { IncomeBanner, NoIncomeCTA } from "@/components/income-banner";
import { useIncome } from "@/lib/use-income";
import { BudgetDashboard } from "@/components/budget-progress";
import { SavingsGoals } from "@/components/savings-goals";

const STORAGE_KEY = "smart-money-state";

// Finance-focused affiliate links
const MONEY_AFFILIATES = [
  { name: "SoFi", desc: "Banking & high-yield savings", url: "https://www.sofi.com/invite/money", tag: "Top Pick" },
  { name: "Robinhood", desc: "Commission-free investing", url: "https://join.robinhood.com/", tag: "Free Stock" },
  { name: "Credit Karma", desc: "Free credit monitoring", url: "https://www.creditkarma.com/signup", tag: "Free" },
  { name: "YNAB", desc: "Budgeting app", url: "https://www.ynab.com/", tag: "Budgeting" },
];

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
  const [mounted, setMounted] = useState(false);
  const { income: calculatorIncome, hasIncome: hasCalculatorIncome } = useIncome();

  // Income inputs
  const [annualIncome, setAnnualIncome] = useState("");
  const [stateTaxRate, setStateTaxRate] = useState("5");
  const [retirement401k, setRetirement401k] = useState("6");
  const [healthInsurance, setHealthInsurance] = useState("200");

  // Budget view
  const [budgetView, setBudgetView] = useState<"monthly" | "weekly" | "daily">("monthly");
  const [showBudgetDetails, setShowBudgetDetails] = useState(true);

  // Load saved state from localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.annualIncome) setAnnualIncome(data.annualIncome);
        if (data.stateTaxRate) setStateTaxRate(data.stateTaxRate);
        if (data.retirement401k) setRetirement401k(data.retirement401k);
        if (data.healthInsurance) setHealthInsurance(data.healthInsurance);
      }
    } catch (e) {
      console.error("Failed to load smart-money state:", e);
    }
  }, []);

  // Save state to localStorage for financial checklist tracking
  useEffect(() => {
    if (annualIncome) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        annualIncome,
        stateTaxRate,
        retirement401k,
        healthInsurance,
      }));
    }
  }, [annualIncome, stateTaxRate, retirement401k, healthInsurance]);

  // Auto-populate income from calculator when available
  useEffect(() => {
    if (hasCalculatorIncome && calculatorIncome && !annualIncome) {
      setAnnualIncome(calculatorIncome.grossAnnual.toString());
    }
  }, [hasCalculatorIncome, calculatorIncome, annualIncome]);

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

  const seoData = {
    calculator: createCalculatorSchema(
      "Budget Planner & Take-Home Pay Calculator",
      "Calculate your take-home pay after taxes and plan your budget using the 50/30/20 rule. Free income breakdown and budget planning tool.",
      "https://autolytiqs.com/smart-money"
    ),
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Smart Money", url: "https://autolytiqs.com/smart-money" },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Budget Planner 2026 - 50/30/20 Calculator & Take-Home Pay"
        description="Free budget planner using the 50/30/20 rule. Calculate take-home pay after taxes, plan needs vs wants, and build smart savings goals. Daily, weekly, and monthly budget views."
        canonical="https://autolytiqs.com/smart-money"
        keywords="budget planner, 50 30 20 rule calculator, take home pay calculator, paycheck calculator after taxes, budget calculator, income breakdown, savings calculator 2026"
        structuredData={{ "@graph": [seoData.calculator, seoData.breadcrumbs] }}
      />
      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />

      {/* Gradient orbs - responsive sizing */}
      <div className="fixed top-0 left-1/4 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px] bg-primary/15 rounded-full blur-[60px] sm:blur-[80px] lg:blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] lg:w-[300px] lg:h-[300px] bg-primary/10 rounded-full blur-[50px] sm:blur-[60px] lg:blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="site-header">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="header-logo p-2 rounded-xl">
                <AutolytiqLogo className="h-6 w-6 text-primary" />
              </div>
              <span className="header-title text-xl">Autolytiq</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/calculator" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Calculator</Link>
            <span className="text-sm font-medium text-primary">Budget Planner</span>
            <Link href="/housing" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Housing</Link>
            <Link href="/auto" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Auto</Link>
            <Link href="/blog" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Blog</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden md:flex" />
            <Link href="/calculator">
              <Button size="sm" className="hidden md:flex">
                Open Calculator
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <PiggyBank className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">50/30/20 Rule Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            Master Your <span className="text-primary">Money</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See where your paycheck goes and plan your budget
          </p>
        </motion.div>

        {/* Income Detection Banner */}
        {hasCalculatorIncome ? (
          <IncomeBanner
            className="mb-6"
            variant="full"
            showCTA={false}
          />
        ) : (
          <NoIncomeCTA className="mb-6" />
        )}

        {/* Main Content - CTA Left, Calculator Right */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          {/* LEFT: Visual CTA & Value Proposition */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-5"
          >
            {/* Hero CTA Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-emerald-500/10 border-2 border-primary/30 p-6 shadow-xl">
              {/* Animated background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }} />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-xs font-semibold text-primary">Free Calculator</span>
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  Know Your <span className="text-primary">Real</span> Take-Home
                </h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Enter your salary and see exactly where every dollar goes. No signup required.
                </p>

                {/* Quick Stats Preview */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs text-muted-foreground">Needs</span>
                    </div>
                    <div className="text-lg font-bold text-emerald-400">50%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs text-muted-foreground">Wants</span>
                    </div>
                    <div className="text-lg font-bold text-blue-400">30%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-xs text-muted-foreground">Savings</span>
                    </div>
                    <div className="text-lg font-bold text-primary">20%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckIcon className="w-3 h-3 text-emerald-500" />
                      <span className="text-xs text-muted-foreground">Method</span>
                    </div>
                    <div className="text-sm font-bold">50/30/20</div>
                  </div>
                </div>

                {/* Arrow pointing to calculator */}
                <div className="hidden lg:flex items-center gap-2 text-primary">
                  <span className="text-sm font-medium">Start here</span>
                  <ChevronRight className="h-5 w-5 animate-bounce-x" />
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 py-3 px-4 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">100% Free</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">No Signup</span>
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-1.5">
                <CheckIcon className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Instant Results</span>
              </div>
            </div>

            {/* Smart Money Tips - Compact */}
            <Card className="glass-card border-none shadow-lg">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <LightbulbIcon className="h-4 w-4 text-yellow-500" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2">
                  {MONEY_TIPS.slice(0, 3).map((tip, index) => (
                    <motion.div
                      key={tip.title}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <tip.icon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <span className="text-xs font-medium">{tip.title}</span>
                        <p className="text-[10px] text-muted-foreground leading-tight">{tip.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* RIGHT: Income & Deductions Calculator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card className="glass-card border-2 border-primary/20 shadow-2xl shadow-primary/5 overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <DollarIcon className="h-5 w-5 text-primary" />
                  </div>
                  Income & Deductions
                  <span className="ml-auto text-xs font-normal text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                    2024 Tax Rates
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Annual Gross Income
                    </Label>
                    <MoneyInput
                      value={annualIncome}
                      onChange={setAnnualIncome}
                      className="h-12 text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      State Tax Rate
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
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
                        className="w-full h-12 px-4 pr-8 rounded-lg border bg-background font-mono text-lg focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all"
                        placeholder="5"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
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
                        className="w-full h-12 px-4 pr-8 rounded-lg border bg-background font-mono text-lg focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none transition-all"
                        placeholder="6"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Health Insurance/mo</Label>
                    <MoneyInput
                      value={healthInsurance}
                      onChange={setHealthInsurance}
                      className="h-12 text-lg"
                    />
                  </div>
                </div>

                {/* Income Breakdown Results */}
                {gross > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-5 border-t border-border/50"
                  >
                    {/* Take Home Pay Hero */}
                    <div className="relative mb-5 p-5 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                      <div className="absolute top-2 right-2">
                        <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          After Taxes
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">Your Take-Home Pay</div>
                      <div className="text-4xl font-bold mono-value text-primary mb-2">
                        <AnimatedNumber value={netMonthly} formatValue={(v) => formatCurrency(v)} />
                        <span className="text-lg text-muted-foreground font-normal">/month</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {formatCurrency(netAnnual)}/year
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {formatCurrency(netWeekly)}/week
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {formatCurrency(netDaily)}/day
                        </span>
                      </div>
                    </div>

                    {/* Pre vs Post Tax Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Gross Annual</div>
                        <div className="text-2xl font-bold mono-value">{formatCurrency(gross)}</div>
                      </div>
                      <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 text-center">
                        <div className="text-xs text-muted-foreground mb-1">Effective Tax Rate</div>
                        <div className="text-2xl font-bold mono-value text-yellow-500">
                          {formatPercent(effectiveTaxRate)}
                        </div>
                      </div>
                    </div>

                    {/* Deduction Breakdown */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Deductions Breakdown</span>
                        <span className="text-xs text-muted-foreground">{formatCurrency(totalDeductions)}/year total</span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center cursor-help hover:border-red-500/40 transition-colors">
                              <div className="text-[10px] text-muted-foreground mb-1">Federal</div>
                              <div className="font-mono font-bold text-red-400 text-sm">{formatCurrency(federalTax)}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Federal Income Tax (progressive brackets)</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-center cursor-help hover:border-orange-500/40 transition-colors">
                              <div className="text-[10px] text-muted-foreground mb-1">FICA</div>
                              <div className="font-mono font-bold text-orange-400 text-sm">{formatCurrency(ficaTax)}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Social Security (6.2%) + Medicare (1.45%)</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-center cursor-help hover:border-yellow-500/40 transition-colors">
                              <div className="text-[10px] text-muted-foreground mb-1">State</div>
                              <div className="font-mono font-bold text-yellow-400 text-sm">{formatCurrency(stateTaxAmount)}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>State Income Tax at {stateTaxRate}%</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center cursor-help hover:border-emerald-500/40 transition-colors">
                              <div className="text-[10px] text-muted-foreground mb-1">401k</div>
                              <div className="font-mono font-bold text-emerald-400 text-sm">{formatCurrency(retirement401kAmount)}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Pre-tax 401k at {retirement401k}% (reduces taxable income)</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center cursor-help hover:border-blue-500/40 transition-colors">
                              <div className="text-[10px] text-muted-foreground mb-1">Health</div>
                              <div className="font-mono font-bold text-blue-400 text-sm">{formatCurrency(healthAnnual)}</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Health Insurance at ${healthInsurance}/month</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Empty State CTA */}
                {gross === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                      <DollarIcon className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm">Enter your annual income above to see your budget breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

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
                    <IncomeIcon className="h-5 w-5 text-primary" />
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
                {/* 50/30/20 Overview with Pie Chart */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <PieChart
                    data={[
                      { label: "Needs", value: 50, color: "#10b981" },
                      { label: "Wants", value: 30, color: "#3b82f6" },
                      { label: "Savings", value: 20, color: "hsl(var(--primary))" },
                    ]}
                    size={140}
                    showLegend={false}
                    className="shrink-0"
                  />
                  <div className="grid grid-cols-3 gap-3 flex-1 w-full">
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
                          <HousingIcon className="h-4 w-4" />
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
                          <HeartIcon className="h-4 w-4" />
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
                          <PiggyIcon className="h-4 w-4" />
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

        {/* Interactive Budget Builder */}
        {gross > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <ProtectedInteractiveBudget monthlyIncome={netMonthly} />
          </motion.div>
        )}

        {/* Budget Progress Dashboard - Safe to Spend & Progress Bars */}
        {netMonthly > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <BudgetDashboard monthlyIncome={netMonthly} />
          </motion.div>
        )}

        {/* Savings Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <SavingsGoals monthlyIncome={netMonthly} />
        </motion.div>

        {/* Quick Stats */}
        {netAnnual > 0 && (
          <Card className="glass-card border-none shadow-xl mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TargetIcon className="h-5 w-5 text-primary" />
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

        {/* Financial Tools / Affiliates */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Financial Tools</h3>
              <span className="text-xs text-primary/70 bg-primary/10 px-2 py-1 rounded-md">Recommended</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MONEY_AFFILIATES.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => analytics.affiliateClick(link.name, "finance", link.url, "/smart-money")}
                  className="group relative p-3 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all"
                >
                  <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">
                    {link.tag}
                  </span>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{link.name}</span>
                    <ExternalLinkIcon className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </a>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/50 text-center mt-3">We may earn a commission from partner links</p>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <FAQ items={BUDGET_PLANNER_FAQ} className="mb-6" />

        {/* Enhanced CTAs with Explanations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-1">Apply Your Budget to Real Decisions</h3>
            <p className="text-sm text-muted-foreground">Now that you know your numbers, see what you can afford</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Housing Calculator CTA */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Link href="/housing">
                <div className="group p-5 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                      <HousingIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">Housing Affordability</h4>
                      <span className="text-xs text-primary/70">Your biggest expense</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-primary ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your housing should be 25-30% of income. Calculate max rent or mortgage payment based on your budget.
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-primary/20 text-primary">Rent vs Buy</span>
                    <span className="px-2 py-1 rounded-full bg-primary/20 text-primary">DTI Calculator</span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Auto Calculator CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Link href="/auto">
                <div className="group p-5 rounded-xl border-2 border-border/50 bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                      <AutoIcon className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">Auto Affordability</h4>
                      <span className="text-xs text-muted-foreground">12% rule for vehicles</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    See how much car you can afford. Keep payments under 12% of income for financial freedom.
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">Max Vehicle Price</span>
                    <span className="px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">True Ownership Cost</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Income Calculator row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Link href="/">
              <div className="group p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all cursor-pointer flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <IncomeIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors">Income Calculator</h4>
                  <p className="text-xs text-muted-foreground">Calculate annual income from your paystub YTD</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
          </motion.div>

          {/* Quick tip */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="text-center pt-4"
          >
            <p className="text-xs text-muted-foreground">
              <LightbulbIcon className="h-3 w-3 inline mr-1" />
              Your budget allocations flow directly into housing and auto calculators
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* First Time User Guide */}
      <FirstTimeGuide
        storageKey="budget-planner"
        title="Smart Money Budget Guide"
        subtitle="Master the 50/30/20 budget rule"
        steps={BUDGET_GUIDE_STEPS}
      />

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-6">
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
