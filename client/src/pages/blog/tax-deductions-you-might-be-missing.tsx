import { Link } from "wouter";
import { ArrowLeft, Calendar, Clock, Receipt, Calculator, DollarSign, Home, Briefcase, Heart, GraduationCap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlogFeedback } from "@/components/blog-feedback";

export default function TaxDeductionsYouMightBeMissing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/blog">
            <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
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
            Taxes
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            12 Tax Deductions You Might Be Missing
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              December 15, 2025
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              9 min read
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed">
            The average taxpayer overpays by hundreds of dollars every year simply by missing deductions they're entitled to. Here are 12 commonly overlooked deductions that could put money back in your pocket.
          </p>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 my-8">
            <p className="text-primary font-medium mb-2">Standard vs. Itemized Deductions</p>
            <p className="text-muted-foreground">
              For 2025, the standard deduction is $14,600 (single) or $29,200 (married filing jointly). You should only itemize if your deductions exceed these amounts. However, some deductions are "above-the-line" and reduce your income even if you take the standard deduction.
            </p>
          </div>

          {/* Above-the-Line Deductions */}
          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Above-the-Line Deductions</h2>
          <p className="text-muted-foreground">
            These reduce your adjusted gross income (AGI) regardless of whether you itemize.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">1. Student Loan Interest</h3>
                <p className="text-primary text-sm font-medium">Up to $2,500/year</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Deduct interest paid on qualified student loans, even if your parents pay them. Phases out at higher incomes ($75,000-$90,000 single, $155,000-$185,000 married). Your loan servicer sends Form 1098-E showing the amount.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">2. Educator Expenses</h3>
                <p className="text-primary text-sm font-medium">Up to $300/year</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Teachers, instructors, counselors, and principals who work at least 900 hours in K-12 can deduct unreimbursed classroom supplies. This includes books, computer equipment, supplies, and professional development courses.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">3. HSA Contributions</h3>
                <p className="text-primary text-sm font-medium">Up to $4,150 (single) or $8,300 (family)</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Contributions to a Health Savings Account are fully deductible. Money grows tax-free and withdrawals for medical expenses are tax-free. If you have a high-deductible health plan, max this out—it's triple tax-advantaged.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">4. Self-Employment Tax Deduction</h3>
                <p className="text-primary text-sm font-medium">7.65% of self-employment income</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Self-employed individuals pay both the employee and employer portion of FICA taxes (15.3%). You can deduct the employer half (7.65%) from your income. This is automatic when you file Schedule SE.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">5. Traditional IRA Contributions</h3>
                <p className="text-primary text-sm font-medium">Up to $7,000 ($8,000 if 50+)</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              If you're not covered by a workplace retirement plan (or your income is below limits), you can deduct IRA contributions. Even if you can't deduct, consider a non-deductible IRA as a backdoor Roth conversion strategy.
            </p>
          </div>

          {/* Itemized Deductions */}
          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Itemized Deductions</h2>
          <p className="text-muted-foreground">
            These only help if your total itemized deductions exceed the standard deduction.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">6. State & Local Taxes (SALT)</h3>
                <p className="text-primary text-sm font-medium">Up to $10,000</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Deduct state income taxes (or sales tax if no state income tax), plus property taxes. The $10,000 cap hits high-tax state residents, but it's still a significant deduction. Keep receipts for large purchases if claiming sales tax.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">7. Mortgage Interest</h3>
                <p className="text-primary text-sm font-medium">Interest on up to $750,000 of mortgage debt</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Deduct interest on your primary home and one second home. Your lender sends Form 1098. Home equity loan interest is also deductible if the loan was used to buy, build, or improve the home.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">8. Charitable Donations</h3>
                <p className="text-primary text-sm font-medium">Up to 60% of AGI for cash donations</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Cash and property donations to qualified charities are deductible. Don't forget non-cash donations like clothing, furniture, and household items. Get receipts for donations over $250. Donating appreciated stock avoids capital gains tax.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">9. Medical Expenses</h3>
                <p className="text-primary text-sm font-medium">Expenses exceeding 7.5% of AGI</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              You can deduct unreimbursed medical expenses that exceed 7.5% of your adjusted gross income. Includes health insurance premiums (if not pre-tax), dental, vision, prescriptions, therapy, and even travel for medical care.
            </p>
          </div>

          {/* Self-Employed Deductions */}
          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Self-Employed & Side Hustle Deductions</h2>
          <p className="text-muted-foreground">
            If you have any self-employment income, these deductions can significantly reduce your tax bill.
          </p>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Home className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">10. Home Office Deduction</h3>
                <p className="text-primary text-sm font-medium">$5/sq ft up to 300 sq ft, or actual expenses</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              If you use part of your home regularly and exclusively for business, you can deduct it. The simplified method allows $5 per square foot (up to $1,500). The actual expense method requires calculating the business percentage of rent, utilities, and repairs.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">11. Business Expenses</h3>
                <p className="text-primary text-sm font-medium">Fully deductible</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Deduct ordinary and necessary business expenses: software subscriptions, equipment, professional development, business travel, client meals (50%), marketing, and professional services. Keep detailed records and receipts.
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 my-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">12. Qualified Business Income (QBI)</h3>
                <p className="text-primary text-sm font-medium">Up to 20% of business income</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Pass-through business owners (sole proprietors, LLCs, S-corps) can deduct up to 20% of their qualified business income. This is one of the most valuable deductions for self-employed individuals, with some income and industry limitations.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">Tax Credits vs. Deductions</h2>
          <p className="text-muted-foreground">
            Don't confuse deductions with credits—credits are even more valuable:
          </p>

          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-semibold text-foreground mb-2">Deductions</h4>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>• Reduce your taxable income</li>
                <li>• Value depends on tax bracket</li>
                <li>• $1,000 deduction in 22% bracket = $220 savings</li>
              </ul>
            </div>
            <div className="bg-card border border-border rounded-xl p-5">
              <h4 className="font-semibold text-foreground mb-2">Credits</h4>
              <ul className="text-muted-foreground text-sm space-y-1">
                <li>• Reduce your tax bill directly</li>
                <li>• Dollar-for-dollar reduction</li>
                <li>• $1,000 credit = $1,000 savings</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-foreground mt-10 mb-4">How to Maximize Your Deductions</h2>
          <div className="bg-card border border-border rounded-xl p-6 my-6 space-y-4">
            <div>
              <h4 className="font-semibold text-foreground">Keep Detailed Records</h4>
              <p className="text-muted-foreground text-sm">Save receipts, use expense tracking apps, and maintain organized files</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Bunch Deductions</h4>
              <p className="text-muted-foreground text-sm">If close to the standard deduction, combine two years of charitable giving into one</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Max Out Tax-Advantaged Accounts</h4>
              <p className="text-muted-foreground text-sm">401(k), IRA, and HSA contributions reduce taxable income</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Review Last Year's Return</h4>
              <p className="text-muted-foreground text-sm">Look for deductions you may have missed and can claim this year</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Consider a Tax Professional</h4>
              <p className="text-muted-foreground text-sm">If you have complex income, the fee often pays for itself in found deductions</p>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 my-8">
            <p className="text-primary font-medium mb-2">Disclaimer</p>
            <p className="text-muted-foreground text-sm">
              This article is for informational purposes only and does not constitute tax advice. Tax laws change frequently. Consult a qualified tax professional for advice specific to your situation.
            </p>
          </div>

          <div className="my-8">
            <Link href="/">
              <Button size="lg" className="gap-2">
                <Calculator className="w-5 h-5" />
                Calculate My Income
              </Button>
            </Link>
          </div>
        </div>

        {/* Feedback & Share */}
        <BlogFeedback
          slug="tax-deductions-you-might-be-missing"
          title="12 Tax Deductions You Might Be Missing"
        />

        {/* CTA */}
        <div className="p-8 bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl text-center">
          <Receipt className="w-12 h-12 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-3">Know Your Income First</h3>
          <p className="text-muted-foreground mb-6">Calculate your annual income to understand your tax bracket and plan your deductions effectively.</p>
          <Link href="/">
            <Button size="lg" className="gap-2">
              <TrendingUp className="w-5 h-5" />
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
          </div>
        </div>
      </footer>
    </div>
  );
}
