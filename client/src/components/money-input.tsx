import React from "react";
import { DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MoneyInputProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function MoneyInput({ value, onChange, className }: MoneyInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits and one decimal point
    const val = e.target.value.replace(/[^0-9.]/g, "");
    if ((val.match(/\./g) || []).length > 1) return;
    onChange(val);
  };

  const formatDisplay = (val: string) => {
    if (!val) return "";
    // Parse and format with commas
    const parts = val.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  return (
    <div className="relative">
      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        inputMode="decimal"
        value={formatDisplay(value)}
        onChange={handleChange}
        className={cn("pl-9 font-mono text-lg", className)}
        placeholder="0.00"
        data-testid="input-ytd"
      />
    </div>
  );
}
