import { useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExportButtonsProps {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
  onEmailClick?: () => void;
  className?: string;
}

export function ExportButtons({
  targetRef,
  filename = "calculation",
  onEmailClick,
  className,
}: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPng = async () => {
    if (!targetRef.current) return;

    setIsExporting(true);
    try {
      // Add print-friendly class temporarily
      targetRef.current.classList.add("print-export");

      const dataUrl = await toPng(targetRef.current, {
        quality: 0.95,
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      targetRef.current.classList.remove("print-export");

      // Download
      const link = document.createElement("a");
      link.download = `${filename}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadPng}
        disabled={isExporting}
        className="gap-2"
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Save as Image
      </Button>
      {onEmailClick && (
        <Button variant="outline" size="sm" onClick={onEmailClick} className="gap-2">
          <Mail className="h-4 w-4" />
          Email Results
        </Button>
      )}
    </div>
  );
}

interface ShareButtonsProps {
  title: string;
  text: string;
  url?: string;
  className?: string;
}

export function ShareButtons({ title, text, url, className }: ShareButtonsProps) {
  const shareUrl = url || window.location.href;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Twitter",
      url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      color: "hover:bg-sky-500/10 hover:text-sky-500",
    },
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:bg-blue-600/10 hover:text-blue-600",
    },
    {
      name: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:bg-blue-700/10 hover:text-blue-700",
    },
    {
      name: "Copy Link",
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        // Could show toast here
      },
      color: "hover:bg-primary/10 hover:text-primary",
    },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">Share:</span>
      {shareLinks.map((link) => (
        link.url ? (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
              link.color
            )}
          >
            {link.name}
          </a>
        ) : (
          <button
            key={link.name}
            onClick={link.action}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
              link.color
            )}
          >
            {link.name}
          </button>
        )
      ))}
    </div>
  );
}

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculationType: string;
  results: Record<string, string | number>;
}

export function EmailCaptureModal({
  isOpen,
  onClose,
  calculationType,
  results,
}: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/email-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, calculationType, results }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send email");
      }

      setSent(true);
    } catch (err) {
      console.error("Failed to send email:", err);
      setError(err instanceof Error ? err.message : "Failed to send email. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 rounded-2xl bg-card border shadow-xl">
        {sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-semibold mb-2">Results Sent!</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Check your inbox for your calculation results.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-2">Email Your Results</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Get a copy of your {calculationType} calculations sent to your email.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-primary/30 outline-none"
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={sending} className="flex-1 gap-2">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Send Results
                </Button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-4">
              We'll also send you helpful financial tips. Unsubscribe anytime.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
