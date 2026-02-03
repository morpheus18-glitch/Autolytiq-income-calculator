import { motion } from "framer-motion";
import { Edit2, Trash2, Plus, Briefcase, Laptop, Car, Home, Sparkles, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
}

const TYPE_ICONS: Record<IncomeType, React.ComponentType<{ className?: string }>> = {
  w2: Briefcase,
  freelance: Laptop,
  gig: Car,
  rental: Home,
  "side-hustle": Sparkles,
  other: HelpCircle,
};

const TYPE_COLORS: Record<IncomeType, string> = {
  w2: "text-blue-500 bg-blue-500/10",
  freelance: "text-purple-500 bg-purple-500/10",
  gig: "text-orange-500 bg-orange-500/10",
  rental: "text-green-500 bg-green-500/10",
  "side-hustle": "text-pink-500 bg-pink-500/10",
  other: "text-gray-500 bg-gray-500/10",
};

export function IncomeStreamCard({ stream, onEdit, onDelete }: IncomeStreamCardProps) {
  const Icon = TYPE_ICONS[stream.type];
  const colorClass = TYPE_COLORS[stream.type];
  const annual = toAnnual(stream.amount, stream.frequency);
  const reliable = annual * STABILITY_WEIGHTS[stream.stabilityRating];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn("p-3 rounded-xl", colorClass.split(" ")[1])}>
          <Icon className={cn("h-5 w-5", colorClass.split(" ")[0])} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm truncate">{stream.name}</h4>
              <p className="text-xs text-muted-foreground">
                {INCOME_TYPE_LABELS[stream.type]} &middot; {stream.frequency}
              </p>
            </div>
            <div className="text-right">
              <div className="font-bold mono-value text-primary">
                {formatCurrency(stream.amount)}
                <span className="text-xs text-muted-foreground font-normal">
                  /{stream.frequency === "annually" ? "yr" : stream.frequency === "monthly" ? "mo" : stream.frequency === "biweekly" ? "2wk" : "wk"}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(annual)}/yr
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
            {/* Stability Badge */}
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "w-2 h-2 rounded-full",
                      level <= stream.stabilityRating
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {STABILITY_LABELS[stream.stabilityRating]}
              </span>
            </div>

            {/* Reliable Income */}
            <div className="text-xs text-muted-foreground ml-auto">
              Reliable: <span className="font-medium text-foreground">{formatCurrency(reliable)}/yr</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(stream)}
            className="h-8 w-8 p-0"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(stream.id)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

interface EmptyStreamsStateProps {
  onAdd: () => void;
}

export function EmptyStreamsState({ onAdd }: EmptyStreamsStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No Income Streams Yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
        Add your income sources to see your total earning power and get personalized affordability insights.
      </p>
      <Button onClick={onAdd} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Your First Income Stream
      </Button>
    </motion.div>
  );
}
