import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, Shield, BarChart3, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConsentStatus = "pending" | "accepted" | "declined" | "customized";

interface ConsentPreferences {
  analytics: boolean;
  functional: boolean;
}

const CONSENT_STORAGE_KEY = "cookie-consent";
const CONSENT_PREFS_KEY = "cookie-preferences";

function getStoredConsent(): ConsentStatus | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONSENT_STORAGE_KEY) as ConsentStatus | null;
}

function getStoredPreferences(): ConsentPreferences {
  if (typeof window === "undefined") return { analytics: false, functional: true };
  const stored = localStorage.getItem(CONSENT_PREFS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { analytics: false, functional: true };
    }
  }
  return { analytics: false, functional: true };
}

function setConsent(status: ConsentStatus, preferences: ConsentPreferences) {
  localStorage.setItem(CONSENT_STORAGE_KEY, status);
  localStorage.setItem(CONSENT_PREFS_KEY, JSON.stringify(preferences));

  // Update GA4 consent mode
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("consent", "update", {
      analytics_storage: preferences.analytics ? "granted" : "denied",
      ad_storage: "denied", // We don't use ads
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }
}

// Initialize consent mode on page load (called from index.html)
export function initializeConsent() {
  const consent = getStoredConsent();
  const prefs = getStoredPreferences();

  if (typeof window !== "undefined" && window.gtag) {
    if (consent === "accepted" || (consent === "customized" && prefs.analytics)) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
  }
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    analytics: true,
    functional: true,
  });

  useEffect(() => {
    // Check if consent has been given
    const consent = getStoredConsent();
    if (!consent || consent === "pending") {
      // Small delay for better UX - don't show immediately
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const prefs = { analytics: true, functional: true };
    setConsent("accepted", prefs);
    setVisible(false);
  };

  const handleDeclineAll = () => {
    const prefs = { analytics: false, functional: true };
    setConsent("declined", prefs);
    setVisible(false);
  };

  const handleSavePreferences = () => {
    setConsent("customized", preferences);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="mx-auto max-w-4xl">
          <div className="glass-card rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
            {/* Main Banner */}
            <div className="p-4 md:p-6">
              <div className="flex items-start gap-4">
                <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Cookie className="h-6 w-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">We value your privacy</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use cookies to enhance your browsing experience and analyze site traffic.
                    By clicking "Accept All", you consent to our use of cookies.
                    You can customize your preferences or decline non-essential cookies.
                  </p>

                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    {showDetails ? "Hide details" : "Customize preferences"}
                  </button>
                </div>

                <button
                  onClick={handleDeclineAll}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Decline cookies"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Expandable Details */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                      {/* Essential Cookies */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-emerald-500" />
                          <div>
                            <div className="font-medium text-sm">Essential Cookies</div>
                            <div className="text-xs text-muted-foreground">
                              Required for basic site functionality
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-emerald-500 font-medium">Always On</div>
                      </div>

                      {/* Analytics Cookies */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium text-sm">Analytics Cookies</div>
                            <div className="text-xs text-muted-foreground">
                              Help us understand how you use our site
                            </div>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.analytics}
                            onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                            className="sr-only peer"
                          />
                          <div className={cn(
                            "w-11 h-6 rounded-full peer transition-colors",
                            "bg-secondary peer-checked:bg-primary",
                            "after:content-[''] after:absolute after:top-[2px] after:left-[2px]",
                            "after:bg-white after:rounded-full after:h-5 after:w-5",
                            "after:transition-transform peer-checked:after:translate-x-5"
                          )} />
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                {showDetails ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleDeclineAll}
                      className="flex-1 sm:flex-none"
                    >
                      Decline All
                    </Button>
                    <Button
                      onClick={handleSavePreferences}
                      className="flex-1 sm:flex-none"
                    >
                      Save Preferences
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleDeclineAll}
                      className="flex-1 sm:flex-none"
                    >
                      Decline
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      className="flex-1 sm:flex-none"
                    >
                      Accept All
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Footer Links */}
            <div className="px-4 md:px-6 py-3 bg-secondary/30 border-t border-border/50">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <a href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </a>
                <a href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Small button to re-open consent modal (for footer)
export function ManageCookiesButton({ className }: { className?: string }) {
  const handleClick = () => {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
    window.location.reload();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1",
        className
      )}
    >
      <Cookie className="h-3 w-3" />
      Manage Cookies
    </button>
  );
}
