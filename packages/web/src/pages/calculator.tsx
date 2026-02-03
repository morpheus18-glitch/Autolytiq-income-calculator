import { useState, useEffect, useRef } from "react";
import {
  differenceInCalendarDays,
  isBefore,
  startOfToday,
  startOfYear,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  AutolytiqLogo,
  IncomeIcon,
  DollarIcon,
  AutoIcon,
  HousingIcon,
  WalletIcon,
  CreditScoreIcon,
  ClockIcon,
  ResetIcon,
  LoginIcon,
  LogoutIcon,
  CheckIcon,
  DownloadIcon,
  InfoIcon,
  HelpIcon,
  ChartIcon,
} from "@/components/icons";
import { Link } from "wouter";

import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MoneyInput } from "@/components/money-input";
import { DateInput } from "@/components/date-input";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { FAQ, INCOME_CALCULATOR_FAQ } from "@/components/faq";
import { ExportButtons, ShareButtons, EmailCaptureModal } from "@/components/pdf-export";
import { BarChart, AnimatedNumber } from "@/components/charts";
import { ScenarioManager } from "@/components/scenarios";
import { SEO, createCalculatorSchema, createHowToSchema, createFAQSchema } from "@/components/seo";
import { ManageCookiesButton } from "@/components/cookie-consent";
import { FirstTimeGuide, CALCULATOR_GUIDE_STEPS } from "@/components/first-time-guide";
import { useToast } from "@/hooks/use-toast";
import { PostCalculationCTA } from "@/components/post-calculation-cta";
import { FinancialChecklist } from "@/components/financial-checklist";
import { AccountPrompt, useCalculationTracker } from "@/components/account-prompt";
import { CalculationHistory, useCalculationHistory } from "@/components/calculation-history";
import { CreditKarmaPopup, useCreditKarmaPopup } from "@/components/credit-karma-popup";

const STORAGE_KEY = "income-calc-state";

// Credit score tiers with base APR rates
const CREDIT_TIERS = [
  { id: "excellent", label: "Excellent", range: "750+", baseApr: 5.99, color: "text-emerald-500" },
  { id: "good", label: "Good", range: "700-749", baseApr: 7.99, color: "text-blue-500" },
  { id: "fair", label: "Fair", range: "650-699", baseApr: 11.99, color: "text-yellow-500" },
  { id: "needs-work", label: "Needs Work", range: "Below 650", baseApr: 17.99, color: "text-orange-500" },
];

// Term adjustments (longer terms = higher rates)
const TERM_ADJUSTMENTS: Record<number, number> = {
  36: 0,
  48: 0.5,
  60: 1.0,
  72: 1.5,
  84: 2.0,
};

const LOAN_TERMS = [36, 48, 60, 72, 84];
const DEFAULT_FEES = 500;
const DEFAULT_TAX_RATE = 6.0;

function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  return payment;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function Calculator() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { incrementCount } = useCalculationTracker();
  const { addToHistory } = useCalculationHistory();
  const [mounted, setMounted] = useState(false);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);
  const { showPopup: showCreditKarmaPopup, closePopup: closeCreditKarmaPopup } = useCreditKarmaPopup();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Income Calculator State
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [checkDate, setCheckDate] = useState<Date | undefined>();
  const [ytdIncome, setYtdIncome] = useState<string>("");

  // Email capture state
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Load sample data for first-time users
  const loadSampleData = () => {
    const currentYear = new Date().getFullYear();
    // Sample: Started Jan 15, earned $45,230 through June 30
    setStartDate(new Date(currentYear, 0, 15)); // Jan 15
    setCheckDate(new Date(currentYear, 5, 30)); // June 30
    setYtdIncome("45230");
    toast({
      title: "Sample data loaded!",
      description: "See how the calculator works with example values.",
    });
  };

  // First-time user and help states
  const [showYtdHelp, setShowYtdHelp] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  // Payment Calculator State
  const [showPaymentCalc, setShowPaymentCalc] = useState(false);
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [tradeIn, setTradeIn] = useState("");
  const [creditTier, setCreditTier] = useState<string>("good");
  const [selectedTerm, setSelectedTerm] = useState(60);
  const [customApr, setCustomApr] = useState<string>("");
  const [customFees, setCustomFees] = useState<string>(DEFAULT_FEES.toString());
  const [customTaxRate, setCustomTaxRate] = useState<string>(DEFAULT_TAX_RATE.toString());
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate APR based on credit tier and term
  const getAprForTierAndTerm = (tierId: string, term: number): number => {
    const tier = CREDIT_TIERS.find(t => t.id === tierId);
    if (!tier) return 7.99;
    return tier.baseApr + (TERM_ADJUSTMENTS[term] || 0);
  };

  const effectiveApr = customApr
    ? parseFloat(customApr)
    : getAprForTierAndTerm(creditTier, selectedTerm);

  // Load from local storage and check first visit
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    const hasVisited = localStorage.getItem("income-calc-visited");

    if (!hasVisited) {
      setIsFirstVisit(true);
      localStorage.setItem("income-calc-visited", "true");
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.startDate) setStartDate(new Date(parsed.startDate));
        if (parsed.checkDate) setCheckDate(new Date(parsed.checkDate));
        if (parsed.ytdIncome) setYtdIncome(parsed.ytdIncome);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ startDate, checkDate, ytdIncome })
    );
  }, [startDate, checkDate, ytdIncome, mounted]);

  // Calculate income results
  const calculateIncome = () => {
    if (!startDate || !checkDate || !ytdIncome) return null;
    if (isBefore(checkDate, startDate)) return null;

    const checkYearStart = startOfYear(checkDate);
    const effectiveStartDate = isBefore(startDate, checkYearStart)
      ? checkYearStart
      : startDate;

    const daysWorked = differenceInCalendarDays(checkDate, effectiveStartDate) + 1;
    if (daysWorked <= 0) return null;

    const income = parseFloat(ytdIncome);
    if (isNaN(income)) return null;

    const daily = income / daysWorked;
    const weekly = daily * 7;
    const monthly = (daily * 365) / 12;
    const annual = daily * 365;

    return { daysWorked, daily, weekly, monthly, annual, effectiveStartDate };
  };

  const incomeResults = calculateIncome();
  const maxAffordablePayment = incomeResults ? incomeResults.monthly * 0.12 : undefined;

  // Track calculation completion (fire once per session)
  const hasTrackedCalc = useRef(false);
  useEffect(() => {
    if (incomeResults && !hasTrackedCalc.current) {
      analytics.calculationComplete(incomeResults.annual);
      hasTrackedCalc.current = true;

      // Add to calculation history
      addToHistory({
        annualIncome: incomeResults.annual,
        monthlyIncome: incomeResults.monthly,
        weeklyIncome: incomeResults.weekly,
        daysWorked: incomeResults.daysWorked,
        ytdIncome: parseFloat(ytdIncome) || 0,
      });

      // Track calculation count for account prompt
      const count = incrementCount();
      if (count >= 2 && !user) {
        setTimeout(() => setShowAccountPrompt(true), 1500);
      }
    }
  }, [incomeResults, addToHistory, incrementCount, user, ytdIncome]);

  // Calculate payment results
  const price = parseFloat(vehiclePrice) || 0;
  const down = parseFloat(downPayment) || 0;
  const trade = parseFloat(tradeIn) || 0;
  const fees = parseFloat(customFees) || DEFAULT_FEES;
  const taxRate = parseFloat(customTaxRate) || DEFAULT_TAX_RATE;

  const taxableAmount = Math.max(0, price - trade);
  const taxAmount = taxableAmount * (taxRate / 100);
  const loanAmount = Math.max(0, price + taxAmount + fees - trade - down);
  const monthlyPayment = loanAmount > 0 ? calculateMonthlyPayment(loanAmount, effectiveApr, selectedTerm) : 0;
  const totalInterest = monthlyPayment * selectedTerm - loanAmount;
  const isAffordable = maxAffordablePayment ? monthlyPayment <= maxAffordablePayment : true;

  const handleReset = () => {
    setStartDate(undefined);
    setCheckDate(startOfToday());
    setYtdIncome("");
    setShowPaymentCalc(false);
    setVehiclePrice("");
    setDownPayment("");
    setTradeIn("");
    setCreditTier("good");
    setSelectedTerm(60);
    setCustomApr("");
    setCustomFees(DEFAULT_FEES.toString());
    setCustomTaxRate(DEFAULT_TAX_RATE.toString());
    localStorage.removeItem(STORAGE_KEY);
  };

  // Handle loading scenario data
  const handleLoadScenario = (data: Record<string, unknown>) => {
    if (data.startDate) setStartDate(new Date(data.startDate as string));
    if (data.checkDate) setCheckDate(new Date(data.checkDate as string));
    if (data.ytdIncome) setYtdIncome(data.ytdIncome as string);
    if (data.vehiclePrice) {
      setVehiclePrice(data.vehiclePrice as string);
      setShowPaymentCalc(true);
    }
    if (data.downPayment) setDownPayment(data.downPayment as string);
    if (data.tradeIn) setTradeIn(data.tradeIn as string);
    if (data.creditTier) setCreditTier(data.creditTier as string);
    if (data.selectedTerm) setSelectedTerm(data.selectedTerm as number);
  };

  // Current scenario data for saving
  const currentScenarioData = {
    startDate: startDate?.toISOString(),
    checkDate: checkDate?.toISOString(),
    ytdIncome,
    vehiclePrice,
    downPayment,
    tradeIn,
    creditTier,
    selectedTerm,
  };

  if (!mounted) return null;

  const seoStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      createCalculatorSchema(
        "Income Calculator",
        "Calculate your projected annual income from year-to-date earnings. Free salary calculator for W2 employees, hourly workers, and contractors.",
        "https://autolytiqs.com/calculator"
      ),
      createHowToSchema(
        "How to Calculate Annual Income from YTD",
        "Calculate your projected annual income using your YTD earnings",
        [
          { name: "Enter start date", text: "Enter the date you started your current job or January 1 if employed all year" },
        { name: "Enter YTD income", text: "Find your year-to-date gross income on your most recent paystub" },
        { name: "Enter last pay date", text: "Enter the date of your most recent paycheck" },
        { name: "View results", text: "See your projected daily, weekly, monthly, and annual income" },
      ]
    ),
      createFAQSchema(INCOME_CALCULATOR_FAQ),
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Free Income Calculator 2026 | Calculate Annual Salary from YTD Pay"
        description="Calculate your projected annual income from year-to-date earnings. Free salary calculator for W2 employees, hourly workers, and contractors. Estimate daily, weekly, monthly, and yearly income instantly."
        canonical="https://autolytiqs.com/calculator"
        keywords="income calculator, salary calculator, annual income calculator, YTD calculator, year to date income, paycheck calculator, gross income calculator"
        structuredData={seoStructuredData}
      />
      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />

      {/* Gradient orbs - like homepage */}
      <div className="fixed top-0 left-1/4 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header - Homepage style */}
      <header className="site-header sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="header-logo p-2 rounded-xl bg-primary/10">
                <AutolytiqLogo className="h-6 w-6 text-primary" />
              </div>
              <span className="header-title text-xl font-bold tracking-tight">Autolytiq</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-sm font-medium text-primary">Calculator</span>
            <Link href="/smart-money" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Budget Planner</Link>
            <Link href="/housing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Housing</Link>
            <Link href="/auto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Auto</Link>
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden md:flex" />
            {user ? (
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2 hidden md:flex">
                <LogoutIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <LoginIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Free Calculator - No Signup Required</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            Know Your <span className="text-primary">True Income</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Calculate your projected annual salary from your year-to-date earnings and discover what you can truly afford
          </p>
        </motion.div>

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
                  <span className="text-xs font-semibold text-primary">YTD Income Calculator</span>
                </div>

                <h3 className="text-2xl font-bold mb-2">
                  Know Your <span className="text-primary">True Income</span>
                </h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Project your annual salary from your year-to-date paystub earnings.
                </p>

                {/* Quick Stats Preview */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-xs text-muted-foreground">Annual</span>
                    </div>
                    <div className="text-sm font-bold">Projected</div>
                    <div className="text-[10px] text-muted-foreground">from YTD</div>
                  </div>
                  <div className="p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs text-muted-foreground">Monthly</span>
                    </div>
                    <div className="text-sm font-bold">Calculated</div>
                    <div className="text-[10px] text-muted-foreground">average</div>
                  </div>
                  <div className="p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-xs text-muted-foreground">Weekly</span>
                    </div>
                    <div className="text-sm font-bold">Included</div>
                    <div className="text-[10px] text-muted-foreground">breakdown</div>
                  </div>
                  <div className="p-3 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckIcon className="w-3 h-3 text-emerald-500" />
                      <span className="text-xs text-muted-foreground">Auto</span>
                    </div>
                    <div className="text-sm font-bold">12% Rule</div>
                  </div>
                </div>

                {/* Arrow pointing to calculator */}
                <div className="hidden lg:flex items-center gap-2 text-primary">
                  <span className="text-sm font-medium">Enter your paystub data</span>
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
                <span className="text-xs text-muted-foreground">Saves Locally</span>
              </div>
            </div>

            {/* What You'll Get */}
            <Card className="glass-card border-none shadow-lg">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  What You'll Get
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <IncomeIcon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-medium">Projected Annual Income</span>
                      <p className="text-[10px] text-muted-foreground leading-tight">Based on your YTD earnings and days worked</p>
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                  >
                    <AutoIcon className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-medium">Max Car Payment (12% Rule)</span>
                      <p className="text-[10px] text-muted-foreground leading-tight">Know exactly what you can afford</p>
                    </div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* RIGHT: Income Calculator */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 space-y-6"
          >
            <Card className="glass-card border-2 border-primary/20 shadow-2xl shadow-primary/5 overflow-hidden">
              <CardHeader className="pb-3 lg:pb-4 bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <IncomeIcon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                    </div>
                    Income Calculator
                    <span className="ml-2 text-xs font-normal text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                      YTD Method
                    </span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <ScenarioManager
                      storageKey="income-calc"
                      currentData={currentScenarioData}
                      onLoad={handleLoadScenario}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    >
                      <ResetIcon className="h-3.5 w-3.5 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 lg:space-y-6 pt-4">
                <div className="grid sm:grid-cols-3 gap-4 lg:gap-6">
              {/* Start Date */}
              <div className="space-y-2 lg:space-y-3">
                <Label className="text-sm lg:text-base font-medium flex items-center gap-2">
                  Job Start Date
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>When did you start this job?</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <DateInput
                  value={startDate}
                  onChange={setStartDate}
                  maxDate={new Date()}
                  placeholder="MM/DD/YYYY"
                />
              </div>

              {/* YTD Income */}
              <div className="space-y-2 lg:space-y-3">
                <Label className="text-sm lg:text-base font-medium flex items-center gap-2">
                  YTD Gross Income
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[220px]">
                      <p>Year-to-date gross income from your paystub. Look for "YTD Gross" or "YTD Earnings" - it's your total pre-tax earnings since Jan 1.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <MoneyInput
                  value={ytdIncome}
                  onChange={setYtdIncome}
                  className="h-11 lg:h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowYtdHelp(true)}
                  className="text-xs text-primary hover:underline lg:hidden"
                >
                  Where do I find this?
                </button>
              </div>

              {/* Check Date */}
              <div className="space-y-2 lg:space-y-3">
                <Label className="text-sm lg:text-base font-medium flex items-center gap-2">
                  Paystub Date
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Date on your most recent paystub</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <DateInput
                  value={checkDate}
                  onChange={setCheckDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  placeholder="MM/DD/YYYY"
                />
              </div>
            </div>

            {/* Try Sample Data - show when no data entered */}
            {!incomeResults && !startDate && !ytdIncome && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadSampleData}
                  className="text-muted-foreground hover:text-foreground gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Try with sample data
                </Button>
              </div>
            )}

            {/* Income Results */}
            <AnimatePresence>
              {incomeResults && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 lg:pt-6 border-t border-border/50">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
                      <div className="stat-card text-center col-span-2 sm:col-span-1 lg:col-span-1 sm:row-span-2 lg:row-span-1 flex flex-col justify-center p-4 lg:p-6">
                        <div className="text-xs lg:text-sm text-muted-foreground">Annual</div>
                        <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mono-value text-primary mt-1">
                          <AnimatedNumber
                            value={incomeResults.annual}
                            formatValue={(v) => formatCurrency(v)}
                          />
                        </div>
                        <div className="text-xs lg:text-sm text-muted-foreground mt-1">
                          {incomeResults.daysWorked} days worked
                        </div>
                      </div>
                      <div className="stat-card text-center p-4 lg:p-6">
                        <div className="text-xs lg:text-sm text-muted-foreground">Monthly</div>
                        <div className="text-lg lg:text-2xl font-bold mono-value mt-1">
                          {formatCurrency(incomeResults.monthly)}
                        </div>
                      </div>
                      <div className="stat-card text-center p-4 lg:p-6">
                        <div className="text-xs lg:text-sm text-muted-foreground">Weekly</div>
                        <div className="text-lg lg:text-2xl font-bold mono-value mt-1">
                          {formatCurrency(incomeResults.weekly)}
                        </div>
                      </div>
                      <div className="stat-card text-center p-4 lg:p-6">
                        <div className="text-xs lg:text-sm text-muted-foreground">Daily</div>
                        <div className="text-lg lg:text-2xl font-bold mono-value mt-1">
                          {formatCurrency(incomeResults.daily)}
                        </div>
                      </div>
                      <div className="stat-card text-center col-span-2 sm:col-span-1 p-4 lg:p-6">
                        <div className="text-xs lg:text-sm text-muted-foreground flex items-center justify-center gap-1">
                          Max Auto Payment
                          <Tooltip>
                            <TooltipTrigger>
                              <InfoIcon className="h-3 w-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[200px]">
                              <p>Based on the 12% rule: keep car payments at or below 12% of gross monthly income to stay within budget.</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="text-lg lg:text-2xl font-bold mono-value mt-1 text-primary">
                          {formatCurrency(maxAffordablePayment || 0)}/mo
                        </div>
                        <div className="text-[10px] lg:text-xs text-muted-foreground mt-0.5">12% of monthly income</div>
                      </div>
                    </div>

                    {/* Export/Email Actions */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEmailModal(true)}
                        className="gap-2"
                      >
                        <DownloadIcon className="h-4 w-4" />
                        Email Results
                      </Button>
                      <ShareButtons
                        title="Income Calculator"
                        text={`My projected annual income: ${formatCurrency(incomeResults.annual)}`}
                      />
                    </div>

                    {/* Post-Calculation CTAs - Contextual suggestions */}
                    <PostCalculationCTA
                      annualIncome={incomeResults.annual}
                      monthlyIncome={incomeResults.monthly}
                      className="mt-6 pt-4 border-t border-border/50"
                    />

                    {/* CTAs - Next Steps */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 space-y-4"
                    >
                      {/* Primary CTA - Calculate Affordability */}
                      {!showPaymentCalc && (
                        <button
                          onClick={() => setShowPaymentCalc(true)}
                          className="w-full group p-5 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 hover:border-primary hover:shadow-lg hover:shadow-primary/20 transition-all text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                              <AutoIcon className="h-7 w-7 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-lg group-hover:text-primary transition-colors flex items-center gap-2">
                                Calculate What You Can Afford
                                <ChevronRight className="h-5 w-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                See your maximum car payment based on the 12% rule
                              </p>
                            </div>
                          </div>
                        </button>
                      )}

                      {/* Secondary CTAs Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Auto Affordability */}
                        <Link href="/auto">
                          <div className="group p-4 rounded-xl border border-border bg-card hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                                <AutoIcon className="h-5 w-5 text-blue-500" />
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>
                            <h4 className="font-semibold text-sm group-hover:text-blue-500 transition-colors">Auto Affordability</h4>
                            <p className="text-xs text-muted-foreground mt-1">Full car buying guide & calculator</p>
                          </div>
                        </Link>

                        {/* Budget Planner */}
                        <Link href="/smart-money">
                          <div className="group p-4 rounded-xl border border-border bg-card hover:border-emerald-500/50 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                                <WalletIcon className="h-5 w-5 text-emerald-500" />
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>
                            <h4 className="font-semibold text-sm group-hover:text-emerald-500 transition-colors">Smart Money Planner</h4>
                            <p className="text-xs text-muted-foreground mt-1">50/30/20 budget breakdown</p>
                          </div>
                        </Link>

                        {/* Housing */}
                        <Link href="/housing">
                          <div className="group p-4 rounded-xl border border-border bg-card hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer h-full">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                                <HousingIcon className="h-5 w-5 text-purple-500" />
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            </div>
                            <h4 className="font-semibold text-sm group-hover:text-purple-500 transition-colors">Housing Calculator</h4>
                            <p className="text-xs text-muted-foreground mt-1">Rent vs buy affordability</p>
                          </div>
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Payment Calculator - Shows after income is calculated */}
        <AnimatePresence>
          {showPaymentCalc && incomeResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="glass-card border-none shadow-xl w-full">
                <CardHeader className="pb-3 lg:pb-4">
                  <CardTitle className="text-lg lg:text-xl flex items-center gap-2">
                    <AutoIcon className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                    Payment Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 lg:space-y-6">
                  {/* Credit Score Selector */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CreditScoreIcon className="h-4 w-4 text-muted-foreground" />
                      Your Credit Score Range
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[220px]">
                          <p>Your credit score determines your loan interest rate. Higher scores get lower rates, saving you money over the life of the loan.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CREDIT_TIERS.map((tier) => (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => {
                            setCreditTier(tier.id);
                            setCustomApr("");
                          }}
                          className={cn(
                            "relative p-3 rounded-xl border-2 transition-all text-left",
                            creditTier === tier.id
                              ? "border-primary bg-primary/5"
                              : "border-border/50 hover:border-primary/30 bg-card"
                          )}
                        >
                          {creditTier === tier.id && (
                            <CheckIcon className="absolute top-2 right-2 h-4 w-4 text-primary" />
                          )}
                          <div className={cn("font-semibold text-sm", tier.color)}>
                            {tier.label}
                          </div>
                          <div className="text-xs text-muted-foreground">{tier.range}</div>
                          <div className="text-xs mt-1 font-mono">
                            ~{tier.baseApr}% APR
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Vehicle & Down Payment */}
                  <div className="grid sm:grid-cols-3 gap-4 lg:gap-6">
                    <div className="space-y-2 lg:space-y-3">
                      <Label className="text-sm lg:text-base font-medium">Vehicle Price</Label>
                      <MoneyInput
                        value={vehiclePrice}
                        onChange={setVehiclePrice}
                        className="h-11 lg:h-12"
                      />
                    </div>
                    <div className="space-y-2 lg:space-y-3">
                      <Label className="text-sm lg:text-base font-medium">Down Payment</Label>
                      <MoneyInput
                        value={downPayment}
                        onChange={setDownPayment}
                        className="h-11 lg:h-12"
                      />
                    </div>
                    <div className="space-y-2 lg:space-y-3">
                      <Label className="text-sm lg:text-base font-medium">Trade-In Value</Label>
                      <MoneyInput
                        value={tradeIn}
                        onChange={setTradeIn}
                        className="h-11 lg:h-12"
                      />
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-muted-foreground" />
                      Loan Term
                    </Label>
                    <div className="grid grid-cols-5 gap-2">
                      {LOAN_TERMS.map((term) => {
                        const termApr = getAprForTierAndTerm(creditTier, term);
                        return (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setSelectedTerm(term);
                              if (!customApr) setCustomApr("");
                            }}
                            className={cn(
                              "py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200 border",
                              selectedTerm === term
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-primary/30"
                            )}
                          >
                            <div>{term}mo</div>
                            <div className="text-xs opacity-70">{termApr.toFixed(1)}%</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Advanced Options Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <ChevronRight className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-90")} />
                    {showAdvanced ? "Hide" : "Show"} advanced options
                  </button>

                  {/* Advanced Options */}
                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-3 gap-3 pt-2">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Custom APR</Label>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={customApr}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^\d.]/g, "");
                                  if ((val.match(/\./g) || []).length <= 1) setCustomApr(val);
                                }}
                                className="w-full h-11 px-3 pr-7 rounded-lg border bg-background font-mono text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                                placeholder={getAprForTierAndTerm(creditTier, selectedTerm).toFixed(2)}
                              />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Tax Rate</Label>
                            <div className="relative">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={customTaxRate}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^\d.]/g, "");
                                  if ((val.match(/\./g) || []).length <= 1) setCustomTaxRate(val);
                                }}
                                className="w-full h-11 px-3 pr-7 rounded-lg border bg-background font-mono text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                                placeholder="6.0"
                              />
                              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Dealer Fees</Label>
                            <MoneyInput
                              value={customFees}
                              onChange={setCustomFees}
                              className="h-11"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Payment Results */}
                  {loanAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-4 border-t border-border/50"
                    >
                      {/* Monthly Payment Hero */}
                      <div className={cn(
                        "hero-stat text-center",
                        !isAffordable && "border-destructive/50 bg-destructive/5"
                      )}>
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Estimated Monthly Payment
                        </div>
                        <div className={cn(
                          "text-4xl font-bold mono-value",
                          isAffordable ? "text-primary neon-text" : "text-destructive"
                        )}>
                          {formatCurrency(monthlyPayment)}
                          <span className="text-lg font-normal text-muted-foreground">/mo</span>
                        </div>
                        <div className={cn(
                          "text-sm mt-2 flex items-center justify-center gap-2",
                          isAffordable ? "text-emerald-500" : "text-destructive"
                        )}>
                          {isAffordable ? (
                            <>
                              <CheckIcon className="h-4 w-4" />
                              Within your budget (max {formatCurrency(maxAffordablePayment || 0)}/mo)
                            </>
                          ) : (
                            <>
                              Over budget by {formatCurrency(monthlyPayment - (maxAffordablePayment || 0))}/mo
                            </>
                          )}
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">Amount Financed</div>
                          <div className="text-sm font-bold mono-value mt-1">{formatCurrency(loanAmount)}</div>
                        </div>
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">APR</div>
                          <div className="text-sm font-bold mono-value mt-1">{effectiveApr.toFixed(2)}%</div>
                        </div>
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">Total Interest</div>
                          <div className="text-sm font-bold mono-value mt-1 text-yellow-500">{formatCurrency(totalInterest)}</div>
                        </div>
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">Total Cost</div>
                          <div className="text-sm font-bold mono-value mt-1">{formatCurrency(monthlyPayment * selectedTerm + down)}</div>
                        </div>
                      </div>

                      {/* Term Comparison */}
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">Compare Terms</div>
                        <div className="space-y-1">
                          {LOAN_TERMS.slice(1, 4).map((term) => {
                            const termApr = customApr ? parseFloat(customApr) : getAprForTierAndTerm(creditTier, term);
                            const payment = calculateMonthlyPayment(loanAmount, termApr, term);
                            const interest = payment * term - loanAmount;
                            const affordable = maxAffordablePayment ? payment <= maxAffordablePayment : true;
                            return (
                              <div
                                key={term}
                                onClick={() => setSelectedTerm(term)}
                                className={cn(
                                  "flex items-center justify-between py-2 px-3 rounded-lg text-sm cursor-pointer transition-colors",
                                  term === selectedTerm
                                    ? "bg-primary/10 border border-primary/30"
                                    : "hover:bg-secondary/30"
                                )}
                              >
                                <span className="text-muted-foreground">{term} months @ {termApr.toFixed(1)}%</span>
                                <div className="flex items-center gap-4">
                                  <span className={cn("font-mono font-semibold", affordable ? "text-foreground" : "text-destructive")}>
                                    {formatCurrency(payment)}/mo
                                  </span>
                                  <span className="text-xs text-yellow-500/80 w-20 text-right">
                                    +{formatCurrency(interest)} int.
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
          </motion.div>
        </div>

        {/* Quick Links Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link href="/auto">
                <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
                  <AutoIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">Auto Guide</div>
                  <div className="text-xs text-muted-foreground">Shopping tips</div>
                </div>
              </Link>
              <Link href="/smart-money">
                <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
                  <WalletIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">Smart Money</div>
                  <div className="text-xs text-muted-foreground">Budget planner</div>
                </div>
              </Link>
              <Link href="/housing">
                <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
                  <HousingIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">Housing</div>
                  <div className="text-xs text-muted-foreground">Rent & mortgage</div>
                </div>
              </Link>
              <Link href="/desk">
                <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
                  <ChartIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <div className="text-sm font-medium">Pro Mode</div>
                  <div className="text-xs text-muted-foreground">Advanced options</div>
                </div>
              </Link>
            </div>

            {/* Additional Tools Row - Calculation History & Financial Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CalculationHistory />
              <FinancialChecklist />
            </div>

            {/* Account Benefits Banner */}
            {!user && (
              <div className="p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-primary/20">
                      <LoginIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Create Free Account</h3>
                      <p className="text-sm text-muted-foreground">Save calculations, compare scenarios, and email results</p>
                    </div>
                  </div>
                  <Link href="/signup">
                    <Button size="lg" className="whitespace-nowrap">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              </div>
            )}

        {/* FAQ Section - Full Width Below Grid */}
        <FAQ items={INCOME_CALCULATOR_FAQ} className="mt-8" />
      </main>

      {/* Email Capture Modal */}
      <EmailCaptureModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        calculationType="income"
        results={incomeResults ? {
          annualIncome: incomeResults.annual,
          monthlyIncome: incomeResults.monthly,
          weeklyIncome: incomeResults.weekly,
          dailyIncome: incomeResults.daily,
          daysWorked: incomeResults.daysWorked,
          maxAutoPayment: maxAffordablePayment || 0,
        } : {}}
      />

      {/* Mobile YTD Help Modal */}
      <AnimatePresence>
        {showYtdHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setShowYtdHelp(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="w-full sm:max-w-md bg-card rounded-t-2xl sm:rounded-2xl p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HelpIcon className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Where do I find YTD?</h3>
                </div>
                <button
                  onClick={() => setShowYtdHelp(false)}
                  className="p-1 rounded-full hover:bg-secondary/50"
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>Look for <strong className="text-foreground">"YTD Gross"</strong> or <strong className="text-foreground">"Year-to-Date Earnings"</strong> on your paystub.</p>
                <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="text-xs text-muted-foreground mb-2">Sample paystub section:</div>
                  <div className="font-mono text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span>Current Gross:</span>
                      <span>$2,500.00</span>
                    </div>
                    <div className="flex justify-between text-primary font-semibold bg-primary/10 -mx-2 px-2 py-1 rounded">
                      <span>YTD Gross:</span>
                      <span>$15,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>YTD Taxes:</span>
                      <span>$2,850.00</span>
                    </div>
                  </div>
                </div>
                <p>Use the <strong className="text-foreground">YTD Gross</strong> amount - this is your total earnings before taxes since January 1st.</p>
              </div>
              <Button
                onClick={() => setShowYtdHelp(false)}
                className="w-full mt-4"
              >
                Got it
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* First Time User Guide */}
      <FirstTimeGuide
        storageKey="income-calculator"
        title="Welcome to the Income Calculator"
        subtitle="Get your projected annual income in 4 simple steps"
        steps={CALCULATOR_GUIDE_STEPS}
      />

      {/* Account Creation Prompt - Shows after 2nd calculation */}
      {showAccountPrompt && (
        <AccountPrompt onClose={() => setShowAccountPrompt(false)} />
      )}

      {/* Credit Karma Exit Intent Popup */}
      {showCreditKarmaPopup && (
        <CreditKarmaPopup onClose={closeCreditKarmaPopup} />
      )}

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Autolytiq. For estimation purposes only.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/desk" className="text-muted-foreground hover:text-foreground transition-colors">
                Pro Mode
              </Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <ManageCookiesButton />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Calculator;
