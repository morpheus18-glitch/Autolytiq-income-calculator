import { useState, useEffect } from "react";
import { X, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ExitIntentPopupProps {
  onClose: () => void;
}

export function ExitIntentPopup({ onClose }: ExitIntentPopupProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          source: "exit-intent"
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        localStorage.setItem("exitIntentShown", "true");
        setTimeout(onClose, 2000);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    }

    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="bg-[#0f0f0f] border border-[#262626] rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">You're In!</h3>
          <p className="text-neutral-400">Check your inbox for your free guide.</p>
        </div>
      </div>
    );
  }

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
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Wait! Don't Miss Out</h2>
          <p className="text-emerald-100">Get our exclusive income-boosting guide FREE</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">What you'll get:</h3>
            <ul className="space-y-2 text-neutral-300 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                10 proven strategies to maximize your income
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                Tax optimization tips that save thousands
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                Weekly financial insights delivered to your inbox
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                Exclusive access to premium calculator features
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-[#171717] border-[#262626] text-white placeholder:text-neutral-500"
            />
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#171717] border-[#262626] text-white placeholder:text-neutral-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              type="submit"
              disabled={isSubmitting || !email}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3"
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  Get My Free Guide
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-neutral-500 text-xs text-center mt-4">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

export function useExitIntent(delay: number = 0) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Don't show if already shown or subscribed
    if (localStorage.getItem("exitIntentShown") || localStorage.getItem("newsletterSubscribed")) {
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

    // Also trigger on back button / tab close attempt (mobile)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!localStorage.getItem("exitIntentShown")) {
        setShowPopup(true);
      }
    };

    // Delay before enabling exit intent detection
    const enableTimeout = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000); // Wait 5 seconds before enabling

    return () => {
      clearTimeout(enableTimeout);
      clearTimeout(timeoutId);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [delay]);

  const closePopup = () => {
    setShowPopup(false);
    localStorage.setItem("exitIntentShown", "true");
  };

  return { showPopup, closePopup };
}
