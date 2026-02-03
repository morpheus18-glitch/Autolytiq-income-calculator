import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, ChevronRight } from "lucide-react";
import {
  AutolytiqLogo,
  IncomeIcon,
  WalletIcon,
  AutoIcon,
  HousingIcon,
  DollarIcon,
  LoginIcon,
  LogoutIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";
import { FAQ } from "@/components/faq";
import { SEO, createCalculatorSchema, createFAQSchema } from "@/components/seo";
import { ManageCookiesButton } from "@/components/cookie-consent";
import { IncomeStreamForm } from "@/components/income-stream-form";
import { IncomeStreamCard, EmptyStreamsState } from "@/components/income-stream-card";
import { IncomeStreamsSummary } from "@/components/income-streams-summary";
import { InflationImpact } from "@/components/inflation-impact";
import {
  type IncomeStream,
  calculateTotalAnnual,
  calculateReliableIncome,
} from "@/lib/income-calculations";

const STORAGE_KEY = "income-streams-state";

const INCOME_STREAMS_FAQ = [
  {
    question: "What is 'reliable income' and how is it calculated?",
    answer: "Reliable income is your total income weighted by stability. A W-2 job (stability 5) counts at 100%, while variable gig work (stability 2) counts at 65%. This gives lenders and you a realistic view of dependable income.",
  },
  {
    question: "How do I choose a stability rating?",
    answer: "Rate based on how consistent the income is: 5 (Very Stable) for W-2 employment with steady hours, 4 (Stable) for rental income or long-term contracts, 3 (Moderate) for freelance work, 2 (Variable) for gig work, 1 (Very Variable) for irregular side hustles.",
  },
  {
    question: "Why track multiple income streams?",
    answer: "Modern workers often have multiple income sources. Combining them gives you a complete picture for budgeting, shows lenders your total earnings, and helps you understand which income sources are most reliable.",
  },
  {
    question: "How does this connect to other calculators?",
    answer: "Your combined income from all streams can be used in our auto and housing affordability calculators. The reliable income figure is especially useful for understanding what lenders will consider when evaluating you for loans.",
  },
  {
    question: "Should I include irregular income?",
    answer: "Yes, include all income sources but use appropriate stability ratings. Even irregular income counts toward your total - just rate it as 1-2 stability so the reliable income calculation reflects its variability.",
  },
];

function IncomeStreams() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // State
  const [streams, setStreams] = useState<IncomeStream[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingStream, setEditingStream] = useState<IncomeStream | null>(null);

  // Load from storage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setStreams(parsed);
        }
      } catch (e) {
        console.error("Failed to load streams", e);
      }
    }

    // Check for pending stream from gig calculator
    const pending = localStorage.getItem("pending-income-stream");
    if (pending) {
      try {
        const pendingStream = JSON.parse(pending);
        if (pendingStream && pendingStream.id) {
          // Add the pending stream if it doesn't already exist
          setStreams((current) => {
            const exists = current.some((s) => s.id === pendingStream.id);
            if (!exists) {
              return [...current, { ...pendingStream, pending: undefined }];
            }
            return current;
          });
          localStorage.removeItem("pending-income-stream");
        }
      } catch (e) {
        console.error("Failed to load pending stream", e);
      }
    }
  }, []);

  // Save to storage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(streams));
  }, [streams, mounted]);

  const handleAddStream = (stream: IncomeStream) => {
    if (editingStream) {
      setStreams((current) =>
        current.map((s) => (s.id === stream.id ? stream : s))
      );
      setEditingStream(null);
    } else {
      setStreams((current) => [...current, stream]);
    }
    setShowForm(false);
  };

  const handleEditStream = (stream: IncomeStream) => {
    setEditingStream(stream);
    setShowForm(true);
  };

  const handleDeleteStream = (id: string) => {
    setStreams((current) => current.filter((s) => s.id !== id));
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingStream(null);
  };

  if (!mounted) return null;

  const totalAnnual = calculateTotalAnnual(streams);
  const reliableIncome = calculateReliableIncome(streams);

  const seoStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      createCalculatorSchema(
        "Multiple Income Streams Calculator",
        "Track and combine multiple income sources with stability weighting. Calculate your total and reliable income for better financial planning.",
        "https://autolytiqs.com/income-streams"
      ),
      createFAQSchema(INCOME_STREAMS_FAQ),
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Multiple Income Streams Calculator 2026 | Track All Your Income Sources"
        description="Combine and track multiple income sources with stability weighting. See your total annual income, reliable income for lenders, and monthly breakdown. Perfect for freelancers, gig workers, and anyone with multiple income streams."
        canonical="https://autolytiqs.com/income-streams"
        keywords="multiple income streams, income tracker, freelance income, gig income, rental income, side hustle income, income calculator, reliable income"
        structuredData={seoStructuredData}
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <header className="site-header sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 h-16 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="header-logo p-2 rounded-xl bg-primary/10">
                <AutolytiqLogo className="h-6 w-6 text-primary" />
              </div>
              <span className="header-title text-xl font-bold tracking-tight">Autolytiq</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/calculator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Calculator</Link>
            <Link href="/gig-calculator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Gig Calculator</Link>
            <span className="text-sm font-medium text-primary">Income Streams</span>
            <Link href="/auto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Auto</Link>
            <Link href="/housing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Housing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden md:flex" />
            {user ? (
              <Button variant="ghost" size="sm" onClick={logout} className="gap-2 hidden md:flex">
                <LogoutIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            ) : (
              <Link href="/login" className="hidden md:block">
                <Button variant="outline" size="sm" className="gap-2">
                  <LoginIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}
            <MobileNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Free Tool - No Signup Required</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            Multiple <span className="text-primary">Income Streams</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track all your income sources in one place and see your total earning power
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Summary Section */}
          <IncomeStreamsSummary streams={streams} className="mb-8" />

          {/* Main Card */}
          <Card className="glass-card border-2 border-primary/30 shadow-2xl shadow-primary/10 overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/20">
                    <WalletIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <span className="block">Your Income Streams</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {streams.length} {streams.length === 1 ? "source" : "sources"}
                    </span>
                  </div>
                </CardTitle>
                {streams.length > 0 && !showForm && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Stream
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="pt-6 pb-8 px-6 space-y-4">
              {/* Form or List */}
              <AnimatePresence mode="wait">
                {showForm ? (
                  <IncomeStreamForm
                    key="form"
                    stream={editingStream}
                    onSave={handleAddStream}
                    onCancel={handleCancelForm}
                  />
                ) : streams.length === 0 ? (
                  <EmptyStreamsState
                    key="empty"
                    onAdd={() => setShowForm(true)}
                  />
                ) : (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    {streams.map((stream) => (
                      <IncomeStreamCard
                        key={stream.id}
                        stream={stream}
                        onEdit={handleEditStream}
                        onDelete={handleDeleteStream}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Inflation Impact Section */}
          {totalAnnual > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <InflationImpact
                income={reliableIncome}
                title="Inflation Impact on Your Reliable Income"
                subtitle="See how inflation affects your stability-weighted income over time"
              />
            </motion.div>
          )}

          {/* Use This Income CTA */}
          {totalAnnual > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border border-primary/20"
            >
              <h3 className="text-lg font-semibold mb-2">Use Your Combined Income</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your reliable income of <span className="font-semibold text-primary">${Math.round(reliableIncome).toLocaleString()}/year</span> can be used to check affordability:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <Link href="/auto">
                  <div className="group p-4 rounded-xl border border-border bg-card hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <AutoIcon className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm group-hover:text-blue-500 transition-colors">Auto Affordability</h4>
                        <p className="text-xs text-muted-foreground">See what car you can afford</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
                <Link href="/housing">
                  <div className="group p-4 rounded-xl border border-border bg-card hover:border-purple-500/50 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                        <HousingIcon className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm group-hover:text-purple-500 transition-colors">Housing Affordability</h4>
                        <p className="text-xs text-muted-foreground">Rent vs buy calculator</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          )}

          {/* Related Tools */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
            <Link href="/calculator">
              <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
                <IncomeIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">W-2 Calculator</div>
                <div className="text-xs text-muted-foreground">Traditional income</div>
              </div>
            </Link>
            <Link href="/gig-calculator">
              <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
                <DollarIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Gig Calculator</div>
                <div className="text-xs text-muted-foreground">1099 income</div>
              </div>
            </Link>
            <Link href="/smart-money">
              <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
                <WalletIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Budget Planner</div>
                <div className="text-xs text-muted-foreground">50/30/20 rule</div>
              </div>
            </Link>
            <Link href="/blog">
              <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all cursor-pointer text-center group">
                <IncomeIcon className="h-6 w-6 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-medium">Blog</div>
                <div className="text-xs text-muted-foreground">Tips & guides</div>
              </div>
            </Link>
          </div>

          {/* FAQ */}
          <FAQ items={INCOME_STREAMS_FAQ} className="mt-8" />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Autolytiq. For estimation purposes only.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                Blog
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
              <ManageCookiesButton />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default IncomeStreams;
