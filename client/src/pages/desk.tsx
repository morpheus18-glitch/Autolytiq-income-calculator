import { useState, useEffect } from "react";
import {
  differenceInCalendarDays,
  isBefore,
  startOfToday,
  startOfYear,
} from "date-fns";
import { motion } from "framer-motion";
import {
  Moon,
  Sun,
  Info,
  RotateCcw,
  LogIn,
  LogOut,
  Calculator as CalcIcon,
  DollarSign,
  BookOpen,
  TrendingUp,
  Car,
  Percent,
  Clock,
  ArrowLeftRight,
  Receipt,
  FileText,
  Home as HomeIcon,
} from "lucide-react";
import { Link } from "wouter";

import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { MoneyInput } from "@/components/money-input";
import { DateInput } from "@/components/date-input";

const STORAGE_KEY = "desk-income-calc-state";
const PAYMENT_STORAGE_KEY = "desk-payment-calc-state";

const LOAN_TERMS = [36, 48, 60, 72, 84];

function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  return payment;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function Desk() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Income Calculator State
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [checkDate, setCheckDate] = useState<Date | undefined>(startOfToday());
  const [ytdIncome, setYtdIncome] = useState<string>("");

  // Payment Calculator State - ALL BLANK by default for quick entry
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [tradeIn, setTradeIn] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [fees, setFees] = useState("");
  const [apr, setApr] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(60);

  // Load from local storage
  useEffect(() => {
    setMounted(true);
    const savedIncome = localStorage.getItem(STORAGE_KEY);
    if (savedIncome) {
      try {
        const parsed = JSON.parse(savedIncome);
        if (parsed.startDate) setStartDate(new Date(parsed.startDate));
        if (parsed.checkDate) setCheckDate(new Date(parsed.checkDate));
        if (parsed.ytdIncome) setYtdIncome(parsed.ytdIncome);
      } catch (e) {
        console.error("Failed to load income state", e);
      }
    }
    const savedPayment = localStorage.getItem(PAYMENT_STORAGE_KEY);
    if (savedPayment) {
      try {
        const parsed = JSON.parse(savedPayment);
        if (parsed.vehiclePrice) setVehiclePrice(parsed.vehiclePrice);
        if (parsed.downPayment) setDownPayment(parsed.downPayment);
        if (parsed.tradeIn) setTradeIn(parsed.tradeIn);
        if (parsed.taxRate) setTaxRate(parsed.taxRate);
        if (parsed.fees) setFees(parsed.fees);
        if (parsed.apr) setApr(parsed.apr);
        if (parsed.selectedTerm) setSelectedTerm(parsed.selectedTerm);
      } catch (e) {
        console.error("Failed to load payment state", e);
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

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(
      PAYMENT_STORAGE_KEY,
      JSON.stringify({ vehiclePrice, downPayment, tradeIn, taxRate, fees, apr, selectedTerm })
    );
  }, [vehiclePrice, downPayment, tradeIn, taxRate, fees, apr, selectedTerm, mounted]);

  // Calculate income results
  const calculateIncome = () => {
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

  const incomeResults = calculateIncome();
  const maxAffordablePayment = incomeResults ? incomeResults.monthly * 0.12 : undefined;

  // Calculate payment results
  const price = parseFloat(vehiclePrice) || 0;
  const down = parseFloat(downPayment) || 0;
  const trade = parseFloat(tradeIn) || 0;
  const tax = parseFloat(taxRate) || 0;
  const dealerFees = parseFloat(fees) || 0;
  const rate = parseFloat(apr) || 0;

  const taxableAmount = Math.max(0, price - trade);
  const taxAmount = taxableAmount * (tax / 100);
  const loanAmount = Math.max(0, price + taxAmount + dealerFees - trade - down);
  const monthlyPayment = loanAmount > 0 && rate > 0 ? calculateMonthlyPayment(loanAmount, rate, selectedTerm) : 0;
  const totalInterest = monthlyPayment * selectedTerm - loanAmount;
  const isAffordable = maxAffordablePayment ? monthlyPayment <= maxAffordablePayment : true;

  const handleResetIncome = () => {
    setStartDate(undefined);
    setCheckDate(startOfToday());
    setYtdIncome("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleResetPayment = () => {
    setVehiclePrice("");
    setDownPayment("");
    setTradeIn("");
    setTaxRate("");
    setFees("");
    setApr("");
    setSelectedTerm(60);
    localStorage.removeItem(PAYMENT_STORAGE_KEY);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="site-header">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="header-logo">
                  <CalcIcon className="h-5 w-5 text-primary" />
                </div>
                <h1 className="header-title">Autolytiq</h1>
              </div>
            </Link>
            <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary font-medium">DESK</span>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/">
              <Button variant="ghost" size="sm" className="header-nav-btn gap-1.5">
                <HomeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="ghost" size="sm" className="header-nav-btn hidden sm:flex gap-1.5">
                <BookOpen className="h-4 w-4" />
                Blog
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="header-nav-btn rounded-full"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {user ? (
              <Button variant="ghost" size="sm" onClick={logout} className="header-nav-btn gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            ) : (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="header-nav-btn gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Income Calculator */}
          <Card className="glass-card border-none shadow-xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Income Calculator
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetIncome}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Job Start Date
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>When did customer start this job?</p>
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
                <Label className="text-sm font-medium">YTD Gross Income</Label>
                <MoneyInput
                  value={ytdIncome}
                  onChange={setYtdIncome}
                  className="h-12 text-base elite-input"
                />
                <p className="text-xs text-muted-foreground">Pre-tax from paystub</p>
              </div>

              {/* Check Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  Check Date
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Date on paystub for YTD amount</p>
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
              </div>

              {/* Income Results */}
              {incomeResults ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-2"
                >
                  <div className="hero-stat text-center">
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Projected Annual
                    </div>
                    <div className="text-3xl font-bold mono-value text-primary neon-text">
                      {formatCurrency(incomeResults.annual)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {incomeResults.daysWorked} days
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="stat-card text-center">
                      <div className="text-xs text-muted-foreground">Monthly</div>
                      <div className="text-sm font-bold mono-value mt-1">
                        {formatCurrency(incomeResults.monthly)}
                      </div>
                    </div>
                    <div className="stat-card text-center">
                      <div className="text-xs text-muted-foreground">Weekly</div>
                      <div className="text-sm font-bold mono-value mt-1">
                        {formatCurrency(incomeResults.weekly)}
                      </div>
                    </div>
                    <div className="stat-card text-center">
                      <div className="text-xs text-muted-foreground">Daily</div>
                      <div className="text-sm font-bold mono-value mt-1">
                        {formatCurrency(incomeResults.daily)}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Max @ 12% PTI</span>
                      </div>
                      <span className="text-lg font-bold text-primary mono-value">
                        {formatCurrency(maxAffordablePayment || 0)}/mo
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-6 text-muted-foreground/50">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Enter paystub details</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Column - Payment Calculator */}
          <Card className="glass-card border-none shadow-xl overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CalcIcon className="h-5 w-5 text-primary" />
                  Payment Calculator
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetPayment}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Vehicle Price */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Car className="h-3.5 w-3.5 text-muted-foreground" />
                  Vehicle Price
                </Label>
                <MoneyInput
                  value={vehiclePrice}
                  onChange={setVehiclePrice}
                  className="h-11"
                />
              </div>

              {/* Down Payment & Trade-In */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                    Down
                  </Label>
                  <MoneyInput
                    value={downPayment}
                    onChange={setDownPayment}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground" />
                    Trade
                  </Label>
                  <MoneyInput
                    value={tradeIn}
                    onChange={setTradeIn}
                    className="h-11"
                  />
                </div>
              </div>

              {/* Tax, Fees, APR */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
                    Tax %
                  </Label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={taxRate}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d.]/g, "");
                        if ((val.match(/\./g) || []).length <= 1) setTaxRate(val);
                      }}
                      className="w-full h-11 px-3 pr-7 rounded-lg border bg-background font-mono text-sm elite-input focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                      placeholder="6.0"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    Fees
                  </Label>
                  <MoneyInput
                    value={fees}
                    onChange={setFees}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Percent className="h-3.5 w-3.5 text-muted-foreground" />
                    APR
                  </Label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={apr}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^\d.]/g, "");
                        if ((val.match(/\./g) || []).length <= 1) setApr(val);
                      }}
                      className="w-full h-11 px-3 pr-7 rounded-lg border bg-background font-mono text-sm elite-input focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                      placeholder="7.99"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                  </div>
                </div>
              </div>

              {/* Loan Term */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Term
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {LOAN_TERMS.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSelectedTerm(term)}
                      className={cn(
                        "py-2 px-1 rounded-lg text-sm font-medium transition-all duration-200 border",
                        selectedTerm === term
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-primary/30"
                      )}
                    >
                      {term}mo
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Results */}
              {loanAmount > 0 && rate > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3 pt-2"
                >
                  <div className={cn("hero-stat text-center", !isAffordable && "border-destructive/50")}>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Monthly Payment
                    </div>
                    <div className={cn(
                      "text-3xl font-bold mono-value",
                      isAffordable ? "text-primary neon-text" : "text-destructive"
                    )}>
                      {formatCurrency(monthlyPayment)}
                      <span className="text-lg font-normal text-muted-foreground">/mo</span>
                    </div>
                    {maxAffordablePayment && (
                      <div className={cn("text-xs mt-2", isAffordable ? "text-primary/80" : "text-destructive")}>
                        {isAffordable
                          ? `Within budget (max ${formatCurrency(maxAffordablePayment)}/mo)`
                          : `Over budget by ${formatCurrency(monthlyPayment - maxAffordablePayment)}/mo`}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="stat-card text-center">
                      <div className="text-xs text-muted-foreground">Financed</div>
                      <div className="text-sm font-bold mono-value mt-1">{formatCurrency(loanAmount)}</div>
                    </div>
                    <div className="stat-card text-center">
                      <div className="text-xs text-muted-foreground">Tax</div>
                      <div className="text-sm font-bold mono-value mt-1">{formatCurrency(taxAmount)}</div>
                    </div>
                    <div className="stat-card text-center">
                      <div className="text-xs text-muted-foreground">Interest</div>
                      <div className="text-sm font-bold mono-value mt-1 text-yellow-500">{formatCurrency(totalInterest)}</div>
                    </div>
                    <div className="stat-card text-center">
                      <div className="text-xs text-muted-foreground">Total</div>
                      <div className="text-sm font-bold mono-value mt-1">{formatCurrency(monthlyPayment * selectedTerm + down + trade)}</div>
                    </div>
                  </div>

                  {/* Quick Comparison */}
                  <div className="pt-1">
                    <div className="text-xs text-muted-foreground mb-2">Compare Terms</div>
                    <div className="space-y-1">
                      {[48, 60, 72].map((term) => {
                        const payment = calculateMonthlyPayment(loanAmount, rate, term);
                        const interest = payment * term - loanAmount;
                        const affordable = maxAffordablePayment ? payment <= maxAffordablePayment : true;
                        return (
                          <div
                            key={term}
                            className={cn(
                              "flex items-center justify-between py-1.5 px-2 rounded-md text-sm",
                              term === selectedTerm && "bg-primary/10"
                            )}
                          >
                            <span className="text-muted-foreground">{term}mo</span>
                            <div className="flex items-center gap-3">
                              <span className={cn("font-mono font-medium", affordable ? "text-foreground" : "text-destructive")}>
                                {formatCurrency(payment)}/mo
                              </span>
                              <span className="text-xs text-yellow-500/80">+{formatCurrency(interest)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-6 text-muted-foreground/50">
                  <Car className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Enter deal details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Autolytiq</span>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Desk;
