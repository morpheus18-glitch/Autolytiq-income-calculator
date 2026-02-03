import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Save, BarChart3, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const STORAGE_KEY = "calculation-count";
const DISMISSED_KEY = "account-prompt-dismissed";
const SHOW_AFTER_COUNT = 2;

interface AccountPromptProps {
  onClose?: () => void;
}

export function AccountPrompt({ onClose }: AccountPromptProps) {
  const { user } = useAuth();
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if user is logged in
    if (user) return;

    // Don't show if dismissed this session
    if (sessionStorage.getItem(DISMISSED_KEY)) return;

    // Check calculation count
    const countStr = localStorage.getItem(STORAGE_KEY);
    const count = countStr ? parseInt(countStr, 10) : 0;

    if (count >= SHOW_AFTER_COUNT) {
      // Small delay before showing
      const timer = setTimeout(() => setShow(true), 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleDismiss = () => {
    setShow(false);
    sessionStorage.setItem(DISMISSED_KEY, "true");
    onClose?.();
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-card border border-border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-6 text-center border-b border-border">
            <div className="w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Save Your Calculations</h2>
            <p className="text-muted-foreground text-sm">
              Create a free account to unlock powerful features
            </p>
          </div>

          {/* Benefits */}
          <div className="p-6">
            <ul className="space-y-3 mb-6">
              {[
                { icon: Save, text: "Save unlimited scenarios" },
                { icon: BarChart3, text: "Compare calculations over time" },
                { icon: Mail, text: "Email your results to yourself" },
              ].map((benefit, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">{benefit.text}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-2">
              <Link href="/signup" onClick={handleDismiss}>
                <Button className="w-full gap-2">
                  <User className="w-4 h-4" />
                  Create Free Account
                </Button>
              </Link>
              <button
                onClick={handleDismiss}
                className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Not now
              </button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              100% free. No credit card required.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to track calculation count
export function useCalculationTracker() {
  const incrementCount = () => {
    const current = localStorage.getItem(STORAGE_KEY);
    const count = current ? parseInt(current, 10) : 0;
    localStorage.setItem(STORAGE_KEY, String(count + 1));
    return count + 1;
  };

  return { incrementCount };
}
