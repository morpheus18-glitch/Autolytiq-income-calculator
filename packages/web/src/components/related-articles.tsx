import { Link } from "wouter";
import { ArrowRight, Clock, BookOpen } from "lucide-react";

interface Article {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  category: string;
  categoryColor?: string;
}

// All available blog articles for related content matching
const ALL_ARTICLES: Article[] = [
  {
    slug: "how-to-calculate-annual-income",
    title: "How to Calculate Your Annual Income from YTD Earnings",
    description: "Learn the exact formula to calculate your projected annual income from year-to-date earnings.",
    readTime: "12 min",
    category: "Calculators",
    categoryColor: "emerald",
  },
  {
    slug: "how-much-car-can-i-afford",
    title: "How Much Car Can I Afford? Complete Guide by Salary",
    description: "Calculate exactly how much car you can afford based on your income using the 20/4/10 rule.",
    readTime: "8 min",
    category: "Auto & Loans",
    categoryColor: "blue",
  },
  {
    slug: "503020-budget-rule",
    title: "The 50/30/20 Budget Rule Explained",
    description: "Learn how the 50/30/20 budget rule works with real examples at every income level.",
    readTime: "10 min",
    category: "Budgeting",
    categoryColor: "emerald",
  },
  {
    slug: "understanding-your-paystub",
    title: "Understanding Your Paystub: Complete Guide",
    description: "Learn how to read every line of your paystub including gross pay, deductions, and YTD totals.",
    readTime: "7 min",
    category: "Income",
    categoryColor: "purple",
  },
  {
    slug: "first-paycheck-budget",
    title: "Your First Paycheck: A Complete Budgeting Guide",
    description: "How to budget your first paycheck wisely and build good financial habits from the start.",
    readTime: "6 min",
    category: "Budgeting",
    categoryColor: "emerald",
  },
  {
    slug: "salary-negotiation-tips",
    title: "Salary Negotiation Tips That Actually Work",
    description: "Proven strategies to negotiate a higher salary at your current job or new offer.",
    readTime: "8 min",
    category: "Career",
    categoryColor: "yellow",
  },
  {
    slug: "maximize-your-401k",
    title: "How to Maximize Your 401k in 2026",
    description: "Strategies to get the most from your 401k including contribution limits and employer matching.",
    readTime: "9 min",
    category: "Retirement",
    categoryColor: "purple",
  },
  {
    slug: "what-credit-score-do-you-need",
    title: "What Credit Score Do You Need? Complete Guide",
    description: "Credit score requirements for mortgages, auto loans, credit cards, and more.",
    readTime: "7 min",
    category: "Credit",
    categoryColor: "blue",
  },
  {
    slug: "tax-deductions-you-might-be-missing",
    title: "Tax Deductions You Might Be Missing",
    description: "Commonly overlooked tax deductions that could save you money this year.",
    readTime: "8 min",
    category: "Taxes",
    categoryColor: "red",
  },
  {
    slug: "side-hustle-income-ideas",
    title: "Side Hustle Income Ideas for 2026",
    description: "Legitimate ways to earn extra income outside your main job.",
    readTime: "10 min",
    category: "Income",
    categoryColor: "emerald",
  },
];

// Category to color mapping
const categoryColors: Record<string, string> = {
  emerald: "bg-emerald-500/10 text-emerald-400",
  blue: "bg-blue-500/10 text-blue-400",
  purple: "bg-purple-500/10 text-purple-400",
  yellow: "bg-yellow-500/10 text-yellow-400",
  red: "bg-red-500/10 text-red-400",
};

interface RelatedArticlesProps {
  currentSlug: string;
  category?: string;
  maxArticles?: number;
  className?: string;
}

export function RelatedArticles({
  currentSlug,
  category,
  maxArticles = 3,
  className = "",
}: RelatedArticlesProps) {
  // Filter out current article and optionally prioritize same category
  let relatedArticles = ALL_ARTICLES.filter(
    (article) => article.slug !== currentSlug
  );

  // If category provided, prioritize articles in same category
  if (category) {
    const sameCategory = relatedArticles.filter((a) => a.category === category);
    const otherCategory = relatedArticles.filter((a) => a.category !== category);
    relatedArticles = [...sameCategory, ...otherCategory];
  }

  // Take only the number we need
  relatedArticles = relatedArticles.slice(0, maxArticles);

  if (relatedArticles.length === 0) return null;

  return (
    <div className={`mt-12 pt-8 border-t border-[#262626] ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="w-5 h-5 text-emerald-400" />
        <h3 className="text-xl font-bold text-white">Related Reading</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {relatedArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
          >
            <a className="group block p-4 rounded-xl bg-[#0f0f0f] border border-[#262626] hover:border-emerald-500/50 transition-all">
              <span
                className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mb-3 ${
                  categoryColors[article.categoryColor || "emerald"]
                }`}
              >
                {article.category}
              </span>
              <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2">
                {article.title}
              </h4>
              <p className="text-sm text-neutral-400 mb-3 line-clamp-2">
                {article.description}
              </p>
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
                <span className="flex items-center gap-1 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}

export { ALL_ARTICLES };
export type { Article };
