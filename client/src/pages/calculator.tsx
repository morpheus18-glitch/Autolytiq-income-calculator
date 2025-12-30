import React, { useState, useEffect, useRef } from "react";
import { format, differenceInCalendarDays, isValid, isBefore, startOfToday, startOfYear, isSameYear, max } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import { 
  Calendar as CalendarIcon, 
  DollarSign, 
  Share2, 
  Moon, 
  Sun, 
  Info, 
  RefreshCcw,
  Check,
  Copy,
  Download
} from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";

// --- Components ---

const MoneyInput = ({ value, onChange, className }: { value: string, onChange: (val: string) => void, className?: string }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits and one decimal point
    const val = e.target.value.replace(/[^0-9.]/g, "");
    if ((val.match(/\./g) || []).length > 1) return;
    onChange(val);
  };

  const formatDisplay = (val: string) => {
    if (!val) return "";
    // Parse and format with commas
    const parts = val.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  return (
    <div className="relative">
      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text" // using text to handle formatting easier
        inputMode="decimal"
        value={formatDisplay(value)}
        onChange={handleChange}
        className={cn("pl-9 font-mono text-lg", className)}
        placeholder="0.00"
        data-testid="input-ytd"
      />
    </div>
  );
};

const ResultRow = ({ label, value, subtext, delay }: { label: string, value: number, subtext?: string, delay: number }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex flex-col p-4 rounded-xl bg-secondary/30 border border-border/50"
    >
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl font-bold font-mono tracking-tight text-foreground">
          <Counter value={value} />
        </span>
        {subtext && <span className="text-xs text-muted-foreground">{subtext}</span>}
      </div>
    </motion.div>
  );
};

const Counter = ({ value }: { value: number }) => {
  // Simple currency formatter
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return <>{formatter.format(value)}</>;
};

const Calculator = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // State
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [checkDate, setCheckDate] = useState<Date | undefined>(startOfToday());
  const [ytdIncome, setYtdIncome] = useState<string>("");
  
  // Load from local storage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("income-calc-state");
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
    localStorage.setItem("income-calc-state", JSON.stringify({
      startDate,
      checkDate,
      ytdIncome
    }));
  }, [startDate, checkDate, ytdIncome, mounted]);

  // Logic
  const calculate = () => {
    if (!startDate || !checkDate || !ytdIncome) return null;
    
    // Validation
    if (isBefore(checkDate, startDate)) return null;

    // Determine effective start date for YTD calculation
    // If job started in a previous year, YTD starts on Jan 1 of the check year
    const checkYearStart = startOfYear(checkDate);
    const effectiveStartDate = isBefore(startDate, checkYearStart) 
      ? checkYearStart 
      : startDate;

    const daysWorked = differenceInCalendarDays(checkDate, effectiveStartDate) + 1; // Inclusive
    if (daysWorked <= 0) return null;

    const income = parseFloat(ytdIncome);
    if (isNaN(income)) return null;

    const daily = income / daysWorked;
    const weekly = daily * 7;
    const monthly = (daily * 365) / 12; // Normalized
    const annual = daily * 365;

    return { daysWorked, daily, weekly, monthly, annual, effectiveStartDate };
  };

  const results = calculate();
  const resultsRef = useRef<HTMLDivElement>(null);

  // Handlers
  const handleShare = async (type: 'copy' | 'image') => {
    if (!results) return;
    
    const text = `Income Calculator Results:\n\n` +
      `📅 Days Worked: ${results.daysWorked} (from ${format(results.effectiveStartDate, "MMM d, yyyy")})\n` +
      `💵 Daily: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(results.daily)}\n` +
      `📅 Weekly: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(results.weekly)}\n` +
      `🗓 Monthly: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(results.monthly)}\n` +
      `💰 Annual: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(results.annual)}\n\n` +
      `Calculated via Income App`;

    if (type === 'copy') {
      navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard", description: "Results ready to share." });
    } else {
      if (!resultsRef.current) return;
      try {
        const dataUrl = await toPng(resultsRef.current, { cacheBust: true, backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff' });
        const link = document.createElement('a');
        link.download = 'income-projection.png';
        link.href = dataUrl;
        link.click();
        toast({ title: "Image generated", description: "Result image downloaded." });
      } catch (err) {
        toast({ title: "Error", description: "Failed to generate image.", variant: "destructive" });
      }
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Income Calc</h1>
            <p className="text-sm text-muted-foreground">True Annual Projection</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full hover:bg-secondary/80"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
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
                    variant={"outline"}
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
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* YTD Income */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Year-to-Date (YTD) Income</Label>
              <MoneyInput 
                value={ytdIncome} 
                onChange={setYtdIncome} 
                className="h-12 text-base"
              />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Pre-tax gross income from your paystub.</p>
                {startDate && checkDate && isBefore(startDate, startOfYear(checkDate)) && (
                   <p className="text-xs text-primary/80 flex items-center gap-1">
                     <Info className="w-3 h-3" />
                     <span>Calculating YTD from Jan 1, {checkDate.getFullYear()}</span>
                   </p>
                )}
              </div>
            </div>

            {/* Check Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                Most Recent Check Date
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The date on your paystub for the YTD amount.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
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
                    disabled={(date) => date > new Date() || (startDate ? date < startDate : false)}
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              ref={resultsRef} // For image generation
              className="bg-card glass-card rounded-xl shadow-2xl overflow-hidden border border-primary/20"
            >
              <div className="bg-primary/10 p-4 border-b border-primary/10 flex justify-between items-center">
                <h3 className="font-semibold text-primary flex items-center gap-2">
                  <Check className="h-4 w-4" /> Projection Ready
                </h3>
                <div className="text-xs font-mono text-primary/80 bg-primary/10 px-2 py-1 rounded">
                  {results.daysWorked} Days (from {format(results.effectiveStartDate, "MMM d")})
                </div>
              </div>
              
              <div className="p-4 grid grid-cols-1 gap-3">
                 <motion.div 
                   className="p-5 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg"
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                 >
                    <div className="text-sm font-medium opacity-90">Projected Annual Income</div>
                    <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tighter mt-1">
                      <Counter value={results.annual} />
                    </div>
                 </motion.div>

                 <div className="grid grid-cols-2 gap-3">
                   <ResultRow label="Monthly" value={results.monthly} subtext="(Normalized)" delay={0.1} />
                   <ResultRow label="Weekly" value={results.weekly} delay={0.2} />
                 </div>
                 
                 <ResultRow label="Daily Average" value={results.daily} delay={0.3} />
              </div>

              <div className="p-4 bg-muted/30 border-t border-border/50 flex gap-2">
                 <Button 
                    className="flex-1" 
                    variant="outline"
                    onClick={() => handleShare('copy')}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy Text
                 </Button>
                 <Button 
                    className="flex-1" 
                    variant="secondary"
                    onClick={() => handleShare('image')}
                  >
                    <Download className="mr-2 h-4 w-4" /> Save Image
                 </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Empty State / Prompt */}
        {!results && (
          <div className="text-center text-muted-foreground py-10 opacity-50">
            <RefreshCcw className="h-10 w-10 mx-auto mb-3" />
            <p>Enter details above to calculate</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Calculator;
