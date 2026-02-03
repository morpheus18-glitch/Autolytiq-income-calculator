import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, Trophy, Star, CreditCard, PiggyBank, Car, Wallet, TrendingUp, Shield } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO, createBreadcrumbSchema } from "@/components/seo";
import { AutolytiqLogo, CheckIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { ALL_CATEGORIES, type Category } from "@/data/comparisons";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'budgeting-apps': <Wallet className="h-6 w-6" />,
  'credit-monitoring': <Shield className="h-6 w-6" />,
  'high-yield-savings': <PiggyBank className="h-6 w-6" />,
  'auto-loans': <Car className="h-6 w-6" />,
  'personal-loans': <CreditCard className="h-6 w-6" />,
  'investment-apps': <TrendingUp className="h-6 w-6" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  'budgeting-apps': 'purple',
  'credit-monitoring': 'blue',
  'high-yield-savings': 'emerald',
  'auto-loans': 'yellow',
  'personal-loans': 'pink',
  'investment-apps': 'cyan',
};

function CategoryCard({ category }: { category: Category }) {
  const winner = category.products.find(p => p.id === category.winner);
  const color = CATEGORY_COLORS[category.slug] || 'primary';

  return (
    <Link href={`/best/${category.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`group p-6 rounded-xl bg-card border-2 border-${color}-500/20 hover:border-${color}-500/50 hover:shadow-xl hover:shadow-${color}-500/10 transition-all cursor-pointer h-full`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-${color}-500/10 text-${color}-500`}>
            {CATEGORY_ICONS[category.slug] || <Star className="h-6 w-6" />}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
        </div>

        <h3 className="text-lg font-bold mb-2">{category.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {category.description}
        </p>

        {winner && (
          <div className="pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-muted-foreground">Our Top Pick</span>
            </div>
            <div className="font-semibold">{winner.name}</div>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    star <= winner.rating
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">{winner.rating}</span>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          {category.products.length} products compared
        </div>
      </motion.div>
    </Link>
  );
}

function BestIndex() {
  const categories = Object.values(ALL_CATEGORIES);

  const seoData = {
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Best Of", url: "https://autolytiqs.com/best" },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Best Financial Tools 2026 | Compare Apps & Services"
        description="Compare the best budgeting apps, credit monitoring services, high-yield savings accounts, and investment apps. Expert reviews and head-to-head comparisons."
        canonical="https://autolytiqs.com/best"
        keywords="best budgeting apps 2026, best credit monitoring, best high yield savings, best investment apps, financial tools comparison"
        structuredData={seoData.breadcrumbs}
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
            <Link href="/calculator" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Calculator</Link>
            <Link href="/afford" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Salary Guides</Link>
            <span className="text-sm font-medium text-primary">Best Of</span>
            <Link href="/compare" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Compare</Link>
            <Link href="/blog" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Blog</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden md:flex" />
            <Link href="/calculator">
              <Button size="sm" className="hidden md:flex">Calculator</Button>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Trophy className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">Expert Comparisons</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Best <span className="text-primary">Financial Tools</span> 2026
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            We've tested and compared the top financial apps and services
            to help you make the best choice for your money.
          </p>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Expert Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Updated for 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Unbiased Analysis</span>
            </div>
          </div>
        </motion.div>

        {/* Category Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <CategoryCard category={category} />
            </motion.div>
          ))}
        </motion.div>

        {/* VS Comparisons CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Head-to-Head Comparisons</h2>
                  <p className="text-muted-foreground">
                    Can't decide between two options? Check out our detailed VS comparisons.
                  </p>
                </div>
                <Link href="/compare">
                  <Button size="lg" variant="outline" className="group whitespace-nowrap">
                    View All Comparisons
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/50">
                {[
                  { title: "YNAB vs Mint", slug: "ynab-vs-mint" },
                  { title: "Credit Karma vs Experian", slug: "credit-karma-vs-experian" },
                  { title: "SoFi vs Marcus", slug: "sofi-vs-marcus" },
                  { title: "Robinhood vs Acorns", slug: "robinhood-vs-acorns" },
                ].map((comparison) => (
                  <Link key={comparison.slug} href={`/compare/${comparison.slug}`}>
                    <div className="p-3 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all cursor-pointer text-center">
                      <span className="text-sm font-medium">{comparison.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* SEO Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="prose prose-invert max-w-4xl mx-auto mt-12"
        >
          <h2>How We Evaluate Financial Products</h2>
          <p>
            Our team evaluates each product based on features, pricing, ease of use,
            customer support, and value for money. We actually test the products
            ourselves and consider feedback from real users.
          </p>

          <h3>Our Rating Criteria</h3>
          <ul>
            <li><strong>Features:</strong> Does it have the tools you need?</li>
            <li><strong>Pricing:</strong> Is it fairly priced for what you get?</li>
            <li><strong>Ease of Use:</strong> How intuitive is the interface?</li>
            <li><strong>Support:</strong> Can you get help when you need it?</li>
            <li><strong>Security:</strong> Is your data and money protected?</li>
          </ul>

          <h3>Affiliate Disclosure</h3>
          <p>
            Some of the products featured on this page are from companies that
            compensate us. This compensation may affect how and where products
            appear on this site. However, this does not influence our evaluations.
            Our opinions are our own.
          </p>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Autolytiq. Comparisons updated for 2026.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/calculator" className="text-muted-foreground hover:text-foreground transition-colors">Calculator</Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default BestIndex;
