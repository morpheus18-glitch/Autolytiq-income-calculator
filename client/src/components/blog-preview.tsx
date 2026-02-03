import { Link } from "wouter";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BlogArticle {
  slug: string;
  title: string;
  description: string;
  readTime: string;
  category: string;
}

// Blog articles organized by calculator relevance
const BLOG_ARTICLES: Record<string, BlogArticle[]> = {
  calculator: [
    {
      slug: "how-to-calculate-annual-income",
      title: "How to Calculate Your Annual Income from YTD Earnings",
      description: "Learn the exact formula to project your annual income from year-to-date paystub earnings.",
      readTime: "12 min",
      category: "Guide",
    },
    {
      slug: "understanding-your-paystub",
      title: "Understanding Your Paystub: Complete Guide",
      description: "Learn how to read every line of your paystub including gross pay, deductions, and YTD totals.",
      readTime: "7 min",
      category: "Guide",
    },
    {
      slug: "salary-negotiation-tips",
      title: "Salary Negotiation Tips That Actually Work",
      description: "Proven strategies to negotiate a higher salary at your current job or new offer.",
      readTime: "8 min",
      category: "Career",
    },
  ],
  auto: [
    {
      slug: "how-much-car-can-i-afford",
      title: "How Much Car Can I Afford? Complete Guide by Salary",
      description: "Calculate what you can afford using the 20/4/10 rule with examples at every income level.",
      readTime: "8 min",
      category: "Guide",
    },
    {
      slug: "what-credit-score-do-you-need",
      title: "What Credit Score Do You Need for an Auto Loan?",
      description: "Credit score requirements for the best auto loan rates and how to improve yours.",
      readTime: "7 min",
      category: "Credit",
    },
  ],
  "smart-money": [
    {
      slug: "50-30-20-budget-rule",
      title: "The 50/30/20 Budget Rule Explained",
      description: "How the 50/30/20 rule works with real examples at every income level.",
      readTime: "10 min",
      category: "Budgeting",
    },
    {
      slug: "first-paycheck-budget",
      title: "Your First Paycheck: A Complete Budgeting Guide",
      description: "How to budget your first paycheck and build good financial habits from the start.",
      readTime: "6 min",
      category: "Budgeting",
    },
    {
      slug: "maximize-your-401k",
      title: "How to Maximize Your 401k in 2026",
      description: "Strategies to get the most from your 401k including contribution limits and matching.",
      readTime: "9 min",
      category: "Retirement",
    },
  ],
  housing: [
    {
      slug: "50-30-20-budget-rule",
      title: "The 50/30/20 Budget Rule Explained",
      description: "How much of your income should go to housing? The 50/30/20 rule has the answer.",
      readTime: "10 min",
      category: "Budgeting",
    },
    {
      slug: "what-credit-score-do-you-need",
      title: "What Credit Score Do You Need for a Mortgage?",
      description: "Credit score requirements for different mortgage types and how to qualify.",
      readTime: "7 min",
      category: "Credit",
    },
  ],
};

interface BlogPreviewProps {
  calculatorType: "calculator" | "auto" | "smart-money" | "housing";
  className?: string;
  maxArticles?: number;
}

export function BlogPreview({ calculatorType, className = "", maxArticles = 3 }: BlogPreviewProps) {
  const articles = BLOG_ARTICLES[calculatorType]?.slice(0, maxArticles) || [];

  if (articles.length === 0) return null;

  return (
    <Card className={`glass-card border-none shadow-xl ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Learn More
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`}>
              <div className="group p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 transition-all cursor-pointer h-full flex flex-col">
                <span className="inline-block w-fit px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary mb-2">
                  {article.category}
                </span>
                <h4 className="font-semibold text-sm group-hover:text-primary transition-colors mb-2 line-clamp-2 flex-grow">
                  {article.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {article.description}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                  <span className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Read
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/blog">
            <span className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
              View all articles
              <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
