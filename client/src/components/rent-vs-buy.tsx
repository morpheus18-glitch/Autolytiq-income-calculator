import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Home, Key, TrendingUp, Calendar, DollarSign, ArrowRight, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RentVsBuyProps {
  className?: string;
  initialRent?: number;
  initialHomePrice?: number;
  initialDownPercent?: number;
  initialRate?: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

interface YearlyData {
  year: number;
  rentCumulative: number;
  buyCumulative: number;
  homeEquity: number;
  homeValue: number;
  loanBalance: number;
  netWorthBuying: number;
  netWorthRenting: number;
}

export function RentVsBuyCalculator({
  className,
  initialRent = 1500,
  initialHomePrice = 350000,
  initialDownPercent = 20,
  initialRate = 6.5,
}: RentVsBuyProps) {
  // Rent inputs
  const [monthlyRent, setMonthlyRent] = useState(initialRent.toString());
  const [rentIncrease, setRentIncrease] = useState("3"); // Annual rent increase %

  // Buy inputs
  const [homePrice, setHomePrice] = useState(initialHomePrice.toString());
  const [downPercent, setDownPercent] = useState(initialDownPercent.toString());
  const [mortgageRate, setMortgageRate] = useState(initialRate.toString());
  const [homeAppreciation, setHomeAppreciation] = useState("3"); // Annual appreciation %
  const [propertyTaxRate, setPropertyTaxRate] = useState("1.2");
  const [maintenancePercent, setMaintenancePercent] = useState("1"); // Annual maintenance as % of home value

  // Investment assumption for renting scenario
  const [investmentReturn, setInvestmentReturn] = useState("7"); // If renting, what return on down payment

  const analysis = useMemo(() => {
    const rent = parseFloat(monthlyRent) || 0;
    const rentIncr = parseFloat(rentIncrease) / 100 || 0.03;
    const price = parseFloat(homePrice) || 0;
    const down = (parseFloat(downPercent) / 100) || 0.2;
    const rate = (parseFloat(mortgageRate) / 100) || 0.065;
    const appreciation = parseFloat(homeAppreciation) / 100 || 0.03;
    const propTax = parseFloat(propertyTaxRate) / 100 || 0.012;
    const maintenance = parseFloat(maintenancePercent) / 100 || 0.01;
    const investReturn = parseFloat(investmentReturn) / 100 || 0.07;

    if (rent <= 0 || price <= 0) {
      return { breakevenYear: null, yearlyData: [], summary: null };
    }

    const downPayment = price * down;
    const loanAmount = price - downPayment;
    const monthlyRate = rate / 12;
    const numPayments = 30 * 12;

    // Calculate monthly P&I
    const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const yearlyData: YearlyData[] = [];
    let breakevenYear: number | null = null;

    let rentCumulative = 0;
    let buyCumulative = downPayment; // Initial investment
    let currentRent = rent;
    let currentHomeValue = price;
    let loanBalance = loanAmount;
    let investmentBalance = downPayment; // If renting, invest the down payment

    // Closing costs (approximately 3% for buying)
    const closingCosts = price * 0.03;
    buyCumulative += closingCosts;

    for (let year = 1; year <= 30; year++) {
      // Rent scenario
      const yearlyRent = currentRent * 12;
      rentCumulative += yearlyRent;

      // Investment grows if renting
      investmentBalance = investmentBalance * (1 + investReturn);
      // Also invest the difference if buying costs more
      const monthlyBuyCost = monthlyPI + (currentHomeValue * propTax / 12) +
        (currentHomeValue * maintenance / 12);
      const monthlySavings = Math.max(0, monthlyBuyCost - currentRent);
      investmentBalance += monthlySavings * 12 * (1 + investReturn / 2); // Approximate mid-year investment

      // Buy scenario
      const yearlyMortgage = monthlyPI * 12;
      const yearlyTax = currentHomeValue * propTax;
      const yearlyMaintenance = currentHomeValue * maintenance;
      const yearlyInsurance = currentHomeValue * 0.005; // ~0.5% for insurance

      buyCumulative += yearlyMortgage + yearlyTax + yearlyMaintenance + yearlyInsurance;

      // Home appreciates
      currentHomeValue = currentHomeValue * (1 + appreciation);

      // Calculate remaining loan balance (simplified)
      const paymentsThisYear = 12;
      for (let m = 0; m < paymentsThisYear; m++) {
        const interestPayment = loanBalance * monthlyRate;
        const principalPayment = monthlyPI - interestPayment;
        loanBalance = Math.max(0, loanBalance - principalPayment);
      }

      // Home equity = home value - loan balance
      const homeEquity = currentHomeValue - loanBalance;

      // Net worth comparison
      // Renting: Investment balance
      // Buying: Home equity minus selling costs (6% realtor fees)
      const sellingCosts = currentHomeValue * 0.06;
      const netWorthBuying = homeEquity - sellingCosts;
      const netWorthRenting = investmentBalance;

      yearlyData.push({
        year,
        rentCumulative,
        buyCumulative,
        homeEquity,
        homeValue: currentHomeValue,
        loanBalance,
        netWorthBuying,
        netWorthRenting,
      });

      // Check for breakeven (when buying net worth exceeds renting net worth)
      if (breakevenYear === null && netWorthBuying > netWorthRenting) {
        breakevenYear = year;
      }

      // Increase rent for next year
      currentRent = currentRent * (1 + rentIncr);
    }

    // Summary at key intervals
    const year5 = yearlyData[4];
    const year10 = yearlyData[9];
    const year30 = yearlyData[29];

    return {
      breakevenYear,
      yearlyData,
      summary: {
        downPayment,
        monthlyMortgage: monthlyPI,
        closingCosts,
        year5,
        year10,
        year30,
      },
    };
  }, [monthlyRent, rentIncrease, homePrice, downPercent, mortgageRate,
    homeAppreciation, propertyTaxRate, maintenancePercent, investmentReturn]);

  return (
    <Card className={cn("glass-card border-none shadow-xl", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          Rent vs. Buy Breakeven Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Rent Side */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-500">
              <Key className="h-4 w-4" />
              Renting Scenario
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Monthly Rent</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(e.target.value)}
                    className="pl-7"
                    placeholder="1500"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  Annual Rent Increase
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">Average rent increases 3-5% annually</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={rentIncrease}
                    onChange={(e) => setRentIncrease(e.target.value)}
                    className="pr-7"
                    placeholder="3"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  Investment Return (on down payment)
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">If renting, you could invest your down payment. S&P 500 averages ~10% historically, 7% after inflation.</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={investmentReturn}
                    onChange={(e) => setInvestmentReturn(e.target.value)}
                    className="pr-7"
                    placeholder="7"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Buy Side */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-500">
              <Home className="h-4 w-4" />
              Buying Scenario
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Home Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={homePrice}
                    onChange={(e) => setHomePrice(e.target.value)}
                    className="pl-7"
                    placeholder="350000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Down Payment</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={downPercent}
                      onChange={(e) => setDownPercent(e.target.value)}
                      className="pr-7"
                      placeholder="20"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Mortgage Rate</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      value={mortgageRate}
                      onChange={(e) => setMortgageRate(e.target.value)}
                      className="pr-7"
                      placeholder="6.5"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Home Appreciation</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={homeAppreciation}
                      onChange={(e) => setHomeAppreciation(e.target.value)}
                      className="pr-7"
                      placeholder="3"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Property Tax</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      value={propertyTaxRate}
                      onChange={(e) => setPropertyTaxRate(e.target.value)}
                      className="pr-7"
                      placeholder="1.2"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {analysis.summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Breakeven Result */}
            <div className={cn(
              "p-4 rounded-xl text-center",
              analysis.breakevenYear
                ? analysis.breakevenYear <= 5
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : analysis.breakevenYear <= 10
                    ? "bg-amber-500/10 border border-amber-500/20"
                    : "bg-red-500/10 border border-red-500/20"
                : "bg-red-500/10 border border-red-500/20"
            )}>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Breakeven Point
              </div>
              {analysis.breakevenYear ? (
                <>
                  <div className={cn(
                    "text-3xl font-bold",
                    analysis.breakevenYear <= 5
                      ? "text-emerald-500"
                      : analysis.breakevenYear <= 10
                        ? "text-amber-500"
                        : "text-red-500"
                  )}>
                    {analysis.breakevenYear} Years
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {analysis.breakevenYear <= 5
                      ? "Buying makes sense if you plan to stay 5+ years"
                      : analysis.breakevenYear <= 10
                        ? "Consider your long-term plans carefully"
                        : "Renting may be better unless you're staying very long-term"}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-red-500">30+ Years</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Renting appears to be the better financial choice in this scenario
                  </div>
                </>
              )}
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">Timeline</th>
                    <th className="text-right py-2 text-blue-500 font-medium">Rent (Net Worth)</th>
                    <th className="text-right py-2 text-emerald-500 font-medium">Buy (Net Worth)</th>
                    <th className="text-right py-2 text-muted-foreground font-medium">Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "5 Years", data: analysis.summary.year5 },
                    { label: "10 Years", data: analysis.summary.year10 },
                    { label: "30 Years", data: analysis.summary.year30 },
                  ].map(({ label, data }) => {
                    const diff = data.netWorthBuying - data.netWorthRenting;
                    const buyWins = diff > 0;
                    return (
                      <tr key={label} className="border-b border-border/50">
                        <td className="py-2 font-medium">{label}</td>
                        <td className="py-2 text-right font-mono">{formatCurrency(data.netWorthRenting)}</td>
                        <td className="py-2 text-right font-mono">{formatCurrency(data.netWorthBuying)}</td>
                        <td className={cn(
                          "py-2 text-right font-mono",
                          buyWins ? "text-emerald-500" : "text-blue-500"
                        )}>
                          {buyWins ? "+" : ""}{formatCurrency(diff)}
                          <span className="text-xs ml-1">
                            {buyWins ? "(Buy)" : "(Rent)"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Key Numbers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="text-xs text-muted-foreground">Down Payment</div>
                <div className="font-bold font-mono">{formatCurrency(analysis.summary.downPayment)}</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="text-xs text-muted-foreground">Monthly P&I</div>
                <div className="font-bold font-mono">{formatCurrency(analysis.summary.monthlyMortgage)}</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="text-xs text-muted-foreground">Closing Costs</div>
                <div className="font-bold font-mono">{formatCurrency(analysis.summary.closingCosts)}</div>
              </div>
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <div className="text-xs text-muted-foreground">Home Value (30yr)</div>
                <div className="font-bold font-mono">{formatCurrency(analysis.summary.year30.homeValue)}</div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground">
              This calculator provides estimates for comparison purposes. Actual costs vary based on location,
              market conditions, maintenance needs, and personal circumstances. Consult a financial advisor
              for personalized advice.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
