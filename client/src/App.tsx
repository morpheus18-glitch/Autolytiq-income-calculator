import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Calculator from "@/pages/calculator";
import Desk from "@/pages/desk";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Admin from "@/pages/admin";
import BlogIndex from "@/pages/blog/index";
import BlogCalculateIncome from "@/pages/blog/how-to-calculate-annual-income";
import BlogSalaryNegotiation from "@/pages/blog/salary-negotiation-tips";
import BlogMaximize401k from "@/pages/blog/maximize-your-401k";
import BlogUnderstandingPaystub from "@/pages/blog/understanding-your-paystub";
import BlogSideHustleIdeas from "@/pages/blog/side-hustle-income-ideas";
import BlogTaxDeductions from "@/pages/blog/tax-deductions-you-might-be-missing";

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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
