import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import {
  ChevronRight,
  Scale,
  Trophy,
  Check,
  X,
  ExternalLink,
  Calculator,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO, createBreadcrumbSchema } from "@/components/seo";
import { AutolytiqLogo, CheckIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { analytics } from "@/lib/analytics";
import {
  getVersusComparison,
  getRelatedComparisons,
  getAllVersusSlugs,
} from "@/data/comparisons/versus";

function ComparePage() {
  const { slug } = useParams<{ slug: string }>();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const comparison = slug ? getVersusComparison(slug) : null;
  const relatedComparisons = slug ? getRelatedComparisons(slug) : [];

  if (!mounted) return null;

  if (!comparison) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Comparison Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We don't have this comparison yet.
            </p>
            <Link href="/compare">
              <Button>
                Browse All Comparisons
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { productA, productB, verdict, comparisonPoints } = comparison;
  const winnerProduct = verdict.winner === 'a' ? productA : verdict.winner === 'b' ? productB : null;

  const seoData = {
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Compare", url: "https://autolytiqs.com/compare" },
      { name: `${productA.name} vs ${productB.name}`, url: `https://autolytiqs.com/compare/${comparison.slug}` },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title={comparison.metaTitle}
        description={comparison.metaDescription}
        canonical={`https://autolytiqs.com/compare/${comparison.slug}`}
        keywords={`${productA.name} vs ${productB.name}, ${productA.name} comparison, ${productB.name} comparison, which is better`}
        structuredData={seoData.breadcrumbs}
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

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
            <Link href="/compare" className="text-sm font-medium text-primary">Compare</Link>
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
          <Link href="/compare" className="hover:text-foreground transition-colors">Compare</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{productA.shortName || productA.name} vs {productB.shortName || productB.name}</span>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Scale className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Head-to-Head Comparison</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {productA.shortName || productA.name} <span className="text-primary">vs</span> {productB.shortName || productB.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {comparison.metaDescription}
          </p>
        </motion.div>

        {/* VS Header Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-3 gap-4 mb-8"
        >
          {/* Product A */}
          <Card className={`glass-card shadow-lg ${verdict.winner === 'a' ? 'border-2 border-emerald-500/50' : 'border-none'}`}>
            <CardContent className="p-6 text-center">
              {verdict.winner === 'a' && (
                <div className="inline-flex items-center gap-1 text-xs bg-emerald-500 text-white px-2 py-1 rounded-full mb-3">
                  <Trophy className="h-3 w-3" />
                  Winner
                </div>
              )}
              <h2 className="text-xl font-bold mb-2">{productA.name}</h2>
              <a
                href={productA.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => analytics.affiliateClick(productA.name, comparison.category, productA.affiliateUrl, `/compare/${comparison.slug}`)}
              >
                <Button variant={verdict.winner === 'a' ? 'default' : 'outline'} className="w-full">
                  Visit Site <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>

          {/* VS */}
          <div className="flex items-center justify-center">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/20">
              <Scale className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Product B */}
          <Card className={`glass-card shadow-lg ${verdict.winner === 'b' ? 'border-2 border-emerald-500/50' : 'border-none'}`}>
            <CardContent className="p-6 text-center">
              {verdict.winner === 'b' && (
                <div className="inline-flex items-center gap-1 text-xs bg-emerald-500 text-white px-2 py-1 rounded-full mb-3">
                  <Trophy className="h-3 w-3" />
                  Winner
                </div>
              )}
              <h2 className="text-xl font-bold mb-2">{productB.name}</h2>
              <a
                href={productB.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => analytics.affiliateClick(productB.name, comparison.category, productB.affiliateUrl, `/compare/${comparison.slug}`)}
              >
                <Button variant={verdict.winner === 'b' ? 'default' : 'outline'} className="w-full">
                  Visit Site <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>

        {/* Verdict */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="glass-card border-2 border-primary/20 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Our Verdict
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <p className="text-lg mb-6">{verdict.summary}</p>

              <div className="grid md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg ${verdict.winner === 'a' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-card border border-border/50'}`}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    {verdict.winner === 'a' && <Trophy className="h-4 w-4 text-emerald-500" />}
                    Choose {productA.shortName || productA.name} if...
                  </h3>
                  <ul className="space-y-2">
                    {verdict.aWinsWhen.map((reason) => (
                      <li key={reason} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`p-4 rounded-lg ${verdict.winner === 'b' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-card border border-border/50'}`}>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    {verdict.winner === 'b' && <Trophy className="h-4 w-4 text-emerald-500" />}
                    Choose {productB.shortName || productB.name} if...
                  </h3>
                  <ul className="space-y-2">
                    {verdict.bWinsWhen.map((reason) => (
                      <li key={reason} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="glass-card border-none shadow-xl overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Feature Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left p-4 text-sm font-medium">Category</th>
                      <th className={`p-4 text-center text-sm font-medium ${verdict.winner === 'a' ? 'bg-emerald-500/5' : ''}`}>
                        {productA.shortName || productA.name}
                      </th>
                      <th className={`p-4 text-center text-sm font-medium ${verdict.winner === 'b' ? 'bg-emerald-500/5' : ''}`}>
                        {productB.shortName || productB.name}
                      </th>
                      <th className="p-4 text-center text-sm font-medium w-[100px]">Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonPoints.map((point, index) => (
                      <tr
                        key={point.category}
                        className={index % 2 === 0 ? '' : 'bg-muted/20'}
                      >
                        <td className="p-4 text-sm font-medium">{point.category}</td>
                        <td className={`p-4 text-center text-sm ${verdict.winner === 'a' ? 'bg-emerald-500/5' : ''}`}>
                          {point.aValue}
                        </td>
                        <td className={`p-4 text-center text-sm ${verdict.winner === 'b' ? 'bg-emerald-500/5' : ''}`}>
                          {point.bValue}
                        </td>
                        <td className="p-4 text-center">
                          {point.winner === 'a' ? (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                              {productA.shortName || 'A'}
                            </span>
                          ) : point.winner === 'b' ? (
                            <span className="text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                              {productB.shortName || 'B'}
                            </span>
                          ) : (
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                              Tie
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Related Comparisons */}
        {relatedComparisons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="glass-card border-none shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">More Comparisons</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid sm:grid-cols-3 gap-3">
                  {relatedComparisons.map((related) => (
                    <Link key={related.slug} href={`/compare/${related.slug}`}>
                      <div className="p-4 rounded-lg bg-card border border-border/50 hover:border-primary/30 transition-all cursor-pointer text-center">
                        <div className="font-medium">
                          {related.productA.shortName || related.productA.name} vs {related.productB.shortName || related.productB.name}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Calculator CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card border-2 border-primary/30 shadow-xl">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">
                Know Your Numbers First
              </h2>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Understanding your income and budget helps you choose the right financial tools.
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

        {/* Affiliate Disclosure */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-8 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground"
        >
          <strong>Affiliate Disclosure:</strong> Some links on this page are affiliate links.
          If you click through and make a purchase or sign up, we may earn a commission at
          no additional cost to you. Our rankings and verdicts are based on independent analysis.
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
              <Link href="/compare" className="text-muted-foreground hover:text-foreground transition-colors">All Comparisons</Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ComparePage;
