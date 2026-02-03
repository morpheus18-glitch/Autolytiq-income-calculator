import { motion } from "framer-motion";
import { Car, Bike, ShoppingCart, Laptop, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { GIG_PLATFORMS, type GigPlatform } from "@/lib/income-calculations";

interface GigPlatformSelectorProps {
  selected: string;
  onChange: (platformId: string) => void;
  className?: string;
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  car: Car,
  bike: Bike,
  shopping: ShoppingCart,
  laptop: Laptop,
  briefcase: Briefcase,
};

export function GigPlatformSelector({ selected, onChange, className }: GigPlatformSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 gap-3", className)}>
      {GIG_PLATFORMS.map((platform) => {
        const Icon = PLATFORM_ICONS[platform.icon] || Briefcase;
        const isSelected = selected === platform.id;

        return (
          <motion.button
            key={platform.id}
            type="button"
            onClick={() => onChange(platform.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all text-left",
              isSelected
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                : "border-border/50 hover:border-primary/30 bg-card hover:bg-card/80"
            )}
          >
            {/* Selection indicator */}
            {isSelected && (
              <motion.div
                layoutId="platform-indicator"
                className="absolute inset-0 border-2 border-primary rounded-xl"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}

            <div className="relative">
              <div className={cn(
                "p-2.5 rounded-lg inline-flex mb-2 transition-colors",
                isSelected ? "bg-primary/20" : "bg-secondary/50"
              )}>
                <Icon className={cn(
                  "h-5 w-5",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
              </div>

              <div className={cn(
                "font-semibold text-sm",
                isSelected && "text-primary"
              )}>
                {platform.name}
              </div>

              <div className="text-xs text-muted-foreground mt-0.5">
                {platform.description}
              </div>

              <div className={cn(
                "text-xs mt-2 font-mono",
                isSelected ? "text-primary/80" : "text-muted-foreground"
              )}>
                ~{Math.round(platform.expenseRate * 100)}% expenses
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * Compact version for inline use
 */
export function GigPlatformChips({ selected, onChange, className }: GigPlatformSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {GIG_PLATFORMS.map((platform) => {
        const Icon = PLATFORM_ICONS[platform.icon] || Briefcase;
        const isSelected = selected === platform.id;

        return (
          <button
            key={platform.id}
            type="button"
            onClick={() => onChange(platform.id)}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              isSelected
                ? "bg-primary text-primary-foreground"
                : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {platform.name}
          </button>
        );
      })}
    </div>
  );
}
