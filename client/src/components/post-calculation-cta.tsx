import { Link } from "wouter";
import { motion } from "framer-motion";
import { Car, Home, PiggyBank, ChevronRight, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostCalculationCTAProps {
  annualIncome: number;
  monthlyIncome: number;
  className?: string;
}

export function PostCalculationCTA({ annualIncome, monthlyIncome, className }: PostCalculationCTAProps) {
  const maxCarPayment = monthlyIncome * 0.12;
  const maxRent = monthlyIncome * 0.30;
  const recommendedSavings = monthlyIncome * 0.20;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const suggestions = [
    {
      icon: Car,
      label: "Auto Guide",
      description: `Max car payment: ${formatCurrency(maxCarPayment)}/mo`,
      href: "/auto",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: Home,
      label: "Housing",
      description: `Max rent: ${formatCurrency(maxRent)}/mo`,
      href: "/housing",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      icon: PiggyBank,
      label: "Budget Planner",
      description: `Save ${formatCurrency(recommendedSavings)}/mo`,
      href: "/smart-money",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={cn("", className)}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Based on your income, here's what you can afford:</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {suggestions.map((item, index) => (
          <Link key={item.href} href={item.href}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg", item.bgColor)}>
                  <item.icon className={cn("h-4 w-4", item.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{item.label}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
