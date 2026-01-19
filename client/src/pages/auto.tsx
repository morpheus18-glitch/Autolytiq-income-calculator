import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, TrendingDown, Search, FileText, DollarSign, Shield, Fuel, Wrench } from "lucide-react";
import { Link } from "wouter";

import { cn } from "@/lib/utils";
import {
  AutoIcon,
  AutolytiqLogo,
  IncomeIcon,
  DollarIcon,
  HousingIcon,
  WalletIcon,
  CreditScoreIcon,
  ClockIcon,
  BlogIcon,
  CheckIcon,
  WarningIcon,
  ShieldIcon,
  FuelIcon,
  WrenchIcon,
  LightbulbIcon,
  InfoIcon,
  ExternalLinkIcon,
  ArrowLeftIcon,
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
import { FAQ, AUTO_FAQ } from "@/components/faq";
import { FirstTimeGuide, AUTO_GUIDE_STEPS } from "@/components/first-time-guide";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { AnimatedNumber } from "@/components/charts";
import { IncomeBanner, NoIncomeCTA } from "@/components/income-banner";
import { useIncome } from "@/lib/use-income";

const STORAGE_KEY = "auto-page-state";

// Auto-focused affiliate links
const AUTO_AFFILIATES = [
  { name: "LendingTree Auto", desc: "Compare auto loan rates", url: "https://www.lendingtree.com/auto/", tag: "Top Pick" },
  { name: "Progressive", desc: "Compare insurance quotes", url: "https://www.progressive.com/auto/", tag: "Insurance" },
  { name: "CarGurus", desc: "Research & find deals", url: "https://www.cargurus.com/", tag: "Research" },
  { name: "Credit Karma", desc: "Free credit scores", url: "https://www.creditkarma.com/signup", tag: "Free" },
];

const CREDIT_TIERS = [
  { id: "excellent", label: "Excellent", range: "750+", baseApr: 5.99, color: "text-emerald-500" },
  { id: "good", label: "Good", range: "700-749", baseApr: 7.99, color: "text-blue-500" },
  { id: "fair", label: "Fair", range: "650-699", baseApr: 11.99, color: "text-yellow-500" },
  { id: "needs-work", label: "Needs Work", range: "Below 650", baseApr: 17.99, color: "text-orange-500" },
];

const TERM_ADJUSTMENTS: Record<number, number> = {
  36: 0, 48: 0.5, 60: 1.0, 72: 1.5, 84: 2.0,
};

const LOAN_TERMS = [36, 48, 60, 72, 84];

function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const SHOPPING_TIPS = [
  {
    icon: Search,
    title: "Research Before You Shop",
    tips: [
      "Check Kelley Blue Book and Edmunds for fair pricing",
      "Read reliability ratings from Consumer Reports and J.D. Power",
      "Compare insurance costs before deciding on a model",
      "Look up the vehicle's safety ratings at NHTSA.gov",
    ],
  },
  {
    icon: FileText,
    title: "Get Pre-Approved",
    tips: [
      "Get pre-approved for a loan before visiting dealerships",
      "Know your credit score and what rates you qualify for",
      "Compare offers from banks, credit unions, and dealers",
      "Pre-approval gives you negotiating power",
    ],
  },
  {
    icon: DollarSign,
    title: "Negotiate Smart",
    tips: [
      "Focus on the out-the-door price, not monthly payment",
      "Research dealer invoice prices vs MSRP",
      "Be willing to walk away - it's your best leverage",
      "Shop at month/quarter end when dealers have quotas",
    ],
  },
  {
    icon: Shield,
    title: "Inspect & Test",
    tips: [
      "Always test drive for at least 20-30 minutes",
      "For used cars, get an independent mechanic inspection",
      "Check the CARFAX or AutoCheck vehicle history report",
      "Inspect in daylight and look for paint mismatches or damage",
    ],
  },
];

const OWNERSHIP_COSTS = [
  { icon: Shield, label: "Insurance", monthly: "$150-300", note: "Varies by coverage, age, location" },
  { icon: Fuel, label: "Fuel", monthly: "$150-250", note: "Based on 12k miles/year" },
  { icon: Wrench, label: "Maintenance", monthly: "$50-100", note: "Oil, tires, brakes, etc." },
  { icon: FileText, label: "Registration", monthly: "$10-50", note: "Annual fee divided monthly" },
];

// Tax and fee constants
const SALES_TAX_RATE = 0.07; // 7% average sales tax
const DEALER_FEES = 500; // Registration, doc fees, etc.
const TITLE_FEES = 150;

function Auto() {
  const [mounted, setMounted] = useState(false);
  const { income: calculatorIncome, hasIncome: hasCalculatorIncome } = useIncome();

  // Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [currentCarPayment, setCurrentCarPayment] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [estimatedInsurance, setEstimatedInsurance] = useState("200");
  const [creditTier, setCreditTier] = useState("good");
  const [selectedTerm, setSelectedTerm] = useState(60);
  const [showCalculator, setShowCalculator] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-populate income from calculator when available
  useEffect(() => {
    if (hasCalculatorIncome && calculatorIncome && !monthlyIncome) {
      setMonthlyIncome(calculatorIncome.grossMonthly.toString());
    }
  }, [hasCalculatorIncome, calculatorIncome, monthlyIncome]);

  const income = parseFloat(monthlyIncome) || 0;
  const existingPayment = parseFloat(currentCarPayment) || 0;
  const down = parseFloat(downPayment) || 0;
  const insurance = parseFloat(estimatedInsurance) || 200;

  // Affordability calculations - including insurance in the 12% rule
  const maxTotalAutoPayment = income * 0.12; // 12% of income rule (payment + insurance)
  const availableForPaymentAndInsurance = Math.max(0, maxTotalAutoPayment - existingPayment);
  const availableLoanPayment = Math.max(0, availableForPaymentAndInsurance - insurance);

  const tier = CREDIT_TIERS.find(t => t.id === creditTier);
  const apr = (tier?.baseApr || 7.99) + (TERM_ADJUSTMENTS[selectedTerm] || 0);

  // Calculate max loan amount based on available payment (after insurance)
  const calculateMaxLoan = (payment: number, rate: number, term: number): number => {
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return payment * term;
    return payment * (Math.pow(1 + monthlyRate, term) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, term));
  };

  // Max loan = what you can finance based on available monthly payment
  const maxLoanAmount = calculateMaxLoan(availableLoanPayment, apr, selectedTerm);

  // Total purchase budget = loan + down payment
  const totalPurchaseBudget = maxLoanAmount + down;

  // Vehicle price (pre-tax) = Total / (1 + tax rate) - fees
  // Rearranged: VehiclePrice * (1 + taxRate) + fees = TotalPurchaseBudget
  const maxVehiclePrice = Math.max(0, (totalPurchaseBudget - DEALER_FEES - TITLE_FEES) / (1 + SALES_TAX_RATE));

  // Calculate what the actual loan would be for display
  const estimatedTax = maxVehiclePrice * SALES_TAX_RATE;
  const estimatedFees = DEALER_FEES + TITLE_FEES;
  const totalOutTheDoor = maxVehiclePrice + estimatedTax + estimatedFees;

  // Estimated ownership costs
  const estFuel = 180;
  const estMaintenance = 75;
  const totalMonthlyOwnership = availableLoanPayment + insurance + estFuel + estMaintenance;

  if (!mounted) return null;

  const seoData = {
    calculator: createCalculatorSchema(
      "Auto Affordability Calculator",
      "Calculate how much car you can afford based on your income. Free auto loan calculator with insurance and ownership cost estimates.",
      "https://autolytiqs.com/auto"
    ),
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Auto Guide", url: "https://autolytiqs.com/auto" },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Auto Affordability Calculator 2026 - How Much Car Can I Afford?"
        description="Free auto affordability calculator. Calculate maximum vehicle price based on income, compare auto loan rates, and understand true ownership costs including insurance, fuel, and maintenance."
        canonical="https://autolytiqs.com/auto"
        keywords="auto affordability calculator, how much car can I afford, car payment calculator, auto loan calculator, car buying guide, vehicle budget calculator 2026"
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
            <Link href="/smart-money" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Budget Planner</Link>
            <Link href="/housing" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Housing</Link>
            <span className="text-sm font-medium text-primary">Auto</span>
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
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">12% Rule Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            Smart <span className="text-primary">Auto</span> Shopping
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Know what you can afford before you step on the lot
          </p>
        </motion.div>

        {/* Income Detection Banner */}
        {hasCalculatorIncome ? (
          <IncomeBanner
            className="mb-6"
            variant="compact"
            showCTA={true}
            ctaText="Plan Budget"
            ctaHref="/smart-money"
          />
        ) : (
          <NoIncomeCTA className="mb-6" />
        )}

        {/* Affordability Calculator */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarIcon className="h-5 w-5 text-primary" />
                Affordability Calculator
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalculator(!showCalculator)}
              >
                {showCalculator ? "Hide" : "Show"}
              </Button>
            </div>
          </CardHeader>
          <AnimatePresence>
            {showCalculator && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Monthly Income
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
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
                        Current Car Payment
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Existing monthly car payment (if any)</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <MoneyInput
                        value={currentCarPayment}
                        onChange={setCurrentCarPayment}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Down Payment
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Cash you'll put down upfront</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <MoneyInput
                        value={downPayment}
                        onChange={setDownPayment}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Est. Insurance
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Monthly insurance cost (included in 12% affordability rule)</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <MoneyInput
                        value={estimatedInsurance}
                        onChange={setEstimatedInsurance}
                        className="h-11"
                      />
                    </div>
                  </div>

                  {/* Credit Tier */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CreditScoreIcon className="h-4 w-4 text-muted-foreground" />
                      Credit Score Range
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CREDIT_TIERS.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setCreditTier(t.id)}
                          className={cn(
                            "relative p-3 rounded-xl border-2 transition-all text-left",
                            creditTier === t.id
                              ? "border-primary bg-primary/5"
                              : "border-border/50 hover:border-primary/30 bg-card"
                          )}
                        >
                          {creditTier === t.id && (
                            <CheckIcon className="absolute top-2 right-2 h-4 w-4 text-primary" />
                          )}
                          <div className={cn("font-semibold text-sm", t.color)}>{t.label}</div>
                          <div className="text-xs text-muted-foreground">{t.range}</div>
                        </button>
                      ))}
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
                        const termApr = (tier?.baseApr || 7.99) + (TERM_ADJUSTMENTS[term] || 0);
                        return (
                          <button
                            key={term}
                            type="button"
                            onClick={() => setSelectedTerm(term)}
                            className={cn(
                              "py-2 px-1 rounded-lg text-sm font-medium transition-all border",
                              selectedTerm === term
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
                            )}
                          >
                            <div>{term}mo</div>
                            <div className="text-xs opacity-70">{termApr.toFixed(1)}%</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Results */}
                  {income > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-4 border-t border-border/50"
                    >
                      {/* Main Results - Vehicle Price vs Total Loan */}
                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        {/* Max Vehicle Price (Pre-Tax) */}
                        <div className="hero-stat text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                          <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1">
                            Max Vehicle Price
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="h-3 w-3" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Pre-tax sticker price you can afford</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="text-3xl font-bold mono-value text-primary neon-text">
                            <AnimatedNumber value={maxVehiclePrice} formatValue={(v) => formatCurrency(v)} />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Pre-tax / Pre-fees
                          </div>
                        </div>

                        {/* Total Out-the-Door / Loan Amount */}
                        <div className="stat-card text-center p-4 rounded-xl">
                          <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1">
                            Max Loan Amount
                            <Tooltip>
                              <TooltipTrigger>
                                <InfoIcon className="h-3 w-3" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Total financed after tax, fees, minus down payment</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="text-2xl font-bold mono-value">
                            <AnimatedNumber value={maxLoanAmount} formatValue={(v) => formatCurrency(v)} />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            After {formatCurrency(down)} down
                          </div>
                        </div>
                      </div>

                      {/* Price Breakdown */}
                      <div className="p-4 rounded-xl bg-secondary/30 border border-border/50 mb-4">
                        <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Price Breakdown</div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Vehicle Price</span>
                            <span className="font-medium mono-value">{formatCurrency(maxVehiclePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Est. Sales Tax (~7%)</span>
                            <span className="font-medium mono-value">+{formatCurrency(estimatedTax)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Title, Reg & Doc Fees</span>
                            <span className="font-medium mono-value">+{formatCurrency(estimatedFees)}</span>
                          </div>
                          <div className="border-t border-border/50 pt-2 flex justify-between font-semibold">
                            <span>Total Out-the-Door</span>
                            <span className="mono-value text-primary">{formatCurrency(totalOutTheDoor)}</span>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>– Down Payment</span>
                            <span className="mono-value">–{formatCurrency(down)}</span>
                          </div>
                          <div className="border-t border-border/50 pt-2 flex justify-between font-semibold">
                            <span>Amount Financed</span>
                            <span className="mono-value">{formatCurrency(maxLoanAmount)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="stat-card text-center p-3">
                          <div className="text-xs text-muted-foreground">Loan Payment</div>
                          <div className="text-sm font-bold mono-value mt-1">{formatCurrency(availableLoanPayment)}/mo</div>
                        </div>
                        <div className="stat-card text-center p-3">
                          <div className="text-xs text-muted-foreground">+ Insurance</div>
                          <div className="text-sm font-bold mono-value mt-1">{formatCurrency(insurance)}/mo</div>
                        </div>
                        <div className="stat-card text-center p-3">
                          <div className="text-xs text-muted-foreground">Total Auto</div>
                          <div className="text-sm font-bold mono-value mt-1 text-primary">{formatCurrency(availableLoanPayment + insurance)}/mo</div>
                        </div>
                        <div className="stat-card text-center p-3">
                          <div className="text-xs text-muted-foreground">APR</div>
                          <div className="text-sm font-bold mono-value mt-1">{apr.toFixed(2)}%</div>
                        </div>
                      </div>

                      {/* 12% Rule Info */}
                      <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-start gap-2">
                          <ShieldIcon className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="text-sm">
                            <span className="font-medium text-primary">12% Rule:</span>{" "}
                            <span className="text-muted-foreground">
                              Your total auto costs (payment + insurance) of {formatCurrency(availableLoanPayment + insurance)}/mo
                              stays within {formatCurrency(maxTotalAutoPayment)}/mo (12% of {formatCurrency(income)} income)
                              {existingPayment > 0 && `, accounting for your existing ${formatCurrency(existingPayment)}/mo payment`}.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Warning for low affordability */}
                      {availableLoanPayment < 100 && (
                        <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
                          <WarningIcon className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-yellow-600 dark:text-yellow-200/80">
                            Your available loan payment is low. Consider reducing insurance coverage, increasing your down payment, or waiting until your income increases.
                          </p>
                        </div>
                      )}

                      {/* Warning for short terms with low budget */}
                      {selectedTerm <= 48 && maxVehiclePrice < 15000 && maxVehiclePrice > 0 && (
                        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-2">
                          <InfoIcon className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-blue-600 dark:text-blue-200/80">
                            A longer loan term could increase your buying power, though you'll pay more in interest over time.
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* True Cost of Ownership */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              True Cost of Ownership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Your car payment is just the beginning. Factor in these ongoing costs:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="stat-card text-center p-3 border-primary/30 bg-primary/5">
                <Shield className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="font-semibold text-sm">Insurance</div>
                <div className="text-primary font-mono text-sm">{formatCurrency(insurance)}/mo</div>
                <div className="text-xs text-emerald-500 mt-1">Included in 12% rule</div>
              </div>
              <div className="stat-card text-center p-3">
                <Fuel className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="font-semibold text-sm">Fuel</div>
                <div className="text-primary font-mono text-sm">$150-250</div>
                <div className="text-xs text-muted-foreground mt-1">Based on 12k mi/year</div>
              </div>
              <div className="stat-card text-center p-3">
                <Wrench className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="font-semibold text-sm">Maintenance</div>
                <div className="text-primary font-mono text-sm">$50-100</div>
                <div className="text-xs text-muted-foreground mt-1">Oil, tires, brakes</div>
              </div>
              <div className="stat-card text-center p-3">
                <FileText className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="font-semibold text-sm">Registration</div>
                <div className="text-primary font-mono text-sm">$10-50</div>
                <div className="text-xs text-muted-foreground mt-1">Annual fee / month</div>
              </div>
            </div>

            {income > 0 && availableLoanPayment > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-medium">Estimated Total Monthly Cost</span>
                    <div className="text-xs text-muted-foreground">
                      Payment + Insurance + Fuel + Maintenance
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold mono-value text-primary">
                      {formatCurrency(totalMonthlyOwnership)}/mo
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-primary/20 grid grid-cols-4 gap-2 text-xs text-center">
                  <div>
                    <div className="text-muted-foreground">Payment</div>
                    <div className="font-medium mono-value">{formatCurrency(availableLoanPayment)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Insurance</div>
                    <div className="font-medium mono-value">{formatCurrency(insurance)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Fuel</div>
                    <div className="font-medium mono-value">{formatCurrency(estFuel)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Maint.</div>
                    <div className="font-medium mono-value">{formatCurrency(estMaintenance)}</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shopping Tips */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <LightbulbIcon className="h-5 w-5 text-primary" />
              Smart Shopping Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {SHOPPING_TIPS.map((section) => (
                <div key={section.title} className="p-4 rounded-lg bg-card border border-border/50">
                  <div className="flex items-center gap-2 mb-3">
                    <section.icon className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{section.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {section.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckIcon className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New vs Used */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AutoIcon className="h-5 w-5 text-primary" />
              New vs Used: What's Right for You?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* New */}
              <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <h3 className="font-semibold text-emerald-500 mb-3">New Vehicle Pros</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>Full manufacturer warranty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>Latest safety features & technology</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>Lower interest rates available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>Choose exact features you want</span>
                  </li>
                </ul>
              </div>

              {/* Used */}
              <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
                <h3 className="font-semibold text-blue-500 mb-3">Used Vehicle Pros</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Significant cost savings (30-50% less)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Slower depreciation rate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Lower insurance costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>CPO options offer warranties</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm">
                <strong className="text-primary">Pro tip:</strong> A 2-3 year old certified pre-owned (CPO) vehicle often offers the best value,
                giving you much of a new car experience at a used car price.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Auto Resources / Affiliates */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Helpful Resources</h3>
              <span className="text-xs text-primary/70 bg-primary/10 px-2 py-1 rounded-md">Recommended</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {AUTO_AFFILIATES.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  onClick={() => analytics.affiliateClick(link.name, "auto")}
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
        <FAQ items={AUTO_FAQ} className="mb-6" />

        {/* Enhanced CTAs with Explanations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-1">Ready to Take the Next Step?</h3>
            <p className="text-sm text-muted-foreground">Use our other tools to complete your financial picture</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Income Calculator CTA */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Link href="/">
                <div className="group p-5 rounded-xl border-2 border-border/50 bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IncomeIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">Income Calculator</h4>
                      <span className="text-xs text-muted-foreground">Unlock accurate results</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Don't guess your income. Calculate your exact annual earnings from your paystub for precise affordability numbers.
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">Quick & Easy</span>
                    <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">Powers all calculators</span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Payment Calculator CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Link href="/desk">
                <div className="group p-5 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-primary/20 group-hover:bg-primary/30 transition-colors">
                      <AutoIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold group-hover:text-primary transition-colors">Pro Payment Calculator</h4>
                      <span className="text-xs text-primary/70">Advanced features</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-primary ml-auto opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enter a specific vehicle price to calculate exact monthly payments, compare loan terms, and see total cost breakdown.
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-primary/20 text-primary">Compare Terms</span>
                    <span className="px-2 py-1 rounded-full bg-primary/20 text-primary">Interest Breakdown</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Additional tools row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            <Link href="/housing">
              <div className="group p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all cursor-pointer flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <HousingIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors">Housing Calculator</h4>
                  <p className="text-xs text-muted-foreground">Rent & mortgage affordability</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Link>
            <Link href="/smart-money">
              <div className="group p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all cursor-pointer flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <WalletIcon className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm group-hover:text-primary transition-colors">Budget Planner</h4>
                  <p className="text-xs text-muted-foreground">50/30/20 money allocation</p>
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
            transition={{ duration: 0.4, delay: 0.5 }}
            className="text-center pt-4"
          >
            <p className="text-xs text-muted-foreground">
              <LightbulbIcon className="h-3 w-3 inline mr-1" />
              Pro tip: Use the Income Calculator first to auto-fill your income across all tools
            </p>
          </motion.div>
        </motion.div>
      </main>

      {/* First Time User Guide */}
      <FirstTimeGuide
        storageKey="auto-calculator"
        title="Auto Affordability Guide"
        subtitle="Know what you can afford before you shop"
        steps={AUTO_GUIDE_STEPS}
      />

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-6">
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

export default Auto;
