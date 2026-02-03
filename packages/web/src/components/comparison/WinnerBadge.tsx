import { Trophy, Award } from "lucide-react";

interface WinnerBadgeProps {
  type: "winner" | "runner-up" | "best-value" | "best-for";
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function WinnerBadge({ type, label, size = "sm" }: WinnerBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  switch (type) {
    case "winner":
      return (
        <span
          className={`inline-flex items-center gap-1 bg-emerald-500 text-white font-semibold rounded-full ${sizeClasses[size]}`}
        >
          <Trophy className={iconSizes[size]} />
          {label || "Best Overall"}
        </span>
      );
    case "runner-up":
      return (
        <span
          className={`inline-flex items-center gap-1 bg-blue-500 text-white font-semibold rounded-full ${sizeClasses[size]}`}
        >
          <Award className={iconSizes[size]} />
          {label || "Runner Up"}
        </span>
      );
    case "best-value":
      return (
        <span
          className={`inline-flex items-center gap-1 bg-yellow-500 text-yellow-950 font-semibold rounded-full ${sizeClasses[size]}`}
        >
          {label || "Best Value"}
        </span>
      );
    case "best-for":
      return (
        <span
          className={`inline-flex items-center gap-1 bg-primary/10 text-primary font-semibold rounded-full ${sizeClasses[size]}`}
        >
          {label || "Best For You"}
        </span>
      );
    default:
      return null;
  }
}

// Large hero badge for top of comparison pages
export function HeroWinnerBadge({
  productName,
  categoryName,
}: {
  productName: string;
  categoryName: string;
}) {
  return (
    <div className="relative inline-block">
      <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-2xl" />
      <div className="relative p-6 rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-full bg-emerald-500">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-sm text-emerald-500 font-medium">
              Our Top Pick for {categoryName}
            </div>
            <div className="text-2xl font-bold">{productName}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
