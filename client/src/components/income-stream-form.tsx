import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/money-input";
import {
  type IncomeStream,
  type Frequency,
  type IncomeType,
  type StabilityRating,
  INCOME_TYPE_LABELS,
  STABILITY_LABELS,
  STABILITY_WEIGHTS,
  generateStreamId,
  getSuggestedStability,
} from "@/lib/income-calculations";

interface IncomeStreamFormProps {
  stream?: IncomeStream | null;
  onSave: (stream: IncomeStream) => void;
  onCancel: () => void;
  className?: string;
}

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Yearly" },
];

const INCOME_TYPES: { value: IncomeType; label: string }[] = [
  { value: "w2", label: "W-2 Employment" },
  { value: "freelance", label: "Freelance" },
  { value: "gig", label: "Gig Work" },
  { value: "rental", label: "Rental Income" },
  { value: "side-hustle", label: "Side Hustle" },
  { value: "other", label: "Other" },
];

const STABILITY_RATINGS: StabilityRating[] = [1, 2, 3, 4, 5];

export function IncomeStreamForm({ stream, onSave, onCancel, className }: IncomeStreamFormProps) {
  const [name, setName] = useState(stream?.name || "");
  const [amount, setAmount] = useState(stream?.amount?.toString() || "");
  const [frequency, setFrequency] = useState<Frequency>(stream?.frequency || "monthly");
  const [type, setType] = useState<IncomeType>(stream?.type || "w2");
  const [stabilityRating, setStabilityRating] = useState<StabilityRating>(stream?.stabilityRating || 5);

  // Auto-suggest stability when type changes
  useEffect(() => {
    if (!stream) {
      setStabilityRating(getSuggestedStability(type));
    }
  }, [type, stream]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount) || 0;
    if (!name.trim() || parsedAmount <= 0) return;

    onSave({
      id: stream?.id || generateStreamId(),
      name: name.trim(),
      amount: parsedAmount,
      frequency,
      type,
      stabilityRating,
    });
  };

  const isEditing = !!stream;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn("p-6 rounded-xl bg-card border border-border", className)}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">
          {isEditing ? "Edit Income Stream" : "Add Income Stream"}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Income Name</Label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Day Job, Freelance Projects, Rental Property"
            className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
            required
          />
        </div>

        {/* Amount & Frequency */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Amount</Label>
            <MoneyInput
              value={amount}
              onChange={setAmount}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Frequency</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {FREQUENCIES.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFrequency(f.value)}
                  className={cn(
                    "py-2 px-1 rounded-lg text-xs font-medium transition-all border",
                    frequency === f.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Income Type */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Income Type</Label>
          <div className="grid grid-cols-3 gap-2">
            {INCOME_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={cn(
                  "py-2.5 px-3 rounded-lg text-xs font-medium transition-all border text-left",
                  type === t.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stability Rating */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Income Stability</Label>
            <span className="text-xs text-muted-foreground">
              {STABILITY_LABELS[stabilityRating]} ({Math.round(STABILITY_WEIGHTS[stabilityRating] * 100)}% weight)
            </span>
          </div>
          <div className="flex gap-2">
            {STABILITY_RATINGS.map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setStabilityRating(rating)}
                className={cn(
                  "flex-1 py-3 rounded-lg text-sm font-medium transition-all border",
                  stabilityRating === rating
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
                )}
              >
                {rating}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Very Variable</span>
            <span>Very Stable</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            {isEditing ? "Update" : "Add"} Stream
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
