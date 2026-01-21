/**
 * Referral Share Component
 *
 * Allows users to generate and share referral links to unlock Pro features.
 * Feature-flagged - only shows when referralUnlockEnabled is true.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Copy, Check, Share2, Loader2, Crown, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReferral, useMonetizationFlags } from '@/hooks/use-monetization';
import { toast } from '@/hooks/use-toast';

interface ReferralShareProps {
  reportId?: string;
  email?: string;
  className?: string;
}

export function ReferralShare({ reportId, email: initialEmail, className = '' }: ReferralShareProps) {
  const [email, setEmail] = useState(initialEmail || '');
  const [copied, setCopied] = useState(false);

  const { flags, loading: flagsLoading } = useMonetizationFlags();
  const {
    referral,
    loading,
    creating,
    error,
    createCode,
    shareUrl,
  } = useReferral(reportId);

  // Don't render if referral system is disabled
  if (flagsLoading || !flags?.referralUnlockEnabled) {
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className={`rounded-xl border p-4 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading referral info...</span>
        </div>
      </div>
    );
  }

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    await createCode(email);
  };

  const handleCopyLink = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied!',
        description: 'Share this link with friends to unlock Pro features',
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Income Calculator',
          text: 'Check out this free income calculator! Use my link:',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled or share failed, fall back to copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const required = referral?.required || 1;
  const count = referral?.count || 0;
  const progress = Math.min((count / required) * 100, 100);
  const rewardUnlocked = referral?.rewardGranted || count >= required;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b flex items-center gap-2">
        <Gift className="h-5 w-5 text-purple-500" />
        <span className="font-medium">Unlock Pro Free</span>
      </div>

      <div className="p-4">
        {!referral?.hasCode ? (
          // Create referral code form
          <form onSubmit={handleCreateCode} className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Share your link with {required} friend{required > 1 ? 's' : ''} and unlock Pro Report features for free!
            </p>

            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2 rounded-lg border bg-background focus:ring-2 focus:ring-purple-500/30 outline-none text-sm"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              disabled={creating}
              className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4" />
                  Get My Referral Link
                </>
              )}
            </Button>
          </form>
        ) : (
          // Show referral code and progress
          <div className="space-y-4">
            {rewardUnlocked ? (
              // Reward unlocked
              <div className="text-center py-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                  <Crown className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-semibold text-primary">Pro Unlocked!</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Thanks to your referrals, you have Pro access.
                </p>
              </div>
            ) : (
              <>
                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Referrals
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {count} / {required}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {required - count} more referral{required - count > 1 ? 's' : ''} to unlock Pro!
                  </p>
                </div>

                {/* Share Link */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your referral link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl || ''}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm rounded-lg border bg-muted/50 truncate"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                      className="flex-shrink-0"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="flex-1 gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Link
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Compact Referral Badge
 * Shows referral progress in a minimal format
 */
export function ReferralBadge({ reportId, className = '' }: { reportId?: string; className?: string }) {
  const { flags } = useMonetizationFlags();
  const { referral, loading } = useReferral(reportId);

  if (!flags?.referralUnlockEnabled || loading || !referral?.hasCode) {
    return null;
  }

  const required = referral?.required || 1;
  const count = referral?.count || 0;
  const rewardUnlocked = referral?.rewardGranted || count >= required;

  if (rewardUnlocked) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium ${className}`}>
        <Crown className="h-3 w-3" />
        Pro via Referral
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-medium ${className}`}>
      <Users className="h-3 w-3" />
      {count}/{required} referrals
    </div>
  );
}
