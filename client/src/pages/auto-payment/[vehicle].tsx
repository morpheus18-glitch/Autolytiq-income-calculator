/**
 * Vehicle-Linked Decision Stabilizer (VLDS) Page
 *
 * NOT a vehicle listing page.
 * A decision stabilizer that appears when confidence collapses.
 *
 * Every page must:
 * - Perform a calculation
 * - Output a verdict
 * - Reduce uncertainty
 * - Route to a next action
 */

import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  TrendingDown,
  Shield,
  Clock,
  DollarSign,
  Percent,
  Mail,
  Download,
  RefreshCw,
} from "lucide-react";
import { AutolytiqLogo, InfoIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import {
  getVehicleBySlug,
  getPopularVehicles,
  formatVehicleName,
  getVehicleMidpointPrice,
  CREDIT_TIERS,
  LOAN_TERMS,
  DEFAULT_TERM,
  type Vehicle,
} from "@/data/vehicles";
import {
  calculateAutoPayment,
  generateAutoPaymentFAQs,
  formatCurrency,
  formatPercent,
  type AutoPaymentResult,
  type VerdictLevel,
} from "@/lib/auto-payment-calculator";

const VERDICT_CONFIG: Record<
  VerdictLevel,
  { icon: typeof CheckCircle2; color: string; bg: string; label: string }
> = {
  comfortable: {
    icon: CheckCircle2,
    color: "text-green-500",
    bg: "bg-green-500/10 border-green-500/30",
    label: "Comfortable",
  },
  tight: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    label: "Tight",
  },
  risky: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/30",
    label: "Risky",
  },
};

function VerdictBadge({ verdict, size = "lg" }: { verdict: VerdictLevel; size?: "sm" | "lg" }) {
  const config = VERDICT_CONFIG[verdict];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-semibold",
        config.bg,
        config.color,
        size === "lg" ? "px-4 py-2 text-base" : "px-3 py-1 text-sm"
      )}
    >
      <Icon className={size === "lg" ? "h-5 w-5" : "h-4 w-4"} />
      {config.label}
    </div>
  );
}

function StressDriverCard({
  driver,
}: {
  driver: { id: string; label: string; impact: string; explanation: string; value: string };
}) {
  const impactColors = {
    high: "border-red-500/30 bg-red-500/5",
    medium: "border-yellow-500/30 bg-yellow-500/5",
    low: "border-blue-500/30 bg-blue-500/5",
  };

  return (
    <div className={cn("p-4 rounded-xl border", impactColors[driver.impact as keyof typeof impactColors])}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-medium text-sm">{driver.label}</h4>
          <p className="text-xs text-muted-foreground mt-1">{driver.explanation}</p>
        </div>
        <span className="font-mono text-sm font-semibold whitespace-nowrap">{driver.value}</span>
      </div>
    </div>
  );
}

function ScenarioToggle({
  label,
  scenario,
  isActive,
  onClick,
}: {
  label: string;
  scenario: { verdict: VerdictLevel; explanation: string };
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 rounded-lg border text-left transition-all",
        isActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <VerdictBadge verdict={scenario.verdict} size="sm" />
      </div>
      {isActive && (
        <p className="text-xs text-muted-foreground mt-2">{scenario.explanation}</p>
      )}
    </button>
  );
}

export default function AutoPaymentVehiclePage() {
  const params = useParams<{ vehicle: string }>();
  const vehicleSlug = params.vehicle || "";

  const vehicle = getVehicleBySlug(vehicleSlug);

  // State
  const [mounted, setMounted] = useState(false);
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [creditTier, setCreditTier] = useState("good");
  const [termMonths, setTermMonths] = useState(DEFAULT_TERM);
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [fixedObligations, setFixedObligations] = useState("");
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  // Initialize defaults from vehicle
  useEffect(() => {
    setMounted(true);
    if (vehicle) {
      const midpoint = getVehicleMidpointPrice(vehicle);
      setVehiclePrice(midpoint.toString());
      setDownPayment(Math.round(midpoint * 0.1).toString()); // 10% default
    }
  }, [vehicle]);

  // Calculate result
  const result = useMemo<AutoPaymentResult | null>(() => {
    const price = parseFloat(vehiclePrice) || 0;
    const down = parseFloat(downPayment) || 0;
    const income = parseFloat(monthlyIncome) || 0;
    const obligations = parseFloat(fixedObligations) || 0;

    if (price <= 0 || income <= 0) return null;

    return calculateAutoPayment({
      vehiclePrice: price,
      downPayment: down,
      creditTierId: creditTier,
      termMonths,
      monthlyGrossIncome: income,
      fixedObligations: obligations,
    });
  }, [vehiclePrice, downPayment, creditTier, termMonths, monthlyIncome, fixedObligations]);

  // Generate FAQs
  const faqs = useMemo(() => {
    if (!vehicle || !result) return [];
    return generateAutoPaymentFAQs(vehicle, result);
  }, [vehicle, result]);

  if (!mounted) return null;

  // 404 for unknown vehicles
  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Vehicle Not Found</h1>
          <p className="text-muted-foreground mb-4">
            We don't have data for this vehicle yet.
          </p>
          <Link href="/auto">
            <Button>Back to Auto Calculator</Button>
          </Link>
        </div>
      </div>
    );
  }

  const vehicleName = formatVehicleName(vehicle);
  const selectedCreditTier = CREDIT_TIERS.find((t) => t.id === creditTier)!;

  const seoStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      createCalculatorSchema(
        `${vehicleName} Payment Calculator`,
        `Calculate your real monthly payment and affordability for a ${vehicleName}. Get a comfort verdict, not just an estimate.`,
        `https://autolytiqs.com/auto-payment/${vehicleSlug}`
      ),
      ...(result && faqs.length > 0 ? [createFAQSchema(faqs)] : []),
      // Dataset schema for vehicle price range
      {
        "@type": "Dataset",
        name: `${vehicleName} Price Range`,
        description: `Typical price range for ${vehicleName}`,
        creator: { "@type": "Organization", name: "Autolytiq" },
        variableMeasured: [
          {
            "@type": "PropertyValue",
            name: "Price Range Low",
            value: vehicle.priceRangeLow,
            unitCode: "USD",
          },
          {
            "@type": "PropertyValue",
            name: "Price Range High",
            value: vehicle.priceRangeHigh,
            unitCode: "USD",
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SEO
        title={`${vehicleName} Payment Calculator | What It Actually Costs You`}
        description={`Not approval. Not estimates. Calculate your real ${vehicleName} payment comfort. See if ${formatCurrency(getVehicleMidpointPrice(vehicle))} is comfortable, tight, or risky for your income.`}
        canonical={`https://autolytiqs.com/auto-payment/${vehicleSlug}`}
        keywords={`${vehicleName} payment, ${vehicleName} monthly cost, can I afford ${vehicleName}, ${vehicle.make} ${vehicle.model} payment calculator`}
        structuredData={seoStructuredData}
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <AutolytiqLogo className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold">Autolytiq</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/auto"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Auto Calculator
            </Link>
            <Link
              href="/calculator"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Income Calculator
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden md:flex" />
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Main Content - No fluff above the fold */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Headline - Immediate recognition + relief */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            What a <span className="text-primary">{vehicleName}</span> actually costs you per month
          </h1>
          <p className="text-muted-foreground">
            Not approval. Not estimates. Your real payment comfort.
          </p>
        </div>

        {/* The Calculator - Above the fold, no intro paragraph */}
        <Card className="border-2 border-primary/20 shadow-xl mb-8">
          <CardContent className="p-6">
            {/* Vehicle Price Range Context */}
            <div className="mb-6 p-3 rounded-lg bg-muted/50 text-sm">
              <span className="text-muted-foreground">Typical {vehicleName} range: </span>
              <span className="font-semibold">
                {formatCurrency(vehicle.priceRangeLow)} – {formatCurrency(vehicle.priceRangeHigh)}
              </span>
            </div>

            {/* Inputs Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Vehicle Price */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Vehicle Price</Label>
                <MoneyInput
                  value={vehiclePrice}
                  onChange={setVehiclePrice}
                  className="h-11"
                />
              </div>

              {/* Down Payment */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  Down Payment
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>20% down is ideal. Less means higher payments and more interest.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <MoneyInput
                  value={downPayment}
                  onChange={setDownPayment}
                  className="h-11"
                />
              </div>

              {/* Monthly Income */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Monthly Gross Income</Label>
                <MoneyInput
                  value={monthlyIncome}
                  onChange={setMonthlyIncome}
                  className="h-11"
                  placeholder="Required"
                />
              </div>

              {/* Credit Tier */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Credit Tier</Label>
                <select
                  value={creditTier}
                  onChange={(e) => setCreditTier(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                >
                  {CREDIT_TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.label} ({tier.scoreRange}) – ~{(tier.typicalRate * 100).toFixed(1)}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Term Length */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Loan Term</Label>
                <select
                  value={termMonths}
                  onChange={(e) => setTermMonths(parseInt(e.target.value, 10))}
                  className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                >
                  {LOAN_TERMS.map((term) => (
                    <option key={term} value={term}>
                      {term} months ({(term / 12).toFixed(1)} years)
                    </option>
                  ))}
                </select>
              </div>

              {/* Fixed Obligations */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-1">
                  Other Obligations
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rent/mortgage, child support, other loan payments</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <MoneyInput
                  value={fixedObligations}
                  onChange={setFixedObligations}
                  className="h-11"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Results Section */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="border-t pt-6 space-y-6"
                >
                  {/* 1. The Payment */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Estimated Monthly Payment</p>
                    <p className="text-5xl font-bold text-primary font-mono">
                      {formatCurrency(result.monthlyPayment)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {formatCurrency(result.loanAmount)} financed at{" "}
                      {formatPercent(selectedCreditTier.typicalRate * 100, 1)} for {termMonths} months
                    </p>
                  </div>

                  {/* 2. The Verdict */}
                  <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-muted/30">
                    <VerdictBadge verdict={result.verdict} />
                    <p className="text-center text-sm max-w-lg">{result.verdictExplanation}</p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <Percent className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold font-mono">
                        {formatPercent(result.paymentToIncomeRatio)}
                      </p>
                      <p className="text-xs text-muted-foreground">of income</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <TrendingDown className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold font-mono">
                        {formatPercent(result.debtToIncomeWithCar)}
                      </p>
                      <p className="text-xs text-muted-foreground">total DTI</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <DollarSign className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold font-mono">
                        {formatCurrency(result.remainingAfterPayment)}
                      </p>
                      <p className="text-xs text-muted-foreground">left monthly</p>
                    </div>
                  </div>

                  {/* 3. Stress Driver Breakdown */}
                  {result.stressDrivers.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        What Actually Matters
                      </h3>
                      <div className="grid gap-3">
                        {result.stressDrivers.map((driver) => (
                          <StressDriverCard key={driver.id} driver={driver} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Micro-Scenarios */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm">What If...</h3>
                    <div className="grid gap-2">
                      <ScenarioToggle
                        label="Income drops 10%?"
                        scenario={result.scenarios.incomeDrops10}
                        isActive={activeScenario === "income"}
                        onClick={() =>
                          setActiveScenario(activeScenario === "income" ? null : "income")
                        }
                      />
                      <ScenarioToggle
                        label="Insurance is higher?"
                        scenario={result.scenarios.higherInsurance}
                        isActive={activeScenario === "insurance"}
                        onClick={() =>
                          setActiveScenario(activeScenario === "insurance" ? null : "insurance")
                        }
                      />
                      <ScenarioToggle
                        label="Term is extended?"
                        scenario={result.scenarios.longerTerm}
                        isActive={activeScenario === "term"}
                        onClick={() =>
                          setActiveScenario(activeScenario === "term" ? null : "term")
                        }
                      />
                    </div>
                  </div>

                  {/* Conversion Actions - Trust, not pressure */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Save Scenario
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Mail className="h-4 w-4" />
                      Email Breakdown
                    </Button>
                    <Link href="/auto">
                      <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Compare Safer Option
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prompt if no income entered */}
            {!result && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Enter your monthly income to see your payment comfort verdict.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related Vehicles */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Compare Other Vehicles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {getPopularVehicles(8)
              .filter((v) => v.slug !== vehicleSlug)
              .slice(0, 4)
              .map((v) => (
                <Link key={v.slug} href={`/auto-payment/${v.slug}`}>
                  <div className="p-3 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer">
                    <p className="font-medium text-sm truncate">{formatVehicleName(v)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(getVehicleMidpointPrice(v))}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* Internal Links - Concept pages */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link href="/blog/how-much-car-can-i-afford">
            <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all">
              <h3 className="font-medium text-sm mb-1">What is a comfortable auto payment?</h3>
              <p className="text-xs text-muted-foreground">
                The 8-12% rule and why approval ≠ affordability
              </p>
            </div>
          </Link>
          <Link href="/auto">
            <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all">
              <h3 className="font-medium text-sm mb-1">Income-based car budget</h3>
              <p className="text-xs text-muted-foreground">
                Start with your income, not the car
              </p>
            </div>
          </Link>
          <Link href="/calculator">
            <div className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all">
              <h3 className="font-medium text-sm mb-1">Calculate your annual income</h3>
              <p className="text-xs text-muted-foreground">
                Know your numbers before car shopping
              </p>
            </div>
          </Link>
        </div>

        {/* FAQ */}
        {faqs.length > 0 && <FAQ items={faqs} className="mb-8" />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Autolytiq. For estimation purposes only.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link
                href="/privacy"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
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
