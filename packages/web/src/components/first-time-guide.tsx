import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GuideStep {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

interface FirstTimeGuideProps {
  storageKey: string;
  title: string;
  subtitle?: string;
  steps: GuideStep[];
  className?: string;
  delay?: number; // Delay before showing in ms
}

export function FirstTimeGuide({
  storageKey,
  title,
  subtitle,
  steps,
  className,
  delay = 1000,
}: FirstTimeGuideProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasSeenGuide = localStorage.getItem(`guide-seen-${storageKey}`);
    if (!hasSeenGuide) {
      const timer = setTimeout(() => setIsVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [storageKey, delay]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`guide-seen-${storageKey}`, "true");
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden",
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-xs text-primary font-medium">Quick Guide</span>
              </div>
              <h3 className="text-xl font-bold">{title}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>

            {/* Steps */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {currentStep + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{steps[currentStep].title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {steps[currentStep].description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Step indicators */}
              <div className="flex items-center justify-center gap-1.5 mt-6">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      index === currentStep
                        ? "bg-primary w-6"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6">
                <button
                  onClick={handleDismiss}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip tour
                </button>
                <Button onClick={handleNext} className="gap-1">
                  {currentStep < steps.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Pre-built guides for each page
export const CALCULATOR_GUIDE_STEPS = [
  {
    title: "Enter your job start date",
    description: "When did you start your current job? If you've been working all year, use January 1st.",
  },
  {
    title: "Find your YTD gross income",
    description: "Look on your paystub for 'YTD Gross' or 'Year-to-Date Earnings' - this is your total pre-tax income since January 1st.",
  },
  {
    title: "Enter your paystub date",
    description: "This is the date on your most recent paycheck. We'll use this to calculate your daily earning rate.",
  },
  {
    title: "See your projected income",
    description: "We'll show you your projected annual income, plus what you can afford for cars and housing!",
  },
];

export const HOUSING_GUIDE_STEPS = [
  {
    title: "Enter your income",
    description: "Start with your monthly gross income. If you've used our income calculator, this auto-fills!",
  },
  {
    title: "Choose rent or buy",
    description: "Toggle between the rent and mortgage calculators to compare your options.",
  },
  {
    title: "Check affordability",
    description: "We'll show you if your housing is within the recommended 30% of income guideline.",
  },
];

export const AUTO_GUIDE_STEPS = [
  {
    title: "Enter your monthly income",
    description: "Your gross monthly income helps us calculate the 12% rule for affordable car payments.",
  },
  {
    title: "Select your credit score",
    description: "Your credit tier determines your estimated interest rate and affects affordability.",
  },
  {
    title: "See what you can afford",
    description: "We'll show you the maximum vehicle price and monthly payment that fits your budget.",
  },
];

export const BUDGET_GUIDE_STEPS = [
  {
    title: "Enter your annual income",
    description: "Start with your gross annual income. If you've used our calculator, this auto-fills!",
  },
  {
    title: "See the 50/30/20 breakdown",
    description: "We split your after-tax income into Needs (50%), Wants (30%), and Savings (20%).",
  },
  {
    title: "Track your expenses",
    description: "Use the interactive budget section to categorize and track where your money actually goes.",
  },
];
