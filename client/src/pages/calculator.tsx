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
  BlogIcon,
  CheckIcon,
  DownloadIcon,
  InfoIcon,
  LightbulbIcon,
  HelpIcon,
  ShieldIcon,
  ChartIcon,
  TargetIcon,
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
import { FAQ, INCOME_CALCULATOR_FAQ } from "@/components/faq";
import { ExportButtons, ShareButtons, EmailCaptureModal } from "@/components/pdf-export";
import { BarChart, AnimatedNumber } from "@/components/charts";
import { ScenarioManager } from "@/components/scenarios";
import { SEO, createCalculatorSchema, createHowToSchema, createFAQSchema } from "@/components/seo";
import { ManageCookiesButton } from "@/components/cookie-consent";

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
  const [mounted, setMounted] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Income Calculator State
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [checkDate, setCheckDate] = useState<Date | undefined>();
  const [ytdIncome, setYtdIncome] = useState<string>("");

  // Email capture state
  const [showEmailModal, setShowEmailModal] = useState(false);

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
    }
  }, [incomeResults]);

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
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SEO
        title="Free Income Calculator 2026 | Calculate Annual Salary from YTD Pay"
        description="Calculate your projected annual income from year-to-date earnings. Free salary calculator for W2 employees, hourly workers, and contractors. Estimate daily, weekly, monthly, and yearly income instantly."
        canonical="https://autolytiqs.com/calculator"
        keywords="income calculator, salary calculator, annual income calculator, YTD calculator, year to date income, paycheck calculator, gross income calculator"
        structuredData={seoStructuredData}
      />
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-12 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20">
              <AutolytiqLogo className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold tracking-tight dark:neon-text">Autolytiq</h1>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/desk">
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5 text-xs" title="Advanced calculators with more options">
                <ChartIcon className="h-4 w-4" />
                Pro Mode
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" size="icon" className="sm:hidden" aria-label="Read blog articles">
                <BlogIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5">
                <BlogIcon className="h-4 w-4" />
                Blog
              </Button>
            </Link>
            <ThemeToggle />
            {user ? (
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
                <LogoutIcon className="h-4 w-4" />
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon" aria-label="Log in">
                  <LoginIcon className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-12 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Know Your <span className="text-primary">Income</span>, Know Your <span className="text-primary">Budget</span>
          </h2>
          <p className="text-muted-foreground">
            Calculate your projected annual income and see what you can afford
          </p>
        </div>

        {/* 3-Column Desktop Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)_240px] xl:grid-cols-[300px_minmax(0,1fr)_300px] 2xl:grid-cols-[340px_minmax(0,1fr)_340px] gap-4 lg:gap-6 xl:gap-8">

          {/* Left Sidebar - Getting Started Guide (Desktop Only) */}
          <aside className="hidden lg:block space-y-4">
            <div className="sticky top-20">
              {/* First Time Welcome */}
              {isFirstVisit && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Welcome!</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get your projected annual income in 3 easy steps. No signup required.
                  </p>
                </motion.div>
              )}

              {/* Getting Started Card */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <LightbulbIcon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Getting Started</span>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</div>
                    <div>
                      <div className="text-sm font-medium">Enter job start date</div>
                      <div className="text-xs text-muted-foreground">When you started this job (or Jan 1 if working all year)</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">2</div>
                    <div>
                      <div className="text-sm font-medium">Enter YTD gross income</div>
                      <div className="text-xs text-muted-foreground">Find this on your latest paystub</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">3</div>
                    <div>
                      <div className="text-sm font-medium">Enter paystub date</div>
                      <div className="text-xs text-muted-foreground">The date on your most recent pay</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Where to Find YTD Help */}
              <div className="mt-4 p-4 rounded-xl bg-card border border-border">
                <button
                  onClick={() => setShowYtdHelp(!showYtdHelp)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <HelpIcon className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Where do I find YTD?</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showYtdHelp && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {showYtdHelp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 pt-3 border-t border-border/50 space-y-3 text-xs text-muted-foreground">
                        <p>Look for <strong className="text-foreground">"YTD Gross"</strong> or <strong className="text-foreground">"Year-to-Date Earnings"</strong> on your paystub.</p>
                        <div className="p-3 rounded-lg bg-secondary/30">
                          <div className="font-mono text-[10px] space-y-1">
                            <div className="flex justify-between">
                              <span>Current Gross:</span>
                              <span>$2,500.00</span>
                            </div>
                            <div className="flex justify-between text-primary font-semibold">
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Data Security Note */}
              <div className="mt-4 p-3 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex items-start gap-2">
                  <ShieldIcon className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-medium">Your data stays private</div>
                    <div className="text-xs text-muted-foreground mt-0.5">All calculations happen in your browser. Nothing is sent to our servers.</div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Center Content - Calculator */}
          <div className="space-y-6">

        {/* Income Calculator */}
        <Card className="glass-card border-none shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <IncomeIcon className="h-5 w-5 text-primary" />
                Income Calculator
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
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
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
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
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
                  className="h-11"
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
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
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

            {/* Income Results */}
            <AnimatePresence>
              {incomeResults && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-border/50">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="stat-card text-center col-span-2 sm:col-span-1 sm:row-span-2 flex flex-col justify-center">
                        <div className="text-xs text-muted-foreground">Annual</div>
                        <div className="text-2xl sm:text-3xl font-bold mono-value text-primary mt-1">
                          <AnimatedNumber
                            value={incomeResults.annual}
                            formatValue={(v) => formatCurrency(v)}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {incomeResults.daysWorked} days
                        </div>
                      </div>
                      <div className="stat-card text-center">
                        <div className="text-xs text-muted-foreground">Monthly</div>
                        <div className="text-lg font-bold mono-value mt-1">
                          {formatCurrency(incomeResults.monthly)}
                        </div>
                      </div>
                      <div className="stat-card text-center">
                        <div className="text-xs text-muted-foreground">Weekly</div>
                        <div className="text-lg font-bold mono-value mt-1">
                          {formatCurrency(incomeResults.weekly)}
                        </div>
                      </div>
                      <div className="stat-card text-center col-span-2 sm:col-span-1">
                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
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
                        <div className="text-lg font-bold mono-value mt-1 text-primary">
                          {formatCurrency(maxAffordablePayment || 0)}/mo
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">12% of monthly</div>
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

                    {/* CTAs - Next Steps */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 space-y-2"
                    >
                      {!showPaymentCalc && (
                        <Button
                          onClick={() => setShowPaymentCalc(true)}
                          className="w-full gap-2"
                          size="lg"
                        >
                          <AutoIcon className="h-5 w-5" />
                          Calculate What You Can Afford
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Link href="/smart-money">
                          <Button variant="outline" className="w-full gap-2" size="sm">
                            <WalletIcon className="h-4 w-4" />
                            Plan Budget
                          </Button>
                        </Link>
                        <Link href="/housing">
                          <Button variant="outline" className="w-full gap-2" size="sm">
                            <HousingIcon className="h-4 w-4" />
                            Housing
                          </Button>
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
              <Card className="glass-card border-none shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AutoIcon className="h-5 w-5 text-primary" />
                    Payment Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
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
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Vehicle Price</Label>
                      <MoneyInput
                        value={vehiclePrice}
                        onChange={setVehiclePrice}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Down Payment</Label>
                      <MoneyInput
                        value={downPayment}
                        onChange={setDownPayment}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Trade-In Value</Label>
                      <MoneyInput
                        value={tradeIn}
                        onChange={setTradeIn}
                        className="h-11"
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

            {/* Quick Links - Mobile Only (Desktop shows in sidebar) */}
            <div className="grid grid-cols-3 gap-3 lg:hidden">
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
            </div>
          </div>
          {/* End Center Content */}

          {/* Right Sidebar - Quick Tools & Benefits (Desktop Only) */}
          <aside className="hidden lg:block space-y-4">
            <div className="sticky top-20">
              {/* Quick Tools */}
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <TargetIcon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">More Tools</span>
                </div>
                <div className="space-y-2">
                  <Link href="/auto">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <AutoIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Auto Guide</div>
                        <div className="text-xs text-muted-foreground">Car shopping tips</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/smart-money">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <WalletIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Smart Money</div>
                        <div className="text-xs text-muted-foreground">50/30/20 budget planner</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/housing">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <HousingIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Housing</div>
                        <div className="text-xs text-muted-foreground">Rent vs buy calculator</div>
                      </div>
                    </div>
                  </Link>
                  <Link href="/desk">
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <ChartIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Pro Mode</div>
                        <div className="text-xs text-muted-foreground">Advanced options</div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Account Benefits */}
              {!user && (
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <LoginIcon className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-sm">Create Free Account</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground mb-3">
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-3 w-3 text-primary" />
                      Save your calculations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-3 w-3 text-primary" />
                      Compare scenarios
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className="h-3 w-3 text-primary" />
                      Email results to yourself
                    </li>
                  </ul>
                  <Link href="/signup">
                    <Button size="sm" className="w-full">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              )}

              {/* Blog Teaser */}
              <div className="mt-4 p-4 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <BlogIcon className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">From the Blog</span>
                </div>
                <div className="space-y-3">
                  <Link href="/blog/understanding-your-paystub">
                    <div className="group cursor-pointer">
                      <div className="text-sm font-medium group-hover:text-primary transition-colors">Understanding Your Paystub</div>
                      <div className="text-xs text-muted-foreground">Find YTD, deductions & more</div>
                    </div>
                  </Link>
                  <Link href="/blog/how-to-calculate-annual-income">
                    <div className="group cursor-pointer">
                      <div className="text-sm font-medium group-hover:text-primary transition-colors">Calculate Annual Income</div>
                      <div className="text-xs text-muted-foreground">Project your yearly earnings</div>
                    </div>
                  </Link>
                </div>
                <Link href="/blog">
                  <Button variant="ghost" size="sm" className="w-full mt-3 text-xs">
                    View All Articles
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </aside>

        </div>
        {/* End 3-Column Grid */}

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

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-12 py-6">
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
