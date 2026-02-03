import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, Mail, Check, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type LeadMagnetType =
  | 'budget-template'
  | 'car-buying-checklist'
  | 'first-apartment-guide'
  | 'tax-deduction-checklist'
  | 'salary-negotiation-script';

interface LeadMagnetConfig {
  title: string;
  description: string;
  benefits: string[];
  icon: string;
}

const LEAD_MAGNETS: Record<LeadMagnetType, LeadMagnetConfig> = {
  'budget-template': {
    title: 'Free Budget Template',
    description: 'A ready-to-use 50/30/20 budget spreadsheet with automatic calculations.',
    benefits: [
      'Auto-calculates your 50/30/20 split',
      'Monthly expense tracker',
      'Savings goal tracker',
      'Works with Excel & Google Sheets',
    ],
    icon: '📊',
  },
  'car-buying-checklist': {
    title: 'Car Buying Checklist',
    description: 'Everything you need to know before buying your next car.',
    benefits: [
      'Pre-purchase inspection checklist',
      'Negotiation tips',
      'Financing comparison worksheet',
      'True cost of ownership calculator',
    ],
    icon: '🚗',
  },
  'first-apartment-guide': {
    title: 'First Apartment Guide',
    description: 'A complete guide to renting your first apartment.',
    benefits: [
      'Move-in cost calculator',
      'Apartment viewing checklist',
      'Lease terms glossary',
      'Budget template for renters',
    ],
    icon: '🏠',
  },
  'tax-deduction-checklist': {
    title: 'Tax Deduction Checklist',
    description: 'Common tax deductions you might be missing.',
    benefits: [
      '50+ deductions by category',
      'Record-keeping guide',
      'Self-employment deductions',
      'Home office guidelines',
    ],
    icon: '📋',
  },
  'salary-negotiation-script': {
    title: 'Salary Negotiation Script',
    description: 'Word-for-word scripts for negotiating your salary.',
    benefits: [
      'Initial offer response script',
      'Counter-offer templates',
      'Email templates',
      'Research checklist',
    ],
    icon: '💼',
  },
};

interface PDFDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: LeadMagnetType;
  onSubmit?: (email: string) => Promise<void>;
}

export function PDFDownloadModal({
  isOpen,
  onClose,
  type,
  onSubmit,
}: PDFDownloadModalProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const config = LEAD_MAGNETS[type];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(email);
      } else {
        // Default behavior - just simulate success
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setIsSuccess(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setIsSuccess(false);
    setError('');
    onClose();
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
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] sm:inset-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md z-50"
          >
            <Card className="glass-card border-2 border-primary/30 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="relative p-6 bg-gradient-to-br from-primary/20 to-primary/5 border-b border-border/30">
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-background/50 transition-colors"
                  >
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>

                  <div className="text-4xl mb-3">{config.icon}</div>
                  <h2 className="text-xl font-bold mb-1">{config.title}</h2>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>

                {/* Content */}
                <div className="p-6">
                  {isSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-emerald-500" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Check Your Email!</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        We've sent the {config.title.toLowerCase()} to {email}
                      </p>
                      <Button onClick={handleClose}>Done</Button>
                    </motion.div>
                  ) : (
                    <>
                      {/* Benefits */}
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold mb-2">What's included:</h3>
                        <ul className="space-y-2">
                          {config.benefits.map((benefit) => (
                            <li key={benefit} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Form */}
                      <form onSubmit={handleSubmit}>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="email" className="sr-only">
                              Email address
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>

                          {error && (
                            <p className="text-sm text-destructive">{error}</p>
                          )}

                          <Button
                            type="submit"
                            className="w-full"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4 mr-2" />
                                Get Free Download
                              </>
                            )}
                          </Button>
                        </div>
                      </form>

                      <p className="text-[10px] text-muted-foreground/50 text-center mt-4">
                        We'll also send you helpful finance tips. Unsubscribe anytime.
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Hook for using lead magnet modal
export function usePDFDownloadModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<LeadMagnetType>('budget-template');

  const open = (magnetType: LeadMagnetType) => {
    setType(magnetType);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return { isOpen, type, open, close };
}

// Trigger button component
interface LeadMagnetTriggerProps {
  type: LeadMagnetType;
  variant?: 'button' | 'card' | 'inline';
  onClick: () => void;
}

export function LeadMagnetTrigger({ type, variant = 'button', onClick }: LeadMagnetTriggerProps) {
  const config = LEAD_MAGNETS[type];

  if (variant === 'card') {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-4 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 bg-primary/5 hover:bg-primary/10 transition-all"
      >
        <div className="flex items-start gap-3">
          <div className="text-3xl">{config.icon}</div>
          <div>
            <div className="font-semibold">{config.title}</div>
            <div className="text-sm text-muted-foreground">{config.description}</div>
            <div className="text-xs text-primary mt-2 flex items-center gap-1">
              <Download className="h-3 w-3" />
              Free Download
            </div>
          </div>
        </div>
      </button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={onClick}
        className="inline-flex items-center gap-1 text-primary hover:underline"
      >
        <FileText className="h-4 w-4" />
        {config.title}
      </button>
    );
  }

  // Button variant
  return (
    <Button onClick={onClick} variant="outline" className="gap-2">
      <Download className="h-4 w-4" />
      {config.title}
    </Button>
  );
}
