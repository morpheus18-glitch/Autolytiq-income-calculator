import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, DollarSign, Calculator, PiggyBank, CreditCard, Home, Briefcase, CheckCircle } from "lucide-react";
import { BlogFeedback } from "@/components/blog-feedback";
import { SEO, createArticleSchema, createBreadcrumbSchema } from "@/components/seo";
import { Button } from "@/components/ui/button";

const ARTICLE_META = {
  title: "How to Budget Your First Paycheck: A Complete Guide for New Grads",
  description: "Got your first real paycheck? Learn exactly how to budget it with the 50/30/20 rule, what to prioritize first, and avoid common money mistakes new grads make.",
  datePublished: "2026-01-20",
  url: "https://autolytiqs.com/blog/first-paycheck-budget",
  keywords: "first paycheck budget, how to budget first job, budgeting for beginners, new grad budget, first salary budget",
};

export default function FirstPaycheckBudget() {
  const combinedSchema = [
    createArticleSchema(ARTICLE_META.title, ARTICLE_META.description, ARTICLE_META.url, ARTICLE_META.datePublished),
    createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Blog", url: "https://autolytiqs.com/blog" },
      { name: "First Paycheck Budget", url: ARTICLE_META.url },
    ]),
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
          <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full mb-4">
            Budgeting
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How to Budget Your First Paycheck: A Complete Guide for New Grads
          </h1>
          <div className="flex items-center gap-4 text-neutral-500 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              January 20, 2026
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              7 min read
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-lg text-neutral-300 leading-relaxed">
            Congratulations! You've landed your first "real" job and that first paycheck is hitting your bank account. It feels amazing... and maybe a little overwhelming. How much should you save? What bills come first? Can you afford that apartment?
          </p>

          <p className="text-neutral-300">
            This guide walks you through exactly how to budget your first paycheck so you start your career on solid financial footing.
          </p>

          {/* CTA Box */}
          <div className="bg-gradient-to-r from-purple-500/10 to-emerald-500/10 border border-purple-500/20 rounded-xl p-6 my-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Calculator className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Know Your True Annual Income First</h3>
                <p className="text-neutral-400 text-sm mb-4">
                  Before budgeting, calculate what you'll actually make this year from your YTD earnings.
                </p>
                <Link href="/calculator">
                  <Button className="bg-purple-500 hover:bg-purple-600">
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Annual Income
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Step 1: Understand Your Take-Home Pay</h2>
          <p className="text-neutral-300">
            Your salary and your take-home pay are very different numbers. Here's what gets deducted:
          </p>

          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 my-6">
            <h4 className="font-semibold text-white mb-4">Common Paycheck Deductions</h4>
            <ul className="space-y-3 text-neutral-300">
              <li className="flex justify-between">
                <span>Federal Income Tax</span>
                <span className="text-neutral-500">10-22% for most new grads</span>
              </li>
              <li className="flex justify-between">
                <span>State Income Tax</span>
                <span className="text-neutral-500">0-13% depending on state</span>
              </li>
              <li className="flex justify-between">
                <span>Social Security</span>
                <span className="text-neutral-500">6.2%</span>
              </li>
              <li className="flex justify-between">
                <span>Medicare</span>
                <span className="text-neutral-500">1.45%</span>
              </li>
              <li className="flex justify-between">
                <span>Health Insurance</span>
                <span className="text-neutral-500">$100-500/month if employer-provided</span>
              </li>
              <li className="flex justify-between">
                <span>401(k) Contribution</span>
                <span className="text-neutral-500">Whatever you choose (aim for match %)</span>
              </li>
            </ul>
            <div className="mt-4 pt-4 border-t border-[#262626]">
              <p className="text-sm text-neutral-400">
                <strong className="text-white">Rule of thumb:</strong> Your take-home pay is usually 70-80% of your gross salary.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Step 2: Use the 50/30/20 Budget Rule</h2>
          <p className="text-neutral-300">
            The simplest and most effective budget for beginners. Here's how to split your <strong>take-home pay</strong>:
          </p>

          <div className="grid md:grid-cols-3 gap-4 my-6">
            <div className="bg-[#0f0f0f] border border-emerald-500/30 rounded-xl p-5">
              <div className="text-3xl font-bold text-emerald-400 mb-2">50%</div>
              <h4 className="font-semibold text-white mb-2">Needs</h4>
              <ul className="text-sm text-neutral-400 space-y-1">
                <li>• Rent/housing</li>
                <li>• Utilities</li>
                <li>• Groceries</li>
                <li>• Transportation</li>
                <li>• Insurance</li>
                <li>• Minimum debt payments</li>
              </ul>
            </div>
            <div className="bg-[#0f0f0f] border border-blue-500/30 rounded-xl p-5">
              <div className="text-3xl font-bold text-blue-400 mb-2">30%</div>
              <h4 className="font-semibold text-white mb-2">Wants</h4>
              <ul className="text-sm text-neutral-400 space-y-1">
                <li>• Dining out</li>
                <li>• Entertainment</li>
                <li>• Subscriptions</li>
                <li>• Shopping</li>
                <li>• Hobbies</li>
                <li>• Travel</li>
              </ul>
            </div>
            <div className="bg-[#0f0f0f] border border-purple-500/30 rounded-xl p-5">
              <div className="text-3xl font-bold text-purple-400 mb-2">20%</div>
              <h4 className="font-semibold text-white mb-2">Savings</h4>
              <ul className="text-sm text-neutral-400 space-y-1">
                <li>• Emergency fund</li>
                <li>• 401(k) beyond match</li>
                <li>• Roth IRA</li>
                <li>• Extra debt payments</li>
                <li>• Investments</li>
                <li>• Goals (house, car)</li>
              </ul>
            </div>
          </div>

          <Link href="/smart-money">
            <div className="text-center my-6">
              <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                <PiggyBank className="w-4 h-4 mr-2" />
                Try Our 50/30/20 Budget Calculator
              </Button>
            </div>
          </Link>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Step 3: Set Up Your Money Priority List</h2>
          <p className="text-neutral-300">
            Not all financial goals are equal. Here's the order to tackle them:
          </p>

          <div className="space-y-4 my-6">
            {[
              { num: 1, title: "Get the 401(k) match", desc: "If your employer matches, contribute at least enough to get the full match. It's free money - 50-100% instant return.", icon: Briefcase, color: "emerald" },
              { num: 2, title: "Build a starter emergency fund", desc: "Save $1,000 as fast as possible. This prevents you from going into debt for unexpected expenses.", icon: PiggyBank, color: "blue" },
              { num: 3, title: "Pay off high-interest debt", desc: "Credit cards, personal loans over 7%. Pay minimums on everything else, throw extra at the highest rate.", icon: CreditCard, color: "red" },
              { num: 4, title: "Grow emergency fund to 3-6 months", desc: "Once high-interest debt is gone, build up 3-6 months of expenses.", icon: DollarSign, color: "purple" },
              { num: 5, title: "Invest for retirement", desc: "Max out Roth IRA ($7,000/year in 2026), then contribute more to 401(k).", icon: CheckCircle, color: "emerald" },
            ].map((item) => (
              <div key={item.num} className="flex gap-4 bg-[#0f0f0f] border border-[#262626] rounded-xl p-5">
                <div className={`flex-shrink-0 w-10 h-10 bg-${item.color}-500/20 text-${item.color}-400 rounded-full flex items-center justify-center font-bold`}>
                  {item.num}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{item.title}</h4>
                  <p className="text-sm text-neutral-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Real Example: $50,000 Salary Budget</h2>
          <p className="text-neutral-300">
            Let's break down a real budget for a new grad making $50,000/year:
          </p>

          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 my-6">
            <div className="mb-4 pb-4 border-b border-[#262626]">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Gross Monthly</span>
                <span className="text-white font-medium">$4,167</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-neutral-400">After Taxes & Deductions (~25%)</span>
                <span className="text-emerald-400 font-medium">$3,125 take-home</span>
              </div>
            </div>

            <h4 className="font-semibold text-white mb-3">Monthly Budget Breakdown</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-300">Rent (aim for under 30%)</span>
                <span className="text-white">$950</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Utilities</span>
                <span className="text-white">$100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Groceries</span>
                <span className="text-white">$300</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Transportation</span>
                <span className="text-white">$200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Phone</span>
                <span className="text-white">$50</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-medium pt-2 border-t border-[#262626]">
                <span>Total Needs (50%)</span>
                <span>$1,600</span>
              </div>
            </div>

            <div className="space-y-2 text-sm mt-4">
              <div className="flex justify-between">
                <span className="text-neutral-300">Dining/Entertainment</span>
                <span className="text-white">$400</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Subscriptions</span>
                <span className="text-white">$50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Shopping/Hobbies</span>
                <span className="text-white">$200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Personal Care</span>
                <span className="text-white">$50</span>
              </div>
              <div className="flex justify-between text-blue-400 font-medium pt-2 border-t border-[#262626]">
                <span>Total Wants (30%)</span>
                <span>$700</span>
              </div>
            </div>

            <div className="space-y-2 text-sm mt-4">
              <div className="flex justify-between">
                <span className="text-neutral-300">401(k) - 6% for match</span>
                <span className="text-white">$250 (pre-tax)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Emergency Fund</span>
                <span className="text-white">$300</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Roth IRA</span>
                <span className="text-white">$275</span>
              </div>
              <div className="flex justify-between text-purple-400 font-medium pt-2 border-t border-[#262626]">
                <span>Total Savings (20%+)</span>
                <span>$825</span>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Common First Paycheck Mistakes to Avoid</h2>

          <div className="space-y-4 my-6">
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">❌ Lifestyle inflation</h4>
              <p className="text-sm text-neutral-400">
                Just because you <em>can</em> afford a nicer apartment or car doesn't mean you should. Keep living like a student for 1-2 years while you build savings.
              </p>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">❌ Skipping the 401(k) match</h4>
              <p className="text-sm text-neutral-400">
                "I'll start next year" costs you thousands. A 6% match on $50k is $3,000/year in free money.
              </p>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">❌ No emergency fund</h4>
              <p className="text-sm text-neutral-400">
                One car repair or medical bill shouldn't put you in credit card debt. Build that $1,000 buffer first.
              </p>
            </div>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h4 className="font-semibold text-white mb-2">❌ Signing up for every subscription</h4>
              <p className="text-sm text-neutral-400">
                Netflix + Hulu + Spotify + gym + apps adds up fast. Audit your subscriptions quarterly.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Quick Wins to Start Today</h2>
          <ul className="list-disc list-inside text-neutral-300 space-y-2 my-4">
            <li>Set up automatic transfers to savings on payday</li>
            <li>Enroll in your company's 401(k) with at least the match percentage</li>
            <li>Open a high-yield savings account for your emergency fund (4-5% APY)</li>
            <li>Track your spending for one month to see where money actually goes</li>
            <li>Set up a simple budget using the 50/30/20 rule</li>
          </ul>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-purple-500/10 to-emerald-500/10 border border-purple-500/20 rounded-xl p-6 my-8">
            <h3 className="text-xl font-bold text-white mb-3">Build Your First Budget Now</h3>
            <p className="text-neutral-300 mb-4">
              Use our free Smart Money budget planner to set up your 50/30/20 budget and track your spending categories.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/smart-money">
                <Button size="lg" className="bg-purple-500 hover:bg-purple-600">
                  <PiggyBank className="w-5 h-5 mr-2" />
                  Budget Planner
                </Button>
              </Link>
              <Link href="/calculator">
                <Button size="lg" variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                  <Calculator className="w-5 h-5 mr-2" />
                  Income Calculator
                </Button>
              </Link>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">The Bottom Line</h2>
          <p className="text-neutral-300">
            Your first paycheck is the start of a long financial journey. The habits you build now - automating savings, avoiding lifestyle inflation, getting the 401(k) match - will compound for decades.
          </p>
          <p className="text-neutral-300 mt-4">
            You don't need a complicated budget. Start with 50/30/20, get your emergency fund to $1,000, and grab that free employer match. Everything else can wait.
          </p>
        </div>

        {/* Feedback */}
        <div className="mt-12 pt-8 border-t border-[#262626]">
          <BlogFeedback articleSlug="first-paycheck-budget" />
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
