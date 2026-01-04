import { useState, useEffect } from "react";
import { format, parse, isValid, isBefore, isAfter } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateInputProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  className?: string;
}

export function DateInput({
  value,
  onChange,
  minDate,
  maxDate = new Date(),
  placeholder = "MM/DD/YYYY",
  className,
}: DateInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Sync input value with date value (only when value changes externally)
  useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, "MM/dd/yyyy"));
    } else if (value === undefined) {
      setInputValue("");
    }
  }, [value]);

  const formatInput = (val: string): string => {
    // Remove all non-digits
    const digits = val.replace(/\D/g, "");

    // Format as MM/DD/YYYY
    if (digits.length <= 2) {
      return digits;
    } else if (digits.length <= 4) {
      return digits.slice(0, 2) + "/" + digits.slice(2);
    } else {
      return digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4, 8);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formatted = formatInput(rawValue);

    setInputValue(formatted);

    // Try to parse when we have a complete date
    if (formatted.length === 10) {
      const parsed = parse(formatted, "MM/dd/yyyy", new Date());
      if (isValid(parsed)) {
        const withinBounds =
          (!minDate || !isBefore(parsed, minDate)) &&
          (!maxDate || !isAfter(parsed, maxDate));

        if (withinBounds) {
          onChange(parsed);
        }
      }
    } else if (formatted.length === 0) {
      onChange(undefined);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Reset invalid partial input
    if (inputValue.length > 0 && inputValue.length < 10) {
      if (value && isValid(value)) {
        setInputValue(format(value, "MM/dd/yyyy"));
      } else {
        setInputValue("");
      }
    }
  };

  const isValidDate = value && isValid(value);

  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center h-12 w-full rounded-lg border bg-background px-3 transition-all duration-300",
          "elite-input",
          isFocused && "ring-2 ring-primary/30 border-primary/50",
          isValidDate && !isFocused && "border-primary/30"
        )}
      >
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-transparent text-base font-mono outline-none placeholder:text-muted-foreground/50",
            isValidDate && "text-foreground"
          )}
        />
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={cn(
                "ml-2 p-1.5 rounded-md transition-all duration-200",
                "hover:bg-primary/10 hover:text-primary",
                "focus:outline-none focus:ring-2 focus:ring-primary/30",
                isOpen && "bg-primary/10 text-primary"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              disabled={(date) => {
                if (maxDate && isAfter(date, maxDate)) return true;
                if (minDate && isBefore(date, minDate)) return true;
                return false;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* Date format hint */}
      {isFocused && !isValidDate && inputValue.length > 0 && inputValue.length < 10 && (
        <div className="absolute -bottom-5 left-0 text-xs text-muted-foreground">
          Format: MM/DD/YYYY
        </div>
      )}
    </div>
  );
}
