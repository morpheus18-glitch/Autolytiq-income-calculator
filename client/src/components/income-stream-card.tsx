import { motion } from "framer-motion";
import { Pencil, Trash2, Briefcase, Building2, Laptop, Car, ShoppingBag, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  type IncomeStream,
  type IncomeType,
  INCOME_TYPE_LABELS,
  STABILITY_LABELS,
  STABILITY_WEIGHTS,
  toAnnual,
  formatCurrency,
} from "@/lib/income-calculations";

interface IncomeStreamCardProps {
  stream: IncomeStream;
  onEdit: (stream: IncomeStream) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const TYPE_ICONS: Record<IncomeType, React.ElementType> = {
  w2: Building2,
  freelance: Laptop,
  gig: Car,
  rental: Building2,
  "side-hustle": ShoppingBag,
  other: Briefcase,
};

const TYPE_COLORS: Record<IncomeType, string> = {
  w2: "text-blue-500 bg-blue-500/10",
  freelance: "text-purple-500 bg-purple-500/10",
  gig: "text-orange-500 bg-orange-500/10",
  rental: "text-green-500 bg-green-500/10",
  "side-hustle": "text-pink-500 bg-pink-500/10",
  other: "text-gray-500 bg-gray-500/10",
};

const STABILITY_COLORS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "bg-red-500",
  2: "bg-orange-500",
  3: "bg-yellow-500",
  4: "bg-lime-500",
  5: "bg-emerald-500",
};

export function IncomeStreamCard({ stream, onEdit, onDelete, className }: IncomeStreamCardProps) {
  const Icon = TYPE_ICONS[stream.type];
  const colorClass = TYPE_COLORS[stream.type];
  const annual = toAnnual(stream.amount, stream.frequency);
  const monthly = annual / 12;
  const reliableAnnual = annual * STABILITY_WEIGHTS[stream.stabilityRating];

  const frequencyLabel = {
    weekly: "week",
    biweekly: "2 weeks",
    monthly: "month",
    annually: "year",
  }[stream.frequency];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all group",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn("p-2.5 rounded-lg", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm truncate">{stream.name}</h4>
              <p className="text-xs text-muted-foreground">
                {INCOME_TYPE_LABELS[stream.type]}
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold mono-value text-primary">
                {formatCurrency(stream.amount)}
              </div>
              <div className="text-xs text-muted-foreground">/{frequencyLabel}</div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div>
              <span className="text-muted-foreground">Annual: </span>
              <span className="font-mono font-medium">{formatCurrency(annual)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reliable: </span>
              <span className="font-mono font-medium text-primary">{formatCurrency(reliableAnnual)}</span>
            </div>
          </div>

          {/* Stability Bar */}
          <div className="flex items-center gap-2 mt-3">
            <div className="flex-1 flex gap-0.5">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    level <= stream.stabilityRating
                      ? STABILITY_COLORS[stream.stabilityRating]
                      : "bg-secondary"
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {STABILITY_LABELS[stream.stabilityRating]}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(stream)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(stream.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Empty state for when no streams exist
 */
export function EmptyStreamsState({ onAdd }: { onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 px-6 rounded-xl border-2 border-dashed border-border"
    >
      <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
        <HelpCircle className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Income Streams Yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
        Add your income sources to see your total income, reliability-weighted income, and monthly breakdown.
      </p>
      <Button onClick={onAdd} className="gap-2">
        Add Your First Income Stream
      </Button>
    </motion.div>
  );
}
