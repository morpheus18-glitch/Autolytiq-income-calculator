import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Twitter, Linkedin, Facebook, Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogFeedbackProps {
  slug: string;
  title: string;
}

export function BlogFeedback({ slug, title }: BlogFeedbackProps) {
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);
  const [copied, setCopied] = useState(false);

  // Load saved feedback
  useEffect(() => {
    const saved = localStorage.getItem(`blog-feedback-${slug}`);
    if (saved) setFeedback(saved as "helpful" | "not-helpful");
  }, [slug]);

  const handleFeedback = (type: "helpful" | "not-helpful") => {
    setFeedback(type);
    localStorage.setItem(`blog-feedback-${slug}`, type);
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-t border-b border-[#262626] py-8 my-10">
      {/* Was this helpful? */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <span className="text-neutral-400 text-sm">Was this article helpful?</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleFeedback("helpful")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                feedback === "helpful"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-[#1a1a1a] text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent"
              )}
            >
              <ThumbsUp className="w-4 h-4" />
              Yes
            </button>
            <button
              onClick={() => handleFeedback("not-helpful")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all",
                feedback === "not-helpful"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : "bg-[#1a1a1a] text-neutral-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent"
              )}
            >
              <ThumbsDown className="w-4 h-4" />
              No
            </button>
          </div>
          {feedback && (
            <span className="text-xs text-neutral-500">Thanks for your feedback!</span>
          )}
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-2">
          <span className="text-neutral-400 text-sm mr-2">Share:</span>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-[#1a1a1a] text-neutral-400 hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 transition-all"
            title="Share on Twitter"
          >
            <Twitter className="w-4 h-4" />
          </a>
          <a
            href={shareLinks.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-[#1a1a1a] text-neutral-400 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-all"
            title="Share on LinkedIn"
          >
            <Linkedin className="w-4 h-4" />
          </a>
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-[#1a1a1a] text-neutral-400 hover:text-[#1877F2] hover:bg-[#1877F2]/10 transition-all"
            title="Share on Facebook"
          >
            <Facebook className="w-4 h-4" />
          </a>
          <button
            onClick={copyLink}
            className={cn(
              "p-2 rounded-lg transition-all",
              copied
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-[#1a1a1a] text-neutral-400 hover:text-emerald-400 hover:bg-emerald-500/10"
            )}
            title="Copy link"
          >
            {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
