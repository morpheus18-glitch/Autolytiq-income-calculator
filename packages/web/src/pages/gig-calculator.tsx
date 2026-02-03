import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronRight,
  ChevronDown,
  Clock,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";
import {
  AutolytiqLogo,
  IncomeIcon,
  WalletIcon,
  DollarIcon,
  InfoIcon,
  CheckIcon,
  ResetIcon,
  LoginIcon,
  LogoutIcon,
} from "@/components/icons";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { FAQ } from "@/components/faq";
import { SEO, createCalculatorSchema, createFAQSchema } from "@/components/seo";
import { ManageCookiesButton } from "@/components/cookie-consent";
import { AnimatedNumber } from "@/components/charts";
import { GigPlatformSelector } from "@/components/gig-platform-selector";
import {
  calculateGigIncome,
  GIG_PLATFORMS,
  formatCurrency,
  toAnnual,
  type Frequency,
  type GigResult,
} from "@/lib/income-calculations";

const STORAGE_KEY = "gig-calculator-state";

const GIG_WORKER_FAQ = [
  {
    question: "How is my true net income calculated?",
    answer: "We subtract estimated business expenses (based on your platform type) from your gross earnings, then calculate self-employment tax (15.3% on 92.35% of net) and estimated federal income tax to show what you actually keep.",
  },
  {
    question: "What expenses are included in the deduction?",
    answer: "For rideshare drivers, we estimate ~30% for mileage, phone, and supplies. Delivery drivers typically have ~25% expenses. Freelancers on platforms like Upwork usually have ~10% (mainly platform fees). You can customize the expense rate.",
  },
  {
    question: "What is self-employment tax?",
    answer: "Self-employment tax is 15.3% (12.4% Social Security + 2.9% Medicare) that you pay as a 1099 worker. W-2 employees split this with their employer, but gig workers pay both halves. It's calculated on 92.35% of your net earnings.",
  },
  {
    question: "Why should I set aside money for quarterly taxes?",
    answer: "As a gig worker, no taxes are withheld from your payments. The IRS expects quarterly estimated tax payments to avoid penalties. We calculate 25% of each quarter's tax liability to keep you on track.",
  },
  {
    question: "What does 'what lenders see' mean?",
    answer: "Banks typically count only 75-80% of self-employment income when evaluating loans because it's considered less stable than W-2 income. This helps you understand your borrowing power.",
  },
];

function GigCalculator() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const hasCalculated = useRef(false);

  // Form state
  const [platform, setPlatform] = useState("uber");
  const [grossEarnings, setGrossEarnings] = useState("");
  const [frequency, setFrequency] = useState<Frequency>("weekly");
  const [hoursPerWeek, setHoursPerWeek] = useState("");
  const [customExpenseRate, setCustomExpenseRate] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Results
  const [results, setResults] = useState<GigResult | null>(null);

  // Load from storage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.platform) setPlatform(parsed.platform);
        if (parsed.grossEarnings) setGrossEarnings(parsed.grossEarnings);
        if (parsed.frequency) setFrequency(parsed.frequency);
        if (parsed.hoursPerWeek) setHoursPerWeek(parsed.hoursPerWeek);
        if (parsed.customExpenseRate) setCustomExpenseRate(parsed.customExpenseRate);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save to storage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ platform, grossEarnings, frequency, hoursPerWeek, customExpenseRate })
    );
  }, [platform, grossEarnings, frequency, hoursPerWeek, customExpenseRate, mounted]);

  // Calculate results
  useEffect(() => {
    const gross = parseFloat(grossEarnings) || 0;
    if (gross <= 0) {
      setResults(null);
      return;
    }

    const grossAnnual = toAnnual(gross, frequency);
    const hours = parseFloat(hoursPerWeek) || undefined;
    const customRate = customExpenseRate ? parseFloat(customExpenseRate) / 100 : undefined;

    const calc = calculateGigIncome(grossAnnual, platform, customRate, hours);
    setResults(calc);
  }, [grossEarnings, frequency, platform, hoursPerWeek, customExpenseRate]);

  const handleReset = () => {
    setPlatform("uber");
    setGrossEarnings("");
    setFrequency("weekly");
    setHoursPerWeek("");
    setCustomExpenseRate("");
    setShowAdvanced(false);
    setResults(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleAddToStreams = () => {
    if (!results) return;

    // Save gig income to be picked up by income-streams page
    const gigStream = {
      id: `gig_${Date.now()}`,
      name: `${GIG_PLATFORMS.find(p => p.id === platform)?.name || "Gig"} Income`,
      amount: results.trueNetIncome / 12,
      frequency: "monthly" as Frequency,
      type: "gig" as const,
      stabilityRating: 2 as const,
      pending: true,
    };
    localStorage.setItem("pending-income-stream", JSON.stringify(gigStream));
    window.location.href = "/income-streams";
  };

  if (!mounted) return null;

  const selectedPlatform = GIG_PLATFORMS.find(p => p.id === platform);

  const seoStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      createCalculatorSchema(
        "Gig Worker Income Calculator",
        "Calculate your true net income as a gig worker after expenses and self-employment taxes. For Uber, Lyft, DoorDash, Instacart, Upwork, and freelancers.",
        "https://autolytiqs.com/gig-calculator"
      ),
      createFAQSchema(GIG_WORKER_FAQ),
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Gig Worker Income Calculator 2026 | True Net Income After Taxes"
        description="Calculate your true net income as a gig worker. See what you really make after expenses, self-employment tax, and estimated income tax. For Uber, Lyft, DoorDash, Instacart, Upwork, and freelancers."
        canonical="https://autolytiqs.com/gig-calculator"
        keywords="gig worker calculator, uber income calculator, doordash calculator, freelance income calculator, self employment tax calculator, 1099 calculator, side hustle income"
        structuredData={seoStructuredData}
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
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
            <Link href="/calculator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Calculator</Link>
            <span className="text-sm font-medium text-primary">Gig Calculator</span>
            <Link href="/income-streams" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Income Streams</Link>
            <Link href="/auto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Auto</Link>
            <Link href="/housing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Housing</Link>
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
            Gig Worker <span className="text-primary">True Income</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what you really make after expenses, self-employment tax, and estimated income tax
          </p>
        </motion.div>

        {/* Main Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-2 border-primary/30 shadow-2xl shadow-primary/10 overflow-hidden max-w-4xl mx-auto">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20">
                    <DollarIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span className="block">Gig Income Calculator</span>
                    <span className="text-sm font-normal text-muted-foreground">For 1099/self-employed workers</span>
                  </div>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-9 px-3 text-muted-foreground hover:text-foreground"
                >
                  <ResetIcon className="h-4 w-4 mr-1.5" />
                  Reset
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6 pb-8 px-6">
              {/* Platform Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium flex items-center gap-2">
                  What type of gig work?
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[220px]">
                      <p>Select your platform to auto-calculate typical expense rates. Rideshare has higher expenses (mileage, depreciation) than delivery or freelance work.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <GigPlatformSelector
                  selected={platform}
                  onChange={setPlatform}
                />
              </div>

              {/* Gross Earnings */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    Gross Earnings
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[220px]">
                        <p>Your total earnings before any expenses or taxes. This is what the app shows you earned.</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <MoneyInput
                    value={grossEarnings}
                    onChange={setGrossEarnings}
                    className="h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Pay Frequency</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: "weekly", label: "Weekly" },
                      { value: "biweekly", label: "Bi-weekly" },
                      { value: "monthly", label: "Monthly" },
                      { value: "annually", label: "Yearly" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFrequency(opt.value as Frequency)}
                        className={cn(
                          "py-2.5 px-2 rounded-lg text-sm font-medium transition-all border",
                          frequency === opt.value
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Advanced Options */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <ChevronRight className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-90")} />
                {showAdvanced ? "Hide" : "Show"} advanced options
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Hours per Week
                          <span className="text-xs text-muted-foreground">(optional)</span>
                        </Label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={hoursPerWeek}
                          onChange={(e) => setHoursPerWeek(e.target.value.replace(/\D/g, ""))}
                          placeholder="e.g. 25"
                          className="w-full h-11 px-3 rounded-lg border bg-background font-mono text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                        />
                        <p className="text-xs text-muted-foreground">For calculating effective hourly rate</p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          Custom Expense Rate
                          <span className="text-xs text-muted-foreground">(optional)</span>
                        </Label>
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={customExpenseRate}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^\d.]/g, "");
                              if ((val.match(/\./g) || []).length <= 1) setCustomExpenseRate(val);
                            }}
                            placeholder={`${Math.round((selectedPlatform?.expenseRate || 0.25) * 100)}`}
                            className="w-full h-11 px-3 pr-7 rounded-lg border bg-background font-mono text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Override the default {Math.round((selectedPlatform?.expenseRate || 0.25) * 100)}% for {selectedPlatform?.name}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results */}
              <AnimatePresence>
                {results && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 border-t-2 border-primary/20 space-y-6">
                      {/* Primary Result - True Net Income */}
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-2">Your TRUE Net Income (Annual)</div>
                        <div className="text-4xl sm:text-5xl font-bold mono-value text-primary">
                          <AnimatedNumber
                            value={results.trueNetIncome}
                            formatValue={(v) => formatCurrency(v)}
                          />
                        </div>
                        <div className="text-sm text-muted-foreground mt-2">
                          {formatCurrency(results.trueNetIncome / 12)}/month after all taxes
                        </div>
                      </div>

                      {/* Breakdown Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="stat-card text-center p-4 rounded-xl bg-gradient-to-br from-background to-muted/30">
                          <div className="text-xs text-muted-foreground">Gross Annual</div>
                          <div className="text-lg font-bold mono-value mt-1">
                            {formatCurrency(results.grossAnnual)}
                          </div>
                        </div>
                        <div className="stat-card text-center p-4 rounded-xl bg-gradient-to-br from-background to-muted/30">
                          <div className="text-xs text-muted-foreground">Expenses (~{Math.round(results.expenseRate * 100)}%)</div>
                          <div className="text-lg font-bold mono-value mt-1 text-yellow-500">
                            -{formatCurrency(results.expenses)}
                          </div>
                        </div>
                        <div className="stat-card text-center p-4 rounded-xl bg-gradient-to-br from-background to-muted/30">
                          <div className="text-xs text-muted-foreground">SE Tax (15.3%)</div>
                          <div className="text-lg font-bold mono-value mt-1 text-orange-500">
                            -{formatCurrency(results.selfEmploymentTax)}
                          </div>
                        </div>
                        <div className="stat-card text-center p-4 rounded-xl bg-gradient-to-br from-background to-muted/30">
                          <div className="text-xs text-muted-foreground">Est. Income Tax</div>
                          <div className="text-lg font-bold mono-value mt-1 text-red-500">
                            -{formatCurrency(results.estimatedIncomeTax)}
                          </div>
                        </div>
                      </div>

                      {/* Key Metrics */}
                      <div className="grid sm:grid-cols-3 gap-4">
                        {/* Quarterly Tax Set-Aside */}
                        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/20">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Quarterly Tax Set-Aside</div>
                              <div className="text-xl font-bold mono-value text-yellow-500">
                                {formatCurrency(results.quarterlyTaxSetAside)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">Save this every 3 months</div>
                            </div>
                          </div>
                        </div>

                        {/* Effective Hourly Rate */}
                        {results.effectiveHourlyRate !== null && (
                          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-blue-500/20">
                                <Clock className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Effective Hourly Rate</div>
                                <div className="text-xl font-bold mono-value text-blue-500">
                                  {formatCurrency(results.effectiveHourlyRate)}/hr
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">What you actually earn</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* What Lenders See */}
                        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20">
                              <WalletIcon className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">What Lenders See</div>
                              <div className="text-xl font-bold mono-value text-purple-500">
                                {formatCurrency(results.lenderVisibleIncome)}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">~75% of net for loans</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Add to Streams CTA */}
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button
                          onClick={handleAddToStreams}
                          className="flex-1 gap-2 bg-gradient-to-r from-primary to-emerald-500 hover:from-primary/90 hover:to-emerald-500/90"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Add to Income Streams
                        </Button>
                        <Link href="/income-streams" className="flex-1">
                          <Button variant="outline" className="w-full gap-2">
                            <IncomeIcon className="h-4 w-4" />
                            View All Streams
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Related Tools */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 max-w-4xl mx-auto">
          <Link href="/calculator">
            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
              <IncomeIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">W-2 Calculator</div>
              <div className="text-xs text-muted-foreground">Traditional income</div>
            </div>
          </Link>
          <Link href="/income-streams">
            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
              <WalletIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">Income Streams</div>
              <div className="text-xs text-muted-foreground">Combine sources</div>
            </div>
          </Link>
          <Link href="/auto">
            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
              <DollarIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">Auto Guide</div>
              <div className="text-xs text-muted-foreground">Car affordability</div>
            </div>
          </Link>
          <Link href="/housing">
            <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
              <DollarIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">Housing</div>
              <div className="text-xs text-muted-foreground">Rent vs buy</div>
            </div>
          </Link>
        </div>

        {/* FAQ */}
        <FAQ items={GIG_WORKER_FAQ} className="mt-8 max-w-4xl mx-auto" />
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Autolytiq. For estimation purposes only.
            </p>
            <div className="flex items-center gap-4 text-xs">
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

export default GigCalculator;
