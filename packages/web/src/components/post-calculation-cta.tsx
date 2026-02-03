import { Link } from "wouter";
import { motion } from "framer-motion";
import { Car, Home, PiggyBank, ChevronRight, TrendingUp, CreditCard, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";

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
      external: false,
    },
    {
      icon: Home,
      label: "Housing",
      description: `Max rent: ${formatCurrency(maxRent)}/mo`,
      href: "/housing",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      external: false,
    },
    {
      icon: PiggyBank,
      label: "Budget Planner",
      description: `Save ${formatCurrency(recommendedSavings)}/mo`,
      href: "/smart-money",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      external: false,
    },
  ];

  const handleCreditKarmaClick = () => {
    analytics.affiliateClick("Credit Karma", "credit", "https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202", "/calculator");
  };

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

      {/* Credit Karma CTA */}
      <motion.a
        href="https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202"
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleCreditKarmaClick}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-4 group block p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <CreditCard className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-emerald-400">Know your income. Now know your credit.</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">FREE</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Check your credit score free with Credit Karma - no credit card required</p>
          </div>
          <ExternalLink className="h-4 w-4 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
        </div>
      </motion.a>
    </motion.div>
  );
}
