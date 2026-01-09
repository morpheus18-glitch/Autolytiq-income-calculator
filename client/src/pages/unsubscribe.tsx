import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { AutolytiqLogo, CheckIcon, WarningIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Spinner } from "@/components/ui/spinner";

type UnsubscribeStatus = "loading" | "success" | "already" | "error" | "invalid";

export default function Unsubscribe() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const token = params.get("token");

  const [status, setStatus] = useState<UnsubscribeStatus>("loading");
  const [email, setEmail] = useState<string>("");
  const [resubscribeEmail, setResubscribeEmail] = useState("");
  const [resubscribeStatus, setResubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    // Call unsubscribe endpoint
    fetch(`/api/leads/unsubscribe/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message === "Successfully unsubscribed") {
          setStatus("success");
          setEmail(data.email || "");
        } else if (data.message === "Already unsubscribed") {
          setStatus("already");
          setEmail(data.email || "");
        } else if (data.message === "Not found" || data.message === "Invalid token") {
          setStatus("invalid");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [token]);

  const handleResubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resubscribeEmail) return;

    setResubscribeStatus("loading");
    try {
      const res = await fetch("/api/leads/resubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resubscribeEmail }),
      });
      const data = await res.json();

      if (data.message === "Successfully resubscribed" || data.message === "Already subscribed") {
        setResubscribeStatus("success");
      } else {
        setResubscribeStatus("error");
      }
    } catch {
      setResubscribeStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="fixed inset-0 dark:grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20">
                <AutolytiqLogo className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold tracking-tight dark:neon-text">Autolytiq</span>
            </div>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-16">
        <Card className="glass-card border-none shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Email Preferences</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {status === "loading" && (
              <div className="flex flex-col items-center py-8">
                <Spinner className="h-8 w-8 text-primary" />
                <p className="text-muted-foreground mt-4">Processing your request...</p>
              </div>
            )}

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">You've been unsubscribed</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {email && <span className="font-mono text-xs">{email}</span>}
                  {email && <br />}
                  You won't receive any more emails from us.
                </p>
                <p className="text-muted-foreground text-sm mb-6">
                  We're sorry to see you go! If you change your mind, you can always resubscribe below.
                </p>
              </motion.div>
            )}

            {status === "already" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <CheckIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Already unsubscribed</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {email && <span className="font-mono text-xs">{email}</span>}
                  {email && <br />}
                  You're already unsubscribed from our mailing list.
                </p>
              </motion.div>
            )}

            {status === "invalid" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                  <WarningIcon className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Invalid link</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  This unsubscribe link is invalid or has expired.
                </p>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-6"
              >
                <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                  <WarningIcon className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  We couldn't process your request. Please try again later.
                </p>
              </motion.div>
            )}

            {/* Resubscribe Section */}
            {(status === "success" || status === "already") && (
              <div className="border-t border-border pt-6 mt-6">
                <h4 className="text-sm font-medium mb-3">Changed your mind?</h4>
                {resubscribeStatus === "success" ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-4"
                  >
                    <p className="text-primary text-sm">
                      <CheckIcon className="h-4 w-4 inline mr-1" />
                      You've been resubscribed!
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleResubscribe} className="flex gap-2">
                    <input
                      type="email"
                      value={resubscribeEmail}
                      onChange={(e) => setResubscribeEmail(e.target.value)}
                      placeholder={email || "Enter your email"}
                      className="flex-1 h-10 px-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 outline-none"
                    />
                    <Button
                      type="submit"
                      disabled={resubscribeStatus === "loading"}
                      size="sm"
                    >
                      {resubscribeStatus === "loading" ? "..." : "Resubscribe"}
                    </Button>
                  </form>
                )}
                {resubscribeStatus === "error" && (
                  <p className="text-destructive text-xs mt-2">
                    Could not resubscribe. Please check your email and try again.
                  </p>
                )}
              </div>
            )}

            {/* Back to calculator */}
            <div className="text-center mt-6 pt-4 border-t border-border">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  ← Back to Calculator
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Autolytiq. Free income calculator.
          </p>
        </div>
      </footer>
    </div>
  );
}
