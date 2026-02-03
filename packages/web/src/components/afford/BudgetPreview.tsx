import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, Calculator, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AffordabilityData } from "@/data/affordability-data";

interface BudgetPreviewProps {
  data: AffordabilityData;
  showCalculatorCTA?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function BudgetPreview({ data, showCalculatorCTA = true }: BudgetPreviewProps) {
  // Calculate suggested allocations within the "needs" budget
  const rentAllocation = Math.round(data.needs * 0.60); // ~60% of needs goes to housing
  const utilitiesAllocation = Math.round(data.needs * 0.10);
  const groceriesAllocation = Math.round(data.needs * 0.15);
  const insuranceAllocation = Math.round(data.needs * 0.10);
  const transportAllocation = Math.round(data.needs * 0.05);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="glass-card border-2 border-primary/20 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Sample Monthly Budget</h3>
              <p className="text-sm text-muted-foreground">
                How to allocate {formatCurrency(data.monthlyNet)}/month
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold mono-value text-primary">
                {data.salaryFormatted}
              </div>
              <div className="text-xs text-muted-foreground">annual salary</div>
            </div>
          </div>

          {/* Budget Table */}
          <div className="space-y-1 mb-6">
            {/* Needs Section */}
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-blue-500">NEEDS (50%)</span>
                <span className="font-bold mono-value">{formatCurrency(data.needs)}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Housing (rent/mortgage)</span>
                  <span className="mono-value">{formatCurrency(rentAllocation)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Utilities</span>
                  <span className="mono-value">{formatCurrency(utilitiesAllocation)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Groceries</span>
                  <span className="mono-value">{formatCurrency(groceriesAllocation)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Insurance (health, auto)</span>
                  <span className="mono-value">{formatCurrency(insuranceAllocation)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Transportation</span>
                  <span className="mono-value">{formatCurrency(transportAllocation)}</span>
                </div>
              </div>
            </div>

            {/* Wants Section */}
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-purple-500">WANTS (30%)</span>
                <span className="font-bold mono-value">{formatCurrency(data.wants)}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Dining & Entertainment</span>
                  <span className="mono-value">{formatCurrency(Math.round(data.wants * 0.40))}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Subscriptions & Memberships</span>
                  <span className="mono-value">{formatCurrency(Math.round(data.wants * 0.20))}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shopping & Personal</span>
                  <span className="mono-value">{formatCurrency(Math.round(data.wants * 0.25))}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Hobbies & Travel</span>
                  <span className="mono-value">{formatCurrency(Math.round(data.wants * 0.15))}</span>
                </div>
              </div>
            </div>

            {/* Savings Section */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-emerald-500">SAVINGS (20%)</span>
                <span className="font-bold mono-value">{formatCurrency(data.savings)}</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>401(k) / Retirement</span>
                  <span className="mono-value">{formatCurrency(Math.round(data.savings * 0.50))}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Emergency Fund</span>
                  <span className="mono-value">{formatCurrency(Math.round(data.savings * 0.30))}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Investments / Goals</span>
                  <span className="mono-value">{formatCurrency(Math.round(data.savings * 0.20))}</span>
                </div>
              </div>
            </div>

            {/* Total */}
            <div className="p-3 rounded-lg bg-card border-2 border-primary/30">
              <div className="flex justify-between items-center">
                <span className="font-bold">TOTAL MONTHLY</span>
                <span className="text-xl font-bold mono-value text-primary">
                  {formatCurrency(data.monthlyNet)}
                </span>
              </div>
            </div>
          </div>

          {/* Calculator CTA */}
          {showCalculatorCTA && (
            <div className="space-y-3">
              <Link href={`/calculator?salary=${data.salary}`}>
                <Button className="w-full group" size="lg">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calculate Your Exact Numbers
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <p className="text-xs text-center text-muted-foreground">
                Get personalized calculations based on your actual income
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Compact version for sidebar or related content
export function BudgetPreviewCompact({ data }: { data: AffordabilityData }) {
  return (
    <Link href={`/afford/${data.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-4 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold">{data.salaryFormatted}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-muted-foreground">Monthly</div>
            <div className="font-mono font-medium">{formatCurrency(data.monthlyNet)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Max Rent</div>
            <div className="font-mono font-medium text-primary">{formatCurrency(data.maxRent)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Save</div>
            <div className="font-mono font-medium text-emerald-500">{formatCurrency(data.savings)}</div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
