/**
 * Resolution Layer - Vehicle Payment Resolution
 *
 * Purpose: Resolve post-research payment uncertainty.
 * Not for discovery. Not for education. Not for selling.
 *
 * Assumptions:
 * - User has already researched this vehicle elsewhere
 * - User knows what they want
 * - User needs only: clarity on payment viability
 */

import { useState, useMemo } from "react";
import { useParams } from "wouter";
import { ResolveLayout } from "@/components/resolve-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Mail, RotateCcw } from "lucide-react";
import {
  getVehicleBySlug,
  formatVehicleName,
  getVehicleMidpointPrice,
  CREDIT_TIERS,
  type Vehicle,
  type CreditTier,
} from "@/data/vehicles";
import {
  calculateAutoPayment,
  formatCurrency,
  type VerdictLevel,
} from "@/lib/auto-payment-calculator";

// Deterministic verdict colors - same inputs always yield same appearance
const VERDICT_STYLES: Record<VerdictLevel, { bg: string; text: string; border: string }> = {
  comfortable: {
    bg: "bg-green-500/10",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-500/30",
  },
  tight: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-600 dark:text-yellow-400",
    border: "border-yellow-500/30",
  },
  risky: {
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30",
  },
};

function VerdictDisplay({ verdict, explanation }: { verdict: VerdictLevel; explanation: string }) {
  const styles = VERDICT_STYLES[verdict];
  return (
    <div className={`p-4 rounded-lg border ${styles.bg} ${styles.border}`}>
      <div className={`text-2xl font-bold ${styles.text} capitalize`}>{verdict}</div>
      <p className="text-sm text-muted-foreground mt-1">{explanation}</p>
    </div>
  );
}

interface SavedScenario {
  timestamp: number;
  vehicleName: string;
  vehiclePrice: number;
  downPayment: number;
  loanTerm: number;
  annualIncome: number;
  creditTier: string;
  monthlyPayment: number;
  verdict: VerdictLevel;
}

function saveScenario(scenario: SavedScenario) {
  const key = "resolve_saved_scenarios";
  const existing = JSON.parse(localStorage.getItem(key) || "[]");
  existing.push(scenario);
  // Keep only last 10 scenarios
  if (existing.length > 10) existing.shift();
  localStorage.setItem(key, JSON.stringify(existing));
}

function getSavedScenarios(): SavedScenario[] {
  return JSON.parse(localStorage.getItem("resolve_saved_scenarios") || "[]");
}

function generateEmailBody(scenario: SavedScenario): string {
  return `Vehicle Payment Analysis

Vehicle: ${scenario.vehicleName}
Price: ${formatCurrency(scenario.vehiclePrice)}
Down Payment: ${formatCurrency(scenario.downPayment)}
Loan Term: ${scenario.loanTerm} months
Annual Income: ${formatCurrency(scenario.annualIncome)}
Credit Tier: ${scenario.creditTier}

Result:
Monthly Payment: ${formatCurrency(scenario.monthlyPayment)}
Verdict: ${scenario.verdict.toUpperCase()}

Generated: ${new Date(scenario.timestamp).toLocaleDateString()}`;
}

export default function ResolveVehiclePage() {
  const { vehicle: slug } = useParams<{ vehicle: string }>();
  const vehicle = slug ? getVehicleBySlug(slug) : undefined;

  // Input state
  const [vehiclePrice, setVehiclePrice] = useState<number>(
    vehicle ? getVehicleMidpointPrice(vehicle) : 35000
  );
  const [downPayment, setDownPayment] = useState<number>(
    vehicle ? Math.round(getVehicleMidpointPrice(vehicle) * 0.1) : 3500
  );
  const [loanTerm, setLoanTerm] = useState<number>(60);
  const [annualIncome, setAnnualIncome] = useState<number>(75000);
  const [selectedCreditTier, setSelectedCreditTier] = useState<CreditTier>(CREDIT_TIERS[1]);
  const [existingDebt, setExistingDebt] = useState<number>(500);

  // UI state
  const [saveConfirmed, setSaveConfirmed] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(getSavedScenarios);

  // Deterministic calculation
  const result = useMemo(() => {
    return calculateAutoPayment({
      vehiclePrice,
      downPayment,
      termMonths: loanTerm,
      creditTierId: selectedCreditTier.id,
      monthlyGrossIncome: annualIncome / 12,
      fixedObligations: existingDebt,
    });
  }, [vehiclePrice, downPayment, loanTerm, selectedCreditTier, annualIncome, existingDebt]);

  // Handle save
  const handleSave = () => {
    const scenario: SavedScenario = {
      timestamp: Date.now(),
      vehicleName: vehicle ? formatVehicleName(vehicle) : "Custom Vehicle",
      vehiclePrice,
      downPayment,
      loanTerm,
      annualIncome,
      creditTier: selectedCreditTier.label,
      monthlyPayment: result.monthlyPayment,
      verdict: result.verdict,
    };
    saveScenario(scenario);
    setSavedScenarios(getSavedScenarios());
    setSaveConfirmed(true);
    setTimeout(() => setSaveConfirmed(false), 2000);
  };

  // Handle email
  const handleEmail = () => {
    const scenario: SavedScenario = {
      timestamp: Date.now(),
      vehicleName: vehicle ? formatVehicleName(vehicle) : "Custom Vehicle",
      vehiclePrice,
      downPayment,
      loanTerm,
      annualIncome,
      creditTier: selectedCreditTier.label,
      monthlyPayment: result.monthlyPayment,
      verdict: result.verdict,
    };
    const body = encodeURIComponent(generateEmailBody(scenario));
    const subject = encodeURIComponent(`Payment Analysis: ${scenario.vehicleName}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Handle reset
  const handleReset = () => {
    if (vehicle) {
      setVehiclePrice(getVehicleMidpointPrice(vehicle));
      setDownPayment(Math.round(getVehicleMidpointPrice(vehicle) * 0.1));
    } else {
      setVehiclePrice(35000);
      setDownPayment(3500);
    }
    setLoanTerm(60);
    setAnnualIncome(75000);
    setSelectedCreditTier(CREDIT_TIERS[1]);
    setExistingDebt(500);
  };

  // Structured data - Calculator and FAQPage
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: vehicle
          ? `${formatVehicleName(vehicle)} Payment Resolution`
          : "Vehicle Payment Resolution",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How is the payment calculated?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Monthly payment is calculated using standard amortization: P = L[c(1+c)^n]/[(1+c)^n-1] where L is loan amount (${formatCurrency(vehiclePrice - downPayment)}), c is monthly rate (${(selectedCreditTier.typicalRate / 12 * 100).toFixed(3)}%), n is term (${loanTerm} months).`,
            },
          },
          {
            "@type": "Question",
            name: "How is the verdict determined?",
            acceptedAnswer: {
              "@type": "Answer",
              text: `Verdict is based on payment-to-income ratio. Under 8% = Comfortable. 8-12% = Tight. Over 12% = Risky. Current ratio: ${result.paymentToIncomeRatio.toFixed(1)}%.`,
            },
          },
        ],
      },
    ],
  };

  // Vehicle not found
  if (slug && !vehicle) {
    return (
      <ResolveLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Vehicle not found.</p>
        </div>
      </ResolveLayout>
    );
  }

  return (
    <ResolveLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Vehicle identifier - minimal, no promotional copy */}
      {vehicle && (
        <div className="mb-6">
          <h1 className="text-xl font-semibold">{formatVehicleName(vehicle)}</h1>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(vehicle.priceRangeLow)} – {formatCurrency(vehicle.priceRangeHigh)}
          </p>
        </div>
      )}

      {/* Calculator - the entry point */}
      <Card className="p-6 mb-6">
        <div className="grid gap-4">
          {/* Vehicle Price */}
          <div>
            <Label htmlFor="price">Vehicle Price</Label>
            <Input
              id="price"
              type="number"
              value={vehiclePrice}
              onChange={(e) => setVehiclePrice(Number(e.target.value))}
              min={1000}
              max={200000}
            />
          </div>

          {/* Down Payment */}
          <div>
            <Label htmlFor="down">Down Payment</Label>
            <Input
              id="down"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(Number(e.target.value))}
              min={0}
              max={vehiclePrice}
            />
          </div>

          {/* Loan Term */}
          <div>
            <Label htmlFor="term">Loan Term (months)</Label>
            <select
              id="term"
              value={loanTerm}
              onChange={(e) => setLoanTerm(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm"
            >
              <option value={36}>36 months</option>
              <option value={48}>48 months</option>
              <option value={60}>60 months</option>
              <option value={72}>72 months</option>
              <option value={84}>84 months</option>
            </select>
          </div>

          {/* Credit Tier */}
          <div>
            <Label htmlFor="credit">Credit Tier</Label>
            <select
              id="credit"
              value={selectedCreditTier.id}
              onChange={(e) => {
                const tier = CREDIT_TIERS.find((t) => t.id === e.target.value);
                if (tier) setSelectedCreditTier(tier);
              }}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm"
            >
              {CREDIT_TIERS.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.label} ({tier.scoreRange}) – {(tier.typicalRate * 100).toFixed(1)}% APR
                </option>
              ))}
            </select>
          </div>

          {/* Annual Income */}
          <div>
            <Label htmlFor="income">Annual Income (gross)</Label>
            <Input
              id="income"
              type="number"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
              min={10000}
              max={1000000}
            />
          </div>

          {/* Existing Monthly Debt */}
          <div>
            <Label htmlFor="debt">Existing Monthly Debt</Label>
            <Input
              id="debt"
              type="number"
              value={existingDebt}
              onChange={(e) => setExistingDebt(Number(e.target.value))}
              min={0}
              max={50000}
            />
          </div>
        </div>
      </Card>

      {/* Verdict - the resolution */}
      <Card className="p-6 mb-6">
        {/* Monthly Payment */}
        <div className="text-center mb-4">
          <div className="text-4xl font-bold">{formatCurrency(result.monthlyPayment)}</div>
          <div className="text-sm text-muted-foreground">/month</div>
        </div>

        {/* Verdict */}
        <VerdictDisplay verdict={result.verdict} explanation={result.verdictExplanation} />

        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div>
            <div className="text-muted-foreground">Payment/Income</div>
            <div className="font-medium">{result.paymentToIncomeRatio.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total DTI</div>
            <div className="font-medium">{result.debtToIncomeWithCar.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Interest</div>
            <div className="font-medium">{formatCurrency(result.totalInterest)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total Cost</div>
            <div className="font-medium">{formatCurrency(result.totalCost)}</div>
          </div>
        </div>
      </Card>

      {/* Allowed interactions: Save, Email, Recalculate */}
      <div className="flex gap-2 mb-6">
        <Button variant="outline" size="sm" onClick={handleSave} className="gap-1">
          <Save className="h-3 w-3" />
          {saveConfirmed ? "Saved" : "Save"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleEmail} className="gap-1">
          <Mail className="h-3 w-3" />
          Email
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>

      {/* Saved scenarios - internal resolution aid */}
      {savedScenarios.length > 0 && (
        <Card className="p-4">
          <h2 className="text-sm font-medium mb-2">Saved Scenarios</h2>
          <div className="space-y-2 text-xs">
            {savedScenarios.slice(-3).reverse().map((s, i) => (
              <div key={i} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                <span className="text-muted-foreground">
                  {formatCurrency(s.vehiclePrice)} @ {formatCurrency(s.monthlyPayment)}/mo
                </span>
                <span className={`font-medium capitalize ${VERDICT_STYLES[s.verdict].text}`}>
                  {s.verdict}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </ResolveLayout>
  );
}
