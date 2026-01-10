import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, FileText, Calculator, DollarSign, Percent, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogFeedback } from "@/components/blog-feedback";
import { SEO, createArticleSchema, createBreadcrumbSchema } from "@/components/seo";
import { ManageCookiesButton } from "@/components/cookie-consent";

const ARTICLE_META = {
  title: "Understanding Your Paystub: A Complete Guide",
  description: "Learn how to read your paystub, understand deductions, verify accuracy, and use YTD figures for financial planning. Complete breakdown of all paystub sections.",
  datePublished: "2025-12-25",
  url: "https://autolytiqs.com/blog/understanding-your-paystub",
  keywords: "paystub explained, read paystub, gross vs net pay, YTD meaning, paycheck deductions explained",
};

export default function UnderstandingYourPaystub() {
  const combinedSchema = [
    createArticleSchema(ARTICLE_META.title, ARTICLE_META.description, ARTICLE_META.url, ARTICLE_META.datePublished),
    createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Blog", url: "https://autolytiqs.com/blog" },
      { name: "Understanding Your Paystub", url: ARTICLE_META.url },
    ]),
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={ARTICLE_META.title}
        description={ARTICLE_META.description}
        canonical={ARTICLE_META.url}
        type="article"
        keywords={ARTICLE_META.keywords}
        structuredData={combinedSchema}
      />
      {/* Header */}
      <header className="site-header">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/blog">
            <a className="header-nav-btn flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </a>
          </Link>
        </div>
      </header>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Meta */}
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
            Basics
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Understanding Your Paystub: A Complete Guide
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              December 25, 2025
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              6 min read
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your paystub contains a wealth of information about your earnings, deductions, and benefits. Understanding each line item helps you verify accuracy, plan your finances, and make informed decisions about your compensation.
          </p>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">The Anatomy of a Paystub</h2>
          <p className="text-muted-foreground">
            Every paystub has several key sections. Let's break down each one so you know exactly where your money is going.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Key Terms to Know</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Gross Pay:</span>
                  <span className="text-muted-foreground ml-2">Your total earnings before any deductions</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">Net Pay:</span>
                  <span className="text-muted-foreground ml-2">Your take-home pay after all deductions</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <span className="text-foreground font-medium">YTD (Year-to-Date):</span>
                  <span className="text-muted-foreground ml-2">Cumulative totals since January 1st</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Earnings Section</h2>
          <p className="text-muted-foreground">
            The earnings section shows all the ways you earned money during the pay period:
          </p>

          <ul className="text-muted-foreground space-y-2 mt-4">
            <li><strong className="text-foreground">Regular Hours:</strong> Your standard hourly wages or salary portion</li>
            <li><strong className="text-foreground">Overtime:</strong> Hours worked beyond 40/week (typically paid at 1.5x)</li>
            <li><strong className="text-foreground">Bonus:</strong> Performance bonuses, signing bonuses, or incentives</li>
            <li><strong className="text-foreground">Commission:</strong> Sales-based earnings</li>
            <li><strong className="text-foreground">PTO/Vacation:</strong> Paid time off that was used</li>
            <li><strong className="text-foreground">Holiday Pay:</strong> Pay for company holidays</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Tax Withholdings</h2>
          <p className="text-muted-foreground">
            This section shows the taxes deducted from your paycheck. Understanding these helps you plan for tax season.
          </p>

          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Percent className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">Federal Taxes</h4>
              </div>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li><strong className="text-foreground">Federal Income Tax:</strong> Based on your W-4 elections and income bracket</li>
                <li><strong className="text-foreground">Social Security (FICA):</strong> 6.2% up to $168,600 (2024)</li>
                <li><strong className="text-foreground">Medicare:</strong> 1.45% on all earnings (plus 0.9% over $200k)</li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Percent className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-foreground">State & Local Taxes</h4>
              </div>
              <ul className="text-muted-foreground text-sm space-y-2">
                <li><strong className="text-foreground">State Income Tax:</strong> Varies by state (0-13%+)</li>
                <li><strong className="text-foreground">Local/City Tax:</strong> Some cities have their own taxes</li>
                <li><strong className="text-foreground">State Disability:</strong> Required in some states (CA, NJ, etc.)</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Pre-Tax Deductions</h2>
          <p className="text-muted-foreground">
            These deductions come out before taxes are calculated, reducing your taxable income:
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-6 space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-foreground"><strong>401(k)/403(b):</strong> Retirement contributions (up to $23,000 in 2024)</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-foreground"><strong>Health Insurance:</strong> Medical, dental, vision premiums</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-foreground"><strong>HSA/FSA:</strong> Health savings or flexible spending accounts</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-foreground"><strong>Commuter Benefits:</strong> Transit or parking pre-tax</span>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 my-8">
            <p className="text-primary font-medium mb-2">Why Pre-Tax Matters</p>
            <p className="text-muted-foreground">
              Every dollar you contribute pre-tax reduces your taxable income. If you're in the 22% tax bracket and contribute $500/month to your 401(k), you save $110/month in taxes while building your retirement.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Post-Tax Deductions</h2>
          <p className="text-muted-foreground">
            These come out after taxes are calculated:
          </p>

          <ul className="text-muted-foreground space-y-2 mt-4">
            <li><strong className="text-foreground">Roth 401(k):</strong> After-tax retirement contributions (tax-free in retirement)</li>
            <li><strong className="text-foreground">Life Insurance:</strong> Coverage above $50,000 is taxable</li>
            <li><strong className="text-foreground">Garnishments:</strong> Court-ordered payments (child support, debt collection)</li>
            <li><strong className="text-foreground">Union Dues:</strong> If you're in a union</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Employer Contributions</h2>
          <p className="text-muted-foreground">
            Some paystubs show what your employer pays on your behalf. These don't come out of your paycheck but represent additional compensation:
          </p>

          <ul className="text-muted-foreground space-y-2 mt-4">
            <li><strong className="text-foreground">401(k) Match:</strong> Employer's matching contribution</li>
            <li><strong className="text-foreground">Health Insurance:</strong> Employer's portion of premiums</li>
            <li><strong className="text-foreground">Employer FICA:</strong> They pay the other half of Social Security/Medicare</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">How to Verify Your Paystub</h2>
          <p className="text-muted-foreground">
            Errors happen more often than you'd think. Here's what to check:
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Verification Checklist</h3>
            <ul className="text-muted-foreground space-y-2">
              <li>✓ Hours worked match your records</li>
              <li>✓ Pay rate is correct (check for raises)</li>
              <li>✓ Overtime calculated at proper rate</li>
              <li>✓ Deductions match your benefit elections</li>
              <li>✓ Tax withholding aligns with your W-4</li>
              <li>✓ YTD totals add up correctly</li>
              <li>✓ PTO balance is accurate</li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Common Paystub Mistakes</h2>
          <p className="text-muted-foreground">
            Watch out for these frequent errors:
          </p>

          <ul className="text-muted-foreground space-y-2 mt-4">
            <li><strong className="text-foreground">Incorrect hours:</strong> Time tracking errors or missing overtime</li>
            <li><strong className="text-foreground">Wrong tax withholding:</strong> Old W-4 still on file after life changes</li>
            <li><strong className="text-foreground">Benefits not updated:</strong> Changes during open enrollment not reflected</li>
            <li><strong className="text-foreground">Missing raises:</strong> Salary increase not applied on time</li>
            <li><strong className="text-foreground">Duplicate deductions:</strong> Same benefit charged twice</li>
          </ul>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Using YTD to Plan Your Finances</h2>
          <p className="text-muted-foreground">
            Your YTD figures are incredibly useful for financial planning:
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-6 space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Project Your Annual Income</h4>
              <p className="text-muted-foreground text-sm">Divide YTD earnings by months elapsed, multiply by 12</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Track Tax Withholding</h4>
              <p className="text-muted-foreground text-sm">Compare YTD taxes to expected annual tax liability</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Monitor Retirement Progress</h4>
              <p className="text-muted-foreground text-sm">Track 401(k) contributions toward annual max</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Plan Large Purchases</h4>
              <p className="text-muted-foreground text-sm">Use income data for mortgage or loan applications</p>
            </div>
          </div>

          <div className="my-8">
            <Link href="/">
              <Button size="lg" className="gap-2">
                <Calculator className="w-5 h-5" />
                Calculate My Annual Income
              </Button>
            </Link>
          </div>
        </div>

        {/* Feedback & Share */}
        <BlogFeedback
          slug="understanding-your-paystub"
          title="Understanding Your Paystub: A Complete Guide"
        />

        {/* CTA */}
        <div className="p-8 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl text-center">
          <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-3">Know Your Numbers</h3>
          <p className="text-muted-foreground mb-6">Use our calculator to project your annual income from your YTD earnings.</p>
          <Link href="/">
            <Button size="lg" className="gap-2">
              <Calculator className="w-5 h-5" />
              Use Free Calculator
            </Button>
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
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
            <ManageCookiesButton />
          </div>
        </div>
      </footer>
    </div>
  );
}
