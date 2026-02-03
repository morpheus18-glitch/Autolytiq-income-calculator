import { motion } from "framer-motion";
import { DollarSign, Home, Car, PiggyBank, CreditCard, Percent, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AffordabilityData } from "@/data/affordability-data";

interface AffordabilityBreakdownProps {
  data: AffordabilityData;
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
  return `${value.toFixed(1)}%`;
}

export function AffordabilityBreakdown({ data }: AffordabilityBreakdownProps) {
  const effectiveTaxRate = (data.totalTaxes / data.salary) * 100;
  const needsPercent = 50;
  const wantsPercent = 30;
  const savingsPercent = 20;

  return (
    <div className="space-y-6">
      {/* Income Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card border-none shadow-xl overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              Income Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Hero Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 text-center">
                <div className="text-sm text-muted-foreground mb-1">Annual Gross</div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-500 mono-value">
                  {data.salaryFormatted}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(data.hourlyRate)}/hour
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-center">
                <div className="text-sm text-muted-foreground mb-1">Take-Home Pay</div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mono-value">
                  {formatCurrency(data.takeHomePay)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  After taxes ({formatPercent(effectiveTaxRate)} effective rate)
                </div>
              </div>
            </div>

            {/* Pay Periods */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                <div className="text-xs text-muted-foreground">Monthly Gross</div>
                <div className="font-bold mono-value text-sm">{formatCurrency(data.monthlyGross)}</div>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                <div className="text-xs text-muted-foreground">Monthly Net</div>
                <div className="font-bold mono-value text-sm text-primary">{formatCurrency(data.monthlyNet)}</div>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                <div className="text-xs text-muted-foreground">Bi-weekly</div>
                <div className="font-bold mono-value text-sm">{formatCurrency(data.biweeklyPay)}</div>
              </div>
              <div className="p-3 rounded-lg bg-card border border-border/50 text-center">
                <div className="text-xs text-muted-foreground">Weekly</div>
                <div className="font-bold mono-value text-sm">{formatCurrency(data.weeklyPay)}</div>
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Percent className="h-4 w-4 text-destructive" />
                Estimated Taxes (Annual)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Federal Tax</div>
                  <div className="font-mono font-medium text-destructive">{formatCurrency(data.federalTax)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">State Tax (est.)</div>
                  <div className="font-mono font-medium text-destructive">{formatCurrency(data.stateTaxEstimate)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">FICA (SS + Med)</div>
                  <div className="font-mono font-medium text-destructive">{formatCurrency(data.ficaTax)}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-destructive/20 flex justify-between items-center">
                <span className="text-sm font-medium">Total Annual Taxes</span>
                <span className="font-bold mono-value text-destructive">{formatCurrency(data.totalTaxes)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 50/30/20 Budget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card border-none shadow-xl overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-500/5 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Wallet className="h-5 w-5 text-blue-500" />
              </div>
              50/30/20 Budget Rule
              <span className="ml-auto text-xs font-normal text-muted-foreground bg-secondary/50 px-2 py-1 rounded-full">
                Monthly
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Visual Bar */}
            <div className="h-8 rounded-full overflow-hidden flex mb-4">
              <div
                className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${needsPercent}%` }}
              >
                50% Needs
              </div>
              <div
                className="bg-purple-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${wantsPercent}%` }}
              >
                30% Wants
              </div>
              <div
                className="bg-emerald-500 flex items-center justify-center text-white text-xs font-medium"
                style={{ width: `${savingsPercent}%` }}
              >
                20% Save
              </div>
            </div>

            {/* Budget Categories */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border-2 border-blue-500/30 bg-blue-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Needs (50%)</span>
                </div>
                <div className="text-2xl font-bold mono-value text-blue-500">
                  {formatCurrency(data.needs)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Rent, utilities, groceries, insurance, minimum debt payments
                </p>
              </div>

              <div className="p-4 rounded-lg border-2 border-purple-500/30 bg-purple-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">Wants (30%)</span>
                </div>
                <div className="text-2xl font-bold mono-value text-purple-500">
                  {formatCurrency(data.wants)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Dining out, entertainment, subscriptions, hobbies, shopping
                </p>
              </div>

              <div className="p-4 rounded-lg border-2 border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="h-4 w-4 text-emerald-500" />
                  <span className="font-medium">Savings (20%)</span>
                </div>
                <div className="text-2xl font-bold mono-value text-emerald-500">
                  {formatCurrency(data.savings)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Emergency fund, retirement (401k/IRA), debt payoff, investments
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Affordability Limits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card border-none shadow-xl overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-yellow-500/5 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-yellow-500/10">
                <TrendingUp className="h-5 w-5 text-yellow-500" />
              </div>
              Affordability Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-card border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Max Rent</span>
                  <span className="ml-auto text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">30% rule</span>
                </div>
                <div className="text-xl font-bold mono-value text-primary">
                  {formatCurrency(data.maxRent)}/mo
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(data.maxRent * 12)}/year
                </p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Max Mortgage</span>
                  <span className="ml-auto text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">28% DTI</span>
                </div>
                <div className="text-xl font-bold mono-value text-blue-500">
                  {formatCurrency(data.maxMortgage)}/mo
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Front-end DTI guideline
                </p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Max Car Payment</span>
                  <span className="ml-auto text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">12% rule</span>
                </div>
                <div className="text-xl font-bold mono-value text-purple-500">
                  {formatCurrency(data.maxCarPayment)}/mo
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Including insurance
                </p>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <PiggyBank className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm font-medium">Emergency Fund</span>
                  <span className="ml-auto text-xs text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">4 months</span>
                </div>
                <div className="text-xl font-bold mono-value text-emerald-500">
                  {formatCurrency(data.recommendedEmergencyFund)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum recommended
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
