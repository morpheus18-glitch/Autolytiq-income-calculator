import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import { CookieConsentBanner } from "@/components/cookie-consent";

// Lazy load all pages for code splitting
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

// Minimal loading fallback
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Calculator} />
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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="dark" storageKey="income-calc-theme">
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={<PageLoader />}>
            <Router />
          </Suspense>
          <CookieConsentBanner />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
