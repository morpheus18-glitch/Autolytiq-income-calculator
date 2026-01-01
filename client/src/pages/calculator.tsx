import { useState, useEffect, useRef } from "react";
import {
  differenceInCalendarDays,
  isBefore,
  startOfToday,
  startOfYear,
} from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  Moon,
  Sun,
  Info,
  RefreshCcw,
  RotateCcw,
  LogIn,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";

import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MoneyInput } from "@/components/money-input";
import { DateInput } from "@/components/date-input";
import { ResultsCard, type CalculationResults } from "@/components/results-card";
import { PTISection } from "@/components/pti-section";
import { PaymentCalculator } from "@/components/payment-calculator";
import { AffiliateSection } from "@/components/affiliate-section";
import { LeadCaptureModal } from "@/components/lead-capture-modal";

const STORAGE_KEY = "income-calc-state";

function Calculator() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // State
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [checkDate, setCheckDate] = useState<Date | undefined>(startOfToday());
  const [ytdIncome, setYtdIncome] = useState<string>("");
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [hasShownModal, setHasShownModal] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Load from local storage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.startDate) setStartDate(new Date(parsed.startDate));
        if (parsed.checkDate) setCheckDate(new Date(parsed.checkDate));
        if (parsed.ytdIncome) setYtdIncome(parsed.ytdIncome);
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ startDate, checkDate, ytdIncome })
    );
  }, [startDate, checkDate, ytdIncome, mounted]);

  // Calculate results
  const calculate = (): CalculationResults | null => {
    if (!startDate || !checkDate || !ytdIncome) return null;
    if (isBefore(checkDate, startDate)) return null;

    const checkYearStart = startOfYear(checkDate);
    const effectiveStartDate = isBefore(startDate, checkYearStart)
      ? checkYearStart
      : startDate;

    const daysWorked = differenceInCalendarDays(checkDate, effectiveStartDate) + 1;
    if (daysWorked <= 0) return null;

    const income = parseFloat(ytdIncome);
    if (isNaN(income)) return null;

    const daily = income / daysWorked;
    const weekly = daily * 7;
    const monthly = (daily * 365) / 12;
    const annual = daily * 365;

    return { daysWorked, daily, weekly, monthly, annual, effectiveStartDate };
  };

  const results = calculate();

  // Show lead capture modal after results are displayed (with delay)
  useEffect(() => {
    if (results && !hasShownModal && !user) {
      const timer = setTimeout(() => {
        setShowLeadModal(true);
        setHasShownModal(true);
      }, 8000); // Show after 8 seconds
      return () => clearTimeout(timer);
    }
  }, [results, hasShownModal, user]);

  // Calculate max affordable payment (12% PTI)
  const maxAffordablePayment = results ? results.monthly * 0.12 : undefined;

  const handleReset = () => {
    setStartDate(undefined);
    setCheckDate(startOfToday());
    setYtdIncome("");
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center font-sans">
      {/* Subtle grid background for dark mode */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-md px-4 py-6 sm:py-8 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-0.5"
          >
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <span className="dark:neon-text">Income Calc</span>
              <Sparkles className="h-4 w-4 text-primary opacity-70" />
            </h1>
            <p className="text-sm text-muted-foreground">
              Precision Annual Projections
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-1"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="rounded-full hover:bg-secondary/80 elite-button"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full hover:bg-secondary/80 elite-button"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {user ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="rounded-full hover:bg-secondary/80 elite-button"
                title={`Logout (${user.email})`}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-secondary/80 elite-button"
                  title="Sign in"
                >
                  <LogIn className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </motion.div>
        </header>

        {/* Inputs Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-none shadow-xl overflow-hidden">
            <CardContent className="pt-6 space-y-5">
              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Job Start Date
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>When did you start this job?</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <DateInput
                  value={startDate}
                  onChange={setStartDate}
                  maxDate={new Date()}
                  placeholder="MM/DD/YYYY"
                />
              </div>

              {/* YTD Income */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Year-to-Date (YTD) Income
                </Label>
                <MoneyInput
                  value={ytdIncome}
                  onChange={setYtdIncome}
                  className="h-12 text-base elite-input"
                />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Pre-tax gross income from your paystub
                  </p>
                  {startDate &&
                    checkDate &&
                    isBefore(startDate, startOfYear(checkDate)) && (
                      <p className="text-xs text-primary/80 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        <span>
                          Calculating YTD from Jan 1, {checkDate.getFullYear()}
                        </span>
                      </p>
                    )}
                </div>
              </div>

              {/* Check Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Most Recent Check Date
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The date on your paystub for the YTD amount</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <DateInput
                  value={checkDate}
                  onChange={setCheckDate}
                  minDate={startDate}
                  maxDate={new Date()}
                  placeholder="MM/DD/YYYY"
                />
                {startDate && checkDate && isBefore(checkDate, startDate) && (
                  <p className="text-xs text-destructive font-medium animate-pulse">
                    Check date cannot be before start date
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results Card */}
        <AnimatePresence>
          {results && (
            <ResultsCard results={results} resultsRef={resultsRef} />
          )}
        </AnimatePresence>

        {/* PTI Section */}
        {results && <PTISection monthlyIncome={results.monthly} />}

        {/* Payment Calculator */}
        {results && (
          <PaymentCalculator maxAffordablePayment={maxAffordablePayment} />
        )}

        {/* Affiliate Section */}
        {results && <AffiliateSection annualIncome={results.annual} />}

        {/* Empty State */}
        {!results && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-muted-foreground py-12"
          >
            <div className="relative inline-block">
              <RefreshCcw className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <div className="absolute inset-0 blur-xl bg-primary/10 rounded-full" />
            </div>
            <p className="text-sm">Enter your details above to calculate</p>
            <p className="text-xs text-muted-foreground/50 mt-1">
              Your data stays on your device
            </p>
          </motion.div>
        )}

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-6 pb-4"
        >
          <p className="text-xs text-muted-foreground/50">
            Calculations are estimates only. Consult a financial advisor.
          </p>
        </motion.footer>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        annualIncome={results?.annual}
      />
    </div>
  );
}

export default Calculator;
