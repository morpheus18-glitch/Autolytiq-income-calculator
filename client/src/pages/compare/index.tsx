import { motion } from "framer-motion";
import { Link } from "wouter";
import { ChevronRight, Scale, Zap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO, createBreadcrumbSchema } from "@/components/seo";
import { AutolytiqLogo, CheckIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { VERSUS_COMPARISONS, type VersusComparison } from "@/data/comparisons/versus";

function ComparisonCard({ comparison }: { comparison: VersusComparison }) {
  const winnerText = comparison.verdict.winner === 'a'
    ? comparison.productA.shortName || comparison.productA.name
    : comparison.verdict.winner === 'b'
    ? comparison.productB.shortName || comparison.productB.name
    : 'Tie';

  return (
    <Link href={`/compare/${comparison.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className="group p-6 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer h-full"
      >
        {/* VS Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-lg font-bold">{comparison.productA.shortName || comparison.productA.name}</div>
            <div className="p-1.5 rounded-full bg-primary/10">
              <Scale className="h-4 w-4 text-primary" />
            </div>
            <div className="text-lg font-bold">{comparison.productB.shortName || comparison.productB.name}</div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>

        {/* Winner Badge */}
        <div className="mb-4">
          {comparison.verdict.winner !== 'tie' ? (
            <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full">
              <Zap className="h-3 w-3" />
              Winner: {winnerText}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-full">
              It Depends
            </span>
          )}
        </div>

        {/* Summary */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {comparison.verdict.summary}
        </p>

        {/* Quick Stats */}
        <div className="text-xs text-muted-foreground">
          {comparison.comparisonPoints.length} comparison points
        </div>
      </motion.div>
    </Link>
  );
}

function CompareIndex() {
  const comparisons = Object.values(VERSUS_COMPARISONS);

  const seoData = {
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Compare", url: "https://autolytiqs.com/compare" },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Financial Product Comparisons 2026 | Head-to-Head Reviews"
        description="Detailed head-to-head comparisons of popular financial products. YNAB vs Mint, Credit Karma vs Experian, and more. Find the right tool for your needs."
        canonical="https://autolytiqs.com/compare"
        keywords="ynab vs mint, credit karma vs experian, sofi vs marcus, robinhood vs acorns, financial app comparison"
        structuredData={seoData.breadcrumbs}
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />

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
            <Link href="/best" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Best Of</Link>
            <span className="text-sm font-medium text-primary">Compare</span>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Scale className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Head-to-Head</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-primary">VS</span> Comparisons
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Can't decide between two options? Our detailed head-to-head comparisons
            help you pick the winner for your specific needs.
          </p>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Side-by-side analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Clear winner verdicts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Use-case recommendations</span>
            </div>
          </div>
        </motion.div>

        {/* Comparison Grid */}
        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          {comparisons.map((comparison, index) => (
            <motion.div
              key={comparison.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <ComparisonCard comparison={comparison} />
            </motion.div>
          ))}
        </div>

        {/* Best Of CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-2 border-primary/20 shadow-xl">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">
                Want More Options?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Check out our comprehensive "Best Of" guides that compare multiple
                products in each category.
              </p>
              <Link href="/best">
                <Button size="lg" className="group">
                  Browse Best Of Guides
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
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
              <Link href="/best" className="text-muted-foreground hover:text-foreground transition-colors">Best Of</Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CompareIndex;
