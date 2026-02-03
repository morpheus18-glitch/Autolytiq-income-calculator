import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  CreditCard,
  Calculator,
  PiggyBank,
  Home,
  Car,
  TrendingUp,
  Shield,
  ExternalLink,
  ChevronRight,
  Star,
  CheckCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { AutolytiqLogo, CheckIcon } from "@/components/icons";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

// Featured partner - Credit Karma
const FEATURED_PARTNER = {
  name: "Credit Karma",
  description: "Free credit scores, reports & monitoring. See your credit score in minutes.",
  url: "https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202",
  features: [
    "Free credit scores from 2 bureaus",
    "Weekly credit monitoring",
    "Personalized recommendations",
    "No credit card required",
  ],
  tag: "Editor's Pick",
  category: "credit",
};

// Our calculators
const OUR_TOOLS = [
  {
    name: "Income Calculator",
    description: "Calculate your projected annual income from YTD earnings",
    href: "/calculator",
    icon: Calculator,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    name: "Budget Planner",
    description: "50/30/20 budget breakdown for your income",
    href: "/smart-money",
    icon: PiggyBank,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    name: "Housing Calculator",
    description: "Find out how much rent or mortgage you can afford",
    href: "/housing",
    icon: Home,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    name: "Auto Affordability",
    description: "Calculate your max car payment using the 12% rule",
    href: "/auto",
    icon: Car,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

// Partner tools
const PARTNER_TOOLS = [
  {
    name: "Credit Karma",
    description: "Free credit scores & monitoring",
    url: "https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202",
    icon: CreditCard,
    tag: "Free",
    category: "credit",
  },
  {
    name: "LendingTree",
    description: "Compare mortgage & loan rates",
    url: "https://www.lendingtree.com",
    icon: Home,
    tag: "Compare",
    category: "loans",
  },
  {
    name: "SoFi",
    description: "Banking & high-yield savings",
    url: "https://www.sofi.com",
    icon: PiggyBank,
    tag: "Banking",
    category: "finance",
  },
  {
    name: "Robinhood",
    description: "Commission-free investing",
    url: "https://join.robinhood.com",
    icon: TrendingUp,
    tag: "Free Stock",
    category: "investing",
  },
  {
    name: "Experian",
    description: "Credit reports & identity protection",
    url: "https://www.experian.com",
    icon: Shield,
    tag: "Security",
    category: "credit",
  },
  {
    name: "YNAB",
    description: "Popular budgeting app",
    url: "https://www.ynab.com",
    icon: Calculator,
    tag: "Budgeting",
    category: "budgeting",
  },
];

export default function FreeTools() {
  const handleAffiliateClick = (name: string, category: string, url: string) => {
    analytics.affiliateClick(name, category, url, "/free-tools");
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Free Financial Tools 2026 - Credit Score, Budgeting, Calculators"
        description="Free financial tools and calculators. Check your credit score free with Credit Karma, plan your budget, calculate income, and more. All free, no signup required."
        canonical="https://autolytiqs.com/free-tools"
        keywords="free financial tools, free credit score, budget calculator, income calculator, financial planning tools, credit karma free"
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="site-header">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="header-logo p-2 rounded-xl">
                <AutolytiqLogo className="h-6 w-6 text-primary" />
              </div>
              <span className="header-title text-xl">Autolytiq</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/calculator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Calculator</Link>
            <Link href="/smart-money" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Budget</Link>
            <Link href="/housing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Housing</Link>
            <Link href="/auto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Auto</Link>
            <span className="text-sm font-medium text-primary">Free Tools</span>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden md:flex" />
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">100% Free Tools</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Free <span className="text-primary">Financial Tools</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to manage your money - all free, no signup required
          </p>
        </motion.div>

        {/* Featured Partner - Credit Karma */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <a
            href={FEATURED_PARTNER.url}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={() => handleAffiliateClick(FEATURED_PARTNER.name, FEATURED_PARTNER.category, FEATURED_PARTNER.url)}
            className="block group"
          >
            <Card className="relative overflow-hidden border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-teal-500/10 hover:border-emerald-500/50 transition-all">
              {/* Background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl opacity-50" />

              <CardContent className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Left side */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-3 rounded-xl bg-emerald-500/20">
                        <CreditCard className="h-8 w-8 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold text-white">{FEATURED_PARTNER.name}</h2>
                          <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />
                            {FEATURED_PARTNER.tag}
                          </span>
                        </div>
                        <p className="text-emerald-300/80 text-sm">Partner Tool</p>
                      </div>
                    </div>
                    <p className="text-lg text-muted-foreground mb-4">{FEATURED_PARTNER.description}</p>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-2">
                      {FEATURED_PARTNER.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right side - CTA */}
                  <div className="flex flex-col items-center gap-3">
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 px-8">
                      Check Your Score Free
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground">No credit card required</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        </motion.div>

        {/* Our Calculators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Our Free Calculators
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {OUR_TOOLS.map((tool, index) => (
              <Link key={tool.href} href={tool.href}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Card className="h-full hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-5">
                      <div className={cn("p-3 rounded-xl w-fit mb-3", tool.bgColor)}>
                        <tool.icon className={cn("h-6 w-6", tool.color)} />
                      </div>
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">{tool.name}</h3>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                      <div className="flex items-center gap-1 mt-3 text-sm text-primary">
                        <span>Try it free</span>
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Partner Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Recommended Partner Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PARTNER_TOOLS.map((tool, index) => (
              <motion.a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => handleAffiliateClick(tool.name, tool.category, tool.url)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
              >
                <Card className="h-full hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group relative">
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {tool.tag}
                  </span>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-card border border-border">
                        <tool.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <h3 className="font-semibold group-hover:text-primary transition-colors">{tool.name}</h3>
                          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            We may earn a commission from partner links at no cost to you
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-2">Ready to take control of your finances?</h2>
              <p className="text-muted-foreground mb-6">Start with our income calculator - it takes 30 seconds</p>
              <Link href="/calculator">
                <Button size="lg" className="gap-2">
                  Calculate Your Income
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Autolytiq. All tools are free to use.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
