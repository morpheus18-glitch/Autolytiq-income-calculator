import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, CreditCard, ExternalLink, CheckCircle, AlertTriangle, TrendingUp, Home, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogFeedback } from "@/components/blog-feedback";
import { SEO, createArticleSchema, createBreadcrumbSchema } from "@/components/seo";
import { ManageCookiesButton } from "@/components/cookie-consent";
import { analytics } from "@/lib/analytics";

const ARTICLE_META = {
  title: "What Credit Score Do You Need? Complete Guide for 2026",
  description: "Learn what credit score you need for mortgages, auto loans, credit cards, and more. Free guide with score ranges, tips to improve, and how to check your score free.",
  datePublished: "2026-01-30",
  dateModified: "2026-01-30",
  url: "https://autolytiqs.com/blog/what-credit-score-do-you-need",
  keywords: "credit score, good credit score, credit score ranges, check credit score free, credit karma, improve credit score, credit score for mortgage, credit score for car loan",
};

export default function WhatCreditScoreDoYouNeed() {
  const handleCreditKarmaClick = () => {
    analytics.affiliateClick("Credit Karma", "credit", "https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202", "/blog/what-credit-score-do-you-need");
  };

  const seoData = {
    article: createArticleSchema(
      ARTICLE_META.title,
      ARTICLE_META.description,
      ARTICLE_META.url,
      ARTICLE_META.datePublished,
      ARTICLE_META.dateModified
    ),
    breadcrumbs: createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Blog", url: "https://autolytiqs.com/blog" },
      { name: "Credit Score Guide", url: ARTICLE_META.url },
    ]),
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={ARTICLE_META.title}
        description={ARTICLE_META.description}
        canonical={ARTICLE_META.url}
        keywords={ARTICLE_META.keywords}
        structuredData={{ "@graph": [seoData.article, seoData.breadcrumbs] }}
      />

      {/* Header */}
      <header className="border-b border-border/40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 py-8">
        {/* Meta */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-sm font-medium">
              Credit
            </span>
            <span className="text-muted-foreground text-sm flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(ARTICLE_META.datePublished).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="text-muted-foreground text-sm flex items-center gap-1">
              <Clock className="h-4 w-4" />
              8 min read
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            What Credit Score Do You Need? Complete Guide for 2026
          </h1>
          <p className="text-xl text-muted-foreground">
            Whether you're buying a home, getting a car loan, or applying for a credit card, your credit score matters. Here's exactly what you need.
          </p>
        </div>

        {/* Featured CTA - Credit Karma */}
        <a
          href="https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202"
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleCreditKarmaClick}
          className="block mb-8 p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <CreditCard className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-emerald-400">Check Your Credit Score Free</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">FREE</span>
              </div>
              <p className="text-sm text-muted-foreground">See your score in minutes with Credit Karma - no credit card required</p>
            </div>
            <ExternalLink className="h-5 w-5 text-emerald-400/50 group-hover:text-emerald-400 transition-colors" />
          </div>
        </a>

        {/* Content */}
        <div className="prose prose-invert prose-emerald max-w-none">
          <h2>Credit Score Ranges Explained</h2>
          <p>
            Credit scores range from 300 to 850, with higher scores indicating better creditworthiness. Here's how lenders typically view different score ranges:
          </p>

          <div className="not-prose my-6 space-y-3">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-2xl font-bold text-emerald-400 w-24">800-850</div>
              <div>
                <div className="font-semibold text-emerald-400">Exceptional</div>
                <div className="text-sm text-muted-foreground">Best rates, instant approvals, premium offers</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-400 w-24">740-799</div>
              <div>
                <div className="font-semibold text-blue-400">Very Good</div>
                <div className="text-sm text-muted-foreground">Great rates, easy approvals, most rewards cards</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="text-2xl font-bold text-primary w-24">670-739</div>
              <div>
                <div className="font-semibold text-primary">Good</div>
                <div className="text-sm text-muted-foreground">Competitive rates, approved for most products</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-400 w-24">580-669</div>
              <div>
                <div className="font-semibold text-yellow-400">Fair</div>
                <div className="text-sm text-muted-foreground">Higher rates, may need secured products</div>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="text-2xl font-bold text-red-400 w-24">300-579</div>
              <div>
                <div className="font-semibold text-red-400">Poor</div>
                <div className="text-sm text-muted-foreground">Limited options, secured cards, higher deposits</div>
              </div>
            </div>
          </div>

          <h2>Credit Score Requirements by Loan Type</h2>

          <h3 className="flex items-center gap-2"><Home className="h-5 w-5" /> Mortgage Loans</h3>
          <ul>
            <li><strong>Conventional loan:</strong> 620 minimum (740+ for best rates)</li>
            <li><strong>FHA loan:</strong> 580 minimum (500-579 with 10% down)</li>
            <li><strong>VA loan:</strong> No minimum (most lenders want 620+)</li>
            <li><strong>Jumbo loan:</strong> 700-720 minimum</li>
          </ul>

          <div className="not-prose my-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="font-semibold text-primary mb-1">Rate Impact Example</div>
                <p className="text-sm text-muted-foreground">
                  On a $400,000 mortgage, the difference between a 740 score (6.5% rate) and a 680 score (7.25% rate)
                  can cost you <strong>$180/month extra</strong> - that's $64,800 over 30 years!
                </p>
              </div>
            </div>
          </div>

          <h3 className="flex items-center gap-2"><Car className="h-5 w-5" /> Auto Loans</h3>
          <ul>
            <li><strong>Excellent rates (3-5%):</strong> 750+ score</li>
            <li><strong>Good rates (5-7%):</strong> 700-749 score</li>
            <li><strong>Fair rates (7-12%):</strong> 650-699 score</li>
            <li><strong>Subprime (12-20%+):</strong> Below 650</li>
          </ul>

          <h3 className="flex items-center gap-2"><CreditCard className="h-5 w-5" /> Credit Cards</h3>
          <ul>
            <li><strong>Premium rewards cards:</strong> 740+ (Chase Sapphire, Amex Platinum)</li>
            <li><strong>Standard rewards cards:</strong> 670-739</li>
            <li><strong>Secured cards:</strong> Any score (rebuilding credit)</li>
            <li><strong>Store cards:</strong> 620+ (easier approval)</li>
          </ul>

          <h2>How to Check Your Credit Score Free</h2>
          <p>
            You don't need to pay for your credit score. Here are legitimate free options:
          </p>

          <ol>
            <li>
              <strong>Credit Karma</strong> (Recommended) - Free scores from TransUnion and Equifax, updated weekly, plus monitoring and recommendations
            </li>
            <li>
              <strong>Your bank or credit card</strong> - Many now offer free FICO scores
            </li>
            <li>
              <strong>AnnualCreditReport.com</strong> - Free credit reports (not scores) from all 3 bureaus
            </li>
          </ol>

          <div className="not-prose my-6">
            <a
              href="https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202"
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleCreditKarmaClick}
              className="block p-6 rounded-xl bg-[#0f0f0f] border border-emerald-500/30 hover:border-emerald-500/50 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-6 w-6 text-emerald-400" />
                  <span className="text-xl font-bold">Credit Karma</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">Editor's Pick</span>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-emerald-400 transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Free credit scores</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Weekly updates</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Credit monitoring</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>No credit card needed</span>
                </div>
              </div>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                Check Your Score Free
              </Button>
            </a>
          </div>

          <h2>5 Ways to Improve Your Credit Score</h2>

          <ol>
            <li>
              <strong>Pay bills on time</strong> - Payment history is 35% of your score. Set up autopay for at least the minimum.
            </li>
            <li>
              <strong>Keep credit utilization below 30%</strong> - If you have $10,000 in credit limits, keep balances under $3,000. Under 10% is even better.
            </li>
            <li>
              <strong>Don't close old accounts</strong> - Length of credit history matters. Keep old cards open, even if unused.
            </li>
            <li>
              <strong>Limit new applications</strong> - Each hard inquiry can drop your score 5-10 points. Space out applications.
            </li>
            <li>
              <strong>Check for errors</strong> - Dispute inaccuracies on your credit report. 1 in 5 reports have errors.
            </li>
          </ol>

          <div className="not-prose my-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
              <div>
                <div className="font-semibold text-yellow-400 mb-1">How Long Does It Take?</div>
                <p className="text-sm text-muted-foreground">
                  Small changes (paying down balances) can show in 30 days. Bigger improvements
                  (adding positive history, removing negatives) take 3-6 months. Major rebuilding takes 12-24 months.
                </p>
              </div>
            </div>
          </div>

          <h2>What Doesn't Affect Your Credit Score</h2>
          <p>Common misconceptions - these DON'T impact your score:</p>
          <ul>
            <li>Checking your own credit (soft inquiry)</li>
            <li>Your income or employment status</li>
            <li>Your bank account balance</li>
            <li>Debit card usage</li>
            <li>Rent payments (unless reported)</li>
            <li>Utility payments (unless sent to collections)</li>
          </ul>

          <h2>The Bottom Line</h2>
          <p>
            Your credit score is one of the most important numbers in your financial life. A good score (670+) opens doors,
            while an excellent score (740+) gets you the best rates that can save you tens of thousands over your lifetime.
          </p>
          <p>
            Start by checking your score for free - you can't improve what you don't measure. Then focus on the fundamentals:
            pay on time, keep balances low, and be patient. Credit building is a marathon, not a sprint.
          </p>
        </div>

        {/* Final CTA */}
        <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-center">
          <h3 className="text-xl font-bold mb-2">Know Your Score, Know Your Options</h3>
          <p className="text-muted-foreground mb-4">Check your credit score free with Credit Karma</p>
          <a
            href="https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202"
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleCreditKarmaClick}
          >
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 gap-2">
              Check Your Score Free
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          <p className="text-xs text-muted-foreground mt-3">No credit card required. Takes 2 minutes.</p>
        </div>

        {/* Blog Feedback */}
        <div className="mt-12">
          <BlogFeedback articleSlug="what-credit-score-do-you-need" />
        </div>

        {/* Related Articles */}
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-xl font-bold mb-4">Related Articles</h3>
          <div className="grid gap-4">
            <Link href="/blog/how-much-car-can-i-afford">
              <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer">
                <h4 className="font-semibold mb-1">How Much Car Can I Afford?</h4>
                <p className="text-sm text-muted-foreground">Use income-based calculations to find your auto budget</p>
              </div>
            </Link>
            <Link href="/blog/50-30-20-budget-rule">
              <div className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all cursor-pointer">
                <h4 className="font-semibold mb-1">The 50/30/20 Budget Rule</h4>
                <p className="text-sm text-muted-foreground">Master the simplest budgeting method that works</p>
              </div>
            </Link>
          </div>
        </div>

        {/* CTA to Calculator */}
        <div className="mt-12 text-center">
          <Link href="/calculator">
            <Button variant="outline" size="lg">
              Calculate Your Income
            </Button>
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Autolytiq
            </p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
              <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
              <ManageCookiesButton />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
