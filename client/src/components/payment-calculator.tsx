import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Car, DollarSign, Percent, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/money-input";
import { cn } from "@/lib/utils";

interface PaymentCalculatorProps {
  maxAffordablePayment?: number;
}

const LOAN_TERMS = [36, 48, 60, 72, 84];
const DEFAULT_APR = 7.99;

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

export function PaymentCalculator({ maxAffordablePayment }: PaymentCalculatorProps) {
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [apr, setApr] = useState(DEFAULT_APR.toString());
  const [selectedTerm, setSelectedTerm] = useState(60);

  const price = parseFloat(vehiclePrice) || 0;
  const down = parseFloat(downPayment) || 0;
  const rate = parseFloat(apr) || DEFAULT_APR;
  const loanAmount = Math.max(0, price - down);

  const monthlyPayment = loanAmount > 0
    ? calculateMonthlyPayment(loanAmount, rate, selectedTerm)
    : 0;

  const totalInterest = monthlyPayment * selectedTerm - loanAmount;
  const totalCost = monthlyPayment * selectedTerm;

  const isAffordable = maxAffordablePayment ? monthlyPayment <= maxAffordablePayment : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <Card className="glass-card border-none shadow-xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Payment Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Vehicle Price */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Car className="h-3.5 w-3.5 text-muted-foreground" />
              Vehicle Price
            </Label>
            <MoneyInput
              value={vehiclePrice}
              onChange={setVehiclePrice}
              className="h-11"
            />
          </div>

          {/* Down Payment */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              Down Payment
            </Label>
            <MoneyInput
              value={downPayment}
              onChange={setDownPayment}
              className="h-11"
            />
          </div>

          {/* APR */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Percent className="h-3.5 w-3.5 text-muted-foreground" />
              Interest Rate (APR)
            </Label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={apr}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d.]/g, "");
                  if ((val.match(/\./g) || []).length <= 1) {
                    setApr(val);
                  }
                }}
                className={cn(
                  "w-full h-11 px-3 pr-8 rounded-lg border bg-background font-mono text-base",
                  "elite-input focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                )}
                placeholder="7.99"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                %
              </span>
            </div>
          </div>

          {/* Loan Term */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Loan Term
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {LOAN_TERMS.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setSelectedTerm(term)}
                  className={cn(
                    "py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200",
                    "border",
                    selectedTerm === term
                      ? "bg-primary text-primary-foreground border-primary neon-border"
                      : "bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-primary/30"
                  )}
                >
                  {term}mo
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {loanAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3 pt-2"
            >
              {/* Monthly Payment - Hero */}
              <div
                className={cn(
                  "hero-stat text-center",
                  !isAffordable && "border-destructive/50"
                )}
              >
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Monthly Payment
                </div>
                <div
                  className={cn(
                    "text-3xl font-bold mono-value",
                    isAffordable ? "text-primary neon-text" : "text-destructive"
                  )}
                >
                  {formatCurrency(monthlyPayment)}
                  <span className="text-lg font-normal text-muted-foreground">/mo</span>
                </div>
                {maxAffordablePayment && (
                  <div
                    className={cn(
                      "text-xs mt-2",
                      isAffordable ? "text-primary/80" : "text-destructive"
                    )}
                  >
                    {isAffordable
                      ? `Within your budget (max ${formatCurrency(maxAffordablePayment)}/mo)`
                      : `Exceeds your budget by ${formatCurrency(monthlyPayment - maxAffordablePayment)}/mo`}
                  </div>
                )}
              </div>

              {/* Breakdown Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="stat-card text-center">
                  <div className="text-xs text-muted-foreground">Loan Amount</div>
                  <div className="text-sm font-bold mono-value mt-1">
                    {formatCurrency(loanAmount)}
                  </div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-xs text-muted-foreground">Total Interest</div>
                  <div className="text-sm font-bold mono-value mt-1 text-yellow-500">
                    {formatCurrency(totalInterest)}
                  </div>
                </div>
                <div className="stat-card text-center">
                  <div className="text-xs text-muted-foreground">Total Cost</div>
                  <div className="text-sm font-bold mono-value mt-1">
                    {formatCurrency(totalCost)}
                  </div>
                </div>
              </div>

              {/* Quick Term Comparison */}
              <div className="pt-2">
                <div className="text-xs text-muted-foreground mb-2">Quick Comparison</div>
                <div className="space-y-1">
                  {[48, 60, 72].map((term) => {
                    const payment = calculateMonthlyPayment(loanAmount, rate, term);
                    const interest = payment * term - loanAmount;
                    const affordable = maxAffordablePayment ? payment <= maxAffordablePayment : true;
                    return (
                      <div
                        key={term}
                        className={cn(
                          "flex items-center justify-between py-1.5 px-2 rounded-md text-sm",
                          term === selectedTerm && "bg-primary/10"
                        )}
                      >
                        <span className="text-muted-foreground">{term} months</span>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "font-mono font-medium",
                              affordable ? "text-foreground" : "text-destructive"
                            )}
                          >
                            {formatCurrency(payment)}/mo
                          </span>
                          <span className="text-xs text-yellow-500/80">
                            +{formatCurrency(interest)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {loanAmount === 0 && (
            <div className="text-center py-6 text-muted-foreground/50">
              <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Enter vehicle details to calculate payment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
