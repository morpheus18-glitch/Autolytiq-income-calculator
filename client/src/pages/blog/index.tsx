import { useState } from "react";
import { Link } from "wouter";
import { Calendar, Clock, ArrowRight, Calculator as CalcIcon, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MobileNav } from "@/components/mobile-nav";
import { SEO } from "@/components/seo";
import { analytics } from "@/lib/analytics";

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
      <section className="py-16 px-4 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">You're Subscribed!</h2>
          <p className="text-muted-foreground">
            Check your inbox for your welcome email with tips to get started.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 border-t border-border">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Get Weekly Financial Tips</h2>
        <p className="text-muted-foreground mb-6">
          Join 10,000+ subscribers getting actionable income-boosting strategies every week.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={isSubmitting || !email} className="gap-2">
            {isSubmitting ? "Subscribing..." : "Subscribe Free"}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </Button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <p className="text-muted-foreground text-xs mt-4">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}

const blogPosts = [
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
  }
];

export default function BlogIndex() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Financial Tips & Guides Blog"
        description="Expert articles on income calculation, budgeting, salary negotiation, and personal finance. Free guides to help you earn more and spend smarter."
        canonical="https://autolytiqs.com/blog"
        keywords="income tips, budgeting guides, salary negotiation, personal finance blog, financial advice"
      />
      {/* Header */}
      <header className="site-header">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 text-foreground hover:text-primary transition-colors">
              <div className="header-logo">
                <CalcIcon className="w-5 h-5 text-primary" />
              </div>
              <span className="header-title">Autolytiq</span>
            </a>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/calculator">
              <Button variant="ghost" size="sm" className="header-nav-btn">Calculator</Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="header-nav-btn text-primary">Blog</Button>
            </Link>
          </nav>
          <MobileNav />
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Financial Insights & Tips
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Expert advice on income optimization, tax strategies, and building wealth.
            Updated weekly with actionable insights.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <a className="group block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300">
                  {/* Category Badge */}
                  <div className="p-6">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
                      {post.category}
                    </span>

                    <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-muted-foreground text-sm">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.readTime}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <NewsletterSection />

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Autolytiq. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy">
              <a className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            </Link>
            <Link href="/terms">
              <a className="text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
