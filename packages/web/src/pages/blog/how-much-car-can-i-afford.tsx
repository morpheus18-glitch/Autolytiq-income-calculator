import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, Car, Calculator, DollarSign, TrendingUp, AlertTriangle } from "lucide-react";
import { BlogFeedback } from "@/components/blog-feedback";
import { SEO, createArticleSchema, createBreadcrumbSchema, createFAQSchema } from "@/components/seo";
import { Button } from "@/components/ui/button";

const ARTICLE_META = {
  title: "How Much Car Can I Afford? Complete Guide by Salary",
  description: "Calculate exactly how much car you can afford based on your income. Includes the 20/4/10 rule, affordability by salary ($30k-$100k+), and free calculator.",
  datePublished: "2026-01-20",
  url: "https://autolytiqs.com/blog/how-much-car-can-i-afford",
  keywords: "how much car can I afford, car affordability calculator, car budget by salary, 20/4/10 rule, car payment calculator",
};

const faqs = [
  {
    question: "What is the 20/4/10 rule for buying a car?",
    answer: "The 20/4/10 rule is a guideline for car affordability: put 20% down, finance for no more than 4 years, and keep total car costs (payment + insurance + gas) under 10% of your gross monthly income."
  },
  {
    question: "How much of my income should go to a car payment?",
    answer: "Financial experts recommend keeping your car payment alone at 8-10% of your gross income, and total car costs (payment + insurance + fuel) under 10-15%. The 10% rule is more conservative and leaves room for other financial goals."
  },
  {
    question: "Should I buy new or used?",
    answer: "A 2-3 year old certified pre-owned (CPO) vehicle often offers the best value. New cars depreciate 20-30% in the first year alone. CPO vehicles let someone else absorb that depreciation while still providing warranty coverage."
  },
  {
    question: "What's a good interest rate for a car loan?",
    answer: "Interest rates vary by credit score. Excellent credit (750+) typically gets 5-6% APR, good credit (700-749) gets 7-9%, fair credit (650-699) gets 10-13%, and below 650 may see rates of 14-18% or higher."
  },
  {
    question: "How much should I put down on a car?",
    answer: "Aim for at least 20% down payment. This reduces your loan amount, lowers monthly payments, saves on interest, and prevents being 'underwater' (owing more than the car is worth)."
  },
  {
    question: "What's included in total cost of car ownership?",
    answer: "Total ownership costs include: monthly payment, auto insurance ($100-300/month), fuel ($150-300/month depending on driving habits), maintenance ($50-100/month average), registration and taxes, and depreciation."
  }
];

export default function HowMuchCarCanIAfford() {
  const combinedSchema = [
    createArticleSchema(ARTICLE_META.title, ARTICLE_META.description, ARTICLE_META.url, ARTICLE_META.datePublished),
    createBreadcrumbSchema([
      { name: "Home", url: "https://autolytiqs.com/" },
      { name: "Blog", url: "https://autolytiqs.com/blog" },
      { name: "Car Affordability Guide", url: ARTICLE_META.url },
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
          <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full mb-4">
            Auto & Loans
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How Much Car Can I Afford? Complete Guide by Salary
          </h1>
          <div className="flex items-center gap-4 text-neutral-500 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              January 20, 2026
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              8 min read
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-emerald max-w-none">
          <p className="text-lg text-neutral-300 leading-relaxed">
            Buying a car is one of the biggest financial decisions you'll make. Spend too much, and you're "car poor" - all your money goes to payments, insurance, and gas. Spend wisely, and you get reliable transportation without sacrificing your other financial goals.
          </p>

          <p className="text-neutral-300">
            This guide breaks down exactly how much car you can afford based on your income, using proven financial rules and real-world examples.
          </p>

          {/* CTA Box */}
          <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-xl p-6 my-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calculator className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Calculate Your Car Budget Instantly</h3>
                <p className="text-neutral-400 text-sm mb-4">
                  Use our free auto affordability calculator to see exactly how much car you can afford based on your income.
                </p>
                <Link href="/auto">
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    <Car className="w-4 h-4 mr-2" />
                    Open Auto Calculator
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">The 20/4/10 Rule for Car Buying</h2>
          <p className="text-neutral-300">
            Financial experts recommend the <strong>20/4/10 rule</strong> as the gold standard for car affordability:
          </p>

          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 my-6">
            <ul className="space-y-4 text-neutral-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold">20</span>
                <div>
                  <strong className="text-white">20% down payment</strong>
                  <p className="text-sm text-neutral-400">Reduces your loan amount and avoids being underwater on your loan</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold">4</span>
                <div>
                  <strong className="text-white">4-year loan maximum</strong>
                  <p className="text-sm text-neutral-400">Shorter loans mean less interest paid and faster equity building</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold">10</span>
                <div>
                  <strong className="text-white">10% of gross income on total car costs</strong>
                  <p className="text-sm text-neutral-400">Payment + insurance + gas should be under 10% of monthly gross income</p>
                </div>
              </li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Car Affordability by Salary</h2>
          <p className="text-neutral-300">
            Here's what you can realistically afford at different income levels, following the 10% rule for monthly costs:
          </p>

          <div className="overflow-x-auto my-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#262626]">
                  <th className="py-3 px-4 text-neutral-400 font-medium">Annual Salary</th>
                  <th className="py-3 px-4 text-neutral-400 font-medium">Monthly Budget (10%)</th>
                  <th className="py-3 px-4 text-neutral-400 font-medium">Max Car Price*</th>
                  <th className="py-3 px-4 text-neutral-400 font-medium">Example Cars</th>
                </tr>
              </thead>
              <tbody className="text-neutral-300">
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$30,000</td>
                  <td className="py-3 px-4">$250</td>
                  <td className="py-3 px-4">$8,000 - $12,000</td>
                  <td className="py-3 px-4 text-sm">Used Honda Civic, Toyota Corolla</td>
                </tr>
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$40,000</td>
                  <td className="py-3 px-4">$333</td>
                  <td className="py-3 px-4">$12,000 - $16,000</td>
                  <td className="py-3 px-4 text-sm">Used Mazda 3, Honda Accord</td>
                </tr>
                <tr className="border-b border-[#262626]/50 bg-emerald-500/5">
                  <td className="py-3 px-4 font-medium text-white">$50,000</td>
                  <td className="py-3 px-4">$417</td>
                  <td className="py-3 px-4">$15,000 - $20,000</td>
                  <td className="py-3 px-4 text-sm">Certified pre-owned, newer used</td>
                </tr>
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$60,000</td>
                  <td className="py-3 px-4">$500</td>
                  <td className="py-3 px-4">$18,000 - $24,000</td>
                  <td className="py-3 px-4 text-sm">New base models, CPO luxury</td>
                </tr>
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$75,000</td>
                  <td className="py-3 px-4">$625</td>
                  <td className="py-3 px-4">$22,000 - $30,000</td>
                  <td className="py-3 px-4 text-sm">New mid-range, Honda CR-V</td>
                </tr>
                <tr className="border-b border-[#262626]/50">
                  <td className="py-3 px-4 font-medium text-white">$100,000</td>
                  <td className="py-3 px-4">$833</td>
                  <td className="py-3 px-4">$30,000 - $40,000</td>
                  <td className="py-3 px-4 text-sm">New Toyota Camry, Subaru Outback</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-neutral-500 italic">
            *Max car price assumes 20% down, 4-year loan at 7% APR, plus $150-200/month for insurance and gas
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Why the 10% Rule Matters</h2>
          <p className="text-neutral-300">
            The average American spends <strong>15-20% of their income</strong> on car-related expenses. This is a major reason why many people struggle to save money or build wealth.
          </p>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 my-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white mb-2">Warning Signs You're Spending Too Much</h4>
                <ul className="text-neutral-300 text-sm space-y-1">
                  <li>• Your car payment is more than your rent/mortgage</li>
                  <li>• You can't contribute to retirement while making payments</li>
                  <li>• You need a 6+ year loan to afford the monthly payment</li>
                  <li>• You're putting less than 10% down</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Total Cost of Ownership</h2>
          <p className="text-neutral-300">
            The sticker price is just the beginning. Here's what you really pay:
          </p>

          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-5">
              <DollarSign className="w-8 h-8 text-emerald-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Monthly Costs</h4>
              <ul className="text-sm text-neutral-400 space-y-1">
                <li>• Car payment</li>
                <li>• Insurance ($100-300/month)</li>
                <li>• Gas ($150-300/month)</li>
                <li>• Parking (varies by location)</li>
              </ul>
            </div>
            <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-5">
              <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Annual Costs</h4>
              <ul className="text-sm text-neutral-400 space-y-1">
                <li>• Registration & taxes</li>
                <li>• Maintenance ($500-1,500/year)</li>
                <li>• Repairs (budget $1,000/year)</li>
                <li>• Depreciation (15-20%/year)</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">Smart Car Buying Tips</h2>
          <ol className="list-decimal list-inside space-y-4 text-neutral-300 my-6">
            <li>
              <strong className="text-white">Get pre-approved for financing first.</strong>
              <span className="block text-sm text-neutral-400 ml-6">Know your rate before you negotiate. Credit unions often have the best rates.</span>
            </li>
            <li>
              <strong className="text-white">Consider 2-3 year old certified pre-owned.</strong>
              <span className="block text-sm text-neutral-400 ml-6">Someone else took the depreciation hit. You get a nearly-new car for 30-40% less.</span>
            </li>
            <li>
              <strong className="text-white">Negotiate the out-the-door price.</strong>
              <span className="block text-sm text-neutral-400 ml-6">Include all taxes, fees, and add-ons in your negotiation.</span>
            </li>
            <li>
              <strong className="text-white">Skip the extended warranty.</strong>
              <span className="block text-sm text-neutral-400 ml-6">Most are overpriced. Put that money in a car repair fund instead.</span>
            </li>
            <li>
              <strong className="text-white">Check insurance costs before buying.</strong>
              <span className="block text-sm text-neutral-400 ml-6">A sports car might be affordable to buy but expensive to insure.</span>
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">When to Stretch Your Budget</h2>
          <p className="text-neutral-300">
            The 10% rule is a guideline, not a law. You might consider spending more if:
          </p>
          <ul className="list-disc list-inside text-neutral-300 my-4 space-y-2">
            <li>You have no other debt and a fully-funded emergency fund</li>
            <li>Your job requires reliable transportation (sales, real estate)</li>
            <li>You're buying a fuel-efficient car that will save money long-term</li>
            <li>You drive significantly more than average (20,000+ miles/year)</li>
          </ul>
          <p className="text-neutral-300">
            Even then, try to stay under 15% of your gross income for total car costs.
          </p>

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
          <div className="bg-gradient-to-r from-blue-500/10 to-emerald-500/10 border border-blue-500/20 rounded-xl p-6 my-8">
            <h3 className="text-xl font-bold text-white mb-3">Calculate Your Exact Car Budget</h3>
            <p className="text-neutral-300 mb-4">
              Ready to see exactly what you can afford? Our free auto calculator factors in your income, down payment, loan terms, and total ownership costs.
            </p>
            <Link href="/auto">
              <Button size="lg" className="bg-blue-500 hover:bg-blue-600">
                <Car className="w-5 h-5 mr-2" />
                Use the Auto Calculator
              </Button>
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">The Bottom Line</h2>
          <p className="text-neutral-300">
            The best car you can afford is one that gets you where you need to go reliably without compromising your other financial goals. For most people, that means following the 20/4/10 rule and keeping total car costs under 10% of gross income.
          </p>
          <p className="text-neutral-300 mt-4">
            Remember: a car is a depreciating asset. Every dollar you don't spend on a car is a dollar that can grow in your retirement account, emergency fund, or investments.
          </p>
        </div>

        {/* Feedback */}
        <div className="mt-12 pt-8 border-t border-[#262626]">
          <BlogFeedback articleSlug="how-much-car-can-i-afford" />
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
