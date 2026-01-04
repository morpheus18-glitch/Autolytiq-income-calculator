import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  Home,
  DollarSign,
  Calculator as CalcIcon,
  ChevronLeft,
  ChevronRight,
  Building,
  Key,
  TrendingUp,
  Info,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Percent,
  Clock,
  Shield,
  Lightbulb,
  MapPin,
  Wallet,
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
import { SEO, createCalculatorSchema, createBreadcrumbSchema } from "@/components/seo";
import { ExternalLink } from "lucide-react";

// Housing-focused affiliate links
const HOUSING_AFFILIATES = [
  { name: "LendingTree", desc: "Compare mortgage rates", url: "https://www.lendingtree.com", tag: "Top Pick" },
  { name: "Zillow", desc: "Home search & values", url: "https://www.zillow.com", tag: "Research" },
  { name: "NerdWallet", desc: "Best mortgage lenders", url: "https://www.nerdwallet.com/mortgages", tag: "Reviews" },
  { name: "Credit Karma", desc: "Free credit score", url: "https://www.creditkarma.com", tag: "Free" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function calculateMortgagePayment(principal: number, annualRate: number, years: number): number {
  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;
  if (monthlyRate === 0) return principal / n;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
}

const MORTGAGE_TERMS = [15, 20, 30];

const RENT_TIPS = [
  {
    icon: Shield,
    title: "Know the 30% Rule",
    description: "Aim to spend no more than 30% of your gross income on rent. Some experts say 25% of take-home is even better.",
  },
  {
    icon: MapPin,
    title: "Factor in Location Costs",
    description: "Cheaper rent farther out may cost more in commuting. Calculate total housing + transportation costs.",
  },
  {
    icon: DollarSign,
    title: "Budget for Move-in Costs",
    description: "Plan for first/last month's rent, security deposit, and moving expenses (typically 3-4x monthly rent).",
  },
  {
    icon: Key,
    title: "Negotiate Your Lease",
    description: "Ask about move-in specials, longer lease discounts, or included utilities. Everything is negotiable.",
  },
];

const BUY_TIPS = [
  {
    icon: Percent,
    title: "Save 20% Down",
    description: "Avoid PMI and get better rates. If you can't, look into FHA loans (3.5% down) or VA loans (0% down).",
  },
  {
    icon: TrendingUp,
    title: "Consider Total Cost",
    description: "Add property taxes (~1-2%), insurance (~0.5%), maintenance (~1-2%), and HOA to your monthly payment.",
  },
  {
    icon: Clock,
    title: "Plan to Stay 5+ Years",
    description: "Buying usually only makes sense if you'll stay long enough to offset closing costs (typically 3-5%).",
  },
  {
    icon: Building,
    title: "Get Pre-Approved First",
    description: "Know your budget before you shop. Pre-approval shows sellers you're serious.",
  },
];

function Housing() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Income inputs
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyDebts, setMonthlyDebts] = useState("");

  // Rent calculator
  const [currentRent, setCurrentRent] = useState("");

  // Mortgage calculator
  const [homePrice, setHomePrice] = useState("");
  const [downPaymentPercent, setDownPaymentPercent] = useState("20");
  const [mortgageRate, setMortgageRate] = useState("6.5");
  const [mortgageTerm, setMortgageTerm] = useState(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState("1.2");
  const [insuranceAnnual, setInsuranceAnnual] = useState("1500");

  // View toggle
  const [activeTab, setActiveTab] = useState<"rent" | "buy">("rent");

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
            const monthly = (daily * 365) / 12;
            setMonthlyIncome(Math.round(monthly).toString());
          }
        }
      }
    } catch (e) {
      console.error("Failed to load income data", e);
    }
  }, []);

  const income = parseFloat(monthlyIncome) || 0;
  const debts = parseFloat(monthlyDebts) || 0;
  const rent = parseFloat(currentRent) || 0;

  // Affordability calculations
  const maxRent30 = income * 0.30; // 30% of gross
  const maxRent25 = income * 0.25; // 25% of gross (conservative)
  const rentPercentOfIncome = income > 0 ? (rent / income) * 100 : 0;
  const isRentAffordable = rent <= maxRent30;

  // Mortgage calculations
  const price = parseFloat(homePrice) || 0;
  const downPercent = parseFloat(downPaymentPercent) || 20;
  const downPayment = price * (downPercent / 100);
  const loanAmount = price - downPayment;
  const rate = parseFloat(mortgageRate) || 6.5;
  const propTaxRate = parseFloat(propertyTaxRate) || 1.2;
  const insurance = parseFloat(insuranceAnnual) || 1500;

  const principalInterest = calculateMortgagePayment(loanAmount, rate, mortgageTerm);
  const propertyTax = (price * (propTaxRate / 100)) / 12;
  const insuranceMonthly = insurance / 12;
  const pmi = downPercent < 20 ? loanAmount * 0.005 / 12 : 0; // ~0.5% PMI if under 20% down
  const totalMortgagePayment = principalInterest + propertyTax + insuranceMonthly + pmi;

  // Debt-to-Income calculations
  const frontEndDTI = income > 0 ? (totalMortgagePayment / income) * 100 : 0;
  const backEndDTI = income > 0 ? ((totalMortgagePayment + debts) / income) * 100 : 0;
  const isMortgageAffordable = frontEndDTI <= 28 && backEndDTI <= 36;

  // Max home price calculation (based on 28% front-end DTI)
  const maxMonthlyHousing = income * 0.28;
  const maxPITI = maxMonthlyHousing;
  // Simplified: assume property tax & insurance ratio stays similar
  const estimatedNonPI = (propTaxRate / 100 / 12) + (insurance / price || 0.01) / 12;
  const maxPrincipalInterest = maxPITI * 0.80; // Rough estimate
  const maxLoanAmount = maxPrincipalInterest > 0
    ? maxPrincipalInterest * (Math.pow(1 + rate / 100 / 12, mortgageTerm * 12) - 1) / ((rate / 100 / 12) * Math.pow(1 + rate / 100 / 12, mortgageTerm * 12))
    : 0;
  const maxHomePrice = maxLoanAmount / (1 - downPercent / 100);

  // Total interest calculation
  const totalPayments = principalInterest * mortgageTerm * 12;
  const totalInterest = totalPayments - loanAmount;

  if (!mounted) return null;

  const seoData = {
    calculator: createCalculatorSchema(
      "Housing Affordability Calculator",
      "Calculate how much rent or mortgage you can afford. Free housing calculator with DTI analysis and rent vs buy comparison.",
      "https://autolytiqs.com/housing"
    ),
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Housing", url: "https://autolytiqs.com/housing" },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SEO
        title="Housing Affordability Calculator 2026 - Rent & Mortgage Calculator"
        description="Free housing affordability calculator. Calculate how much rent you can afford (30% rule), estimate mortgage payments with PITI breakdown, and compare rent vs buy. DTI analysis included."
        canonical="https://autolytiqs.com/housing"
        keywords="housing affordability calculator, how much rent can I afford, mortgage calculator, rent vs buy calculator, DTI calculator, 30 percent rule rent, home affordability 2026"
        structuredData={{ "@graph": [seoData.calculator, seoData.breadcrumbs] }}
      />
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
              <Home className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold tracking-tight dark:neon-text">Housing</h1>
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
            <span className="text-primary">Housing</span> Affordability
          </h2>
          <p className="text-muted-foreground">
            Find out what you can afford to rent or buy
          </p>
        </div>

        {/* Income Inputs */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Your Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Monthly Gross Income
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pre-tax monthly income</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <MoneyInput
                  value={monthlyIncome}
                  onChange={setMonthlyIncome}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Monthly Debt Payments
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Car payments, student loans, credit cards, etc.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <MoneyInput
                  value={monthlyDebts}
                  onChange={setMonthlyDebts}
                  className="h-11"
                />
              </div>
            </div>

            {income > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50"
              >
                <div className="stat-card text-center">
                  <div className="text-xs text-muted-foreground">Max Rent (30%)</div>
                  <div className="text-lg font-bold mono-value text-primary mt-1">
                    {formatCurrency(maxRent30)}
                  </div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-xs text-muted-foreground">Safe Rent (25%)</div>
                  <div className="text-lg font-bold mono-value text-emerald-400 mt-1">
                    {formatCurrency(maxRent25)}
                  </div>
                </div>
                <div className="stat-card text-center col-span-2 sm:col-span-1">
                  <div className="text-xs text-muted-foreground">Max Home Price</div>
                  <div className="text-lg font-bold mono-value text-blue-400 mt-1">
                    {formatCurrency(maxHomePrice)}
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Tab Toggle */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab("rent")}
            className={cn(
              "flex-1 py-3 px-4 text-center font-medium rounded-l-xl border transition-all",
              activeTab === "rent"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-secondary/50"
            )}
          >
            <Key className="h-4 w-4 inline mr-2" />
            Rent Calculator
          </button>
          <button
            onClick={() => setActiveTab("buy")}
            className={cn(
              "flex-1 py-3 px-4 text-center font-medium rounded-r-xl border-y border-r transition-all",
              activeTab === "buy"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:bg-secondary/50"
            )}
          >
            <Building className="h-4 w-4 inline mr-2" />
            Mortgage Calculator
          </button>
        </div>

        {/* Rent Calculator */}
        <AnimatePresence mode="wait">
          {activeTab === "rent" && (
            <motion.div
              key="rent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <Card className="glass-card border-none shadow-xl mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Rent Affordability
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Monthly Rent You're Considering</Label>
                    <MoneyInput
                      value={currentRent}
                      onChange={setCurrentRent}
                      className="h-11"
                    />
                  </div>

                  {rent > 0 && income > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-4 border-t border-border/50"
                    >
                      <div className={cn(
                        "hero-stat text-center",
                        !isRentAffordable && "border-destructive/50 bg-destructive/5"
                      )}>
                        <div className="text-sm text-muted-foreground mb-1">
                          This rent is {rentPercentOfIncome.toFixed(1)}% of your income
                        </div>
                        <div className={cn(
                          "text-4xl font-bold mono-value",
                          isRentAffordable ? "text-primary neon-text" : "text-destructive"
                        )}>
                          {formatCurrency(rent)}/mo
                        </div>
                        <div className={cn(
                          "text-sm mt-2 flex items-center justify-center gap-2",
                          isRentAffordable ? "text-emerald-500" : "text-destructive"
                        )}>
                          {isRentAffordable ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Within the 30% guideline
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4" />
                              Above 30% - may strain your budget
                            </>
                          )}
                        </div>
                      </div>

                      {/* Rent Breakdown */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">Your Max (30%)</div>
                          <div className="text-lg font-bold mono-value mt-1">{formatCurrency(maxRent30)}</div>
                        </div>
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">Room to Spare</div>
                          <div className={cn(
                            "text-lg font-bold mono-value mt-1",
                            maxRent30 - rent >= 0 ? "text-emerald-400" : "text-destructive"
                          )}>
                            {formatCurrency(maxRent30 - rent)}
                          </div>
                        </div>
                      </div>

                      {/* Move-in costs estimate */}
                      <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="text-sm font-medium mb-2">Estimated Move-in Costs</div>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <div className="text-muted-foreground text-xs">First Month</div>
                            <div className="font-mono">{formatCurrency(rent)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Security Deposit</div>
                            <div className="font-mono">{formatCurrency(rent)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground text-xs">Total</div>
                            <div className="font-mono text-primary font-bold">{formatCurrency(rent * 2)}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Rent Tips */}
              <Card className="glass-card border-none shadow-xl mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Renting Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {RENT_TIPS.map((tip) => (
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
            </motion.div>
          )}

          {activeTab === "buy" && (
            <motion.div
              key="buy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-card border-none shadow-xl mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Mortgage Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Price & Down Payment */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Home Price</Label>
                      <MoneyInput
                        value={homePrice}
                        onChange={setHomePrice}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Down Payment %</Label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={downPaymentPercent}
                          onChange={(e) => setDownPaymentPercent(e.target.value.replace(/[^\d.]/g, ""))}
                          className="w-full h-11 px-3 pr-7 rounded-lg border bg-background font-mono text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                          placeholder="20"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                      </div>
                      {price > 0 && (
                        <div className="text-xs text-muted-foreground">
                          = {formatCurrency(downPayment)}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Interest Rate</Label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={mortgageRate}
                          onChange={(e) => setMortgageRate(e.target.value.replace(/[^\d.]/g, ""))}
                          className="w-full h-11 px-3 pr-7 rounded-lg border bg-background font-mono text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                          placeholder="6.5"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                      </div>
                    </div>
                  </div>

                  {/* Loan Term */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      Loan Term
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {MORTGAGE_TERMS.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => setMortgageTerm(term)}
                          className={cn(
                            "py-2 rounded-lg text-sm font-medium transition-all border",
                            mortgageTerm === term
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
                          )}
                        >
                          {term} years
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Additional Costs */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Property Tax Rate</Label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={propertyTaxRate}
                          onChange={(e) => setPropertyTaxRate(e.target.value.replace(/[^\d.]/g, ""))}
                          className="w-full h-11 px-3 pr-7 rounded-lg border bg-background font-mono text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                          placeholder="1.2"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Home Insurance/year</Label>
                      <MoneyInput
                        value={insuranceAnnual}
                        onChange={setInsuranceAnnual}
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Results */}
                  {price > 0 && income > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-4 border-t border-border/50"
                    >
                      {/* Monthly Payment Hero */}
                      <div className={cn(
                        "hero-stat text-center",
                        !isMortgageAffordable && "border-destructive/50 bg-destructive/5"
                      )}>
                        <div className="text-sm text-muted-foreground mb-1">
                          Total Monthly Payment (PITI)
                        </div>
                        <div className={cn(
                          "text-4xl font-bold mono-value",
                          isMortgageAffordable ? "text-primary neon-text" : "text-destructive"
                        )}>
                          {formatCurrency(totalMortgagePayment)}
                          <span className="text-lg font-normal text-muted-foreground">/mo</span>
                        </div>
                        <div className={cn(
                          "text-sm mt-2 flex items-center justify-center gap-2",
                          isMortgageAffordable ? "text-emerald-500" : "text-destructive"
                        )}>
                          {isMortgageAffordable ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Within DTI guidelines (28%/36%)
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-4 w-4" />
                              DTI too high - {frontEndDTI.toFixed(0)}% front / {backEndDTI.toFixed(0)}% back
                            </>
                          )}
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                        <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                          <div className="text-xs text-muted-foreground">Principal & Interest</div>
                          <div className="font-mono font-bold text-sm">{formatCurrency(principalInterest)}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                          <div className="text-xs text-muted-foreground">Property Tax</div>
                          <div className="font-mono font-bold text-sm">{formatCurrency(propertyTax)}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                          <div className="text-xs text-muted-foreground">Insurance</div>
                          <div className="font-mono font-bold text-sm">{formatCurrency(insuranceMonthly)}</div>
                        </div>
                        <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                          <div className="text-xs text-muted-foreground">PMI</div>
                          <div className="font-mono font-bold text-sm">{pmi > 0 ? formatCurrency(pmi) : "-"}</div>
                        </div>
                      </div>

                      {/* Key Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">Loan Amount</div>
                          <div className="text-sm font-bold mono-value mt-1">{formatCurrency(loanAmount)}</div>
                        </div>
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">Total Interest</div>
                          <div className="text-sm font-bold mono-value mt-1 text-yellow-500">{formatCurrency(totalInterest)}</div>
                        </div>
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">Front-End DTI</div>
                          <div className={cn(
                            "text-sm font-bold mono-value mt-1",
                            frontEndDTI <= 28 ? "text-emerald-400" : "text-destructive"
                          )}>{frontEndDTI.toFixed(1)}%</div>
                        </div>
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">Back-End DTI</div>
                          <div className={cn(
                            "text-sm font-bold mono-value mt-1",
                            backEndDTI <= 36 ? "text-emerald-400" : "text-destructive"
                          )}>{backEndDTI.toFixed(1)}%</div>
                        </div>
                      </div>

                      {/* PMI Warning */}
                      {pmi > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-yellow-200/80">
                            With less than 20% down, you'll pay PMI (~{formatCurrency(pmi)}/mo) until you reach 20% equity.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* Buy Tips */}
              <Card className="glass-card border-none shadow-xl mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-primary" />
                    Home Buying Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {BUY_TIPS.map((tip) => (
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rent vs Buy Comparison */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Rent vs Buy: Quick Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Rent Column */}
              <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
                <h3 className="font-semibold text-blue-500 mb-3 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Renting Makes Sense If...
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>You may move within 3-5 years</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>You prefer flexibility and less responsibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>You haven't saved 20% for a down payment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Rent is significantly cheaper than buying</span>
                  </li>
                </ul>
              </div>

              {/* Buy Column */}
              <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <h3 className="font-semibold text-emerald-500 mb-3 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Buying Makes Sense If...
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>You plan to stay 5+ years</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>You want to build equity and wealth</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>You have 20% down + 6 months reserves</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>Monthly payment fits within 28% DTI</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Housing Resources / Affiliates */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Housing Resources</h3>
              <span className="text-xs text-primary/70 bg-primary/10 px-2 py-1 rounded-md">Recommended</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {HOUSING_AFFILIATES.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="group relative p-3 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all"
                >
                  <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">
                    {link.tag}
                  </span>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">{link.name}</span>
                    <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </a>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground/50 text-center mt-3">We may earn a commission from partner links</p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <CalcIcon className="h-4 w-4" />
              Income Calculator
            </Button>
          </Link>
          <Link href="/smart-money" className="flex-1">
            <Button className="w-full gap-2">
              <Wallet className="h-4 w-4" />
              Budget Planner
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
              © {new Date().getFullYear()} Autolytiq. For estimation purposes only.
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

export default Housing;
