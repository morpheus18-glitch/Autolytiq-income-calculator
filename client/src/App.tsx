import { Suspense, lazy, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { CookieConsentBanner } from "@/components/cookie-consent";
import { StickyChecklist } from "@/components/sticky-checklist";
import { analytics } from "@/lib/analytics";

// Lazy load all pages for code splitting
const Home = lazy(() => import("@/pages/home"));
const Calculator = lazy(() => import("@/pages/calculator"));
const Desk = lazy(() => import("@/pages/desk"));
const Login = lazy(() => import("@/pages/login"));
const Signup = lazy(() => import("@/pages/signup"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Admin = lazy(() => import("@/pages/admin"));
const Auto = lazy(() => import("@/pages/auto"));
const SmartMoney = lazy(() => import("@/pages/smart-money"));
const Housing = lazy(() => import("@/pages/housing"));
const NotFound = lazy(() => import("@/pages/not-found"));
const BlogIndex = lazy(() => import("@/pages/blog/index"));
const BlogCalculateIncome = lazy(() => import("@/pages/blog/how-to-calculate-annual-income"));
const BlogSalaryNegotiation = lazy(() => import("@/pages/blog/salary-negotiation-tips"));
const BlogMaximize401k = lazy(() => import("@/pages/blog/maximize-your-401k"));
const BlogUnderstandingPaystub = lazy(() => import("@/pages/blog/understanding-your-paystub"));
const BlogSideHustleIdeas = lazy(() => import("@/pages/blog/side-hustle-income-ideas"));
const BlogTaxDeductions = lazy(() => import("@/pages/blog/tax-deductions-you-might-be-missing"));
const BlogCarAffordability = lazy(() => import("@/pages/blog/how-much-car-can-i-afford"));
const BlogFirstPaycheck = lazy(() => import("@/pages/blog/first-paycheck-budget"));
const Blog503020Rule = lazy(() => import("@/pages/blog/503020-budget-rule"));
const BlogCreditScore = lazy(() => import("@/pages/blog/what-credit-score-do-you-need"));
const Unsubscribe = lazy(() => import("@/pages/unsubscribe"));
const LPCalculator = lazy(() => import("@/pages/lp/calculator"));
const FreeTools = lazy(() => import("@/pages/free-tools"));
const GigCalculator = lazy(() => import("@/pages/gig-calculator"));
const IncomeStreams = lazy(() => import("@/pages/income-streams"));

// Programmatic SEO pages
const AffordIndex = lazy(() => import("@/pages/afford/index"));
const AffordPage = lazy(() => import("@/pages/afford/[salary]"));
const BestIndex = lazy(() => import("@/pages/best/index"));
const BestPage = lazy(() => import("@/pages/best/[category]"));
const CompareIndex = lazy(() => import("@/pages/compare/index"));
const ComparePage = lazy(() => import("@/pages/compare/[slug]"));
const SalaryIndex = lazy(() => import("@/pages/salary/index"));
const SalaryPage = lazy(() => import("@/pages/salary/[job]"));
const QuizFinancialHealth = lazy(() => import("@/pages/quiz/financial-health"));
const SharePage = lazy(() => import("@/pages/share/[type]"));
const IncomeCalculatorIndex = lazy(() => import("@/pages/income-calculator/index"));
const IncomeCalculatorStateIndex = lazy(() => import("@/pages/income-calculator/state/index"));
const IncomeCalculatorDynamic = lazy(() => import("@/pages/income-calculator/[param]"));

// Minimal loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

// Track page views for SPA navigation
function PageViewTracker() {
  const [location] = useLocation();

  useEffect(() => {
    // Get page title from document or derive from path
    const pageTitle = document.title || location;
    analytics.pageView(location, pageTitle);
  }, [location]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/desk" component={Desk} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/admin" component={Admin} />
      <Route path="/auto" component={Auto} />
      <Route path="/smart-money" component={SmartMoney} />
      <Route path="/housing" component={Housing} />
      <Route path="/blog" component={BlogIndex} />
      <Route path="/blog/how-to-calculate-annual-income" component={BlogCalculateIncome} />
      <Route path="/blog/salary-negotiation-tips" component={BlogSalaryNegotiation} />
      <Route path="/blog/maximize-your-401k" component={BlogMaximize401k} />
      <Route path="/blog/understanding-your-paystub" component={BlogUnderstandingPaystub} />
      <Route path="/blog/side-hustle-income-ideas" component={BlogSideHustleIdeas} />
      <Route path="/blog/tax-deductions-you-might-be-missing" component={BlogTaxDeductions} />
      <Route path="/blog/how-much-car-can-i-afford" component={BlogCarAffordability} />
      <Route path="/blog/first-paycheck-budget" component={BlogFirstPaycheck} />
      <Route path="/blog/50-30-20-budget-rule" component={Blog503020Rule} />
      <Route path="/blog/what-credit-score-do-you-need" component={BlogCreditScore} />
      <Route path="/unsubscribe" component={Unsubscribe} />
      <Route path="/lp/calculator" component={LPCalculator} />
      <Route path="/free-tools" component={FreeTools} />
      <Route path="/gig-calculator" component={GigCalculator} />
      <Route path="/income-streams" component={IncomeStreams} />
      {/* Programmatic SEO routes */}
      <Route path="/afford" component={AffordIndex} />
      <Route path="/afford/:salary" component={AffordPage} />
      <Route path="/best" component={BestIndex} />
      <Route path="/best/:category" component={BestPage} />
      <Route path="/compare" component={CompareIndex} />
      <Route path="/compare/:slug" component={ComparePage} />
      <Route path="/salary" component={SalaryIndex} />
      <Route path="/salary/:job" component={SalaryPage} />
      <Route path="/quiz/financial-health" component={QuizFinancialHealth} />
      <Route path="/share/:type" component={SharePage} />
      <Route path="/income-calculator" component={IncomeCalculatorIndex} />
      <Route path="/income-calculator/state" component={IncomeCalculatorStateIndex} />
      <Route path="/income-calculator/:param" component={IncomeCalculatorDynamic} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="income-calc-theme">
        <TooltipProvider>
          <PageViewTracker />
          <Toaster />
          <Suspense fallback={<PageLoader />}>
            <Router />
          </Suspense>
          <StickyChecklist />
          <CookieConsentBanner />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
