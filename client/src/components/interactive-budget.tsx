import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Home, Car, CreditCard, ShoppingCart, Zap, Smartphone, Plane, Heart, PiggyBank, Check, AlertTriangle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MoneyInput } from "@/components/money-input";
import { cn } from "@/lib/utils";

interface BudgetStep {
  id: string;
  icon: React.ElementType;
  title: string;
  question: string;
  placeholder: string;
  category: "needs" | "wants" | "savings";
  guideline: number; // Recommended % of income
}

const BUDGET_STEPS: BudgetStep[] = [
  {
    id: "housing",
    icon: Home,
    title: "Housing",
    question: "How much do you spend on housing per month?",
    placeholder: "Rent or mortgage payment",
    category: "needs",
    guideline: 0.28,
  },
  {
    id: "car",
    icon: Car,
    title: "Car Payments",
    question: "What are your monthly car payments?",
    placeholder: "Car loan or lease payment",
    category: "needs",
    guideline: 0.10,
  },
  {
    id: "creditCards",
    icon: CreditCard,
    title: "Credit Cards",
    question: "How much do you pay toward credit cards monthly?",
    placeholder: "Minimum payments or payoff amount",
    category: "needs",
    guideline: 0.05,
  },
  {
    id: "food",
    icon: ShoppingCart,
    title: "Groceries & Food",
    question: "What's your monthly food budget?",
    placeholder: "Groceries and dining out",
    category: "needs",
    guideline: 0.12,
  },
  {
    id: "utilities",
    icon: Zap,
    title: "Utilities",
    question: "How much are your monthly utilities?",
    placeholder: "Electric, gas, water, internet",
    category: "needs",
    guideline: 0.05,
  },
  {
    id: "subscriptions",
    icon: Smartphone,
    title: "Subscriptions",
    question: "What do you spend on subscriptions?",
    placeholder: "Streaming, apps, memberships",
    category: "wants",
    guideline: 0.03,
  },
  {
    id: "entertainment",
    icon: Plane,
    title: "Entertainment & Travel",
    question: "Monthly entertainment and travel spending?",
    placeholder: "Fun, hobbies, vacations",
    category: "wants",
    guideline: 0.05,
  },
  {
    id: "personal",
    icon: Heart,
    title: "Personal & Shopping",
    question: "Personal care and shopping budget?",
    placeholder: "Clothes, personal items",
    category: "wants",
    guideline: 0.05,
  },
  {
    id: "savings",
    icon: PiggyBank,
    title: "Savings",
    question: "How much are you saving each month?",
    placeholder: "Emergency fund, investments",
    category: "savings",
    guideline: 0.20,
  },
];

interface BudgetData {
  [key: string]: number;
}

interface InteractiveBudgetProps {
  monthlyIncome: number;
}

export function InteractiveBudget({ monthlyIncome }: InteractiveBudgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [budgetData, setBudgetData] = useState<BudgetData>({});
  const [showResults, setShowResults] = useState(false);
  const [direction, setDirection] = useState(1);

  const handleStart = () => {
    setIsOpen(true);
    setCurrentStep(0);
    setBudgetData({});
    setShowResults(false);
  };

  const handleNext = () => {
    if (currentStep < BUDGET_STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (showResults) {
      setShowResults(false);
    } else if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  };

  const handleValueChange = (value: string) => {
    const step = BUDGET_STEPS[currentStep];
    setBudgetData({
      ...budgetData,
      [step.id]: parseFloat(value) || 0,
    });
  };

  const currentStepData = BUDGET_STEPS[currentStep];
  const currentValue = budgetData[currentStepData?.id] || 0;

  // Calculate totals
  const totalSpending = Object.values(budgetData).reduce((sum, val) => sum + val, 0);
  const needsTotal = BUDGET_STEPS.filter(s => s.category === "needs")
    .reduce((sum, s) => sum + (budgetData[s.id] || 0), 0);
  const wantsTotal = BUDGET_STEPS.filter(s => s.category === "wants")
    .reduce((sum, s) => sum + (budgetData[s.id] || 0), 0);
  const savingsTotal = budgetData.savings || 0;

  const needsPercent = monthlyIncome > 0 ? (needsTotal / monthlyIncome) * 100 : 0;
  const wantsPercent = monthlyIncome > 0 ? (wantsTotal / monthlyIncome) * 100 : 0;
  const savingsPercent = monthlyIncome > 0 ? (savingsTotal / monthlyIncome) * 100 : 0;
  const leftover = monthlyIncome - totalSpending;

  // Generate recommendations
  const getRecommendations = () => {
    const recommendations: { type: "success" | "warning" | "danger"; message: string }[] = [];

    // Housing check (should be < 30%)
    const housingPercent = monthlyIncome > 0 ? ((budgetData.housing || 0) / monthlyIncome) * 100 : 0;
    if (housingPercent > 30) {
      recommendations.push({
        type: "warning",
        message: `Housing is ${housingPercent.toFixed(0)}% of income. Aim for under 30% to avoid being house-poor.`,
      });
    } else if (housingPercent > 0 && housingPercent <= 30) {
      recommendations.push({
        type: "success",
        message: `Great job! Housing at ${housingPercent.toFixed(0)}% is within the recommended 30%.`,
      });
    }

    // 50/30/20 check
    if (needsPercent > 50) {
      recommendations.push({
        type: "danger",
        message: `Needs are ${needsPercent.toFixed(0)}% of income. The 50/30/20 rule suggests keeping needs under 50%.`,
      });
    }

    if (wantsPercent > 30) {
      recommendations.push({
        type: "warning",
        message: `Wants are ${wantsPercent.toFixed(0)}% of income. Try to keep discretionary spending under 30%.`,
      });
    }

    if (savingsPercent < 10 && monthlyIncome > 0) {
      recommendations.push({
        type: "danger",
        message: `Saving only ${savingsPercent.toFixed(0)}% of income. Aim for at least 20% for financial security.`,
      });
    } else if (savingsPercent >= 20) {
      recommendations.push({
        type: "success",
        message: `Excellent! Saving ${savingsPercent.toFixed(0)}% puts you on track for financial independence.`,
      });
    }

    // Credit card warning
    const ccPercent = monthlyIncome > 0 ? ((budgetData.creditCards || 0) / monthlyIncome) * 100 : 0;
    if (ccPercent > 10) {
      recommendations.push({
        type: "danger",
        message: `Credit card payments at ${ccPercent.toFixed(0)}% is high. Focus on paying down this high-interest debt.`,
      });
    }

    // Leftover money
    if (leftover < 0) {
      recommendations.push({
        type: "danger",
        message: `You're spending $${Math.abs(leftover).toFixed(0)} more than you earn! Review expenses urgently.`,
      });
    } else if (leftover > monthlyIncome * 0.1) {
      recommendations.push({
        type: "success",
        message: `You have $${leftover.toFixed(0)} unallocated. Consider increasing savings or investments.`,
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
            Answer a few quick questions to get personalized budget recommendations based on your spending.
          </p>
          <Button onClick={handleStart} className="gap-2">
            Start Interactive Budget
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardContent className="p-0">
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{
              width: showResults
                ? "100%"
                : `${((currentStep + 1) / BUDGET_STEPS.length) * 100}%`,
            }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait" custom={direction}>
            {showResults ? (
              <motion.div
                key="results"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {/* Results View */}
                <div className="text-center mb-6">
                  <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Your Budget Analysis</h3>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 rounded-lg bg-blue-500/10">
                    <div className="text-2xl font-bold text-blue-500">{needsPercent.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Needs</div>
                    <div className="text-xs text-muted-foreground">(Target: 50%)</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-purple-500/10">
                    <div className="text-2xl font-bold text-purple-500">{wantsPercent.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Wants</div>
                    <div className="text-xs text-muted-foreground">(Target: 30%)</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-500/10">
                    <div className="text-2xl font-bold text-green-500">{savingsPercent.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">Savings</div>
                    <div className="text-xs text-muted-foreground">(Target: 20%)</div>
                  </div>
                </div>

                {/* Spending breakdown */}
                <div className="mb-6 p-4 rounded-lg bg-muted/50">
                  <div className="flex justify-between mb-2">
                    <span>Monthly Income</span>
                    <span className="font-bold">${monthlyIncome.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Total Spending</span>
                    <span className="font-bold">${totalSpending.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Leftover</span>
                    <span className={cn("font-bold", leftover >= 0 ? "text-green-500" : "text-red-500")}>
                      ${leftover.toFixed(0)}
                    </span>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Recommendations</h4>
                  {getRecommendations().map((rec, i) => (
                    <div
                      key={i}
                      className={cn(
                        "p-3 rounded-lg flex gap-3 items-start",
                        rec.type === "success" && "bg-green-500/10 text-green-700 dark:text-green-400",
                        rec.type === "warning" && "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
                        rec.type === "danger" && "bg-red-500/10 text-red-700 dark:text-red-400"
                      )}
                    >
                      {rec.type === "success" ? (
                        <Check className="h-5 w-5 shrink-0 mt-0.5" />
                      ) : rec.type === "warning" ? (
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      )}
                      <span className="text-sm">{rec.message}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={handlePrev} className="flex-1">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Review Answers
                  </Button>
                  <Button onClick={() => setIsOpen(false)} className="flex-1">
                    Done
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                {/* Question View */}
                <div className="text-center mb-6">
                  <div className="p-3 rounded-full bg-primary/10 w-fit mx-auto mb-3">
                    <currentStepData.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    Step {currentStep + 1} of {BUDGET_STEPS.length}
                  </div>
                  <h3 className="text-xl font-bold">{currentStepData.title}</h3>
                  <p className="text-muted-foreground mt-1">{currentStepData.question}</p>
                </div>

                <div className="max-w-xs mx-auto mb-6">
                  <MoneyInput
                    value={currentValue.toString()}
                    onChange={handleValueChange}
                    placeholder={currentStepData.placeholder}
                    className="text-center text-2xl h-14"
                  />
                  {monthlyIncome > 0 && currentValue > 0 && (
                    <div className="text-center mt-2 text-sm text-muted-foreground">
                      {((currentValue / monthlyIncome) * 100).toFixed(1)}% of your income
                      <span className="mx-1">|</span>
                      <span className={cn(
                        (currentValue / monthlyIncome) > currentStepData.guideline
                          ? "text-yellow-500"
                          : "text-green-500"
                      )}>
                        Guideline: {(currentStepData.guideline * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={currentStep === 0 ? () => setIsOpen(false) : handlePrev}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    {currentStep === 0 ? "Cancel" : "Back"}
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    {currentStep === BUDGET_STEPS.length - 1 ? "See Results" : "Next"}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
