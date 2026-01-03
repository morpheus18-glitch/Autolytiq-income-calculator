import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, TrendingUp, Share2, DollarSign } from "lucide-react";

export default function SalaryNegotiationTips() {
  const shareArticle = () => {
    if (navigator.share) {
      navigator.share({
        title: "10 Salary Negotiation Tips That Actually Work",
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
            Career
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            10 Salary Negotiation Tips That Actually Work
          </h1>
          <div className="flex items-center gap-4 text-neutral-500 text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              December 28, 2025
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
            Research shows that 78% of employers expect candidates to negotiate. Yet most people accept the first offer out of fear or discomfort. Here are 10 proven strategies to confidently negotiate a higher salary.
          </p>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 my-8">
            <p className="text-emerald-400 font-medium mb-2">The Cost of Not Negotiating</p>
            <p className="text-neutral-300">
              Accepting a salary just $5,000 below your worth costs you <strong className="text-white">$634,000+</strong> over a 40-year career (assuming 5% annual raises). Negotiation is worth the discomfort.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">1. Know Your Market Value</h2>
          <p className="text-neutral-300">
            Before any negotiation, research what your role pays. Use multiple sources:
          </p>
          <ul className="text-neutral-300 space-y-2">
            <li><strong className="text-white">Glassdoor:</strong> Real salary data from employees</li>
            <li><strong className="text-white">LinkedIn Salary:</strong> Location-specific ranges</li>
            <li><strong className="text-white">Levels.fyi:</strong> Especially for tech roles</li>
            <li><strong className="text-white">PayScale:</strong> Industry benchmarks</li>
          </ul>
          <p className="text-neutral-300 mt-4">
            Calculate your projected annual income from your current job to understand where you stand.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">2. Never Give the First Number</h2>
          <p className="text-neutral-300">
            When asked about salary expectations early in the process, deflect politely:
          </p>
          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 my-6">
            <p className="text-neutral-300 italic">
              "I'd like to learn more about the role and responsibilities before discussing compensation. What's the budgeted range for this position?"
            </p>
          </div>
          <p className="text-neutral-300">
            Whoever says a number first anchors the negotiation. Let them anchor high.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">3. Use Specific Numbers</h2>
          <p className="text-neutral-300">
            Research shows that specific numbers are more effective than round ones. Instead of asking for $80,000, ask for $83,500. Specific numbers suggest you've done your research.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">4. Focus on Total Compensation</h2>
          <p className="text-neutral-300">
            Salary is just one piece. Consider negotiating:
          </p>
          <ul className="text-neutral-300 space-y-2">
            <li><strong className="text-white">Signing bonus:</strong> Often easier to approve than salary increases</li>
            <li><strong className="text-white">Equity/stock options:</strong> Can be significant at growth companies</li>
            <li><strong className="text-white">Extra PTO:</strong> 5 more days = ~2% more compensation</li>
            <li><strong className="text-white">Remote work flexibility:</strong> Saves commute time and money</li>
            <li><strong className="text-white">Professional development budget:</strong> Invest in your future</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">5. Use the "Salary Sandwich"</h2>
          <p className="text-neutral-300">
            Frame your counteroffer positively:
          </p>
          <ol className="text-neutral-300 space-y-2">
            <li><strong className="text-white">1. Express enthusiasm:</strong> "I'm excited about this opportunity..."</li>
            <li><strong className="text-white">2. Make your ask:</strong> "Based on my research and experience, I was hoping for $X..."</li>
            <li><strong className="text-white">3. Reinforce value:</strong> "I'm confident I can deliver [specific value]..."</li>
          </ol>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">6. Practice Your Pitch</h2>
          <p className="text-neutral-300">
            Negotiation is a skill. Practice with a friend or in front of a mirror until your ask feels natural. The more comfortable you are, the more confident you'll appear.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">7. Silence Is Your Friend</h2>
          <p className="text-neutral-300">
            After making your ask, stop talking. Uncomfortable silence often leads the other party to fill it—sometimes with a better offer. Resist the urge to negotiate against yourself.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">8. Get It In Writing</h2>
          <p className="text-neutral-300">
            Verbal agreements mean nothing. Always get the final offer in writing before accepting. Review every detail: start date, salary, bonus structure, benefits, and any negotiated items.
          </p>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">9. Time It Right</h2>
          <p className="text-neutral-300">
            The best time to negotiate is after they've decided they want you but before you've accepted. Other good times:
          </p>
          <ul className="text-neutral-300 space-y-2">
            <li>After completing a successful project</li>
            <li>During annual review cycles</li>
            <li>When taking on new responsibilities</li>
            <li>When you have another offer</li>
          </ul>

          <h2 className="text-2xl font-bold text-white mt-10 mb-4">10. Be Willing to Walk Away</h2>
          <p className="text-neutral-300">
            The most powerful negotiating position is being willing to walk away. Know your minimum acceptable offer before you start, and stick to it. Sometimes the best negotiation outcome is saying no to a bad deal.
          </p>

          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 my-8">
            <h3 className="text-xl font-bold text-white mb-4">Sample Negotiation Script</h3>
            <p className="text-neutral-300 italic">
              "Thank you for the offer—I'm genuinely excited about joining [Company]. After reviewing the details and researching market rates for this role in [City], I was hoping we could discuss the base salary. Based on my [X years] of experience in [skill] and my track record of [specific achievement], I believe a salary of [$X] would be more aligned with my value. Is there flexibility here?"
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Know Your Numbers First</h3>
          <p className="text-neutral-300 mb-6">Calculate your current projected income to negotiate from a position of knowledge.</p>
          <Link href="/">
            <a className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors">
              <DollarSign className="w-5 h-5" />
              Calculate My Income
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
