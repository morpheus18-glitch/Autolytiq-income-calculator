import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Gift, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  annualIncome?: number;
}

export function LeadCaptureModal({ isOpen, onClose, annualIncome }: LeadCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: name || undefined,
          income_range: annualIncome ? getIncomeRange(annualIncome) : undefined,
          source: "calculator"
        }),
      });

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "You're in!",
          description: "Check your inbox for exclusive tips.",
        });
        setTimeout(() => {
          onClose();
          setIsSuccess(false);
          setEmail("");
          setName("");
        }, 2000);
      } else {
        throw new Error("Failed to subscribe");
      }
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIncomeRange = (income: number): string => {
    if (income >= 150000) return "150k+";
    if (income >= 100000) return "100k-150k";
    if (income >= 75000) return "75k-100k";
    if (income >= 50000) return "50k-75k";
    if (income >= 35000) return "35k-50k";
    return "under-35k";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-50"
          >
            <div className="glass-card rounded-2xl shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {isSuccess ? (
                /* Success State */
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", duration: 0.5 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4"
                  >
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    Welcome aboard!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    You'll receive our best financial tips soon.
                  </p>
                </div>
              ) : (
                /* Form State */
                <>
                  {/* Header */}
                  <div className="bg-primary/10 dark:bg-primary/5 p-6 border-b border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        <Gift className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        Free Financial Guide
                      </h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Get our exclusive guide: "10 Ways to Maximize Your Income" plus weekly money tips.
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm">
                        Name <span className="text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="elite-input h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="elite-input h-11 pl-10"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold elite-button"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Subscribing...
                        </>
                      ) : (
                        "Get Free Guide"
                      )}
                    </Button>

                    <p className="text-[10px] text-muted-foreground/60 text-center">
                      No spam. Unsubscribe anytime. We respect your privacy.
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
