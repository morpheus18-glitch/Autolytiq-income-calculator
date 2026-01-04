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
  Calculator as CalcIcon,
  Shield,
  Zap,
  Mail,
  TrendingUp,
  DollarSign,
  Calendar,
  BookOpen,
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
import { ExitIntentPopup, useExitIntent } from "@/components/exit-intent-popup";

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

  // Exit intent popup
  const { showPopup: showExitIntent, closePopup: closeExitIntent } = useExitIntent();

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
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Subtle grid background for dark mode */}
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />

      {/* Desktop Header Bar - Only visible on lg+ */}
      <header className="hidden lg:block sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 dark:bg-primary/20">
              <CalcIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight dark:neon-text">Autolytiq</h1>
              <p className="text-xs text-muted-foreground">Free Income Calculator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="rounded-full hover:bg-secondary/80">
                <BookOpen className="h-4 w-4 mr-2" />
                Blog
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="rounded-full hover:bg-secondary/80"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full hover:bg-secondary/80"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="rounded-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm" className="rounded-full">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative w-full">
        {/* Mobile Layout */}
        <div className="lg:hidden flex flex-col items-center px-4 py-6 sm:py-8 space-y-6 max-w-md mx-auto">
          {/* Mobile Header */}
          <header className="w-full space-y-4">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-0.5"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20">
                    <CalcIcon className="h-5 w-5 text-primary" />
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    <span className="dark:neon-text">Autolytiq</span>
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground">
                  Free Income Calculator
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-1"
              >
                <Link href="/blog">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-secondary/80 elite-button"
                    title="Blog"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="rounded-full hover:bg-secondary/80 elite-button"
                  title="Reset Calculator"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-full hover:bg-secondary/80 elite-button"
                  title="Toggle Theme"
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
            </div>

            {/* Mobile Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-center space-y-2 py-2"
            >
              <h2 className="text-lg font-semibold text-foreground">
                Calculate Your Annual Income from YTD Earnings
              </h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Enter your paystub details to instantly project your yearly salary.
                Perfect for W2 employees, hourly workers, and contractors.
              </p>
              <div className="flex justify-center gap-4 pt-1">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3 text-primary" />
                  100% Private
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Zap className="h-3 w-3 text-primary" />
                  Instant Results
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  Free Forever
                </span>
              </div>
            </motion.div>
          </header>

          {/* Mobile Inputs Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full"
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

          {/* Mobile Results */}
          <AnimatePresence>
            {results && (
              <ResultsCard results={results} resultsRef={resultsRef} />
            )}
          </AnimatePresence>

          {results && <PTISection monthlyIncome={results.monthly} />}
          {results && (
            <PaymentCalculator maxAffordablePayment={maxAffordablePayment} />
          )}
          {results && <AffiliateSection annualIncome={results.annual} />}

          {/* Mobile Empty State */}
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

          {/* Mobile Footer */}
          <MobileFooter />
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block max-w-7xl mx-auto px-6 py-10">
          {/* Desktop Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Calculate Your Annual Income from YTD Earnings
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Enter your paystub details to instantly project your yearly salary.
              Perfect for W2 employees, hourly workers, and contractors.
            </p>
            <div className="flex justify-center gap-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="p-2 rounded-full bg-primary/10">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <span>100% Private - Data stays on your device</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="p-2 rounded-full bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <span>Instant calculations</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="p-2 rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <span>Free forever, no sign-up required</span>
              </div>
            </div>
          </motion.div>

          {/* Desktop Two-Column Layout */}
          <div className="grid grid-cols-12 gap-8">
            {/* Left Column - Input Form */}
            <div className="col-span-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="glass-card border-none shadow-xl overflow-hidden sticky top-24">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold">Enter Your Details</h3>
                    </div>

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
                      <Label className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        Year-to-Date (YTD) Income
                      </Label>
                      <MoneyInput
                        value={ytdIncome}
                        onChange={setYtdIncome}
                        className="h-14 text-lg elite-input"
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

                    {/* Quick Stats */}
                    {results && (
                      <div className="pt-4 border-t border-border/30">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span>{results.daysWorked} days worked this period</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Results */}
            <div className="col-span-7 space-y-6">
              <AnimatePresence mode="wait">
                {results ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <ResultsCard results={results} resultsRef={resultsRef} />

                    <div className="grid grid-cols-2 gap-6">
                      <PTISection monthlyIncome={results.monthly} />
                      <PaymentCalculator maxAffordablePayment={maxAffordablePayment} />
                    </div>

                    <AffiliateSection annualIncome={results.annual} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex items-center justify-center"
                  >
                    <Card className="glass-card border-none shadow-xl w-full">
                      <CardContent className="py-20 text-center">
                        <div className="relative inline-block mb-6">
                          <div className="p-6 rounded-full bg-primary/5">
                            <TrendingUp className="h-16 w-16 text-primary/30" />
                          </div>
                          <div className="absolute inset-0 blur-2xl bg-primary/10 rounded-full" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Ready to Calculate</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Enter your job start date, YTD income from your paystub, and your most recent
                          check date to see your projected annual income.
                        </p>
                        <div className="flex justify-center gap-6 mt-8 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-primary" />
                            Your data stays on your device
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Footer */}
          <DesktopFooter />
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        annualIncome={results?.annual}
      />

      {/* Exit Intent Popup */}
      {showExitIntent && <ExitIntentPopup onClose={closeExitIntent} />}
    </div>
  );
}

// Mobile Footer Component
function MobileFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="w-full pt-8 pb-6 space-y-6"
    >
      {/* How It Works Section */}
      <div className="text-center space-y-3 border-t border-border/30 pt-6">
        <h3 className="text-sm font-semibold text-foreground">How It Works</h3>
        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
          <div className="space-y-1">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-xs">1</div>
            <p>Enter your job start date</p>
          </div>
          <div className="space-y-1">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-xs">2</div>
            <p>Add YTD income from paystub</p>
          </div>
          <div className="space-y-1">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-xs">3</div>
            <p>Get instant projections</p>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex justify-center gap-6 text-xs text-muted-foreground/70">
        <div className="flex items-center gap-1">
          <Shield className="h-3.5 w-3.5" />
          <span>SSL Secured</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="h-3.5 w-3.5" />
          <span>No Sign-up Required</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground/50 text-center max-w-sm mx-auto">
        This calculator provides estimates only and should not be considered financial advice.
        Consult a qualified financial advisor for important financial decisions.
      </p>

      {/* Links */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs">
        <Link href="/blog" className="text-muted-foreground/60 hover:text-primary transition-colors inline-flex items-center gap-1">
          <BookOpen className="h-3 w-3" />
          Blog
        </Link>
        <Link href="/privacy" className="text-muted-foreground/60 hover:text-primary transition-colors">
          Privacy Policy
        </Link>
        <Link href="/terms" className="text-muted-foreground/60 hover:text-primary transition-colors">
          Terms of Service
        </Link>
        <a
          href="mailto:admin@autolytiqs.com"
          className="text-muted-foreground/60 hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <Mail className="h-3 w-3" />
          Contact
        </a>
      </div>

      {/* Copyright */}
      <div className="text-center space-y-1 pt-2 border-t border-border/20">
        <p className="text-xs text-muted-foreground/40">
          © {new Date().getFullYear()} Autolytiq. All rights reserved.
        </p>
        <p className="text-[10px] text-muted-foreground/30">
          Free Income Calculator | Salary Estimator | YTD to Annual Converter
        </p>
      </div>
    </motion.footer>
  );
}

// Desktop Footer Component
function DesktopFooter() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-16 border-t border-border/30"
    >
      {/* How It Works - Desktop */}
      <div className="py-12">
        <h3 className="text-lg font-semibold text-center mb-8">How It Works</h3>
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-lg">1</div>
            <h4 className="font-medium">Enter Start Date</h4>
            <p className="text-sm text-muted-foreground">Input when you started your current job</p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-lg">2</div>
            <h4 className="font-medium">Add YTD Income</h4>
            <p className="text-sm text-muted-foreground">Enter your year-to-date gross income from your paystub</p>
          </div>
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-lg">3</div>
            <h4 className="font-medium">Get Projections</h4>
            <p className="text-sm text-muted-foreground">Instantly see your projected daily, weekly, monthly, and annual income</p>
          </div>
        </div>
      </div>

      {/* Trust & Links Row */}
      <div className="py-8 border-t border-border/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Trust Badges */}
          <div className="flex gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>No Sign-up Required</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Free Forever</span>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-sm">
            <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Blog
            </Link>
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <a
              href="mailto:admin@autolytiqs.com"
              className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              <Mail className="h-4 w-4" />
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Copyright Row */}
      <div className="py-6 border-t border-border/20 text-center">
        <p className="text-sm text-muted-foreground/50 mb-2">
          This calculator provides estimates only and should not be considered financial advice.
        </p>
        <p className="text-xs text-muted-foreground/40">
          © {new Date().getFullYear()} Autolytiq. All rights reserved. | Free Income Calculator | Salary Estimator | YTD to Annual Converter
        </p>
      </div>
    </motion.footer>
  );
}

export default Calculator;
