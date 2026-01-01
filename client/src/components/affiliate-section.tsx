import { motion } from "framer-motion";
import { ExternalLink, CreditCard, Car, PiggyBank, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AffiliateLink {
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  tag?: string;
}

const affiliateLinks: AffiliateLink[] = [
  {
    name: "Credit Karma",
    description: "Check your credit score for free",
    url: "https://www.creditkarma.com",
    icon: <CreditCard className="h-5 w-5" />,
    tag: "Free",
  },
  {
    name: "LendingTree",
    description: "Compare auto loan rates",
    url: "https://www.lendingtree.com/auto",
    icon: <Car className="h-5 w-5" />,
  },
  {
    name: "SoFi",
    description: "Personal loans & refinancing",
    url: "https://www.sofi.com",
    icon: <PiggyBank className="h-5 w-5" />,
  },
  {
    name: "NerdWallet",
    description: "Compare credit cards & loans",
    url: "https://www.nerdwallet.com",
    icon: <TrendingUp className="h-5 w-5" />,
    tag: "Popular",
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
