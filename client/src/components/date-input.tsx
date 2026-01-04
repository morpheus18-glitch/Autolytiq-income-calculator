import { useState, useEffect, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input value with date value
  useEffect(() => {
    if (value && isValid(value)) {
      setInputValue(format(value, "MM/dd/yyyy"));
    } else if (!value) {
      setInputValue("");
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    // Only allow digits and slashes
    val = val.replace(/[^\d/]/g, "");

    // Auto-insert slashes
    const digits = val.replace(/\//g, "");
    if (digits.length >= 2 && !val.includes("/")) {
      val = digits.slice(0, 2) + "/" + digits.slice(2);
    }
    if (digits.length >= 4 && val.split("/").length < 3) {
      const parts = val.split("/");
      if (parts.length === 2 && parts[1].length >= 2) {
        val = parts[0] + "/" + parts[1].slice(0, 2) + "/" + parts[1].slice(2);
      }
    }

    // Limit length
    if (val.length > 10) {
      val = val.slice(0, 10);
    }

    setInputValue(val);

    // Try to parse the date
    if (val.length === 10) {
      const parsed = parse(val, "MM/dd/yyyy", new Date());
      if (isValid(parsed)) {
        // Check bounds
        if (minDate && isBefore(parsed, minDate)) return;
        if (maxDate && isAfter(parsed, maxDate)) return;
        onChange(parsed);
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    onChange(date);
    setIsOpen(false);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Select all text on focus so user can immediately type to replace
    e.target.select();
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Validate on blur
    if (inputValue.length > 0 && inputValue.length < 10) {
      // Invalid partial date, reset to last valid value
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
          ref={inputRef}
          type="text"
          inputMode="numeric"
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
      {/* Subtle date format hint */}
      {isFocused && !isValidDate && inputValue.length > 0 && inputValue.length < 10 && (
        <div className="absolute -bottom-5 left-0 text-xs text-muted-foreground">
          Format: MM/DD/YYYY
        </div>
      )}
    </div>
  );
}
