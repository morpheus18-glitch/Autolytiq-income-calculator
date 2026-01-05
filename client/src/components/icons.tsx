import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

// Autolytiq Brand Logo - Stylized "A" with chart bars
export function AutolytiqLogo({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Chart bars forming abstract "A" */}
      <rect x="3" y="14" width="3" height="7" rx="1" fill="currentColor" opacity="0.6" />
      <rect x="8" y="10" width="3" height="11" rx="1" fill="currentColor" opacity="0.8" />
      <rect x="13" y="6" width="3" height="15" rx="1" fill="currentColor" />
      <rect x="18" y="3" width="3" height="18" rx="1" fill="currentColor" opacity="0.9" />
      {/* Connecting line */}
      <path
        d="M4.5 13 L9.5 9 L14.5 5 L19.5 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

// Income Calculator Icon - Dollar with upward momentum
export function IncomeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Circular background */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      {/* Dollar sign */}
      <path
        d="M12 6V7M12 17V18M9 9.5C9 8.12 10.34 7 12 7C13.66 7 15 8.12 15 9.5C15 10.88 13.66 12 12 12C10.34 12 9 13.12 9 14.5C9 15.88 10.34 17 12 17C13.66 17 15 15.88 15 14.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Upward arrow accent */}
      <path
        d="M17 8L19 6M19 6L21 8M19 6V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
}

// Auto Icon - Sleek modern car silhouette
export function AutoIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Car body */}
      <path
        d="M5 15V16C5 16.55 5.45 17 6 17H7C7.55 17 8 16.55 8 16V15M16 15V16C16 16.55 16.45 17 17 17H18C18.55 17 19 16.55 19 16V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 15H20V12C20 11.45 19.55 11 19 11H18L16 7H8L6 11H5C4.45 11 4 11.45 4 12V15Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Windows */}
      <path
        d="M7.5 11L9 8H15L16.5 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Headlights glow */}
      <circle cx="6.5" cy="13" r="1" fill="currentColor" />
      <circle cx="17.5" cy="13" r="1" fill="currentColor" />
      {/* Speed lines */}
      <path
        d="M1 12H2.5M1 14H3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

// Housing Icon - Modern geometric house
export function HousingIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Roof */}
      <path
        d="M3 11L12 4L21 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* House body */}
      <path
        d="M5 10V19C5 19.55 5.45 20 6 20H18C18.55 20 19 19.55 19 19V10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Door */}
      <rect x="10" y="14" width="4" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Window */}
      <rect x="14" y="11" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      {/* Chimney with smoke */}
      <rect x="15" y="5" width="2" height="4" fill="currentColor" opacity="0.6" />
      <path
        d="M16 3C16 3 16.5 2 17 2.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

// Wallet/Money Icon - Modern wallet with card
export function WalletIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Wallet body */}
      <rect
        x="2"
        y="6"
        width="20"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Fold line */}
      <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* Card slot */}
      <rect x="15" y="12" width="5" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      {/* Money peek */}
      <path
        d="M5 6V5C5 3.9 5.9 3 7 3H17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* Dollar accent */}
      <circle cx="8" cy="14" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 13V15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// Chart/Analytics Icon - Rising bars with trend line
export function ChartIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Bars */}
      <rect x="4" y="13" width="4" height="8" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="10" y="9" width="4" height="12" rx="1" fill="currentColor" opacity="0.7" />
      <rect x="16" y="5" width="4" height="16" rx="1" fill="currentColor" />
      {/* Trend line */}
      <path
        d="M3 16L8 12L14 8L21 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow head */}
      <path
        d="M17 3H21V7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Dollar Sign Icon - Stylized with glow effect
export function DollarIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Outer glow ring */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.2" />
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {/* Dollar sign */}
      <path
        d="M12 5V6.5M12 17.5V19M8.5 8.5C8.5 7.12 10.07 6 12 6C13.93 6 15.5 7.12 15.5 8.5C15.5 9.88 13.93 11 12 11C10.07 11 8.5 12.12 8.5 13.5C8.5 14.88 10.07 16 12 16C13.93 16 15.5 14.88 15.5 13.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Calendar Icon - Modern date picker style
export function CalendarIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Calendar body */}
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Top hooks */}
      <path d="M8 3V6M16 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Header line */}
      <path d="M3 9H21" stroke="currentColor" strokeWidth="1.5" />
      {/* Date dots */}
      <circle cx="8" cy="13" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="12" cy="13" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="16" cy="13" r="1.5" fill="currentColor" />
      <circle cx="8" cy="17" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="12" cy="17" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

// Credit Score Icon - Gauge/meter style
export function CreditScoreIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Gauge arc */}
      <path
        d="M4 18C4 12.48 8.48 8 14 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.3"
      />
      <path
        d="M4 18C4 14 6 10 10 8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Needle */}
      <circle cx="4" cy="18" r="2" fill="currentColor" />
      <path
        d="M4 18L12 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Score levels */}
      <circle cx="8" cy="8" r="1" fill="currentColor" opacity="0.4" />
      <circle cx="14" cy="6" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="19" cy="8" r="1" fill="currentColor" opacity="0.8" />
      <circle cx="21" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

// Save Icon - Floppy with checkmark
export function SaveIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Floppy disk */}
      <path
        d="M5 3H16L21 8V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Metal slider */}
      <rect x="7" y="3" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" />
      {/* Label area */}
      <rect x="6" y="13" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      {/* Checkmark */}
      <path
        d="M9 16L11 18L15 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Load Icon - Folder with arrow
export function LoadIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Folder */}
      <path
        d="M3 7V17C3 18.1 3.9 19 5 19H19C20.1 19 21 18.1 21 17V9C21 7.9 20.1 7 19 7H12L10 5H5C3.9 5 3 5.9 3 7Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Upload arrow */}
      <path
        d="M12 10V16M12 10L9 13M12 10L15 13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Sun Icon - Stylized with rays
export function SunIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-yellow-500", className)}
    >
      {/* Core */}
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      {/* Rays */}
      <path
        d="M12 2V5M12 19V22M22 12H19M5 12H2M19.07 4.93L16.95 7.05M7.05 16.95L4.93 19.07M19.07 19.07L16.95 16.95M7.05 7.05L4.93 4.93"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Moon Icon - Crescent with stars
export function MoonIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-blue-400", className)}
    >
      {/* Crescent moon */}
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Stars */}
      <circle cx="17" cy="5" r="1" fill="currentColor" opacity="0.6" />
      <circle cx="20" cy="8" r="0.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

// Percent Icon - For rates and percentages
export function PercentIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Diagonal line */}
      <path
        d="M19 5L5 19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Top circle */}
      <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
      {/* Bottom circle */}
      <circle cx="17" cy="17" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

// Clock/Time Icon - Modern style
export function ClockIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Clock face */}
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      {/* Hour markers */}
      <circle cx="12" cy="5" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="19" cy="12" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="12" cy="19" r="1" fill="currentColor" opacity="0.5" />
      <circle cx="5" cy="12" r="1" fill="currentColor" opacity="0.5" />
      {/* Hands */}
      <path d="M12 12L12 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Center */}
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Shield/Insurance Icon
export function ShieldIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Shield shape */}
      <path
        d="M12 3L4 7V12C4 16.42 7.42 20.42 12 21.5C16.58 20.42 20 16.42 20 12V7L12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.15"
        strokeLinejoin="round"
      />
      {/* Checkmark */}
      <path
        d="M8 12L11 15L16 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Trend Up Icon - Arrow with growth line
export function TrendUpIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Growth line */}
      <path
        d="M3 17L9 11L13 15L21 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow head */}
      <path
        d="M15 7H21V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base line */}
      <path
        d="M3 21H21"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.3"
      />
    </svg>
  );
}

// Piggy Bank Icon - Savings
export function PiggyIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Body */}
      <ellipse cx="12" cy="13" rx="8" ry="6" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
      {/* Snout */}
      <ellipse cx="18" cy="12" rx="2" ry="1.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Ear */}
      <path d="M8 8C8 8 7 5 9 5C11 5 10 8 10 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="14" cy="11" r="1" fill="currentColor" />
      {/* Legs */}
      <path d="M7 17V20M11 17V20M13 17V20M17 17V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Coin slot */}
      <path d="M10 7H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Tail */}
      <path d="M4 12C3 12 3 11 4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Email/Mail Icon
export function EmailIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Envelope */}
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      {/* Flap */}
      <path
        d="M3 7L12 13L21 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Share Icon - Connected nodes
export function ShareIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Nodes */}
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
      {/* Connections */}
      <path d="M8.5 10.5L15.5 6.5M8.5 13.5L15.5 17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Download Icon
export function DownloadIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Arrow */}
      <path
        d="M12 4V16M12 16L7 11M12 16L17 11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Tray */}
      <path
        d="M4 17V19C4 20.1 4.9 21 6 21H18C19.1 21 20 20.1 20 19V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Reset/Refresh Icon
export function ResetIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Circular arrow */}
      <path
        d="M4 12C4 7.58 7.58 4 12 4C15.35 4 18.22 6.07 19.41 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 12C20 16.42 16.42 20 12 20C8.65 20 5.78 17.93 4.59 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Arrow heads */}
      <path d="M16 9H20V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 15H4V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Info Icon - Stylized
export function InfoIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Circle */}
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      {/* i letter */}
      <path d="M12 11V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

// Checkmark Icon
export function CheckIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Circle */}
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
      {/* Checkmark */}
      <path
        d="M7 12L10 15L17 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Warning Icon
export function WarningIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-yellow-500", className)}
    >
      {/* Triangle */}
      <path
        d="M12 3L22 20H2L12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Exclamation */}
      <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </svg>
  );
}

// Arrow Right Icon
export function ArrowRightIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M5 12H19M19 12L13 6M19 12L13 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Arrow Left Icon
export function ArrowLeftIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M19 12H5M5 12L11 6M5 12L11 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Blog/Book Icon
export function BlogIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Book cover */}
      <path
        d="M4 4C4 3.45 4.45 3 5 3H19C19.55 3 20 3.45 20 4V20C20 20.55 19.55 21 19 21H5C4.45 21 4 20.55 4 20V4Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Spine */}
      <path d="M8 3V21" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* Lines */}
      <path d="M11 7H17M11 11H17M11 15H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Fuel/Gas Icon
export function FuelIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Pump body */}
      <rect x="4" y="4" width="10" height="16" rx="1" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      {/* Display */}
      <rect x="6" y="6" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      {/* Hose */}
      <path d="M14 10H17C18.1 10 19 10.9 19 12V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Nozzle */}
      <path d="M17 16V19L20 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Wrench/Maintenance Icon
export function WrenchIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M14.7 6.3C14.5 5.1 13.4 4 12 4C10.3 4 9 5.3 9 7C9 8.4 10.1 9.5 11.3 9.7L6 15V18H9L14.7 12.3C15.9 12.1 17 11 17.3 9.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M17.3 6.7L21 3M21 3L18 3M21 3V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Lightbulb/Tips Icon
export function LightbulbIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Bulb */}
      <path
        d="M12 3C8.69 3 6 5.69 6 9C6 11.22 7.21 13.15 9 14.19V17C9 17.55 9.45 18 10 18H14C14.55 18 15 17.55 15 17V14.19C16.79 13.15 18 11.22 18 9C18 5.69 15.31 3 12 3Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* Base */}
      <path d="M9 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 18V21M14 18V21" stroke="currentColor" strokeWidth="1.5" />
      {/* Rays */}
      <path
        d="M12 0V1M4.22 4.22L4.93 4.93M0 12H1M4.22 19.78L4.93 19.07M24 12H23M19.78 4.22L19.07 4.93"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

// Target/Goal Icon
export function TargetIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Rings */}
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" opacity="0.6" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      {/* Arrow */}
      <path
        d="M12 12L19 5M19 5H15M19 5V9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Question/Help Icon
export function HelpIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Circle */}
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      {/* Question mark */}
      <path
        d="M9 9C9 7.34 10.34 6 12 6C13.66 6 15 7.34 15 9C15 10.31 14.18 11.42 13 11.83V14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

// Login Icon
export function LoginIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Door frame */}
      <path
        d="M15 3H19C20.1 3 21 3.9 21 5V19C21 20.1 20.1 21 19 21H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Arrow */}
      <path
        d="M3 12H15M15 12L11 8M15 12L11 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Logout Icon
export function LogoutIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Door frame */}
      <path
        d="M9 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Arrow */}
      <path
        d="M16 12H8M16 12L12 8M16 12L12 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M16 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// External Link Icon
export function ExternalLinkIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M15 3H21V9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 14L21 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Plus Icon
export function PlusIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M12 5V19M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// X/Close Icon
export function CloseIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M18 6L6 18M6 6L18 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Trash/Delete Icon
export function TrashIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-destructive", className)}
    >
      {/* Lid */}
      <path d="M4 6H20M9 6V4H15V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* Body */}
      <path
        d="M6 6V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V6"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Lines */}
      <path d="M10 10V17M14 10V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Chevron Down Icon
export function ChevronDownIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Graduation/Education Icon
export function GraduationIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Cap */}
      <path
        d="M12 4L2 9L12 14L22 9L12 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.2"
      />
      {/* Tassel */}
      <path d="M6 11V16C6 18 9 20 12 20C15 20 18 18 18 16V11" stroke="currentColor" strokeWidth="2" />
      <path d="M22 9V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Heart Icon
export function HeartIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M12 21C12 21 3 15 3 9C3 6.24 5.24 4 8 4C9.76 4 11.3 4.93 12 6.31C12.7 4.93 14.24 4 16 4C18.76 4 21 6.24 21 9C21 15 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.2"
      />
    </svg>
  );
}

// Print Icon
export function PrintIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Printer body */}
      <rect x="4" y="8" width="16" height="10" rx="1" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      {/* Paper top */}
      <path d="M7 8V4H17V8" stroke="currentColor" strokeWidth="2" />
      {/* Paper output */}
      <path d="M7 14H17V20H7V14Z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      {/* Indicator */}
      <circle cx="16" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}
