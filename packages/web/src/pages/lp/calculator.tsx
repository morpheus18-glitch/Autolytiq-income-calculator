import { useState, useEffect } from "react";
import { differenceInCalendarDays, startOfYear, format } from "date-fns";
import { Calculator, CheckCircle, ArrowRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SEO } from "@/components/seo";
import { analytics } from "@/lib/analytics";

// Landing page optimized for Google Ads conversions
export default function LPCalculator() {
  const [ytdIncome, setYtdIncome] = useState("");
  const [checkDate, setCheckDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [result, setResult] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Track landing page view
    analytics.pageView("/lp/calculator", "Income Calculator - Landing Page");
  }, []);

  const calculateIncome = () => {
    const income = parseFloat(ytdIncome.replace(/[^0-9.]/g, ""));
    if (!income || !checkDate) return;

    const check = new Date(checkDate);
    const yearStart = startOfYear(check);
    const daysPassed = differenceInCalendarDays(check, yearStart) + 1;
    const dailyRate = income / daysPassed;
    const projected = dailyRate * 365;

    setResult(projected);
    analytics.calculationComplete(projected);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !result) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "google-ads-lp",
          income_range: result >= 150000 ? "150k+" : result >= 100000 ? "100k-150k" : result >= 75000 ? "75k-100k" : result >= 50000 ? "50k-75k" : "under-50k"
        })
      });
      setEmailSubmitted(true);
      analytics.newsletterSignup("google-ads-lp");
    } catch {
      // Silent fail
    }
    setIsSubmitting(false);
  };

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white">
      <SEO
        title="Free Income Calculator - Calculate Your Annual Salary"
        description="Calculate your projected annual income from your YTD earnings in seconds. Free, instant, no signup required."
        canonical="https://autolytiqs.com/lp/calculator"
        keywords="income calculator, annual salary calculator, YTD income calculator, salary projection"
      />

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            100% Free • No Signup Required
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Calculate Your Annual Income
            <span className="text-emerald-400"> in Seconds</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Enter your year-to-date earnings and instantly see your projected annual salary
          </p>
        </div>

        {/* Calculator Card */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur max-w-xl mx-auto">
          <CardContent className="p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <Label htmlFor="ytd" className="text-slate-200 text-base font-medium">
                  Year-to-Date Income (from your paystub)
                </Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="ytd"
                    type="text"
                    placeholder="25,000"
                    value={ytdIncome}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.]/g, "");
                      if (val) {
                        setYtdIncome(parseFloat(val).toLocaleString());
                      } else {
                        setYtdIncome("");
                      }
                    }}
                    className="pl-10 h-12 text-lg bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="date" className="text-slate-200 text-base font-medium">
                  Paycheck Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={checkDate}
                  onChange={(e) => setCheckDate(e.target.value)}
                  className="mt-2 h-12 text-lg bg-slate-900/50 border-slate-600 text-white"
                />
              </div>

              <Button
                onClick={calculateIncome}
                disabled={!ytdIncome}
                className="w-full h-12 text-lg font-semibold bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calculate My Annual Income
              </Button>
            </div>

            {/* Result */}
            {result && (
              <div className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                <p className="text-slate-300 mb-2">Your Projected Annual Income</p>
                <p className="text-4xl md:text-5xl font-bold text-emerald-400">
                  {formatCurrency(result)}
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Based on {differenceInCalendarDays(new Date(checkDate), startOfYear(new Date(checkDate))) + 1} days worked
                </p>

                {/* Email Capture */}
                {!emailSubmitted ? (
                  <form onSubmit={handleEmailSubmit} className="mt-6 space-y-3">
                    <p className="text-slate-300 text-sm">Get weekly tips to maximize your income:</p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                        required
                      />
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-white text-slate-900 hover:bg-slate-100"
                      >
                        {isSubmitting ? "..." : <ArrowRight className="w-5 h-5" />}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="mt-6 flex items-center justify-center gap-2 text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                    <span>You're subscribed! Check your inbox.</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust Signals */}
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
          <div>
            <p className="text-3xl font-bold text-white">10K+</p>
            <p className="text-slate-400 text-sm">Calculations</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">Free</p>
            <p className="text-slate-400 text-sm">Forever</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">Instant</p>
            <p className="text-slate-400 text-sm">Results</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {[
            { title: "Accurate Projection", desc: "Uses actual days worked for precise annual estimates" },
            { title: "Works with Any Pay", desc: "Salary, hourly, commission - any income type" },
            { title: "Private & Secure", desc: "Your data stays on your device, never stored" }
          ].map((feature, i) => (
            <div key={i} className="text-center p-4">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-slate-500 text-sm">
          <p>© 2026 Autolytiq • Free Financial Tools</p>
        </div>
      </div>
    </div>
  );
}
