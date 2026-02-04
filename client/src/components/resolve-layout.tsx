/**
 * Resolution Layer Layout
 *
 * Minimal, isolated layout for the Resolution Layer.
 * No global navigation. No homepage links. No promotional elements.
 * Exists solely to contain resolution tools.
 */

import { ReactNode } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

interface ResolveLayoutProps {
  children: ReactNode;
}

export function ResolveLayout({ children }: ResolveLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Minimal header - no navigation, no branding links */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            Resolution Layer
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>

      {/* Minimal footer - no links */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <p className="text-xs text-muted-foreground text-center">
            For estimation purposes only. Not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
