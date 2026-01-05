import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
  size?: number;
}

// Autolytiq Logo - Bar chart with growth arrow (matching reference)
export function AutolytiqLogo({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Ascending bars */}
      <rect x="4" y="16" width="3" height="5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="12" width="3" height="9" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="8" width="3" height="13" stroke="currentColor" strokeWidth="1.5" />
      {/* Growth arrow */}
      <path d="M6 10l5-5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 3l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Income/Calculator Icon - Matching reference style
export function IncomeIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Calculator body */}
      <rect x="4" y="2" width="16" height="20" rx="1" stroke="currentColor" strokeWidth="1.5" />
      {/* Display */}
      <rect x="6" y="4" width="12" height="3" stroke="currentColor" strokeWidth="1.5" />
      {/* Button grid - 4x4 */}
      <rect x="6" y="9" width="2.5" height="2" stroke="currentColor" strokeWidth="1" />
      <rect x="9.5" y="9" width="2.5" height="2" stroke="currentColor" strokeWidth="1" />
      <rect x="13" y="9" width="2.5" height="2" stroke="currentColor" strokeWidth="1" />
      <rect x="6" y="12" width="2.5" height="2" stroke="currentColor" strokeWidth="1" />
      <rect x="9.5" y="12" width="2.5" height="2" stroke="currentColor" strokeWidth="1" />
      <rect x="13" y="12" width="2.5" height="2" stroke="currentColor" strokeWidth="1" />
      <rect x="6" y="15" width="2.5" height="2" stroke="currentColor" strokeWidth="1" />
      <rect x="9.5" y="15" width="2.5" height="2" stroke="currentColor" strokeWidth="1" />
      <rect x="13" y="15" width="2.5" height="2" stroke="currentColor" strokeWidth="1" />
      <rect x="6" y="18" width="2.5" height="2" stroke="currentColor" strokeWidth="1" />
      <rect x="9.5" y="18" width="2.5" height="2" stroke="currentColor" strokeWidth="1" />
      <rect x="13" y="18" width="2.5" height="2" stroke="currentColor" strokeWidth="1" />
      {/* Side column for operators */}
      <rect x="16" y="9" width="2" height="5" stroke="currentColor" strokeWidth="1" />
      <rect x="16" y="15" width="2" height="5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

// Dollar Sign Icon
export function DollarIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M12 4v2m0 12v2m-4-12c0-1.66 1.79-3 4-3s4 1.34 4 3-1.79 3-4 3-4 1.34-4 3 1.79 3 4 3 4-1.34 4-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Car/Auto Icon - Matching reference style
export function AutoIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      {/* Complete car outline in one path */}
      <path
        d="M2 14h3l1.5-3h2.5l2-3h2l2 3h2.5l1.5 3h3v2h-3.5a2.5 2.5 0 00-5 0h-3a2.5 2.5 0 00-5 0H2v-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Wheels */}
      <circle cx="7" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17" cy="16" r="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

// House/Housing Icon - Simple house shape
export function HousingIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M3 10.5L12 4l9 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 20v-6h4v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Wallet Icon - Bi-fold wallet
export function WalletIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <rect
        x="3"
        y="6"
        width="18"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

// Credit Score Icon - Meter gauge
export function CreditScoreIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M12 20a8 8 0 100-16 8 8 0 000 16z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 12l3-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

// Clock Icon
export function ClockIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7v5l3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Calendar Icon
export function CalendarIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="2" />
      <path d="M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Chart/Trending Up Icon
export function ChartIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M3 17l6-6 4 4 8-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 7h4v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Trend Up Icon
export function TrendUpIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M3 17l6-6 4 4 8-8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 7h7v7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Percent Icon
export function PercentIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path d="M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="17" r="2.5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// Piggy Bank Icon
export function PiggyIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <ellipse cx="12" cy="13" rx="7" ry="5" stroke="currentColor" strokeWidth="2" />
      <ellipse cx="17" cy="12" rx="1.5" ry="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9c0-1 .5-2 2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 17v2M12 17v2M16 17v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 8h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Shield Icon
export function ShieldIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M12 3l8 4v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V7l8-4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Check Icon
export function CheckIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 12l3 3 5-5"
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
      <path
        d="M12 4L3 20h18L12 4z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

// Info Icon
export function InfoIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

// Save Icon - Floppy disk
export function SaveIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M5 3h11l5 5v13a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="7" y="13" width="10" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="8" y="3" width="6" height="5" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// Load/Folder Icon
export function LoadIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M4 6a1 1 0 011-1h4l2 2h8a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M12 11v5m0-5l-2.5 2.5M12 11l2.5 2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Reset Icon
export function ResetIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M4 12a8 8 0 018-8c3 0 5.5 1.5 7 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 12a8 8 0 01-8 8c-3 0-5.5-1.5-7-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M19 4v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 20v-4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
      <path
        d="M12 4v12m0 0l-4-4m4 4l4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Share Icon
export function ShareIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M8.5 10.5l7-4M8.5 13.5l7 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
      <path
        d="M4 4a1 1 0 011-1h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M8 3v18" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8h5M12 12h5M12 16h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Lightbulb Icon
export function LightbulbIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M9 18h6M10 21h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 3a6 6 0 00-4 10.5V16h8v-2.5A6 6 0 0012 3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
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
      <path
        d="M15 3h4a1 1 0 011 1v16a1 1 0 01-1 1h-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 12H3m0 0l3-3m-3 3l3 3"
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
      <path
        d="M9 3H5a1 1 0 00-1 1v16a1 1 0 001 1h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 12h5m0 0l-3-3m3 3l-3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
        d="M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 12l8-8m0 0h-6m6 0v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Target Icon
export function TargetIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
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
        d="M12 20s-8-5-8-10a5 5 0 0110-1 5 5 0 0110 1c0 5-8 10-8 10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Graduation Icon
export function GraduationIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <path
        d="M12 4L2 9l10 5 10-5-10-5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M6 11v5c0 2 2.5 4 6 4s6-2 6-4v-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M22 9v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Fuel Icon
export function FuelIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <rect x="4" y="4" width="10" height="16" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="6" y="6" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M14 10h3a1 1 0 011 1v6l2 2v-9a1 1 0 00-1-1h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Wrench Icon
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
        d="M14.7 6.3a5 5 0 00-6.4 6.4l-4.6 4.6a1.4 1.4 0 002 2l4.6-4.6a5 5 0 006.4-6.4l-3 3-2-2 3-3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Sun Icon
export function SunIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-yellow-500", className)}
    >
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2m0 16v2M4 12H2m20 0h-2M6.34 6.34L4.93 4.93m14.14 14.14l-1.41-1.41M6.34 17.66l-1.41 1.41m14.14-14.14l-1.41 1.41"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Moon Icon
export function MoonIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-blue-400", className)}
    >
      <path
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
        d="M5 12h14m0 0l-6-6m6 6l-6 6"
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
        d="M19 12H5m0 0l6-6m-6 6l6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
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
        d="M12 5v14m-7-7h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Close/X Icon
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
        d="M6 6l12 12M6 18L18 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Trash Icon
export function TrashIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-destructive", className)}
    >
      <path d="M4 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 6v13a1 1 0 001 1h10a1 1 0 001-1V6"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M10 10v6M14 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Help Icon
export function HelpIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M9 9a3 3 0 115 2.83V13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
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
      <rect x="6" y="14" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="2" />
      <path d="M6 14V8a1 1 0 011-1h10a1 1 0 011 1v6" stroke="currentColor" strokeWidth="2" />
      <path d="M6 10H4a1 1 0 00-1 1v4a1 1 0 001 1h2m12-6h2a1 1 0 011 1v4a1 1 0 01-1 1h-2" stroke="currentColor" strokeWidth="2" />
      <path d="M8 3h8v4H8z" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// Email Icon
export function EmailIcon({ className, size = 24 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("text-primary", className)}
    >
      <rect x="3" y="5" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="2" />
      <path
        d="M3 7l9 6 9-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
