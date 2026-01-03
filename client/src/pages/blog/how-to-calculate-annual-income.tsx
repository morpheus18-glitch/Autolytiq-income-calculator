import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, TrendingUp, Calculator, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowToCalculateAnnualIncome() {
  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: "How to Calculate Your Annual Income from YTD Earnings",
        url: window.location.href
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a] sticky top-0 bg-[#09090b]/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/blog">
            <a className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </a>
          </Link>
          <button onClick={shareArticle} className="text-neutral-400 hover:text-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
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
              5 min read
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

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Common Questions</h2>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">Is projected income the same as actual income?</h3>
          <p className="text-neutral-300">
            No. Projected income is an estimate based on your current earnings rate. Your actual annual income may vary due to bonuses, raises, job changes, or unpaid time off.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">Can I use this for loan applications?</h3>
          <p className="text-neutral-300">
            Yes! Lenders often accept YTD paystubs for income verification. They'll use a similar calculation to estimate your annual income.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-3">What about self-employment income?</h3>
          <p className="text-neutral-300">
            For self-employment, use your year-to-date profit (revenue minus expenses). The same formula applies, though lenders may require 2 years of tax returns.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30 rounded-2xl text-center">
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
          </div>
        </div>
      </footer>
    </div>
  );
}
