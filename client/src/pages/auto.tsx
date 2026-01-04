import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  Sun,
  Car,
  DollarSign,
  Calculator as CalcIcon,
  ChevronRight,
  ChevronLeft,
  Shield,
  Fuel,
  Wrench,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Clock,
  Info,
  BookOpen,
  Lightbulb,
  Search,
  FileText,
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

const STORAGE_KEY = "auto-page-state";

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

function Auto() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Calculator State
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [currentCarPayment, setCurrentCarPayment] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [creditTier, setCreditTier] = useState("good");
  const [selectedTerm, setSelectedTerm] = useState(60);
  const [showCalculator, setShowCalculator] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Try to get income from main calculator
    try {
      const mainCalcState = localStorage.getItem("income-calc-state");
      if (mainCalcState) {
        const parsed = JSON.parse(mainCalcState);
        if (parsed.ytdIncome && parsed.startDate && parsed.checkDate) {
          // Calculate monthly income
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
  const existingPayment = parseFloat(currentCarPayment) || 0;
  const down = parseFloat(downPayment) || 0;

  // Affordability calculations
  const maxPayment = income * 0.12; // 12% of income rule
  const availablePayment = Math.max(0, maxPayment - existingPayment);
  const tier = CREDIT_TIERS.find(t => t.id === creditTier);
  const apr = (tier?.baseApr || 7.99) + (TERM_ADJUSTMENTS[selectedTerm] || 0);

  // Calculate max loan amount based on available payment
  const calculateMaxLoan = (payment: number, rate: number, term: number): number => {
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return payment * term;
    return payment * (Math.pow(1 + monthlyRate, term) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, term));
  };

  const maxLoan = calculateMaxLoan(availablePayment, apr, selectedTerm);
  const maxVehiclePrice = maxLoan + down;

  // Estimated ownership costs
  const estInsurance = 200;
  const estFuel = 180;
  const estMaintenance = 75;
  const totalMonthlyOwnership = availablePayment + estInsurance + estFuel + estMaintenance;

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
              <Car className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold tracking-tight dark:neon-text">Auto Guide</h1>
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
            Smart <span className="text-primary">Auto</span> Shopping
          </h2>
          <p className="text-muted-foreground">
            Know what you can afford before you step on the lot
          </p>
        </div>

        {/* Affordability Calculator */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalcIcon className="h-5 w-5 text-primary" />
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
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Monthly Income
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
                      <Label className="text-sm font-medium">Current Car Payment</Label>
                      <MoneyInput
                        value={currentCarPayment}
                        onChange={setCurrentCarPayment}
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
                  </div>

                  {/* Credit Tier */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
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
                            <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
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
                      <Clock className="h-4 w-4 text-muted-foreground" />
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
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Max Vehicle Price */}
                        <div className="hero-stat text-center">
                          <div className="text-sm text-muted-foreground mb-1">Max Vehicle Price</div>
                          <div className="text-3xl font-bold mono-value text-primary neon-text">
                            {formatCurrency(maxVehiclePrice)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Based on {formatCurrency(availablePayment)}/mo payment
                          </div>
                        </div>

                        {/* Payment Budget */}
                        <div className="stat-card text-center">
                          <div className="text-sm text-muted-foreground mb-1">Payment Budget (12% rule)</div>
                          <div className="text-2xl font-bold mono-value">
                            {formatCurrency(availablePayment)}/mo
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Max: {formatCurrency(maxPayment)}/mo
                            {existingPayment > 0 && ` - ${formatCurrency(existingPayment)} existing`}
                          </div>
                        </div>
                      </div>

                      {/* Loan Details */}
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">Max Loan</div>
                          <div className="text-sm font-bold mono-value mt-1">{formatCurrency(maxLoan)}</div>
                        </div>
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">Down Payment</div>
                          <div className="text-sm font-bold mono-value mt-1">{formatCurrency(down)}</div>
                        </div>
                        <div className="stat-card text-center">
                          <div className="text-xs text-muted-foreground">APR</div>
                          <div className="text-sm font-bold mono-value mt-1">{apr.toFixed(2)}%</div>
                        </div>
                      </div>

                      {/* Warning for short terms */}
                      {selectedTerm <= 48 && maxVehiclePrice < 15000 && (
                        <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-yellow-200/80">
                            Consider a longer term for more flexibility, or increase your down payment.
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
              {OWNERSHIP_COSTS.map((cost) => (
                <div key={cost.label} className="stat-card text-center">
                  <cost.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="font-semibold text-sm">{cost.label}</div>
                  <div className="text-primary font-mono text-sm">{cost.monthly}</div>
                  <div className="text-xs text-muted-foreground mt-1">{cost.note}</div>
                </div>
              ))}
            </div>

            {income > 0 && availablePayment > 0 && (
              <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Est. Total Monthly Cost</span>
                  <span className="text-lg font-bold mono-value text-primary">
                    {formatCurrency(totalMonthlyOwnership)}/mo
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Payment ({formatCurrency(availablePayment)}) + Insurance + Fuel + Maintenance
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shopping Tips */}
        <Card className="glass-card border-none shadow-xl mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
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
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
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
              <Car className="h-5 w-5 text-primary" />
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
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>Full manufacturer warranty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>Latest safety features & technology</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>Lower interest rates available</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                    <span>Choose exact features you want</span>
                  </li>
                </ul>
              </div>

              {/* Used */}
              <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
                <h3 className="font-semibold text-blue-500 mb-3">Used Vehicle Pros</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Significant cost savings (30-50% less)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Slower depreciation rate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
                    <span>Lower insurance costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5" />
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

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <CalcIcon className="h-4 w-4" />
              Income Calculator
            </Button>
          </Link>
          <Link href="/desk" className="flex-1">
            <Button className="w-full gap-2">
              <Car className="h-4 w-4" />
              Payment Calculator
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

export default Auto;
