import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Home, Car, CreditCard, ShoppingCart, Zap, Smartphone, Tv, Music, Sparkles, Shirt, Package, Coffee, Utensils, Dumbbell, Gamepad2, BookOpen, Scissors, Dog, Baby, Pill, PiggyBank, Check, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Subscription services with typical prices
const SUBSCRIPTIONS = {
  streaming: {
    title: "TV & Video Streaming",
    icon: Tv,
    items: [
      { id: "netflix", name: "Netflix", price: 15.49 },
      { id: "hulu", name: "Hulu", price: 17.99 },
      { id: "disney", name: "Disney+", price: 13.99 },
      { id: "hbomax", name: "Max (HBO)", price: 15.99 },
      { id: "prime", name: "Prime Video", price: 14.99 },
      { id: "apple_tv", name: "Apple TV+", price: 9.99 },
      { id: "peacock", name: "Peacock", price: 7.99 },
      { id: "paramount", name: "Paramount+", price: 11.99 },
      { id: "youtube_premium", name: "YouTube Premium", price: 13.99 },
    ],
  },
  music: {
    title: "Music & Audio",
    icon: Music,
    items: [
      { id: "spotify", name: "Spotify", price: 11.99 },
      { id: "apple_music", name: "Apple Music", price: 10.99 },
      { id: "amazon_music", name: "Amazon Music", price: 9.99 },
      { id: "audible", name: "Audible", price: 14.95 },
      { id: "tidal", name: "Tidal", price: 10.99 },
    ],
  },
  ai: {
    title: "AI & Productivity",
    icon: Sparkles,
    items: [
      { id: "chatgpt", name: "ChatGPT Plus", price: 20.00 },
      { id: "claude", name: "Claude Pro", price: 20.00 },
      { id: "copilot", name: "GitHub Copilot", price: 10.00 },
      { id: "midjourney", name: "Midjourney", price: 10.00 },
      { id: "notion", name: "Notion", price: 10.00 },
      { id: "canva", name: "Canva Pro", price: 12.99 },
    ],
  },
  gaming: {
    title: "Gaming",
    icon: Gamepad2,
    items: [
      { id: "xbox_gamepass", name: "Xbox Game Pass", price: 16.99 },
      { id: "ps_plus", name: "PlayStation Plus", price: 17.99 },
      { id: "nintendo", name: "Nintendo Online", price: 3.99 },
      { id: "ea_play", name: "EA Play", price: 9.99 },
    ],
  },
  fitness: {
    title: "Fitness & Wellness",
    icon: Dumbbell,
    items: [
      { id: "gym", name: "Gym Membership", price: 40.00 },
      { id: "peloton", name: "Peloton", price: 44.00 },
      { id: "classpass", name: "ClassPass", price: 49.00 },
      { id: "headspace", name: "Headspace", price: 12.99 },
      { id: "calm", name: "Calm", price: 14.99 },
    ],
  },
  boxes: {
    title: "Subscription Boxes",
    icon: Package,
    items: [
      { id: "hellofresh", name: "HelloFresh", price: 60.00 },
      { id: "bluapron", name: "Blue Apron", price: 50.00 },
      { id: "fabfitfun", name: "FabFitFun", price: 55.00 },
      { id: "birchbox", name: "Birchbox", price: 15.00 },
      { id: "ipsy", name: "Ipsy", price: 13.00 },
      { id: "boxycharm", name: "BoxyCharm", price: 28.00 },
      { id: "stitch_fix", name: "Stitch Fix", price: 20.00 },
      { id: "bark_box", name: "BarkBox", price: 35.00 },
    ],
  },
  news: {
    title: "News & Reading",
    icon: BookOpen,
    items: [
      { id: "nyt", name: "NY Times", price: 17.00 },
      { id: "wsj", name: "Wall Street Journal", price: 12.00 },
      { id: "wapo", name: "Washington Post", price: 10.00 },
      { id: "kindle", name: "Kindle Unlimited", price: 11.99 },
      { id: "medium", name: "Medium", price: 5.00 },
    ],
  },
  other: {
    title: "Other Services",
    icon: Smartphone,
    items: [
      { id: "icloud", name: "iCloud+", price: 2.99 },
      { id: "google_one", name: "Google One", price: 2.99 },
      { id: "dropbox", name: "Dropbox", price: 11.99 },
      { id: "1password", name: "1Password", price: 4.99 },
      { id: "vpn", name: "VPN Service", price: 12.99 },
    ],
  },
};

interface FrequencyQuestion {
  id: string;
  icon: React.ElementType;
  title: string;
  question: string;
  frequencyLabel: string;
  amountLabel: string;
  frequencyOptions: { label: string; value: number }[];
  amountOptions: { label: string; value: number }[];
  category: "needs" | "wants" | "savings";
  guideline: number;
}

const FREQUENCY_QUESTIONS: FrequencyQuestion[] = [
  {
    id: "groceries",
    icon: ShoppingCart,
    title: "Grocery Shopping",
    question: "Let's figure out your grocery spending",
    frequencyLabel: "How often do you go grocery shopping?",
    amountLabel: "About how much per trip?",
    frequencyOptions: [
      { label: "Once a week", value: 4 },
      { label: "Twice a week", value: 8 },
      { label: "Every 2 weeks", value: 2 },
      { label: "Once a month", value: 1 },
    ],
    amountOptions: [
      { label: "$50-75", value: 62 },
      { label: "$75-100", value: 87 },
      { label: "$100-150", value: 125 },
      { label: "$150-200", value: 175 },
      { label: "$200-300", value: 250 },
      { label: "$300+", value: 350 },
    ],
    category: "needs",
    guideline: 0.10,
  },
  {
    id: "dining",
    icon: Utensils,
    title: "Dining Out",
    question: "How often do you eat out or order delivery?",
    frequencyLabel: "Times per month eating out/ordering",
    amountLabel: "Average spent per meal",
    frequencyOptions: [
      { label: "Rarely (1-2x)", value: 1.5 },
      { label: "Sometimes (3-4x)", value: 3.5 },
      { label: "Weekly (4-5x)", value: 4.5 },
      { label: "Often (6-8x)", value: 7 },
      { label: "Very often (10+)", value: 12 },
    ],
    amountOptions: [
      { label: "$10-15", value: 12 },
      { label: "$15-25", value: 20 },
      { label: "$25-40", value: 32 },
      { label: "$40-60", value: 50 },
      { label: "$60+", value: 75 },
    ],
    category: "wants",
    guideline: 0.05,
  },
  {
    id: "coffee",
    icon: Coffee,
    title: "Coffee & Drinks",
    question: "Coffee shop and drink habits",
    frequencyLabel: "Coffee shop visits per month",
    amountLabel: "Average per visit",
    frequencyOptions: [
      { label: "Never", value: 0 },
      { label: "Few times (2-4x)", value: 3 },
      { label: "Weekly (4-5x)", value: 4.5 },
      { label: "Several/week (8-12x)", value: 10 },
      { label: "Daily (20+)", value: 22 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$4-6", value: 5 },
      { label: "$6-8", value: 7 },
      { label: "$8-12", value: 10 },
      { label: "$12+", value: 15 },
    ],
    category: "wants",
    guideline: 0.02,
  },
  {
    id: "shopping",
    icon: Shirt,
    title: "Clothes & Shopping",
    question: "Clothing and personal shopping",
    frequencyLabel: "Shopping trips per month",
    amountLabel: "Average spent per trip",
    frequencyOptions: [
      { label: "Rarely (0-1x)", value: 0.5 },
      { label: "Monthly (1-2x)", value: 1.5 },
      { label: "Often (2-4x)", value: 3 },
      { label: "Very often (4+)", value: 5 },
    ],
    amountOptions: [
      { label: "$25-50", value: 37 },
      { label: "$50-100", value: 75 },
      { label: "$100-200", value: 150 },
      { label: "$200-300", value: 250 },
      { label: "$300+", value: 400 },
    ],
    category: "wants",
    guideline: 0.05,
  },
  {
    id: "haircare",
    icon: Scissors,
    title: "Hair & Beauty",
    question: "Haircuts, salon, and beauty services",
    frequencyLabel: "Salon/barber visits per month",
    amountLabel: "Average cost per visit",
    frequencyOptions: [
      { label: "Every 2-3 months", value: 0.4 },
      { label: "Monthly", value: 1 },
      { label: "Twice a month", value: 2 },
      { label: "Weekly", value: 4 },
    ],
    amountOptions: [
      { label: "$15-25", value: 20 },
      { label: "$25-50", value: 37 },
      { label: "$50-100", value: 75 },
      { label: "$100-200", value: 150 },
      { label: "$200+", value: 250 },
    ],
    category: "wants",
    guideline: 0.02,
  },
  {
    id: "gas",
    icon: Car,
    title: "Gas & Fuel",
    question: "How often do you fill up your car?",
    frequencyLabel: "Fill-ups per month",
    amountLabel: "Cost per fill-up",
    frequencyOptions: [
      { label: "Don't drive", value: 0 },
      { label: "Once a month", value: 1 },
      { label: "Twice a month", value: 2 },
      { label: "Weekly", value: 4 },
      { label: "Twice a week", value: 8 },
    ],
    amountOptions: [
      { label: "$0", value: 0 },
      { label: "$30-50", value: 40 },
      { label: "$50-70", value: 60 },
      { label: "$70-100", value: 85 },
      { label: "$100+", value: 120 },
    ],
    category: "needs",
    guideline: 0.05,
  },
];

interface FixedExpense {
  id: string;
  icon: React.ElementType;
  title: string;
  question: string;
  placeholder: string;
  category: "needs" | "wants" | "savings";
  guideline: number;
}

const FIXED_EXPENSES: FixedExpense[] = [
  {
    id: "housing",
    icon: Home,
    title: "Housing",
    question: "What's your monthly rent or mortgage?",
    placeholder: "Monthly payment",
    category: "needs",
    guideline: 0.28,
  },
  {
    id: "car_payment",
    icon: Car,
    title: "Car Payment",
    question: "Monthly car payment (if any)?",
    placeholder: "Loan or lease payment",
    category: "needs",
    guideline: 0.08,
  },
  {
    id: "car_insurance",
    icon: Car,
    title: "Car Insurance",
    question: "Monthly car insurance cost?",
    placeholder: "Insurance premium",
    category: "needs",
    guideline: 0.03,
  },
  {
    id: "credit_cards",
    icon: CreditCard,
    title: "Credit Card Payments",
    question: "Monthly credit card payments?",
    placeholder: "Minimum or payoff amount",
    category: "needs",
    guideline: 0.05,
  },
  {
    id: "utilities",
    icon: Zap,
    title: "Utilities",
    question: "Total monthly utilities?",
    placeholder: "Electric, gas, water",
    category: "needs",
    guideline: 0.05,
  },
  {
    id: "phone",
    icon: Smartphone,
    title: "Phone Bill",
    question: "Monthly phone bill?",
    placeholder: "Cell phone plan",
    category: "needs",
    guideline: 0.02,
  },
  {
    id: "internet",
    icon: Zap,
    title: "Internet",
    question: "Monthly internet cost?",
    placeholder: "Home internet",
    category: "needs",
    guideline: 0.02,
  },
  {
    id: "pets",
    icon: Dog,
    title: "Pet Expenses",
    question: "Monthly pet costs (food, vet, etc)?",
    placeholder: "Pet expenses",
    category: "needs",
    guideline: 0.02,
  },
  {
    id: "childcare",
    icon: Baby,
    title: "Childcare",
    question: "Monthly childcare or child expenses?",
    placeholder: "Daycare, activities, etc",
    category: "needs",
    guideline: 0.10,
  },
  {
    id: "health",
    icon: Pill,
    title: "Health & Medical",
    question: "Monthly health expenses (meds, copays)?",
    placeholder: "Out of pocket medical",
    category: "needs",
    guideline: 0.03,
  },
  {
    id: "savings",
    icon: PiggyBank,
    title: "Savings",
    question: "How much do you save each month?",
    placeholder: "Savings & investments",
    category: "savings",
    guideline: 0.20,
  },
];

type Step =
  | { type: "fixed"; data: FixedExpense }
  | { type: "frequency"; data: FrequencyQuestion }
  | { type: "subscriptions"; category: keyof typeof SUBSCRIPTIONS }
  | { type: "results" };

interface InteractiveBudgetProps {
  monthlyIncome: number;
}

export function InteractiveBudget({ monthlyIncome }: InteractiveBudgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Data storage
  const [fixedExpenses, setFixedExpenses] = useState<Record<string, number>>({});
  const [frequencyData, setFrequencyData] = useState<Record<string, { frequency: number; amount: number }>>({});
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<string>>(new Set());

  // Build step sequence
  const steps: Step[] = [
    // Fixed expenses first
    ...FIXED_EXPENSES.map(exp => ({ type: "fixed" as const, data: exp })),
    // Then frequency-based questions
    ...FREQUENCY_QUESTIONS.map(q => ({ type: "frequency" as const, data: q })),
    // Then subscriptions by category
    ...Object.keys(SUBSCRIPTIONS).map(cat => ({ type: "subscriptions" as const, category: cat as keyof typeof SUBSCRIPTIONS })),
    // Finally results
    { type: "results" as const },
  ];

  const totalSteps = steps.length;
  const currentStep = steps[currentStepIndex];

  const handleStart = () => {
    setIsOpen(true);
    setCurrentStepIndex(0);
    setFixedExpenses({});
    setFrequencyData({});
    setSelectedSubscriptions(new Set());
  };

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setDirection(1);
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFixedChange = (id: string, value: string) => {
    setFixedExpenses({ ...fixedExpenses, [id]: parseFloat(value) || 0 });
  };

  const handleFrequencySelect = (id: string, type: "frequency" | "amount", value: number) => {
    setFrequencyData({
      ...frequencyData,
      [id]: {
        ...frequencyData[id],
        [type]: value,
      },
    });
  };

  const toggleSubscription = (id: string) => {
    const newSet = new Set(selectedSubscriptions);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedSubscriptions(newSet);
  };

  // Calculate totals
  const calculateTotals = () => {
    let needs = 0;
    let wants = 0;
    let savings = 0;

    // Fixed expenses
    FIXED_EXPENSES.forEach(exp => {
      const amount = fixedExpenses[exp.id] || 0;
      if (exp.category === "needs") needs += amount;
      else if (exp.category === "wants") wants += amount;
      else savings += amount;
    });

    // Frequency-based expenses
    FREQUENCY_QUESTIONS.forEach(q => {
      const data = frequencyData[q.id];
      if (data) {
        const amount = (data.frequency || 0) * (data.amount || 0);
        if (q.category === "needs") needs += amount;
        else if (q.category === "wants") wants += amount;
        else savings += amount;
      }
    });

    // Subscriptions (all wants)
    Object.values(SUBSCRIPTIONS).forEach(category => {
      category.items.forEach(item => {
        if (selectedSubscriptions.has(item.id)) {
          wants += item.price;
        }
      });
    });

    return { needs, wants, savings, total: needs + wants + savings };
  };

  const { needs, wants, savings, total } = calculateTotals();
  const needsPercent = monthlyIncome > 0 ? (needs / monthlyIncome) * 100 : 0;
  const wantsPercent = monthlyIncome > 0 ? (wants / monthlyIncome) * 100 : 0;
  const savingsPercent = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;
  const leftover = monthlyIncome - total;

  // Calculate subscription total
  const subscriptionTotal = Object.values(SUBSCRIPTIONS).reduce((sum, category) => {
    return sum + category.items.reduce((catSum, item) => {
      return catSum + (selectedSubscriptions.has(item.id) ? item.price : 0);
    }, 0);
  }, 0);

  const getRecommendations = () => {
    const recommendations: { type: "success" | "warning" | "danger"; message: string }[] = [];

    const housingPercent = monthlyIncome > 0 ? ((fixedExpenses.housing || 0) / monthlyIncome) * 100 : 0;
    if (housingPercent > 30) {
      recommendations.push({
        type: "danger",
        message: `Housing is ${housingPercent.toFixed(0)}% of income - above the recommended 30%. Consider finding ways to reduce housing costs.`,
      });
    } else if (housingPercent > 0) {
      recommendations.push({
        type: "success",
        message: `Housing at ${housingPercent.toFixed(0)}% is within the recommended 30%.`,
      });
    }

    if (subscriptionTotal > monthlyIncome * 0.05) {
      recommendations.push({
        type: "warning",
        message: `Subscriptions total $${subscriptionTotal.toFixed(0)}/mo. Review which ones you actually use regularly.`,
      });
    }

    const coffeeData = frequencyData.coffee;
    if (coffeeData && coffeeData.frequency * coffeeData.amount > 100) {
      const coffeeTotal = coffeeData.frequency * coffeeData.amount;
      recommendations.push({
        type: "warning",
        message: `Coffee habit costs $${coffeeTotal.toFixed(0)}/mo ($${(coffeeTotal * 12).toFixed(0)}/year). Making coffee at home could save significantly.`,
      });
    }

    const diningData = frequencyData.dining;
    if (diningData && diningData.frequency * diningData.amount > monthlyIncome * 0.08) {
      recommendations.push({
        type: "warning",
        message: `Dining out is ${((diningData.frequency * diningData.amount / monthlyIncome) * 100).toFixed(0)}% of income. Cooking more meals at home could help.`,
      });
    }

    if (needsPercent > 50) {
      recommendations.push({
        type: "danger",
        message: `Essential expenses are ${needsPercent.toFixed(0)}% of income (target: 50%). Look for areas to cut back.`,
      });
    }

    if (wantsPercent > 30) {
      recommendations.push({
        type: "warning",
        message: `Wants/lifestyle spending is ${wantsPercent.toFixed(0)}% (target: 30%). Consider prioritizing what brings most value.`,
      });
    }

    if (savingsPercent < 10) {
      recommendations.push({
        type: "danger",
        message: `Only saving ${savingsPercent.toFixed(0)}% of income. Aim for at least 20% for financial security.`,
      });
    } else if (savingsPercent >= 20) {
      recommendations.push({
        type: "success",
        message: `Great job saving ${savingsPercent.toFixed(0)}%! You're on track for financial independence.`,
      });
    }

    if (leftover < 0) {
      recommendations.push({
        type: "danger",
        message: `You're spending $${Math.abs(leftover).toFixed(0)} more than you earn! Immediate action needed.`,
      });
    } else if (leftover > monthlyIncome * 0.1) {
      recommendations.push({
        type: "success",
        message: `You have $${leftover.toFixed(0)} unallocated. Consider putting this toward savings or debt payoff.`,
      });
    }

    const ccPayment = fixedExpenses.credit_cards || 0;
    if (ccPayment > monthlyIncome * 0.1) {
      recommendations.push({
        type: "danger",
        message: `Credit card payments are ${((ccPayment / monthlyIncome) * 100).toFixed(0)}% of income. Focus on paying down this high-interest debt.`,
      });
    }

    return recommendations;
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  if (!isOpen) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-6 text-center">
          <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-4">
            <PiggyBank className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Interactive Budget Builder</h3>
          <p className="text-muted-foreground mb-4">
            Answer easy questions about your spending habits to get personalized budget recommendations.
          </p>
          <Button onClick={handleStart} className="gap-2">
            Start Interactive Budget
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderStepContent = () => {
    if (currentStep.type === "fixed") {
      const exp = currentStep.data;
      const value = fixedExpenses[exp.id] || 0;
      const Icon = exp.icon;

      return (
        <div className="text-center">
          <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-1">{exp.title}</h3>
          <p className="text-muted-foreground mb-6">{exp.question}</p>

          <div className="max-w-xs mx-auto">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={value || ""}
                onChange={(e) => handleFixedChange(exp.id, e.target.value.replace(/[^\d.]/g, ""))}
                placeholder={exp.placeholder}
                className="w-full h-14 pl-8 pr-4 text-2xl text-center rounded-lg border bg-background font-mono focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
              />
            </div>
            {monthlyIncome > 0 && value > 0 && (
              <div className="text-sm text-muted-foreground mt-2">
                {((value / monthlyIncome) * 100).toFixed(1)}% of income
                <span className={cn(
                  "ml-2",
                  (value / monthlyIncome) > exp.guideline ? "text-yellow-500" : "text-green-500"
                )}>
                  (guideline: {(exp.guideline * 100).toFixed(0)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentStep.type === "frequency") {
      const q = currentStep.data;
      const data = frequencyData[q.id] || { frequency: 0, amount: 0 };
      const Icon = q.icon;
      const monthlyTotal = data.frequency * data.amount;

      return (
        <div className="text-center">
          <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-1">{q.title}</h3>
          <p className="text-muted-foreground mb-4">{q.question}</p>

          <div className="space-y-4 max-w-sm mx-auto">
            <div>
              <label className="text-sm font-medium block mb-2">{q.frequencyLabel}</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {q.frequencyOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleFrequencySelect(q.id, "frequency", opt.value)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm border transition-all",
                      data.frequency === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-muted border-border"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2">{q.amountLabel}</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {q.amountOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleFrequencySelect(q.id, "amount", opt.value)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm border transition-all",
                      data.amount === opt.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card hover:bg-muted border-border"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {monthlyTotal > 0 && (
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <span className="text-sm text-muted-foreground">Monthly total: </span>
                <span className="font-bold text-lg">${monthlyTotal.toFixed(0)}</span>
                {monthlyIncome > 0 && (
                  <span className={cn(
                    "text-sm ml-2",
                    (monthlyTotal / monthlyIncome) > q.guideline ? "text-yellow-500" : "text-green-500"
                  )}>
                    ({((monthlyTotal / monthlyIncome) * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (currentStep.type === "subscriptions") {
      const category = SUBSCRIPTIONS[currentStep.category];
      const Icon = category.icon;
      const categoryTotal = category.items.reduce((sum, item) =>
        sum + (selectedSubscriptions.has(item.id) ? item.price : 0), 0
      );

      return (
        <div className="text-center">
          <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-1">{category.title}</h3>
          <p className="text-muted-foreground mb-4">Select all that you subscribe to</p>

          <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
            {category.items.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleSubscription(item.id)}
                className={cn(
                  "p-3 rounded-lg text-left border transition-all flex items-center justify-between",
                  selectedSubscriptions.has(item.id)
                    ? "bg-primary/10 border-primary"
                    : "bg-card hover:bg-muted border-border"
                )}
              >
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground">${item.price}/mo</div>
                </div>
                {selectedSubscriptions.has(item.id) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>

          {categoryTotal > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Category total: </span>
              <span className="font-bold">${categoryTotal.toFixed(2)}/mo</span>
            </div>
          )}
        </div>
      );
    }

    if (currentStep.type === "results") {
      return (
        <div>
          <div className="text-center mb-6">
            <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Your Budget Analysis</h3>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 rounded-lg bg-blue-500/10">
              <div className="text-2xl font-bold text-blue-500">{needsPercent.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Needs</div>
              <div className="text-xs font-medium">${needs.toFixed(0)}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-purple-500/10">
              <div className="text-2xl font-bold text-purple-500">{wantsPercent.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Wants</div>
              <div className="text-xs font-medium">${wants.toFixed(0)}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-green-500/10">
              <div className="text-2xl font-bold text-green-500">{savingsPercent.toFixed(0)}%</div>
              <div className="text-xs text-muted-foreground">Savings</div>
              <div className="text-xs font-medium">${savings.toFixed(0)}</div>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-lg bg-muted/50 space-y-2">
            <div className="flex justify-between">
              <span>Monthly Income</span>
              <span className="font-bold">${monthlyIncome.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Spending</span>
              <span className="font-bold">${total.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span>Subscriptions</span>
              <span className="font-medium text-muted-foreground">${subscriptionTotal.toFixed(0)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span>Leftover</span>
              <span className={cn("font-bold", leftover >= 0 ? "text-green-500" : "text-red-500")}>
                ${leftover.toFixed(0)}
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            <h4 className="font-semibold sticky top-0 bg-background py-1">Recommendations</h4>
            {getRecommendations().map((rec, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-lg flex gap-3 items-start text-sm",
                  rec.type === "success" && "bg-green-500/10 text-green-700 dark:text-green-400",
                  rec.type === "warning" && "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
                  rec.type === "danger" && "bg-red-500/10 text-red-700 dark:text-red-400"
                )}
              >
                {rec.type === "success" ? (
                  <Check className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <span>{rec.message}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardContent className="p-0">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Close button */}
        <div className="flex justify-between items-center px-4 pt-3">
          <span className="text-xs text-muted-foreground">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-muted"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 pt-2">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStepIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            {currentStep.type === "results" ? (
              <Button onClick={() => setIsOpen(false)} className="flex-1">
                Done
              </Button>
            ) : (
              <Button onClick={handleNext} className="flex-1">
                {currentStepIndex === totalSteps - 2 ? "See Results" : "Next"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
