import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Check,
  Shield,
  Zap,
  TrendingUp,
  Calculator,
  PiggyBank,
  Home,
  Car,
  Clock,
  Lock,
  Star,
  Users,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { AutolytiqLogo } from "@/components/icons";
import { SEO } from "@/components/seo";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function HomePage() {
  const currentYear = new Date().getFullYear();

  // Structured data for SEO - WebApplication only (FAQ schema on /calculator page)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Autolytiq Income Calculator",
    "url": "https://autolytiqs.com",
    "description": "Free income calculator that projects your annual salary from year-to-date earnings. Calculate daily, weekly, monthly, and yearly income instantly.",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "2847",
      "bestRating": "5"
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <SEO
        title="Free Income Calculator 2026 | Calculate Annual Salary from YTD Pay | Autolytiq"
        description="Calculate your projected annual income from year-to-date earnings in seconds. Free salary calculator for W2 employees, hourly workers & contractors. No signup required."
        keywords="income calculator, salary calculator, annual income calculator, YTD calculator, paycheck calculator, gross income calculator, projected income, wage calculator"
        canonical="https://autolytiqs.com"
        structuredData={structuredData}
      />

      {/* Background */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />

      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="site-header">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
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
            <Link href="/smart-money" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Budget Planner</Link>
            <Link href="/housing" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Housing</Link>
            <Link href="/blog" className="header-nav-btn text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">Blog</Link>
          </nav>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/calculator">
              <Button size="sm" className="hidden sm:flex">
                Open Calculator
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">100% Free - No Signup Required</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Know Your <span className="text-primary">True Income</span> in Seconds
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Stop guessing what you make. Calculate your projected annual salary from your year-to-date earnings and make smarter financial decisions.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/calculator">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg shadow-primary/25">
                    Calculate My Income
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                    See How It Works
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-primary border-2 border-background flex items-center justify-center text-xs font-bold text-white">
                        {['JD', 'MK', 'AS', 'RW'][i]}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <span className="text-muted-foreground">2,847+ users this month</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Calculator Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-2xl" />
              <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 lg:p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calculator className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-semibold">Income Calculator</span>
                </div>

                {/* Fake calculator preview */}
                <div className="space-y-4 mb-6">
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Job Start Date</div>
                    <div className="font-mono">01/15/{currentYear}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">YTD Gross Income</div>
                    <div className="font-mono text-lg">$45,230.00</div>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-1">Paystub Date</div>
                    <div className="font-mono">06/30/{currentYear}</div>
                  </div>
                </div>

                {/* Result preview */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
                  <div className="text-sm text-muted-foreground mb-1">Projected Annual Income</div>
                  <div className="text-3xl font-bold text-primary font-mono">$98,450</div>
                  <div className="text-sm text-muted-foreground mt-2">$8,204/mo &bull; $1,894/wk &bull; $270/day</div>
                </div>

                <Link href="/calculator">
                  <Button className="w-full mt-6" size="lg">
                    Try It Now - It's Free
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-8 border-y border-border/40 bg-secondary/30">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-12">
          <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-16 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Bank-Level Privacy</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Data Never Leaves Your Browser</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Instant Results</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">50,000+ Calculations</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-12">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Stop Guessing. Start <span className="text-primary">Knowing.</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              78% of Americans can't accurately state their annual income. That makes budgeting,
              loan applications, and financial planning nearly impossible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: TrendingUp,
                title: "Project Your Annual Income",
                description: "Convert your year-to-date earnings into accurate annual projections. Perfect for new jobs or variable income."
              },
              {
                icon: Car,
                title: "Know What You Can Afford",
                description: "Our 12% rule calculator shows your maximum car payment based on your actual income—not a guess."
              },
              {
                icon: Home,
                title: "Plan Major Purchases",
                description: "Whether it's a house, car, or vacation, know exactly what fits your budget before you commit."
              },
              {
                icon: PiggyBank,
                title: "Budget With Confidence",
                description: "Build a 50/30/20 budget based on real numbers. Track needs, wants, and savings accurately."
              },
              {
                icon: BarChart3,
                title: "Track Income Growth",
                description: "Save scenarios and compare over time. See how raises and bonuses impact your annual picture."
              },
              {
                icon: Clock,
                title: "Save Hours of Math",
                description: "No spreadsheets needed. Enter 3 numbers from your paystub and get instant, accurate results."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-secondary/30">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-12">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Calculate Your Income in <span className="text-primary">3 Simple Steps</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              No signup, no credit card, no personal info required. Just your paystub.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: "1",
                title: "Enter Your Job Start Date",
                description: "When did you start this job? If you've worked all year, use January 1st."
              },
              {
                step: "2",
                title: "Enter YTD Gross Income",
                description: "Find 'YTD Gross' or 'Year-to-Date Earnings' on your paystub. It's your total before taxes."
              },
              {
                step: "3",
                title: "Get Your Projection",
                description: "See your projected annual, monthly, weekly, and daily income instantly. Plus your max affordable car payment."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/25">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>

                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/calculator">
              <Button size="lg" className="text-lg px-8 py-6">
                Try It Now - Free Forever
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-12">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Complete Financial <span className="text-primary">Toolkit</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Beyond income calculation—everything you need to manage your money smarter.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Calculator,
                title: "Income Calculator",
                description: "Project annual income from YTD earnings",
                href: "/calculator",
                color: "bg-emerald-500/10 text-emerald-500"
              },
              {
                icon: PiggyBank,
                title: "Budget Planner",
                description: "50/30/20 budget with expense tracking",
                href: "/smart-money",
                color: "bg-blue-500/10 text-blue-500"
              },
              {
                icon: Home,
                title: "Housing Calculator",
                description: "Rent vs buy analysis & affordability",
                href: "/housing",
                color: "bg-purple-500/10 text-purple-500"
              },
              {
                icon: Car,
                title: "Auto Guide",
                description: "Car affordability & loan calculator",
                href: "/auto",
                color: "bg-orange-500/10 text-orange-500"
              }
            ].map((tool, index) => (
              <Link key={index} href={tool.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer group h-full"
                >
                  <div className={`p-3 rounded-xl ${tool.color} w-fit mb-4`}>
                    <tool.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                  <div className="flex items-center gap-1 mt-4 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Try it free <ChevronRight className="h-4 w-4" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-20 lg:py-28 bg-secondary/30">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Your Data Stays <span className="text-primary">Private</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Unlike other financial tools, Autolytiq never sends your data to our servers.
                All calculations happen locally in your browser. We can't see your income—and we don't want to.
              </p>
              <ul className="space-y-4">
                {[
                  "No account required to use any calculator",
                  "Data stored only on your device (localStorage)",
                  "No tracking of financial information",
                  "Open calculations—see exactly how we compute",
                  "No ads, no data selling, ever"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="p-1 rounded-full bg-primary/20 mt-0.5">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-3xl blur-2xl" />
              <div className="relative bg-card border border-border rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Privacy First</div>
                    <div className="text-sm text-muted-foreground">Your financial data is yours alone</div>
                  </div>
                </div>
                <div className="space-y-3 font-mono text-sm">
                  <div className="p-3 rounded-lg bg-secondary/50 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Server requests:</span>
                    <span className="text-primary">0</span>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Data stored:</span>
                    <span className="text-primary">Local only</span>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50 flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Tracking:</span>
                    <span className="text-primary">None</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-12">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 lg:p-16 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                Ready to Know Your True Income?
              </h2>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join thousands who've stopped guessing and started planning with real numbers.
                It takes 30 seconds and costs nothing.
              </p>
              <Link href="/calculator">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6 shadow-xl">
                  Calculate My Income Now
                  <ChevronRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <p className="text-white/70 text-sm mt-4">
                No signup &bull; No credit card &bull; 100% free forever
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-8 xl:px-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <AutolytiqLogo className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold">Autolytiq</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Free financial calculators to help you make smarter money decisions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Calculators</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/calculator" className="hover:text-foreground transition-colors">Income Calculator</Link></li>
                <li><Link href="/smart-money" className="hover:text-foreground transition-colors">Budget Planner</Link></li>
                <li><Link href="/housing" className="hover:text-foreground transition-colors">Housing Calculator</Link></li>
                <li><Link href="/auto" className="hover:text-foreground transition-colors">Auto Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="/blog/understanding-your-paystub" className="hover:text-foreground transition-colors">Understanding Your Paystub</Link></li>
                <li><Link href="/blog/how-to-calculate-annual-income" className="hover:text-foreground transition-colors">How to Calculate Income</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Autolytiq. All rights reserved. For estimation purposes only.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with precision in the USA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
