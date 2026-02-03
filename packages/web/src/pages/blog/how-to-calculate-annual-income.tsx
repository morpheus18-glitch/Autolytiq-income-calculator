import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, TrendingUp, Calculator } from "lucide-react";
import { BlogFeedback } from "@/components/blog-feedback";
import { SEO, createArticleSchema, createBreadcrumbSchema, createFAQSchema, createHowToSchema } from "@/components/seo";
import { ManageCookiesButton } from "@/components/cookie-consent";

const ARTICLE_META = {
  title: "How to Calculate Your Annual Income from YTD Earnings",
  description: "Learn the exact formula to calculate your projected annual income from year-to-date earnings. Includes factors affecting accuracy and free calculator.",
  datePublished: "2026-01-02",
  url: "https://autolytiqs.com/blog/how-to-calculate-annual-income",
  keywords: "YTD income calculator, annual income calculation, salary projection, gross income, paystub YTD",
};

const faqs = [
  {
    question: "Is projected income the same as actual income?",
    answer: "No. Projected income is an estimate based on your current earnings rate. Your actual annual income may vary due to bonuses, raises, job changes, or unpaid time off."
  },
  {
    question: "Can I use this calculation for loan applications?",
    answer: "Yes! Lenders often accept YTD paystubs for income verification. They'll use a similar calculation to estimate your annual income. Having your projected annual income ready can speed up the application process."
  },
  {
    question: "What about self-employment income?",
    answer: "For self-employment, use your year-to-date profit (revenue minus expenses). The same formula applies, though lenders may require 2 years of tax returns for verification."
  },
  {
    question: "Should I use gross or net income for the calculation?",
    answer: "Use gross income (before taxes and deductions) for most purposes including loan applications, salary negotiations, and budgeting. Net income is what you take home, but gross is the standard measure of earning power."
  },
  {
    question: "How accurate is this projection early in the year?",
    answer: "Projections become more accurate as the year progresses. In January, a few days of variation can significantly impact the projection. By June, you'll have enough data for a reliable estimate. If you receive annual bonuses, include them separately for better accuracy."
  },
  {
    question: "What if I started my job mid-year?",
    answer: "Use your actual start date, not January 1st, for the calculation. The formula will project what you would earn over a full year at your current rate. Our calculator handles this automatically."
  },
  {
    question: "How do I account for overtime in my projection?",
    answer: "If your overtime varies significantly, calculate your base pay and overtime separately. Use your average weekly overtime hours to project the annual overtime component, then add it to your base salary projection."
  },
  {
    question: "What's the formula to calculate annual income from YTD?",
    answer: "The formula is: Annual Income = (YTD Income ÷ Days Worked) × 365. For example, if you've earned $45,000 in 166 days, your daily rate is $271.08, and your projected annual income is $98,944."
  }
];

const howToSteps = [
  { name: "Find your YTD gross income", text: "Look on your paystub for 'YTD Gross' or 'Year-to-Date Earnings' - this is your total pre-tax earnings since January 1st." },
  { name: "Determine your start date", text: "If you started your job this year, use your actual start date. If you worked the full year, use January 1st." },
  { name: "Count the days worked", text: "Calculate the number of calendar days from your start date to your most recent pay date (inclusive)." },
  { name: "Calculate your daily rate", text: "Divide your YTD gross income by the number of days worked. Example: $45,000 ÷ 166 days = $271.08/day" },
  { name: "Project to annual income", text: "Multiply your daily rate by 365 to get your projected annual income. Example: $271.08 × 365 = $98,944" }
];

export default function HowToCalculateAnnualIncome() {
  const combinedSchema = [
    createArticleSchema(ARTICLE_META.title, ARTICLE_META.description, ARTICLE_META.url, ARTICLE_META.datePublished),
    createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Blog", url: "https://autolytiqs.com/blog" },
      { name: "Calculate Annual Income", url: ARTICLE_META.url },
    ]),
    createFAQSchema(faqs),
    createHowToSchema(
      "How to Calculate Annual Income from YTD Earnings",
      "Calculate your projected annual salary using your year-to-date paystub earnings",
      howToSteps
    ),
  ];

  return (
    <div className="min-h-screen bg-[#09090b]">
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
          <span className="inline-block px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full mb-4">
            Calculators
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How to Calculate Your Annual Income from YTD Earnings
          </h1>
          <div className="flex items-center gap-4 text-neutral-500 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              January 2, 2026
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              12 min read
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-lg text-neutral-300 leading-relaxed">
            Whether you're applying for a loan, negotiating a raise, or just planning your budget, knowing your projected annual income is essential. Here's exactly how to calculate it from your year-to-date (YTD) earnings.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">The Basic Formula</h2>
          <p className="text-neutral-300">
            The fundamental formula for projecting annual income from YTD earnings is:
          </p>

          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 my-6">
            <code className="text-emerald-400 text-lg">
              Annual Income = (YTD Income ÷ Days Worked) × 365
            </code>
          </div>

          <p className="text-neutral-300">
            Let's break this down with a real example:
          </p>

          <ul className="text-neutral-300 space-y-2">
            <li><strong className="text-white">YTD Income:</strong> $45,000 (from your paystub)</li>
            <li><strong className="text-white">Start Date:</strong> January 1, 2026</li>
            <li><strong className="text-white">Current Date:</strong> June 15, 2026 (166 days)</li>
          </ul>

          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 my-6">
            <p className="text-neutral-300 mb-2">Daily Rate = $45,000 ÷ 166 = <span className="text-emerald-400">$271.08/day</span></p>
            <p className="text-neutral-300">Projected Annual = $271.08 × 365 = <span className="text-emerald-400 font-bold">$98,944</span></p>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Factors That Affect Accuracy</h2>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">1. Variable Pay (Bonuses & Commissions)</h3>
          <p className="text-neutral-300">
            If you receive annual bonuses or quarterly commissions, your projection will be more accurate later in the year. For the most accurate estimate, add your expected bonus to your base salary projection.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">2. Overtime Hours</h3>
          <p className="text-neutral-300">
            If your overtime varies significantly, consider calculating your base pay and overtime separately. Use your average weekly overtime to project the annual overtime component.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">3. Mid-Year Raises</h3>
          <p className="text-neutral-300">
            If you received a raise during the year, your simple YTD calculation will underestimate your annual income. Calculate the projection from the date of your raise for accuracy.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">4. New Job Start Date</h3>
          <p className="text-neutral-300">
            If you started mid-year, use your actual start date—not January 1st—for the calculation. Our calculator handles this automatically.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Where to Find Your YTD Income</h2>
          <p className="text-neutral-300">
            Your YTD gross income is typically found in the "Year-to-Date" or "YTD" section of your paystub. Look for:
          </p>

          <ul className="text-neutral-300 space-y-2">
            <li><strong className="text-white">Gross YTD:</strong> Total earnings before any deductions</li>
            <li><strong className="text-white">Net YTD:</strong> Take-home pay after all deductions (not used for this calculation)</li>
          </ul>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 my-8">
            <p className="text-emerald-400 font-medium mb-2">Pro Tip</p>
            <p className="text-neutral-300">
              Always use your <strong className="text-white">Gross YTD</strong> (before taxes and deductions) for income calculations. This is what lenders and landlords typically require.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Try Our Free Calculator</h2>
          <p className="text-neutral-300">
            Skip the math and get instant results with our free income calculator. Just enter your start date, YTD income, and last pay date—we'll handle the rest.
          </p>

          <div className="my-8">
            <Link href="/">
              <a className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                <Calculator className="w-5 h-5" />
                Calculate My Income Now
              </a>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Income by Time Period: Quick Reference</h2>
          <p className="text-neutral-300">
            Once you know your annual income, you can easily convert it to other time periods:
          </p>

          <div className="overflow-x-auto my-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262626]">
                  <th className="py-3 px-4 text-neutral-400 font-medium">Annual Income</th>
                  <th className="py-3 px-4 text-neutral-400 font-medium">Monthly</th>
                  <th className="py-3 px-4 text-neutral-400 font-medium">Bi-Weekly</th>
                  <th className="py-3 px-4 text-neutral-400 font-medium">Weekly</th>
                  <th className="py-3 px-4 text-neutral-400 font-medium">Hourly (40hr)</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$40,000</td>
                  <td className="py-3 px-4">$3,333</td>
                  <td className="py-3 px-4">$1,538</td>
                  <td className="py-3 px-4">$769</td>
                  <td className="py-3 px-4">$19.23</td>
                </tr>
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$50,000</td>
                  <td className="py-3 px-4">$4,167</td>
                  <td className="py-3 px-4">$1,923</td>
                  <td className="py-3 px-4">$962</td>
                  <td className="py-3 px-4">$24.04</td>
                </tr>
                <tr className="border-b border-[#262626]/50 bg-emerald-500/5">
                  <td className="py-3 px-4 font-medium text-white">$60,000</td>
                  <td className="py-3 px-4">$5,000</td>
                  <td className="py-3 px-4">$2,308</td>
                  <td className="py-3 px-4">$1,154</td>
                  <td className="py-3 px-4">$28.85</td>
                </tr>
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$75,000</td>
                  <td className="py-3 px-4">$6,250</td>
                  <td className="py-3 px-4">$2,885</td>
                  <td className="py-3 px-4">$1,442</td>
                  <td className="py-3 px-4">$36.06</td>
                </tr>
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$100,000</td>
                  <td className="py-3 px-4">$8,333</td>
                  <td className="py-3 px-4">$3,846</td>
                  <td className="py-3 px-4">$1,923</td>
                  <td className="py-3 px-4">$48.08</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Real-World Examples</h2>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">Example 1: Full-Year Employee</h3>
          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 my-4">
            <p className="text-neutral-300 mb-2"><strong className="text-white">Scenario:</strong> Sarah has worked at her job since 2024. Her paystub dated June 30 shows YTD Gross of $52,500.</p>
            <p className="text-neutral-300 mb-2">Start Date: January 1 (day 1)</p>
            <p className="text-neutral-300 mb-2">Check Date: June 30 (day 182)</p>
            <p className="text-neutral-300 mb-2">Days Worked: 182</p>
            <p className="text-emerald-400 font-medium">Projected Annual: $52,500 ÷ 182 × 365 = <strong>$105,302</strong></p>
          </div>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">Example 2: Mid-Year Start</h3>
          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 my-4">
            <p className="text-neutral-300 mb-2"><strong className="text-white">Scenario:</strong> Marcus started his new job on March 15. His paystub dated July 31 shows YTD Gross of $28,000.</p>
            <p className="text-neutral-300 mb-2">Start Date: March 15 (his actual start)</p>
            <p className="text-neutral-300 mb-2">Check Date: July 31</p>
            <p className="text-neutral-300 mb-2">Days Worked: 139</p>
            <p className="text-emerald-400 font-medium">Projected Annual: $28,000 ÷ 139 × 365 = <strong>$73,525</strong></p>
          </div>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">Example 3: With Overtime</h3>
          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 my-4">
            <p className="text-neutral-300 mb-2"><strong className="text-white">Scenario:</strong> Alex works hourly with variable overtime. Base pay YTD: $35,000. Overtime YTD: $8,500. Average overtime: 8 hours/week.</p>
            <p className="text-neutral-300 mb-2">Days Worked: 166</p>
            <p className="text-neutral-300 mb-2">Base Projection: $35,000 ÷ 166 × 365 = $76,958</p>
            <p className="text-neutral-300 mb-2">Overtime Projection: $8,500 ÷ 166 × 365 = $18,689</p>
            <p className="text-emerald-400 font-medium">Total Projected Annual: <strong>$95,647</strong></p>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Step-by-Step Guide</h2>
          <div className="space-y-4 my-6">
            {howToSteps.map((step, index) => (
              <div key={index} className="flex gap-4 p-4 bg-[#0f0f0f] border border-[#262626] rounded-xl">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{step.name}</h4>
                  <p className="text-sm text-neutral-400">{step.text}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 my-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-5">
                <h4 className="font-semibold text-white mb-2">{faq.question}</h4>
                <p className="text-sm text-neutral-400">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback & Share */}
        <BlogFeedback
          slug="how-to-calculate-annual-income"
          title="How to Calculate Your Annual Income from YTD Earnings"
        />

        {/* CTA */}
        <div className="p-8 bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Ready to Calculate Your Income?</h3>
          <p className="text-neutral-300 mb-6">Get your projected annual salary in seconds with our free calculator.</p>
          <Link href="/">
            <a className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors">
              <TrendingUp className="w-5 h-5" />
              Use Free Calculator
            </a>
          </Link>
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} Autolytiq. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy">
              <a className="text-neutral-400 hover:text-white transition-colors">Privacy</a>
            </Link>
            <Link href="/terms">
              <a className="text-neutral-400 hover:text-white transition-colors">Terms</a>
            </Link>
            <ManageCookiesButton className="text-neutral-400 hover:text-white" />
          </div>
        </div>
      </footer>
    </div>
  );
}
