/**
 * Pro Report Upsell Component
 *
 * Displays at peak intent (results screen) to offer Pro upgrade.
 * Feature-flagged - only shows when monetization + proReport enabled.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, X, Loader2, Crown, TrendingUp, Target, Calendar, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMonetization } from '@/hooks/use-monetization';
import { TIER_FEATURES } from '@/lib/monetization';

interface ProUpsellProps {
  reportId?: string;
  onEmailClick?: () => void;
  className?: string;
}

export function ProUpsell({ reportId, onEmailClick, className = '' }: ProUpsellProps) {
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [localError, setLocalError] = useState('');

  const {
    flags,
    pricing,
    canShowUpsell,
    loading,
    checkoutLoading,
    checkoutError,
    startCheckout,
  } = useMonetization(reportId);

  // Don't render if monetization is disabled or loading
  if (loading || !flags?.monetizationEnabled || !flags?.proReportEnabled) {
    return null;
  }

  // Don't show if user can't upgrade (already has Pro or higher)
  if (!canShowUpsell) {
    return null;
  }

  const proPrice = pricing?.proReport?.priceFormatted || '$9.99';

  const handleUpgradeClick = () => {
    setShowModal(true);
    setLocalError('');
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !email.includes('@')) {
      setLocalError('Please enter a valid email address');
      return;
    }

    await startCheckout(email);
  };

  const proFeatures = [
    { icon: TrendingUp, label: 'Income Stability Score', description: 'See how consistent your income is' },
    { icon: Target, label: 'Approval Readiness', description: 'Know where you stand with lenders' },
    { icon: Sparkles, label: 'Top 3 Leverage Moves', description: 'Personalized income growth tips' },
    { icon: Calendar, label: '30-Day Action Plan', description: 'Week-by-week financial tasks' },
    { icon: Lightbulb, label: 'Expanded Tips', description: 'In-depth strategies for your level' },
  ];

  return (
    <>
      {/* Inline Upsell Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className={`glass-card rounded-xl overflow-hidden border-2 border-primary/30 ${className}`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Unlock Pro Report</span>
          </div>
          <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {proPrice}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-4">
            Get deeper insights and a personalized action plan based on your income.
          </p>

          {/* Feature Preview */}
          <div className="space-y-2 mb-4">
            {proFeatures.slice(0, 3).map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <feature.icon className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature.label}</span>
              </div>
            ))}
            <div className="text-xs text-muted-foreground pl-6">
              + 2 more exclusive features
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleUpgradeClick}
              className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Sparkles className="h-4 w-4" />
              Unlock Pro Report
            </Button>
            {onEmailClick && (
              <Button variant="outline" onClick={onEmailClick} className="w-full">
                Email Basic Report (Free)
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border rounded-2xl shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6 relative">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="text-xl font-bold">Pro Income Report</h3>
                    <p className="text-sm text-muted-foreground">One-time purchase</p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">{proPrice}</div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {/* Feature List */}
                <div className="space-y-3 mb-6">
                  {proFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <feature.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{feature.label}</div>
                        <div className="text-xs text-muted-foreground">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Email Form */}
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label htmlFor="checkout-email" className="block text-sm font-medium mb-2">
                      Email to receive your Pro Report
                    </label>
                    <input
                      id="checkout-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                  </div>

                  {(localError || checkoutError) && (
                    <p className="text-sm text-red-500">{localError || checkoutError}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={checkoutLoading}
                    className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80 py-6"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Redirecting to checkout...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Continue to Payment
                      </>
                    )}
                  </Button>
                </form>

                {/* Trust Signals */}
                <div className="mt-4 pt-4 border-t text-center">
                  <p className="text-xs text-muted-foreground">
                    Secure payment via Stripe. Instant delivery to your email.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * Feature Comparison Table Component
 */
export function TierComparison({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border overflow-hidden ${className}`}>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="text-left p-4 font-medium">Feature</th>
            <th className="text-center p-4 font-medium">Free</th>
            <th className="text-center p-4 font-medium text-primary">
              <div className="flex items-center justify-center gap-1">
                <Crown className="h-4 w-4" />
                Pro
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {TIER_FEATURES.filter(f => f.premium !== false || f.pro !== false).slice(0, 8).map((feature, i) => (
            <tr key={i} className="border-b last:border-0">
              <td className="p-4 text-sm">{feature.name}</td>
              <td className="p-4 text-center">
                {feature.free ? (
                  <Check className="h-5 w-5 text-green-500 mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                )}
              </td>
              <td className="p-4 text-center bg-primary/5">
                {feature.pro ? (
                  <Check className="h-5 w-5 text-primary mx-auto" />
                ) : (
                  <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
