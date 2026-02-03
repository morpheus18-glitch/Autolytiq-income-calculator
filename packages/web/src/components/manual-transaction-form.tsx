import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, X, DollarSign, Store, Calendar, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transactionApi } from "@/lib/api";

interface ManualTransactionFormProps {
  onClose: () => void;
  onCreated: () => void;
}

const SUBCATEGORIES: Record<string, string[]> = {
  needs: [
    "housing",
    "utilities",
    "groceries",
    "gas",
    "transportation",
    "insurance",
    "healthcare",
    "phone",
    "internet",
    "childcare",
  ],
  wants: [
    "dining",
    "entertainment",
    "shopping",
    "subscriptions",
    "travel",
    "hobbies",
    "personal",
    "gifts",
  ],
  savings: ["emergency_fund", "investments", "retirement", "goals"],
};

export function ManualTransactionForm({
  onClose,
  onCreated,
}: ManualTransactionFormProps) {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("wants");
  const [subcategory, setSubcategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;

    setLoading(true);
    setError(null);

    try {
      const { error: apiError } = await transactionApi.create({
        amount: parseFloat(amount),
        merchant: merchant || undefined,
        category,
        subcategory: subcategory || undefined,
        transactionDate: date,
      });

      if (apiError) {
        throw new Error(apiError);
      }

      onCreated();
      onClose();
    } catch (err) {
      console.error("Create error:", err);
      setError((err as Error).message || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Add Transaction
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
                aria-label="Close form"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Amount */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-11 pl-8 pr-3 rounded-lg border bg-background font-mono"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Merchant */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  Merchant (optional)
                </label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border bg-background"
                  placeholder="Store name"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["needs", "wants", "savings"].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setCategory(cat);
                        setSubcategory("");
                      }}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors border capitalize ${
                        category === cat
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/30 border-border hover:bg-muted"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subcategory */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Subcategory (optional)
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border bg-background"
                >
                  <option value="">Select...</option>
                  {SUBCATEGORIES[category]?.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border bg-background"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    "Add Transaction"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
