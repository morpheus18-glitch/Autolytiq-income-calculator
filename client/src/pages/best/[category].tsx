import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import {
  ChevronRight,
  ChevronLeft,
  Trophy,
  Calculator,
  ExternalLink,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO, createBreadcrumbSchema } from "@/components/seo";
import { AutolytiqLogo, CheckIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { analytics } from "@/lib/analytics";

import { ComparisonTable } from "@/components/comparison/ComparisonTable";
import { ProductCard } from "@/components/comparison/ProductCard";
import { HeroWinnerBadge } from "@/components/comparison/WinnerBadge";
import {
  getCategoryBySlug,
  getAllCategorySlugs,
  ALL_CATEGORIES,
} from "@/data/comparisons";

function BestPage() {
  const { category: categorySlug } = useParams<{ category: string }>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const category = categorySlug ? getCategoryBySlug(categorySlug) : null;

  // Get adjacent categories for navigation
  const allSlugs = getAllCategorySlugs();
  const currentIndex = categorySlug ? allSlugs.indexOf(categorySlug) : -1;
  const prevSlug = currentIndex > 0 ? allSlugs[currentIndex - 1] : null;
  const nextSlug = currentIndex < allSlugs.length - 1 ? allSlugs[currentIndex + 1] : null;
  const prevCategory = prevSlug ? getCategoryBySlug(prevSlug) : null;
  const nextCategory = nextSlug ? getCategoryBySlug(nextSlug) : null;

  if (!mounted) return null;

  if (!category) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We don't have a comparison for this category yet.
            </p>
            <Link href="/best">
              <Button>
                Browse All Categories
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winner = category.products.find(p => p.id === category.winner);
  const runnerUp = category.products.find(p => p.id === category.runnerUp);

  const seoData = {
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Best Of", url: "https://autolytiqs.com/best" },
      { name: category.name, url: `https://autolytiqs.com/best/${category.slug}` },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title={category.metaTitle}
        description={category.metaDescription}
        canonical={`https://autolytiqs.com/best/${category.slug}`}
        keywords={`best ${category.slug.replace(/-/g, ' ')}, ${category.products.map(p => p.name).join(', ')}, comparison 2026`}
        structuredData={seoData.breadcrumbs}
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[300px] h-[300px] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />
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
            <Link href="/afford" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Salary Guides</Link>
            <Link href="/best" className="text-sm font-medium text-primary">Best Of</Link>
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
        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-6"
        >
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/best" className="hover:text-foreground transition-colors">Best Of</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{category.name}</span>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Trophy className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-medium">Updated January 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {category.name} <span className="text-primary">2026</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mb-6">
            {category.description}
          </p>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">{category.products.length} products reviewed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Expert analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">No bias guarantee</span>
            </div>
          </div>
        </motion.div>

        {/* Winner Highlight */}
        {winner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <HeroWinnerBadge
              productName={winner.name}
              categoryName={category.name.replace('Best ', '')}
            />
          </motion.div>
        )}

        {/* Quick Jump */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card className="glass-card border-none shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium">Jump to:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.products.map((product, index) => (
                  <a
                    key={product.id}
                    href={`#${product.id}`}
                    className="text-sm px-3 py-1.5 rounded-full bg-card border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    #{index + 1} {product.name}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparison Table */}
        <div className="mb-8">
          <ComparisonTable category={category} />
        </div>

        {/* Product Cards */}
        <div className="space-y-6 mb-8">
          <h2 className="text-2xl font-bold">Detailed Reviews</h2>
          {category.products.map((product, index) => (
            <div key={product.id} id={product.id}>
              <ProductCard
                product={product}
                categorySlug={category.slug}
                isWinner={product.id === category.winner}
                isRunnerUp={product.id === category.runnerUp}
                rank={index + 1}
              />
            </div>
          ))}
        </div>

        {/* Related Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="glass-card border-none shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Related Comparisons</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.values(ALL_CATEGORIES)
                  .filter((c) => c.id !== category.id)
                  .slice(0, 3)
                  .map((relatedCategory) => (
                    <Link key={relatedCategory.id} href={`/best/${relatedCategory.slug}`}>
                      <div className="p-4 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all cursor-pointer">
                        <div className="font-medium mb-1">{relatedCategory.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {relatedCategory.products.length} products compared
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calculator CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <Card className="glass-card border-2 border-primary/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">
                Know Your Numbers First
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Before choosing financial tools, understand your income and budget.
                Our free calculator helps you make informed decisions.
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

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between pt-8 border-t border-border/40"
        >
          {prevCategory ? (
            <Link href={`/best/${prevSlug}`}>
              <Button variant="outline" className="group">
                <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                {prevCategory.name}
              </Button>
            </Link>
          ) : (
            <div />
          )}
          <Link href="/best">
            <Button variant="ghost">All Categories</Button>
          </Link>
          {nextCategory ? (
            <Link href={`/best/${nextSlug}`}>
              <Button variant="outline" className="group">
                {nextCategory.name}
                <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </motion.div>

        {/* Affiliate Disclosure */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-8 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground"
        >
          <strong>Affiliate Disclosure:</strong> Some links on this page are affiliate links.
          If you click through and make a purchase or sign up, we may earn a commission at
          no additional cost to you. This helps support our free tools and content.
          Our rankings and reviews are based on our independent analysis and are not
          influenced by affiliate relationships.
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
              <Link href="/best" className="text-muted-foreground hover:text-foreground transition-colors">All Best Of</Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default BestPage;
