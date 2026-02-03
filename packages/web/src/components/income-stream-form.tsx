import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MoneyInput } from "@/components/money-input";
import {
  type IncomeStream,
  type Frequency,
  type IncomeType,
  type StabilityRating,
  INCOME_TYPE_LABELS,
  STABILITY_LABELS,
  generateStreamId,
  getSuggestedStability,
} from "@/lib/income-calculations";

interface IncomeStreamFormProps {
  stream: IncomeStream | null;
  onSave: (stream: IncomeStream) => void;
  onCancel: () => void;
}

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "annually", label: "Annually" },
];

const INCOME_TYPES: { value: IncomeType; label: string }[] = [
  { value: "w2", label: INCOME_TYPE_LABELS.w2 },
  { value: "freelance", label: INCOME_TYPE_LABELS.freelance },
  { value: "gig", label: INCOME_TYPE_LABELS.gig },
  { value: "rental", label: INCOME_TYPE_LABELS.rental },
  { value: "side-hustle", label: INCOME_TYPE_LABELS["side-hustle"] },
  { value: "other", label: INCOME_TYPE_LABELS.other },
];

const STABILITY_RATINGS: { value: StabilityRating; label: string }[] = [
  { value: 5, label: `5 - ${STABILITY_LABELS[5]}` },
  { value: 4, label: `4 - ${STABILITY_LABELS[4]}` },
  { value: 3, label: `3 - ${STABILITY_LABELS[3]}` },
  { value: 2, label: `2 - ${STABILITY_LABELS[2]}` },
  { value: 1, label: `1 - ${STABILITY_LABELS[1]}` },
];

export function IncomeStreamForm({ stream, onSave, onCancel }: IncomeStreamFormProps) {
  const [name, setName] = useState(stream?.name || "");
  const [amount, setAmount] = useState(stream?.amount?.toString() || "");
  const [frequency, setFrequency] = useState<Frequency>(stream?.frequency || "monthly");
  const [type, setType] = useState<IncomeType>(stream?.type || "w2");
  const [stabilityRating, setStabilityRating] = useState<StabilityRating>(
    stream?.stabilityRating || 5
  );

  // When type changes, suggest appropriate stability
  useEffect(() => {
    if (!stream) {
      setStabilityRating(getSuggestedStability(type));
    }
  }, [type, stream]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return;

    onSave({
      id: stream?.id || generateStreamId(),
      name: name.trim(),
      amount: parsedAmount,
      frequency,
      type,
      stabilityRating,
    });
  };

  const isValid = name.trim() && parseFloat(amount) > 0;

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit}
      className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">
          {stream ? "Edit Income Stream" : "Add Income Stream"}
        </h3>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Name and Amount */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Income Name</Label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Primary Job, Freelance Work"
            className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Amount</Label>
          <MoneyInput
            value={amount}
            onChange={setAmount}
            className="h-11"
          />
        </div>
      </div>

      {/* Frequency and Type */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Pay Frequency</Label>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFrequency(f.value)}
                className={cn(
                  "py-2 px-3 rounded-lg text-sm font-medium transition-all border",
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

        <div className="space-y-2">
          <Label className="text-sm font-medium">Income Type</Label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as IncomeType)}
            className="w-full h-11 px-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
          >
            {INCOME_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stability Rating */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Stability Rating
          <span className="ml-2 text-xs text-muted-foreground">
            (How consistent is this income?)
          </span>
        </Label>
        <div className="flex gap-2">
          {STABILITY_RATINGS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStabilityRating(s.value)}
              className={cn(
                "flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all border",
                stabilityRating === s.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary/30 border-border/50 hover:bg-secondary/50"
              )}
            >
              {s.value}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {STABILITY_LABELS[stabilityRating]}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid} className="flex-1 gap-2">
          <DollarSign className="h-4 w-4" />
          {stream ? "Update Stream" : "Add Stream"}
        </Button>
      </div>
    </motion.form>
  );
}
