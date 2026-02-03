import { useState, useEffect } from "react";
import { X, CreditCard, ExternalLink, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";

interface CreditKarmaPopupProps {
  onClose: () => void;
}

export function CreditKarmaPopup({ onClose }: CreditKarmaPopupProps) {
  const handleClick = () => {
    analytics.affiliateClick("Credit Karma", "credit", "https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202", "exit-popup");
    localStorage.setItem("creditKarmaPopupShown", "true");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-[#0f0f0f] border border-[#262626] rounded-2xl max-w-lg w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Before You Go...</h2>
          <p className="text-emerald-100">Do you know your credit score?</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-xl font-bold text-white">Credit Karma</span>
            <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              Free
            </span>
          </div>

          <p className="text-neutral-300 text-center mb-6">
            Check your credit score in 2 minutes - completely free, no credit card required.
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-neutral-300">Free credit scores</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-neutral-300">Weekly updates</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-neutral-300">Credit monitoring</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="text-neutral-300">100% free forever</span>
            </div>
          </div>

          <a
            href="https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202"
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleClick}
            className="block"
          >
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 gap-2">
              Check My Score Free
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>

          <button
            onClick={onClose}
            className="w-full text-neutral-500 hover:text-neutral-300 text-sm mt-4 transition-colors"
          >
            No thanks, I'll check later
          </button>
        </div>
      </div>
    </div>
  );
}

export function useCreditKarmaPopup(delay: number = 0) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Don't show if already shown
    if (localStorage.getItem("creditKarmaPopupShown")) {
      return;
    }

    // Don't show if regular exit intent was shown
    if (localStorage.getItem("exitIntentShown")) {
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves from the top of the page
      if (e.clientY <= 0) {
        timeoutId = setTimeout(() => {
          setShowPopup(true);
        }, delay);
      }
    };

    // Delay before enabling exit intent detection
    const enableTimeout = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 8000); // Wait 8 seconds before enabling (longer than regular popup)

    return () => {
      clearTimeout(enableTimeout);
      clearTimeout(timeoutId);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [delay]);

  const closePopup = () => {
    setShowPopup(false);
    localStorage.setItem("creditKarmaPopupShown", "true");
  };

  return { showPopup, closePopup };
}
