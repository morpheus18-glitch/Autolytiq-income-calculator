import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, DollarSign, TrendingUp, Calculator } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO, createBreadcrumbSchema } from "@/components/seo";
import { AutolytiqLogo, CheckIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import {
  SALARY_LEVELS,
  calculateAffordability,
  type AffordabilityData,
} from "@/data/affordability-data";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Group salaries into tiers
const SALARY_TIERS = [
  { label: "Entry Level", range: "$30K - $50K", min: 30000, max: 50000, color: "blue" },
  { label: "Mid Career", range: "$55K - $80K", min: 55000, max: 80000, color: "purple" },
  { label: "Senior Level", range: "$85K - $120K", min: 85000, max: 120000, color: "emerald" },
  { label: "Executive", range: "$150K - $200K", min: 150000, max: 200000, color: "yellow" },
];

function SalaryCard({ data }: { data: AffordabilityData }) {
  return (
    <Link href={`/afford/${data.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="group p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="text-xl font-bold">{data.salaryFormatted}</div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Take-Home</div>
            <div className="font-mono font-medium text-emerald-500">
              {formatCurrency(data.takeHomePay)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Monthly Net</div>
            <div className="font-mono font-medium">{formatCurrency(data.monthlyNet)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Max Rent</div>
            <div className="font-mono font-medium text-primary">{formatCurrency(data.maxRent)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Save/Month</div>
            <div className="font-mono font-medium text-blue-500">{formatCurrency(data.savings)}</div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function AffordIndex() {
  const allAffordabilityData = SALARY_LEVELS.map(calculateAffordability);

  const seoData = {
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Salary Budget Guides", url: "https://autolytiqs.com/afford" },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Salary Budget Calculator 2026 | Budget by Income Level"
        description="Free budget calculators for every salary level. See take-home pay, 50/30/20 budget breakdown, and affordability limits for salaries from $30K to $200K."
        canonical="https://autolytiqs.com/afford"
        keywords="salary budget calculator, budget by income, 50k salary budget, 75k salary budget, 100k salary budget, take home pay calculator"
        structuredData={seoData.breadcrumbs}
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[200px] h-[200px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

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
            <Link href="/calculator" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Calculator</Link>
            <Link href="/smart-money" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Budget</Link>
            <span className="text-sm font-medium text-primary">Salary Guides</span>
            <Link href="/blog" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Blog</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden md:flex" />
            <Link href="/calculator">
              <Button size="sm" className="hidden md:flex">
                <Calculator className="h-4 w-4 mr-1" />
                Calculator
              </Button>
            </Link>
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Budget by Salary Level</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How to <span className="text-primary">Budget</span> Your Salary
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Complete budget breakdowns for every income level. See your take-home pay,
            50/30/20 allocation, and what you can afford.
          </p>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">20 salary levels</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Tax estimates included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Affordability limits</span>
            </div>
          </div>
        </motion.div>

        {/* Salary Tiers */}
        {SALARY_TIERS.map((tier, tierIndex) => {
          const tierSalaries = allAffordabilityData.filter(
            (d) => d.salary >= tier.min && d.salary <= tier.max
          );

          return (
            <motion.div
              key={tier.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + tierIndex * 0.1 }}
              className="mb-8"
            >
              <Card className="glass-card border-none shadow-xl overflow-hidden">
                <CardHeader className={`pb-3 bg-gradient-to-r from-${tier.color}-500/10 to-transparent`}>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-${tier.color}-500/10`}>
                      <TrendingUp className={`h-5 w-5 text-${tier.color}-500`} />
                    </div>
                    {tier.label}
                    <span className="ml-auto text-sm font-normal text-muted-foreground">
                      {tier.range}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tierSalaries.map((data) => (
                      <SalaryCard key={data.salary} data={data} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center py-12"
        >
          <Card className="glass-card border-2 border-primary/30 shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-3">
                Don't See Your Salary?
              </h2>
              <p className="text-muted-foreground mb-6">
                Use our calculator to get personalized budget breakdowns for any income amount.
              </p>
              <Link href="/calculator">
                <Button size="lg" className="group">
                  <Calculator className="h-5 w-5 mr-2" />
                  Open Income Calculator
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* SEO Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="prose prose-invert max-w-4xl mx-auto mt-12"
        >
          <h2>Understanding the 50/30/20 Budget Rule</h2>
          <p>
            The 50/30/20 budget rule is a simple framework for managing your money.
            It suggests allocating 50% of your after-tax income to needs, 30% to wants,
            and 20% to savings and debt repayment.
          </p>

          <h3>Needs (50%)</h3>
          <p>
            Essentials you can't live without: housing, utilities, groceries, insurance,
            minimum debt payments, and transportation to work.
          </p>

          <h3>Wants (30%)</h3>
          <p>
            Non-essentials that improve quality of life: dining out, entertainment,
            hobbies, subscriptions, and shopping.
          </p>

          <h3>Savings (20%)</h3>
          <p>
            Building financial security: emergency fund, retirement contributions (401k, IRA),
            extra debt payments, and investment accounts.
          </p>

          <h2>Affordability Guidelines</h2>
          <ul>
            <li><strong>Rent:</strong> Maximum 30% of gross monthly income</li>
            <li><strong>Mortgage:</strong> Maximum 28% of gross income (front-end DTI)</li>
            <li><strong>Car Payment:</strong> Maximum 10-15% of gross income (including insurance)</li>
            <li><strong>Total Debt:</strong> Maximum 36% of gross income (back-end DTI)</li>
          </ul>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Autolytiq. For estimation purposes only.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/calculator" className="text-muted-foreground hover:text-foreground transition-colors">
                Calculator
              </Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AffordIndex;
