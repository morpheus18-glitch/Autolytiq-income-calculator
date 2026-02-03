import { cn } from "@/lib/utils";
import { GIG_PLATFORMS } from "@/lib/income-calculations";
import {
  Car,
  Bike,
  ShoppingBag,
  ShoppingCart,
  Laptop,
  Briefcase,
} from "lucide-react";

interface GigPlatformSelectorProps {
  selected: string;
  onChange: (platformId: string) => void;
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  uber: Car,
  lyft: Car,
  doordash: Bike,
  instacart: ShoppingCart,
  upwork: Laptop,
  other: Briefcase,
};

export function GigPlatformSelector({ selected, onChange }: GigPlatformSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {GIG_PLATFORMS.map((platform) => {
        const Icon = PLATFORM_ICONS[platform.id] || Briefcase;
        const isSelected = selected === platform.id;

        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => onChange(platform.id)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
              isSelected
                ? "bg-primary/10 border-primary/50 ring-2 ring-primary/20"
                : "bg-secondary/30 border-border/50 hover:bg-secondary/50 hover:border-border"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg",
                isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className={cn("font-medium text-sm", isSelected && "text-primary")}>
                {platform.name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                ~{Math.round(platform.expenseRate * 100)}% expenses
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
