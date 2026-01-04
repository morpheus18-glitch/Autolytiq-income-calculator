import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex items-center gap-2 p-1 rounded-full transition-colors",
        "bg-secondary/50 hover:bg-secondary",
        className
      )}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <div className="relative flex items-center w-14 h-7">
        {/* Track */}
        <div className="absolute inset-0 rounded-full bg-muted" />

        {/* Icons */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5">
          <Sun className={cn(
            "h-4 w-4 transition-colors",
            isDark ? "text-muted-foreground/50" : "text-yellow-500"
          )} />
          <Moon className={cn(
            "h-4 w-4 transition-colors",
            isDark ? "text-blue-400" : "text-muted-foreground/50"
          )} />
        </div>

        {/* Thumb */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "absolute w-5 h-5 rounded-full shadow-md",
            "bg-background border border-border",
            isDark ? "left-[calc(100%-22px)]" : "left-0.5"
          )}
        />
      </div>

      {showLabel && (
        <span className="text-sm font-medium pr-2">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}

// Floating theme toggle for mobile
export function FloatingThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg",
        "bg-card border border-border",
        "sm:hidden" // Only show on mobile
      )}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-blue-500" />
      )}
    </motion.button>
  );
}
