import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import {
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Calculator,
  Home,
  Car,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO, createCalculatorSchema, createBreadcrumbSchema } from "@/components/seo";
import { AutolytiqLogo, CheckIcon, WalletIcon, HousingIcon, AutoIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { analytics } from "@/lib/analytics";

import { AffordabilityBreakdown } from "@/components/afford/AffordabilityBreakdown";
import { BudgetPreview, BudgetPreviewCompact } from "@/components/afford/BudgetPreview";
import {
  getAffordabilityBySlug,
  getAllAffordabilitySlugs,
  getAffiliatesForIncome,
  getAffordabilityPageTitle,
  getAffordabilityPageDescription,
  calculateAffordability,
  SALARY_LEVELS,
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

function AffordPage() {
  const { salary } = useParams<{ salary: string }>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const data = salary ? getAffordabilityBySlug(salary) : null;

  // Get adjacent salary levels for navigation
  const allSlugs = getAllAffordabilitySlugs();
  const currentIndex = salary ? allSlugs.indexOf(salary.toLowerCase()) : -1;
  const prevSlug = currentIndex > 0 ? allSlugs[currentIndex - 1] : null;
  const nextSlug = currentIndex < allSlugs.length - 1 ? allSlugs[currentIndex + 1] : null;
  const prevData = prevSlug ? getAffordabilityBySlug(prevSlug) : null;
  const nextData = nextSlug ? getAffordabilityBySlug(nextSlug) : null;

  // Get related salary levels for sidebar
  const relatedSalaries = SALARY_LEVELS
    .filter((s) => data && Math.abs(s - data.salary) <= 30000 && s !== data.salary)
    .slice(0, 4)
    .map(calculateAffordability);

  if (!mounted) return null;

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Salary Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We don't have a budget guide for this salary level yet.
            </p>
            <Link href="/afford">
              <Button>
                Browse All Salary Guides
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const affiliates = getAffiliatesForIncome(data.salary);
  const pageTitle = getAffordabilityPageTitle(data);
  const pageDescription = getAffordabilityPageDescription(data);

  const seoData = {
    calculator: createCalculatorSchema(
      `${data.salaryFormatted} Salary Budget Calculator`,
      pageDescription,
      `https://autolytiqs.com/afford/${data.slug}`
    ),
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Salary Guides", url: "https://autolytiqs.com/afford" },
      { name: `${data.salaryFormatted} Budget`, url: `https://autolytiqs.com/afford/${data.slug}` },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonical={`https://autolytiqs.com/afford/${data.slug}`}
        keywords={`${data.slug} salary budget, budget on ${data.salaryFormatted}, ${data.slug} income budget, how to spend ${data.slug} salary, 50 30 20 budget ${data.slug}`}
        structuredData={{ "@graph": [seoData.calculator, seoData.breadcrumbs] }}
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
            <Link href="/afford" className="text-sm font-medium text-primary">Salary Guides</Link>
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
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        >
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/afford" className="hover:text-foreground transition-colors">Salary Guides</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{data.salaryFormatted}</span>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">2026 Budget Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            Budget on <span className="text-primary">{data.salaryFormatted}</span> Salary
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complete budget breakdown, take-home pay calculator, and affordability limits
            for a {data.salaryFormatted} annual income.
          </p>
        </motion.div>

        {/* Quick Stats Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
        >
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-xs text-muted-foreground mb-1">Take-Home Pay</div>
            <div className="text-xl font-bold mono-value text-emerald-500">
              {formatCurrency(data.takeHomePay)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
            <div className="text-xs text-muted-foreground mb-1">Monthly Net</div>
            <div className="text-xl font-bold mono-value text-primary">
              {formatCurrency(data.monthlyNet)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
            <div className="text-xs text-muted-foreground mb-1">Max Rent</div>
            <div className="text-xl font-bold mono-value text-blue-500">
              {formatCurrency(data.maxRent)}/mo
            </div>
          </div>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
            <div className="text-xs text-muted-foreground mb-1">Save Monthly</div>
            <div className="text-xl font-bold mono-value text-purple-500">
              {formatCurrency(data.savings)}
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AffordabilityBreakdown data={data} />
            <BudgetPreview data={data} />
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">
            {/* Calculator CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-2 border-primary/30 shadow-xl">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-primary" />
                    Get Exact Numbers
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    This is an estimate. Use our calculator with your actual pay details
                    for precise results.
                  </p>
                  <Link href={`/calculator?salary=${data.salary}`}>
                    <Button className="w-full group">
                      Open Calculator
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="glass-card border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Useful Tools</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2">
                    <Link href="/housing" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <HousingIcon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm font-medium">Housing Calculator</div>
                        <div className="text-xs text-muted-foreground">Max rent: {formatCurrency(data.maxRent)}/mo</div>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                    </Link>
                    <Link href="/auto" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <AutoIcon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm font-medium">Auto Calculator</div>
                        <div className="text-xs text-muted-foreground">Max payment: {formatCurrency(data.maxCarPayment)}/mo</div>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                    </Link>
                    <Link href="/smart-money" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <WalletIcon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="text-sm font-medium">Budget Planner</div>
                        <div className="text-xs text-muted-foreground">50/30/20 breakdown</div>
                      </div>
                      <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Affiliate Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border-none shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Recommended Tools</span>
                    <span className="text-xs font-normal text-primary/70 bg-primary/10 px-2 py-0.5 rounded">
                      For your income
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="space-y-2">
                    {affiliates.slice(0, 5).map((affiliate) => (
                      <a
                        key={affiliate.name}
                        href={affiliate.url}
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={() => analytics.affiliateClick(affiliate.name, affiliate.category, affiliate.url, `/afford/${data.slug}`)}
                        className="group flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium group-hover:text-primary transition-colors">
                              {affiliate.name}
                            </span>
                            {affiliate.tag && (
                              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                {affiliate.tag}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {affiliate.description}
                          </div>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground/50 text-center mt-3">
                    We may earn a commission from partner links
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Related Salaries */}
            {relatedSalaries.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <Card className="glass-card border-none shadow-lg">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Related Salary Guides</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-2">
                    {relatedSalaries.map((relatedData) => (
                      <BudgetPreviewCompact key={relatedData.salary} data={relatedData} />
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between mt-12 pt-8 border-t border-border/40"
        >
          {prevData ? (
            <Link href={`/afford/${prevSlug}`}>
              <Button variant="outline" className="group">
                <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {prevData.salaryFormatted}
              </Button>
            </Link>
          ) : (
            <div />
          )}
          <Link href="/afford">
            <Button variant="ghost">
              All Salary Guides
            </Button>
          </Link>
          {nextData ? (
            <Link href={`/afford/${nextSlug}`}>
              <Button variant="outline" className="group">
                {nextData.salaryFormatted}
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </motion.div>

        {/* SEO Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="prose prose-invert max-w-4xl mx-auto mt-12"
        >
          <h2>How to Budget a {data.salaryFormatted} Salary</h2>
          <p>
            Earning {data.salaryFormatted} per year puts you at approximately {formatCurrency(data.hourlyRate)} per hour
            (assuming 40 hours/week, 52 weeks/year). After federal taxes, state taxes (estimated at 5%),
            and FICA contributions, your take-home pay is approximately {formatCurrency(data.takeHomePay)}.
          </p>

          <h3>Monthly Budget Breakdown</h3>
          <p>
            With a monthly net income of {formatCurrency(data.monthlyNet)}, the 50/30/20 rule suggests:
          </p>
          <ul>
            <li><strong>Needs ({formatCurrency(data.needs)}):</strong> Housing, utilities, groceries, insurance, transportation</li>
            <li><strong>Wants ({formatCurrency(data.wants)}):</strong> Dining, entertainment, subscriptions, shopping</li>
            <li><strong>Savings ({formatCurrency(data.savings)}):</strong> Emergency fund, retirement, investments</li>
          </ul>

          <h3>What Can You Afford on {data.salaryFormatted}?</h3>
          <p>
            Following standard financial guidelines:
          </p>
          <ul>
            <li><strong>Maximum rent:</strong> {formatCurrency(data.maxRent)}/month (30% of gross)</li>
            <li><strong>Maximum mortgage payment:</strong> {formatCurrency(data.maxMortgage)}/month (28% DTI)</li>
            <li><strong>Maximum car payment:</strong> {formatCurrency(data.maxCarPayment)}/month (includes insurance)</li>
            <li><strong>Target emergency fund:</strong> {formatCurrency(data.recommendedEmergencyFund)} (3-6 months expenses)</li>
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
              <Link href="/afford" className="text-muted-foreground hover:text-foreground transition-colors">
                Salary Guides
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

export default AffordPage;
