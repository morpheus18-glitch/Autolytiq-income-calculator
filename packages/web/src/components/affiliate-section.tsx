import { motion } from "framer-motion";
import { ExternalLink, CreditCard, Car, PiggyBank, TrendingUp, Briefcase, Home, GraduationCap, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AffiliateLink {
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  tag?: string;
  category: "credit" | "loans" | "investing" | "insurance";
}

// Organized by income level relevance
const affiliateLinks: AffiliateLink[] = [
  // Credit & Monitoring
  {
    name: "Credit Karma",
    description: "Free credit scores & monitoring",
    url: "https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202",
    icon: <CreditCard className="h-5 w-5" />,
    tag: "Free",
    category: "credit",
  },
  {
    name: "Experian",
    description: "Credit reports & identity protection",
    url: "https://www.experian.com/consumer-products/free-credit-report.html",
    icon: <Shield className="h-5 w-5" />,
    category: "credit",
  },
  // Loans & Refinancing
  {
    name: "LendingTree",
    description: "Compare rates from multiple lenders",
    url: "https://www.lendingtree.com",
    icon: <Home className="h-5 w-5" />,
    tag: "Top Pick",
    category: "loans",
  },
  {
    name: "SoFi",
    description: "Student & personal loan refinancing",
    url: "https://www.sofi.com/personal-loans",
    icon: <GraduationCap className="h-5 w-5" />,
    category: "loans",
  },
  // Investing
  {
    name: "Robinhood",
    description: "Commission-free stock trading",
    url: "https://join.robinhood.com",
    icon: <TrendingUp className="h-5 w-5" />,
    tag: "Free Stock",
    category: "investing",
  },
  {
    name: "Betterment",
    description: "Automated investing & retirement",
    url: "https://www.betterment.com",
    icon: <PiggyBank className="h-5 w-5" />,
    category: "investing",
  },
  // Auto & Insurance
  {
    name: "Progressive",
    description: "Compare auto insurance quotes",
    url: "https://www.progressive.com",
    icon: <Car className="h-5 w-5" />,
    category: "insurance",
  },
  {
    name: "Indeed",
    description: "Find higher-paying jobs",
    url: "https://www.indeed.com",
    icon: <Briefcase className="h-5 w-5" />,
    tag: "Careers",
    category: "investing",
  },
];

interface AffiliateSectionProps {
  annualIncome: number;
}

export function AffiliateSection({ annualIncome }: AffiliateSectionProps) {
  // Show different messaging based on income level
  const incomeLevel = annualIncome >= 75000 ? "high" : annualIncome >= 45000 ? "mid" : "entry";

  const getMessage = () => {
    switch (incomeLevel) {
      case "high":
        return "Maximize your financial potential";
      case "mid":
        return "Smart tools for your income level";
      default:
        return "Build your financial foundation";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="glass-card border-none shadow-xl overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-foreground">
                Financial Tools
              </h3>
              <p className="text-xs text-muted-foreground">
                {getMessage()}
              </p>
            </div>
            <span className="text-xs text-primary/70 bg-primary/10 px-2 py-1 rounded-md">
              Recommended
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {affiliateLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="group relative stat-card hover:border-primary/30 transition-all duration-300 cursor-pointer"
              >
                {link.tag && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">
                    {link.tag}
                  </span>
                )}
                <div className="flex items-start gap-3">
                  <div className="text-primary/70 group-hover:text-primary transition-colors">
                    {link.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {link.name}
                      </span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {link.description}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground/50 text-center">
            We may earn a commission from partner links
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
