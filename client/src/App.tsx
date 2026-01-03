import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Calculator from "@/pages/calculator";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Calculator} />
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
