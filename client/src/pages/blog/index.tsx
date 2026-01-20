import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight, CheckCircle, BookOpen, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MobileNav } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { SEO } from "@/components/seo";
import { AutolytiqLogo, CheckIcon } from "@/components/icons";
import { analytics } from "@/lib/analytics";
import { cn } from "@/lib/utils";

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "blog-newsletter" })
      });

      if (res.ok) {
        setIsSuccess(true);
        analytics.newsletterSignup("blog");
        localStorage.setItem("newsletterSubscribed", "true");
      } else {
        const data = await res.json();
        setError(data.message || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-16 px-4"
      >
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">You're Subscribed!</h2>
          <p className="text-muted-foreground">
            Check your inbox for your welcome email with tips to get started.
          </p>
        </div>
      </motion.section>
    );
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-emerald-500/10 border border-primary/20 p-8 md:p-12">
          {/* Background elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl" />

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-4">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">Free Weekly Tips</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Get Weekly Financial Tips
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Join 10,000+ subscribers getting actionable income-boosting strategies delivered every week.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 h-12 bg-background/80 backdrop-blur-sm"
              />
              <Button type="submit" disabled={isSubmitting || !email} size="lg" className="gap-2">
                {isSubmitting ? "Subscribing..." : "Subscribe Free"}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckIcon className="h-3 w-3 text-emerald-500" />
                No spam
              </span>
              <span className="flex items-center gap-1">
                <CheckIcon className="h-3 w-3 text-emerald-500" />
                Unsubscribe anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const blogPosts = [
  {
    slug: "50-30-20-budget-rule",
    title: "The 50/30/20 Budget Rule: Complete Guide for 2026",
    excerpt: "Master the simplest budgeting method that actually works. Learn how to split your income into needs, wants, and savings with real examples at every income level.",
    date: "2026-01-20",
    readTime: "8 min read",
    category: "Budgeting",
    featured: true
  },
  {
    slug: "first-paycheck-budget",
    title: "How to Budget Your First Paycheck: A Complete Guide",
    excerpt: "Just landed your first job? Learn exactly how to budget your paycheck with a proven system that builds savings while still enjoying life.",
    date: "2026-01-18",
    readTime: "9 min read",
    category: "Budgeting"
  },
  {
    slug: "how-much-car-can-i-afford",
    title: "How Much Car Can I Afford? Complete 2026 Guide",
    excerpt: "Use the 20/4/10 rule and income-based calculations to find exactly how much you should spend on a car without straining your budget.",
    date: "2026-01-15",
    readTime: "10 min read",
    category: "Auto"
  },
  {
    slug: "how-to-calculate-annual-income",
    title: "How to Calculate Your Annual Income from YTD Earnings",
    excerpt: "Learn the exact formula to project your yearly salary from your year-to-date paystub. Plus tips for accounting for bonuses, overtime, and variable pay.",
    date: "2026-01-02",
    readTime: "5 min read",
    category: "Calculators"
  },
  {
    slug: "maximize-your-401k",
    title: "401(k) Strategies: How to Maximize Your Employer Match",
    excerpt: "Don't leave free money on the table. Learn how to optimize your 401(k) contributions to get the full employer match and reduce your tax burden.",
    date: "2026-01-01",
    readTime: "7 min read",
    category: "Retirement"
  },
  {
    slug: "salary-negotiation-tips",
    title: "10 Salary Negotiation Tips That Actually Work",
    excerpt: "Data shows 78% of employers expect negotiation. Here's how to confidently ask for more and get it, backed by research and real examples.",
    date: "2025-12-28",
    readTime: "8 min read",
    category: "Career"
  },
  {
    slug: "understanding-your-paystub",
    title: "Understanding Your Paystub: A Complete Guide",
    excerpt: "Decode every line on your paycheck. From gross pay to net pay, understand deductions, taxes, and where your money actually goes.",
    date: "2025-12-25",
    readTime: "6 min read",
    category: "Basics"
  },
  {
    slug: "side-hustle-income-ideas",
    title: "15 Side Hustle Ideas to Boost Your Income in 2026",
    excerpt: "Looking to earn extra money? These proven side hustles can add $500-$5,000/month to your income without quitting your day job.",
    date: "2025-12-20",
    readTime: "10 min read",
    category: "Side Income"
  },
  {
    slug: "tax-deductions-you-might-be-missing",
    title: "12 Tax Deductions You Might Be Missing",
    excerpt: "The average taxpayer overpays by $400. Make sure you're claiming all the deductions you're entitled to with this comprehensive checklist.",
    date: "2025-12-15",
    readTime: "9 min read",
    category: "Taxes"
  },
  // Additional posts for fuller grid
  {
    slug: "emergency-fund-guide",
    title: "How to Build an Emergency Fund From Scratch",
    excerpt: "Start with $0 and build a 3-6 month safety net. Step-by-step strategies to save your first $1,000 and beyond, even on a tight budget.",
    date: "2025-12-12",
    readTime: "7 min read",
    category: "Budgeting"
  },
  {
    slug: "new-vs-used-car",
    title: "New vs Used Car: Which is the Smarter Financial Choice?",
    excerpt: "Crunch the numbers on depreciation, maintenance, and total cost of ownership to make the right decision for your budget.",
    date: "2025-12-10",
    readTime: "8 min read",
    category: "Auto"
  },
  {
    slug: "roth-vs-traditional-401k",
    title: "Roth vs Traditional 401(k): Which Should You Choose?",
    excerpt: "Compare tax implications, growth potential, and withdrawal rules to pick the retirement account that fits your situation.",
    date: "2025-12-08",
    readTime: "9 min read",
    category: "Retirement"
  },
  {
    slug: "rent-vs-buy-calculator-guide",
    title: "Rent vs Buy: The Complete Financial Breakdown",
    excerpt: "Use our framework to calculate the true cost of homeownership vs renting, including hidden costs most people forget.",
    date: "2025-12-05",
    readTime: "11 min read",
    category: "Calculators"
  },
  {
    slug: "asking-for-a-raise",
    title: "How to Ask for a Raise (And Actually Get It)",
    excerpt: "Timing, preparation, and scripts that work. Real examples from people who successfully negotiated 10-30% salary increases.",
    date: "2025-12-03",
    readTime: "8 min read",
    category: "Career"
  },
  {
    slug: "zero-based-budgeting",
    title: "Zero-Based Budgeting: Give Every Dollar a Job",
    excerpt: "Learn the budgeting method that helps you control every dollar. Perfect for people who've tried other methods and failed.",
    date: "2025-12-01",
    readTime: "7 min read",
    category: "Budgeting"
  },
  {
    slug: "car-insurance-savings",
    title: "7 Ways to Lower Your Car Insurance Premium Today",
    excerpt: "Most people overpay for auto insurance by $300-500/year. These strategies can cut your premium without reducing coverage.",
    date: "2025-11-28",
    readTime: "6 min read",
    category: "Auto"
  },
  {
    slug: "w4-form-guide",
    title: "How to Fill Out Your W-4 for the Perfect Tax Withholding",
    excerpt: "Stop getting huge refunds or owing at tax time. Adjust your W-4 to keep more money in each paycheck while staying tax-compliant.",
    date: "2025-11-25",
    readTime: "8 min read",
    category: "Taxes"
  },
  {
    slug: "freelance-taxes-guide",
    title: "Freelance Taxes 101: What Self-Employed Workers Must Know",
    excerpt: "Quarterly payments, deductions, and record-keeping essentials for freelancers, gig workers, and side hustlers.",
    date: "2025-11-22",
    readTime: "10 min read",
    category: "Taxes"
  },
  {
    slug: "high-yield-savings-accounts",
    title: "Best High-Yield Savings Accounts in 2026",
    excerpt: "Compare APYs, fees, and features of the top savings accounts. Some are paying 5%+ right now—is your money working hard enough?",
    date: "2025-11-20",
    readTime: "6 min read",
    category: "Basics"
  },
  {
    slug: "passive-income-ideas",
    title: "12 Passive Income Ideas That Actually Work",
    excerpt: "Build income streams that pay you while you sleep. From dividend investing to digital products, ranked by startup effort and earning potential.",
    date: "2025-11-18",
    readTime: "12 min read",
    category: "Side Income"
  },
  {
    slug: "ira-contribution-guide",
    title: "IRA Contribution Limits and Strategies for 2026",
    excerpt: "Maximize your IRA contributions with these strategies. Plus, learn the income limits and backdoor Roth conversion techniques.",
    date: "2025-11-15",
    readTime: "7 min read",
    category: "Retirement"
  },
  {
    slug: "credit-score-basics",
    title: "Credit Score 101: What It Is and How to Improve It",
    excerpt: "Understand the 5 factors that make up your credit score and actionable steps to boost your number by 50-100 points.",
    date: "2025-11-12",
    readTime: "8 min read",
    category: "Basics"
  },
  {
    slug: "first-time-home-buyer",
    title: "First-Time Home Buyer's Complete Financial Checklist",
    excerpt: "Everything you need to know before buying your first home: down payments, closing costs, DTI ratios, and hidden expenses.",
    date: "2025-11-10",
    readTime: "14 min read",
    category: "Calculators"
  },
  {
    slug: "remote-job-salary",
    title: "How to Negotiate a Higher Remote Job Salary",
    excerpt: "Remote work changes the negotiation game. Learn how to leverage location flexibility and market rates to maximize your offer.",
    date: "2025-11-08",
    readTime: "7 min read",
    category: "Career"
  },
  {
    slug: "debt-payoff-strategies",
    title: "Debt Snowball vs Avalanche: Which Payoff Method Wins?",
    excerpt: "Compare the two most popular debt payoff strategies with real numbers. Find out which saves more money and which keeps you motivated.",
    date: "2025-11-05",
    readTime: "9 min read",
    category: "Budgeting"
  },
  {
    slug: "selling-your-car-guide",
    title: "How to Sell Your Car for Maximum Value",
    excerpt: "Private sale vs trade-in vs online buyers: compare your options and get the best price with these preparation and negotiation tips.",
    date: "2025-11-02",
    readTime: "8 min read",
    category: "Auto"
  },
  {
    slug: "etsy-side-hustle",
    title: "Starting an Etsy Shop: From Zero to $1,000/Month",
    excerpt: "A step-by-step guide to launching a profitable Etsy business, from product selection to SEO optimization and pricing strategy.",
    date: "2025-10-30",
    readTime: "11 min read",
    category: "Side Income"
  },
  {
    slug: "hsa-benefits-guide",
    title: "HSA: The Triple Tax-Advantaged Account You're Not Using",
    excerpt: "Health Savings Accounts offer unique tax benefits most people don't know about. Learn how to use your HSA as a stealth retirement account.",
    date: "2025-10-28",
    readTime: "8 min read",
    category: "Retirement"
  },
  {
    slug: "tax-filing-status",
    title: "Choosing the Right Tax Filing Status: A Complete Guide",
    excerpt: "Single, married filing jointly, head of household—your filing status affects your taxes more than you think. Here's how to choose.",
    date: "2025-10-25",
    readTime: "7 min read",
    category: "Taxes"
  }
];

const categories = ["All", "Budgeting", "Auto", "Calculators", "Career", "Retirement", "Taxes", "Side Income", "Basics"];

const categoryColors: Record<string, string> = {
  "Budgeting": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  "Auto": "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Calculators": "bg-primary/10 text-primary border-primary/20",
  "Career": "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Retirement": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  "Taxes": "bg-red-500/10 text-red-500 border-red-500/20",
  "Side Income": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  "Basics": "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState("All");

  const featuredPost = blogPosts.find(p => p.featured);
  const filteredPosts = activeCategory === "All"
    ? blogPosts.filter(p => !p.featured)
    : blogPosts.filter(p => p.category === activeCategory && !p.featured);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Financial Tips & Guides Blog | Autolytiq"
        description="Expert articles on income calculation, budgeting, salary negotiation, and personal finance. Free guides to help you earn more and spend smarter."
        canonical="https://autolytiqs.com/blog"
        keywords="income tips, budgeting guides, salary negotiation, personal finance blog, financial advice, 50/30/20 rule, first paycheck budget"
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />

      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/4 w-[300px] h-[300px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[200px] h-[200px] bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />

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
            <Link href="/smart-money" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Budget Planner</Link>
            <Link href="/housing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Housing</Link>
            <Link href="/auto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Auto</Link>
            <span className="text-sm font-medium text-primary">Blog</span>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden md:flex" />
            <Link href="/calculator">
              <Button size="sm" className="hidden md:flex">
                Open Calculator
                <ChevronRight className="h-4 w-4 ml-1" />
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
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Financial Education</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3">
            Financial <span className="text-primary">Insights</span> & Tips
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert advice on income optimization, tax strategies, and building wealth. Updated weekly with actionable insights.
          </p>
        </motion.div>

        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <Link href={`/blog/${featuredPost.slug}`}>
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-emerald-500/5 border-2 border-primary/20 p-6 md:p-8 hover:border-primary/40 transition-all cursor-pointer">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50" />

                <div className="relative z-10 grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                        <TrendingUp className="h-3 w-3" />
                        Featured
                      </span>
                      <span className={cn("px-3 py-1 text-xs font-medium rounded-full border", categoryColors[featuredPost.category])}>
                        {featuredPost.category}
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h2>

                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {featuredPost.excerpt}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                  </div>

                  <div className="hidden md:flex justify-end">
                    <div className="p-6 rounded-xl bg-background/60 backdrop-blur-sm border border-border/50 text-center">
                      <div className="text-6xl font-bold text-primary mb-2">50/30/20</div>
                      <div className="text-sm text-muted-foreground">The Golden Budget Rule</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Link href={`/blog/${post.slug}`}>
                <Card className="group h-full glass-card border-none shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden">
                  <CardContent className="p-6">
                    <span className={cn("inline-block px-3 py-1 text-xs font-medium rounded-full border mb-4", categoryColors[post.category])}>
                      {post.category}
                    </span>

                    <h2 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-muted-foreground text-sm pt-4 border-t border-border/50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No articles found in this category.</p>
            <Button variant="outline" className="mt-4" onClick={() => setActiveCategory("All")}>
              View All Articles
            </Button>
          </div>
        )}

        {/* Newsletter CTA */}
        <NewsletterSection />

        {/* Calculator CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <Card className="glass-card border-2 border-primary/20 shadow-xl overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Ready to Put This Into Practice?</h3>
                  <p className="text-muted-foreground mb-4">
                    Use our free calculators to apply what you've learned and take control of your finances today.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/calculator">
                      <Button className="gap-2">
                        Income Calculator
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/smart-money">
                      <Button variant="outline" className="gap-2">
                        Budget Planner
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                    <div className="text-2xl font-bold text-primary">50/30/20</div>
                    <div className="text-xs text-muted-foreground">Budget Rule</div>
                  </div>
                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center">
                    <div className="text-2xl font-bold text-blue-500">12%</div>
                    <div className="text-xs text-muted-foreground">Auto Rule</div>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
                    <div className="text-2xl font-bold text-purple-500">30%</div>
                    <div className="text-xs text-muted-foreground">Housing Rule</div>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                    <div className="text-2xl font-bold text-emerald-500">20%</div>
                    <div className="text-xs text-muted-foreground">Savings Goal</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-16 2xl:px-24 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Autolytiq. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/calculator" className="text-muted-foreground hover:text-foreground transition-colors">
                Calculator
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
