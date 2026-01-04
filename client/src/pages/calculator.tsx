import { useState, useEffect, useRef } from "react";
import {
  differenceInCalendarDays,
  isBefore,
  startOfToday,
  startOfYear,
} from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Info,
  RotateCcw,
  LogIn,
  LogOut,
  Calculator as CalcIcon,
  DollarSign,
  BookOpen,
  Car,
  Clock,
  ChevronRight,
  Wallet,
  Home as HomeIcon,
  CreditCard,
  CheckCircle2,
  Download,
  Share2,
  Printer,
} from "lucide-react";
import { Link } from "wouter";

import { useAuth } from "@/lib/auth";
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
import { DateInput } from "@/components/date-input";
import { ThemeToggle } from "@/components/theme-toggle";
import { FAQ, INCOME_CALCULATOR_FAQ } from "@/components/faq";
import { ExportButtons, ShareButtons } from "@/components/pdf-export";
import { BarChart } from "@/components/charts";

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
  const [checkDate, setCheckDate] = useState<Date | undefined>(startOfToday());
  const [ytdIncome, setYtdIncome] = useState<string>("");

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

  // Load from local storage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
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

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20">
              <CalcIcon className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold tracking-tight dark:neon-text">Autolytiq</h1>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/desk">
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5 text-xs">
                Pro Mode
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" size="icon" className="sm:hidden">
                <BookOpen className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-1.5">
                <BookOpen className="h-4 w-4" />
                Blog
              </Button>
            </Link>
            <ThemeToggle />
            {user ? (
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="icon">
                  <LogIn className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Know Your <span className="text-primary">Income</span>, Know Your <span className="text-primary">Budget</span>
          </h2>
          <p className="text-muted-foreground">
            Calculate your projected annual income and see what you can afford
          </p>
        </div>

        {/* Income Calculator */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Income Calculator
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
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
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
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
                <Label className="text-sm font-medium">YTD Gross Income</Label>
                <MoneyInput
                  value={ytdIncome}
                  onChange={setYtdIncome}
                  className="h-11"
                />
              </div>

              {/* Check Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Paystub Date
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
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
                          {formatCurrency(incomeResults.annual)}
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
                        <div className="text-xs text-muted-foreground">Max Auto Payment</div>
                        <div className="text-lg font-bold mono-value mt-1 text-primary">
                          {formatCurrency(maxAffordablePayment || 0)}/mo
                        </div>
                      </div>
                    </div>

                    {/* CTA to Payment Calculator */}
                    {!showPaymentCalc && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4"
                      >
                        <Button
                          onClick={() => setShowPaymentCalc(true)}
                          className="w-full gap-2"
                          size="lg"
                        >
                          <Car className="h-5 w-5" />
                          Calculate What You Can Afford
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    )}
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
              <Card className="glass-card border-none shadow-xl mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    Payment Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Credit Score Selector */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      Your Credit Score Range
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
                            <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
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
                      <Clock className="h-4 w-4 text-muted-foreground" />
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
                              <CheckCircle2 className="h-4 w-4" />
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

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          <Link href="/auto">
            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
              <Car className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">Auto Guide</div>
              <div className="text-xs text-muted-foreground">Shopping tips</div>
            </div>
          </Link>
          <Link href="/smart-money">
            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
              <Wallet className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">Smart Money</div>
              <div className="text-xs text-muted-foreground">Budget planner</div>
            </div>
          </Link>
          <Link href="/housing">
            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
              <HomeIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">Housing</div>
              <div className="text-xs text-muted-foreground">Rent & mortgage</div>
            </div>
          </Link>
        </div>

        {/* FAQ Section */}
        <FAQ items={INCOME_CALCULATOR_FAQ} className="mt-8" />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Calculator;
