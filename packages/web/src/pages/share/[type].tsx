import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams, useSearch } from "wouter";
import {
  ChevronRight,
  DollarSign,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check,
  Calculator,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/seo";
import { AutolytiqLogo } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function SharePage() {
  const { type } = useParams<{ type: string }>();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parse URL params
  const annualIncome = parseInt(searchParams.get('a') || '0');
  const monthlyIncome = parseInt(searchParams.get('m') || '0');
  const takeHome = parseInt(searchParams.get('t') || '0');

  const hasData = annualIncome > 0 || monthlyIncome > 0;

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = annualIncome > 0
    ? `I calculated my income breakdown - ${formatCurrency(annualIncome)}/year! Check yours:`
    : 'Check out this income calculator!';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title={annualIncome ? `${formatCurrency(annualIncome)} Income Breakdown | Autolytiq` : "Share Your Income Results | Autolytiq"}
        description="See this income breakdown and calculate your own with our free calculator."
        canonical={`https://autolytiqs.com/share/${type}`}
        keywords="income calculator, salary breakdown, take home pay"
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
            <Link href="/afford" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Budget Guides</Link>
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

      <main className="max-w-2xl mx-auto px-4 py-12">
        {hasData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Shared Result */}
            <Card className="glass-card border-2 border-primary/30 shadow-xl overflow-hidden">
              <div className="p-8 bg-gradient-to-br from-primary/20 to-primary/5 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-4">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Income Breakdown</span>
                </div>

                {annualIncome > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-muted-foreground mb-1">Annual Income</div>
                    <div className="text-4xl sm:text-5xl font-bold text-primary mono-value">
                      {formatCurrency(annualIncome)}
                    </div>
                  </div>
                )}

                {monthlyIncome > 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 rounded-lg bg-background/50">
                      <div className="text-xs text-muted-foreground mb-1">Monthly Gross</div>
                      <div className="text-xl font-bold mono-value">
                        {formatCurrency(monthlyIncome)}
                      </div>
                    </div>
                    {takeHome > 0 && (
                      <div className="p-4 rounded-lg bg-background/50">
                        <div className="text-xs text-muted-foreground mb-1">Take-Home (est.)</div>
                        <div className="text-xl font-bold mono-value text-emerald-500">
                          {formatCurrency(takeHome)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <p className="text-center text-muted-foreground mb-6">
                  Someone shared their income breakdown with you.
                  Want to calculate yours?
                </p>

                <Link href={`/calculator${annualIncome ? `?salary=${annualIncome}` : ''}`}>
                  <Button className="w-full group" size="lg">
                    <Calculator className="h-5 w-5 mr-2" />
                    Calculate Your Income
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Share Options */}
            <Card className="glass-card border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  Share This
                </h3>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4267B2]/10 text-[#4267B2] hover:bg-[#4267B2]/20 transition-colors"
                  >
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0077B5]/10 text-[#0077B5] hover:bg-[#0077B5]/20 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="glass-card border-2 border-primary/30 shadow-xl">
              <CardContent className="p-8">
                <div className="text-6xl mb-4">📊</div>
                <h1 className="text-2xl font-bold mb-4">Income Calculator</h1>
                <p className="text-muted-foreground mb-6">
                  Calculate your annual income, monthly breakdown, and see
                  what you can afford.
                </p>
                <Link href="/calculator">
                  <Button size="lg" className="group">
                    <Calculator className="h-5 w-5 mr-2" />
                    Start Calculator
                    <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid sm:grid-cols-3 gap-4"
        >
          <Link href="/afford">
            <Card className="glass-card border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-medium text-sm">Budget Guides</div>
                <div className="text-xs text-muted-foreground">By salary level</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/housing">
            <Card className="glass-card border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🏠</div>
                <div className="font-medium text-sm">Housing</div>
                <div className="text-xs text-muted-foreground">Rent & mortgage</div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/quiz/financial-health">
            <Card className="glass-card border-none shadow-lg hover:shadow-xl transition-shadow cursor-pointer h-full">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <div className="font-medium text-sm">Money Quiz</div>
                <div className="text-xs text-muted-foreground">Your personality</div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Autolytiq. Free income calculator.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/calculator" className="text-muted-foreground hover:text-foreground transition-colors">Calculator</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SharePage;
