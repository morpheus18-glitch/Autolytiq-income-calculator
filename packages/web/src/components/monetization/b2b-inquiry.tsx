/**
 * B2B Inquiry Component
 *
 * Captures white-label/enterprise inquiries.
 * Feature-flagged - only shows when b2bInquiryEnabled is true.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Loader2, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMonetizationFlags } from '@/hooks/use-monetization';
import { submitPartnerInquiry } from '@/lib/monetization';

interface B2BInquiryProps {
  className?: string;
}

export function B2BInquiryFooter({ className = '' }: B2BInquiryProps) {
  const { flags, loading: flagsLoading } = useMonetizationFlags();
  const [showForm, setShowForm] = useState(false);

  // Don't render if B2B inquiry is disabled
  if (flagsLoading || !flags?.b2bInquiryEnabled) {
    return null;
  }

  return (
    <div className={`rounded-xl border bg-muted/30 overflow-hidden ${className}`}>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <div className="font-medium text-sm">Want this for your team?</div>
              <div className="text-xs text-muted-foreground">
                White-label and enterprise options available
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </button>
      ) : (
        <B2BInquiryForm onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}

interface B2BInquiryFormProps {
  onClose?: () => void;
  className?: string;
}

export function B2BInquiryForm({ onClose, className = '' }: B2BInquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    volume: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await submitPartnerInquiry(formData);

    setSubmitting(false);

    if (result.success) {
      setSubmitted(true);
    } else {
      setError(result.message || 'Failed to submit inquiry');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-6 text-center ${className}`}
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
          <Check className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-semibold mb-1">Thank You!</h3>
        <p className="text-sm text-muted-foreground mb-4">
          We'll be in touch within 1-2 business days.
        </p>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className={`p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Enterprise Inquiry
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name"
            required
            className="px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Work email"
            required
            className="px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
          />
        </div>

        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          placeholder="Company name"
          required
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
        />

        <select
          name="volume"
          value={formData.volume}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none"
        >
          <option value="">Expected monthly users (optional)</option>
          <option value="100-500">100-500</option>
          <option value="500-1000">500-1,000</option>
          <option value="1000-5000">1,000-5,000</option>
          <option value="5000-10000">5,000-10,000</option>
          <option value="10000+">10,000+</option>
        </select>

        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us about your use case (optional)"
          rows={3}
          className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none resize-none"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          disabled={submitting}
          className="w-full gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Inquiry'
          )}
        </Button>
      </form>
    </motion.div>
  );
}

/**
 * Standalone Partner Page Component
 */
export function PartnerPage() {
  const { flags, loading } = useMonetizationFlags();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!flags?.b2bInquiryEnabled) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Coming Soon</h1>
        <p className="text-muted-foreground">
          Enterprise and white-label options will be available soon.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Partner With Us</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Add our income calculator to your platform. White-label options,
          custom integrations, and volume pricing available.
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { title: 'White Label', description: 'Your brand, our technology' },
          { title: 'API Access', description: 'Integrate into your workflows' },
          { title: 'Custom Features', description: 'Tailored to your needs' },
        ].map((feature, i) => (
          <div key={i} className="p-4 rounded-xl border bg-card text-center">
            <h3 className="font-semibold mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <div className="rounded-xl border bg-card p-6">
        <B2BInquiryForm />
      </div>
    </div>
  );
}
