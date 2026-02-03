import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
  className?: string;
}

export function FAQ({ items, title = "Frequently Asked Questions", className }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item, index) => {
          const isLastOdd = items.length % 2 === 1 && index === items.length - 1;
          return (
          <div
            key={index}
            className={cn(
              "p-4 rounded-xl bg-card border border-border/50 transition-all cursor-pointer hover:border-primary/30 hover:shadow-md faq-trigger",
              openIndex === index && "border-primary/50 bg-card/80",
              isLastOdd && "sm:col-span-2"
            )}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setOpenIndex(openIndex === index ? null : index)}
          >
            <div className="flex items-start justify-between gap-2 min-h-[36px]">
              <span className="font-medium text-sm leading-tight">{item.question}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform shrink-0 mt-0.5",
                  openIndex === index && "rotate-180 text-primary"
                )}
              />
            </div>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 pt-3 border-t border-border/50 text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
        })}
      </div>
    </div>
  );
}

// Pre-built FAQ sets for each page
export const INCOME_CALCULATOR_FAQ: FAQItem[] = [
  {
    question: "How is my annual income calculated?",
    answer: "We take your year-to-date (YTD) gross income and divide it by the number of days you've worked, then multiply by 365 to project your annual income. This accounts for your actual earning period rather than assuming a full year.",
  },
  {
    question: "What is YTD income on my paystub?",
    answer: "YTD (Year-to-Date) income is your total gross earnings since January 1st of the current year. You can find this on your paystub, usually labeled 'YTD Gross' or 'YTD Earnings'. It includes all wages before taxes and deductions.",
  },
  {
    question: "Why use job start date instead of January 1st?",
    answer: "If you started your job after January 1st, using your actual start date gives a more accurate projection. Otherwise, it would assume you earned your YTD amount over more days than you actually worked.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes! All calculations happen in your browser. Your financial data is stored locally on your device and is never sent to our servers unless you explicitly choose to email your results.",
  },
  {
    question: "What's the 12% rule for car payments?",
    answer: "Financial experts recommend keeping your total car payment (including insurance) at or below 12% of your gross monthly income. This helps ensure you can afford the vehicle without straining your budget.",
  },
];

export const BUDGET_PLANNER_FAQ: FAQItem[] = [
  {
    question: "What is the 50/30/20 rule?",
    answer: "The 50/30/20 budget rule suggests allocating 50% of your after-tax income to needs (housing, utilities, groceries), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment.",
  },
  {
    question: "How are taxes calculated?",
    answer: "We use the 2024 federal tax brackets with the standard deduction ($14,600 for single filers). State taxes are estimated based on your input rate. FICA taxes (Social Security + Medicare) are calculated at 7.65%.",
  },
  {
    question: "What counts as 'needs' vs 'wants'?",
    answer: "Needs are essential expenses: housing, utilities, groceries, transportation, insurance, minimum debt payments. Wants are non-essential: dining out, streaming services, hobbies, vacations. The line can be personal, but be honest!",
  },
  {
    question: "Why is 20% savings recommended?",
    answer: "The 20% savings goal includes emergency fund contributions, retirement savings (401k, IRA), and debt repayment beyond minimums. This rate helps build long-term wealth and financial security.",
  },
];

export const HOUSING_FAQ: FAQItem[] = [
  {
    question: "What's the 30% rule for rent?",
    answer: "The 30% rule suggests spending no more than 30% of your gross monthly income on rent. Some financial experts recommend 25% of your net (after-tax) income for a more conservative approach.",
  },
  {
    question: "What is DTI (Debt-to-Income ratio)?",
    answer: "DTI measures your monthly debt payments against your gross income. Front-end DTI includes only housing costs (aim for ≤28%). Back-end DTI includes all debts (aim for ≤36%). Lenders use these to determine loan eligibility.",
  },
  {
    question: "What is PMI and when is it required?",
    answer: "Private Mortgage Insurance (PMI) is required when you put less than 20% down on a home. It typically costs 0.5-1% of the loan annually. PMI can be removed once you reach 20% equity.",
  },
  {
    question: "Should I rent or buy?",
    answer: "It depends on your situation. Buying makes sense if you plan to stay 5+ years, have 20% down payment, and your monthly payment fits within 28% DTI. Renting offers flexibility and lower upfront costs.",
  },
];

export const AUTO_FAQ: FAQItem[] = [
  {
    question: "How much car can I afford?",
    answer: "A common guideline is keeping your car payment at or below 12% of your gross monthly income, with total transportation costs (payment + insurance + fuel + maintenance) under 20%. We calculate this based on your income.",
  },
  {
    question: "Should I buy new or used?",
    answer: "Used cars (2-3 years old) often offer the best value—you avoid the steepest depreciation while still getting modern features. Certified Pre-Owned (CPO) vehicles offer warranties with used car pricing.",
  },
  {
    question: "What affects my auto loan rate?",
    answer: "Your credit score is the biggest factor. Other factors include loan term (shorter = lower rate), down payment amount, new vs. used vehicle, and the lender. Always get pre-approved before shopping.",
  },
  {
    question: "What's included in 'total cost of ownership'?",
    answer: "Beyond your car payment: insurance ($150-300/mo), fuel ($150-250/mo), maintenance ($50-100/mo), registration fees, and depreciation. These can add $400-600+ monthly to your costs.",
  },
];

export const GIG_WORKER_FAQ: FAQItem[] = [
  {
    question: "How is my true net income calculated?",
    answer: "We subtract estimated business expenses (based on your platform type) from your gross earnings, then calculate self-employment tax (15.3% on 92.35% of net) and estimated federal income tax to show what you actually keep.",
  },
  {
    question: "What expenses are included in the deduction?",
    answer: "For rideshare drivers, we estimate ~30% for mileage, phone, and supplies. Delivery drivers typically have ~25% expenses. Freelancers on platforms like Upwork usually have ~10% (mainly platform fees). You can customize the expense rate.",
  },
  {
    question: "What is self-employment tax?",
    answer: "Self-employment tax is 15.3% (12.4% Social Security + 2.9% Medicare) that you pay as a 1099 worker. W-2 employees split this with their employer, but gig workers pay both halves. It's calculated on 92.35% of your net earnings.",
  },
  {
    question: "Why should I set aside money for quarterly taxes?",
    answer: "As a gig worker, no taxes are withheld from your payments. The IRS expects quarterly estimated tax payments to avoid penalties. We calculate 25% of each quarter's tax liability to keep you on track.",
  },
];

export const INCOME_STREAMS_FAQ: FAQItem[] = [
  {
    question: "What is 'reliable income' and how is it calculated?",
    answer: "Reliable income is your total income weighted by stability. A W-2 job (stability 5) counts at 100%, while variable gig work (stability 2) counts at 65%. This gives lenders and you a realistic view of dependable income.",
  },
  {
    question: "How do I choose a stability rating?",
    answer: "Rate based on how consistent the income is: 5 (Very Stable) for W-2 employment with steady hours, 4 (Stable) for rental income or long-term contracts, 3 (Moderate) for freelance work, 2 (Variable) for gig work, 1 (Very Variable) for irregular side hustles.",
  },
  {
    question: "Why track multiple income streams?",
    answer: "Modern workers often have multiple income sources. Combining them gives you a complete picture for budgeting, shows lenders your total earnings, and helps you understand which income sources are most reliable.",
  },
  {
    question: "How does this connect to other calculators?",
    answer: "Your combined income from all streams can be used in our auto and housing affordability calculators. The reliable income figure is especially useful for understanding what lenders will consider when evaluating you for loans.",
  },
];
