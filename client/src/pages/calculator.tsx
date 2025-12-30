import { useState, useEffect, useRef } from "react";
import {
  format,
  differenceInCalendarDays,
  isBefore,
  startOfToday,
  startOfYear,
} from "date-fns";
import { AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Moon,
  Sun,
  Info,
  RefreshCcw,
  RotateCcw,
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import { Link } from "wouter";

import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MoneyInput } from "@/components/money-input";
import { ResultsCard, type CalculationResults } from "@/components/results-card";
import { PTISection } from "@/components/pti-section";

const STORAGE_KEY = "income-calc-state";

function Calculator() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // State
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [checkDate, setCheckDate] = useState<Date | undefined>(startOfToday());
  const [ytdIncome, setYtdIncome] = useState<string>("");

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

  const handleReset = () => {
    setStartDate(undefined);
    setCheckDate(startOfToday());
    setYtdIncome("");
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 flex flex-col items-center font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Income Calc</h1>
            <p className="text-sm text-muted-foreground">
              True Annual Projection
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="rounded-full hover:bg-secondary/80"
              title="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full hover:bg-secondary/80"
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
                className="rounded-full hover:bg-secondary/80"
                title={`Logout (${user.email})`}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-secondary/80"
                  title="Sign in"
                >
                  <LogIn className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Inputs Card */}
        <Card className="glass-card border-none shadow-xl">
          <CardContent className="pt-6 space-y-6">
            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Job Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12 text-base input-ring",
                      !startDate && "text-muted-foreground"
                    )}
                    data-testid="input-start-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* YTD Income */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Year-to-Date (YTD) Income
              </Label>
              <MoneyInput
                value={ytdIncome}
                onChange={setYtdIncome}
                className="h-12 text-base"
              />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Pre-tax gross income from your paystub.
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
                    <p>The date on your paystub for the YTD amount.</p>
                  </TooltipContent>
                </Tooltip>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12 text-base input-ring",
                      !checkDate && "text-muted-foreground"
                    )}
                    data-testid="input-check-date"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkDate ? format(checkDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkDate}
                    onSelect={setCheckDate}
                    disabled={(date) =>
                      date > new Date() || (startDate ? date < startDate : false)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {startDate && checkDate && isBefore(checkDate, startDate) && (
                <p className="text-xs text-destructive font-medium animate-pulse">
                  Check date cannot be before start date.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <AnimatePresence>
          {results && (
            <ResultsCard results={results} resultsRef={resultsRef} />
          )}
        </AnimatePresence>

        {/* PTI Section */}
        {results && <PTISection monthlyIncome={results.monthly} />}

        {/* Empty State */}
        {!results && (
          <div className="text-center text-muted-foreground py-10 opacity-50">
            <RefreshCcw className="h-10 w-10 mx-auto mb-3" />
            <p>Enter details above to calculate</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Calculator;
