import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, PiggyBank, Calculator, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { BlogFeedback } from "@/components/blog-feedback";
import { SEO, createArticleSchema, createBreadcrumbSchema, createFAQSchema } from "@/components/seo";
import { Button } from "@/components/ui/button";

const ARTICLE_META = {
  title: "The 50/30/20 Budget Rule Explained: Complete Guide with Calculator",
  description: "Learn exactly how the 50/30/20 budget rule works, see real examples at every income level, and use our free calculator to build your budget in minutes.",
  datePublished: "2026-01-20",
  url: "https://autolytiqs.com/blog/503020-budget-rule",
  keywords: "50/30/20 budget rule, 50 30 20 rule, budget calculator, how to budget, simple budget method",
};

const faqs = [
  {
    question: "What is the 50/30/20 budget rule?",
    answer: "The 50/30/20 rule is a simple budgeting method where you allocate 50% of your after-tax income to needs (rent, food, utilities), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment."
  },
  {
    question: "Should I use gross or net income for the 50/30/20 rule?",
    answer: "Use your net (take-home) income - the amount that actually hits your bank account after taxes and deductions. This gives you a realistic picture of what you can actually spend and save."
  },
  {
    question: "What if I can't make my budget fit 50/30/20?",
    answer: "The 50/30/20 rule is a guideline, not a strict rule. If you live in a high cost-of-living area, your needs might be 60%. Adjust the percentages to fit your situation while still prioritizing savings."
  },
  {
    question: "Is the 50/30/20 rule good for paying off debt?",
    answer: "Yes, but you may want to temporarily adjust to 50/20/30 (more to debt/savings) until high-interest debt is paid off. The 20% savings category includes extra debt payments beyond minimums."
  }
];

export default function BudgetRule503020() {
  const combinedSchema = [
    createArticleSchema(ARTICLE_META.title, ARTICLE_META.description, ARTICLE_META.url, ARTICLE_META.datePublished),
    createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Blog", url: "https://autolytiqs.com/blog" },
      { name: "50/30/20 Budget Rule", url: ARTICLE_META.url },
    ]),
    createFAQSchema(faqs),
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
            Budgeting
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            The 50/30/20 Budget Rule Explained: Complete Guide with Calculator
          </h1>
          <div className="flex items-center gap-4 text-neutral-500 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              January 20, 2026
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              10 min read
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-lg text-neutral-300 leading-relaxed">
            The 50/30/20 rule is the simplest budgeting method that actually works. Created by Senator Elizabeth Warren and her daughter in the book "All Your Worth," this approach has helped millions of people take control of their money without complicated spreadsheets or tracking every penny.
          </p>

          <p className="text-neutral-300">
            Here's everything you need to know to start using it today.
          </p>

          {/* CTA Box */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-xl p-6 my-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Calculator className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Calculate Your 50/30/20 Budget Instantly</h3>
                <p className="text-neutral-400 text-sm mb-4">
                  Enter your income and see exactly how much to spend on needs, wants, and savings.
                </p>
                <Link href="/smart-money">
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    <PiggyBank className="w-4 h-4 mr-2" />
                    Open Budget Calculator
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">What is the 50/30/20 Rule?</h2>
          <p className="text-neutral-300">
            The 50/30/20 rule divides your <strong>after-tax income</strong> into three simple categories:
          </p>

          <div className="grid md:grid-cols-3 gap-4 my-8">
            <div className="bg-gradient-to-b from-emerald-500/20 to-transparent border border-emerald-500/30 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-emerald-400 mb-3">50%</div>
              <h3 className="text-xl font-semibold text-white mb-2">Needs</h3>
              <p className="text-sm text-neutral-400">Essential expenses you must pay to live and work</p>
            </div>
            <div className="bg-gradient-to-b from-blue-500/20 to-transparent border border-blue-500/30 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-blue-400 mb-3">30%</div>
              <h3 className="text-xl font-semibold text-white mb-2">Wants</h3>
              <p className="text-sm text-neutral-400">Non-essentials that improve your quality of life</p>
            </div>
            <div className="bg-gradient-to-b from-purple-500/20 to-transparent border border-purple-500/30 rounded-xl p-6 text-center">
              <div className="text-5xl font-bold text-purple-400 mb-3">20%</div>
              <h3 className="text-xl font-semibold text-white mb-2">Savings</h3>
              <p className="text-sm text-neutral-400">Future you: retirement, emergency fund, debt payoff</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Breaking Down Each Category</h2>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">50% Needs: The Non-Negotiables</h3>
          <p className="text-neutral-300">
            Needs are expenses required for basic living and earning income. If you'd face serious consequences for not paying, it's a need.
          </p>

          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 my-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Includes
                </h4>
                <ul className="space-y-2 text-neutral-300 text-sm">
                  <li>• Rent or mortgage payment</li>
                  <li>• Utilities (electric, water, gas)</li>
                  <li>• Basic groceries</li>
                  <li>• Health insurance premiums</li>
                  <li>• Car payment (if needed for work)</li>
                  <li>• Gas for commuting</li>
                  <li>• Minimum debt payments</li>
                  <li>• Basic phone plan</li>
                  <li>• Childcare (if required for work)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Does NOT Include
                </h4>
                <ul className="space-y-2 text-neutral-300 text-sm">
                  <li>• Streaming services</li>
                  <li>• Dining out</li>
                  <li>• Premium phone plans</li>
                  <li>• Gym memberships</li>
                  <li>• Organic/premium groceries</li>
                  <li>• New clothes (beyond basics)</li>
                  <li>• Cable TV</li>
                  <li>• A nicer apartment than you need</li>
                </ul>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">30% Wants: The Fun Stuff</h3>
          <p className="text-neutral-300">
            Wants are everything that improves your life but isn't strictly necessary. This is where you have flexibility.
          </p>

          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 my-6">
            <ul className="grid md:grid-cols-2 gap-2 text-neutral-300">
              <li>• Restaurants and takeout</li>
              <li>• Netflix, Spotify, subscriptions</li>
              <li>• Shopping for clothes/gadgets</li>
              <li>• Vacations and travel</li>
              <li>• Hobbies and entertainment</li>
              <li>• Gym membership</li>
              <li>• Concerts and events</li>
              <li>• Upgrading to a nicer car</li>
              <li>• Premium coffee drinks</li>
              <li>• Personal care (haircuts, etc.)</li>
            </ul>
          </div>

          <p className="text-neutral-300">
            <strong className="text-white">The key distinction:</strong> If you could downgrade or eliminate it without serious consequences, it's a want - even if it feels essential.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">20% Savings: Paying Future You</h3>
          <p className="text-neutral-300">
            This category builds your financial security. Prioritize in this order:
          </p>

          <ol className="list-decimal list-inside space-y-3 text-neutral-300 my-6">
            <li><strong className="text-white">401(k) up to employer match</strong> - Free money, always first</li>
            <li><strong className="text-white">$1,000 emergency fund</strong> - Basic protection from debt</li>
            <li><strong className="text-white">High-interest debt payoff</strong> - Anything over 7% APR</li>
            <li><strong className="text-white">3-6 month emergency fund</strong> - Full job loss protection</li>
            <li><strong className="text-white">Max Roth IRA</strong> - $7,000/year in 2026</li>
            <li><strong className="text-white">Additional 401(k)</strong> - Up to $23,500/year in 2026</li>
            <li><strong className="text-white">Other investments</strong> - Brokerage account, real estate</li>
          </ol>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">50/30/20 Examples by Income</h2>
          <p className="text-neutral-300">Here's what the 50/30/20 budget looks like at different income levels:</p>

          <div className="overflow-x-auto my-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262626]">
                  <th className="py-3 px-4 text-neutral-400 font-medium">Take-Home Pay</th>
                  <th className="py-3 px-4 text-emerald-400 font-medium">50% Needs</th>
                  <th className="py-3 px-4 text-blue-400 font-medium">30% Wants</th>
                  <th className="py-3 px-4 text-purple-400 font-medium">20% Savings</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$2,500/mo</td>
                  <td className="py-3 px-4">$1,250</td>
                  <td className="py-3 px-4">$750</td>
                  <td className="py-3 px-4">$500</td>
                </tr>
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$3,500/mo</td>
                  <td className="py-3 px-4">$1,750</td>
                  <td className="py-3 px-4">$1,050</td>
                  <td className="py-3 px-4">$700</td>
                </tr>
                <tr className="border-b border-[#262626]/50 bg-emerald-500/5">
                  <td className="py-3 px-4 font-medium text-white">$4,500/mo</td>
                  <td className="py-3 px-4">$2,250</td>
                  <td className="py-3 px-4">$1,350</td>
                  <td className="py-3 px-4">$900</td>
                </tr>
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$6,000/mo</td>
                  <td className="py-3 px-4">$3,000</td>
                  <td className="py-3 px-4">$1,800</td>
                  <td className="py-3 px-4">$1,200</td>
                </tr>
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$8,000/mo</td>
                  <td className="py-3 px-4">$4,000</td>
                  <td className="py-3 px-4">$2,400</td>
                  <td className="py-3 px-4">$1,600</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">When to Modify the 50/30/20 Rule</h2>
          <p className="text-neutral-300">
            The percentages aren't law. Adjust them based on your situation:
          </p>

          <div className="space-y-4 my-6">
            <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">High Cost of Living Area → 60/20/20</h4>
              <p className="text-sm text-neutral-400">
                If you live in NYC, SF, or LA, rent alone might be 40% of income. Reduce wants to compensate, but don't touch savings.
              </p>
            </div>
            <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">Paying Off Debt → 50/20/30</h4>
              <p className="text-sm text-neutral-400">
                Flip wants and savings temporarily. Put 30% toward debt until high-interest balances are gone.
              </p>
            </div>
            <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">High Earner → 40/20/40</h4>
              <p className="text-sm text-neutral-400">
                If you make $150k+, you don't need 50% for needs. Boost savings for early retirement or wealth building.
              </p>
            </div>
            <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">Low Income → Focus on Needs First</h4>
              <p className="text-sm text-neutral-400">
                If 50% doesn't cover needs, that's okay. Cover essentials, save what you can, and work on increasing income.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">How to Start Using the 50/30/20 Rule</h2>

          <ol className="list-decimal list-inside space-y-4 text-neutral-300 my-6">
            <li>
              <strong className="text-white">Calculate your take-home pay.</strong>
              <span className="block text-sm text-neutral-400 ml-6">Look at your bank deposits, not your salary. Use our <Link href="/calculator" className="text-emerald-400 hover:underline">income calculator</Link> if needed.</span>
            </li>
            <li>
              <strong className="text-white">List all your current expenses.</strong>
              <span className="block text-sm text-neutral-400 ml-6">Pull bank statements for the last 3 months. Categorize each expense as need, want, or savings.</span>
            </li>
            <li>
              <strong className="text-white">Calculate your current percentages.</strong>
              <span className="block text-sm text-neutral-400 ml-6">Most people are shocked - often 70%+ goes to needs and wants, with little left for savings.</span>
            </li>
            <li>
              <strong className="text-white">Identify areas to adjust.</strong>
              <span className="block text-sm text-neutral-400 ml-6">Usually: reduce wants, look for cheaper needs (housing, car, phone plan), increase savings.</span>
            </li>
            <li>
              <strong className="text-white">Automate your savings.</strong>
              <span className="block text-sm text-neutral-400 ml-6">Set up automatic transfers on payday. What you don't see, you don't spend.</span>
            </li>
          </ol>

          {/* FAQ Section */}
          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4 my-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-5">
                <h4 className="font-semibold text-white mb-2">{faq.question}</h4>
                <p className="text-sm text-neutral-400">{faq.answer}</p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-purple-500/10 border border-emerald-500/20 rounded-xl p-6 my-8">
            <h3 className="text-xl font-bold text-white mb-3">Build Your 50/30/20 Budget Now</h3>
            <p className="text-neutral-300 mb-4">
              Use our free budget calculator to see exactly how your income should be divided and start tracking your spending today.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/smart-money">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600">
                  <PiggyBank className="w-5 h-5 mr-2" />
                  Budget Calculator
                </Button>
              </Link>
              <Link href="/calculator">
                <Button size="lg" variant="outline" className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
                  <Calculator className="w-5 h-5 mr-2" />
                  Income Calculator
                </Button>
              </Link>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">The Bottom Line</h2>
          <p className="text-neutral-300">
            The 50/30/20 rule works because it's simple enough to actually follow. You don't need to track every purchase or use complicated apps. Just divide your paycheck three ways and check in monthly.
          </p>
          <p className="text-neutral-300 mt-4">
            Start today: calculate your three buckets, set up automatic savings transfers, and commit to living within each category. Your future self will thank you.
          </p>
        </div>

        {/* Feedback */}
        <div className="mt-12 pt-8 border-t border-[#262626]">
          <BlogFeedback articleSlug="503020-budget-rule" />
        </div>
      </article>

      {/* Footer */}
      <footer className="border-t border-[#262626] py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-500">
          <p>&copy; 2026 Autolytiq. Free financial tools.</p>
          <div className="flex gap-6">
            <Link href="/privacy"><a className="hover:text-white transition-colors">Privacy</a></Link>
            <Link href="/terms"><a className="hover:text-white transition-colors">Terms</a></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
