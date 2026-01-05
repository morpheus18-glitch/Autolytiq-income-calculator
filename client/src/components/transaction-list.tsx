import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Edit2,
  Check,
  X,
  Receipt,
  Plus,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { transactionApi, type Transaction } from "@/lib/api";

interface TransactionListProps {
  onAddNew: () => void;
  refreshTrigger?: number;
}

const CATEGORY_COLORS = {
  needs: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  wants: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  savings: "bg-purple-500/10 text-purple-600 border-purple-500/30",
};

export function TransactionList({
  onAddNew,
  refreshTrigger,
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Transaction>>({});
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchTransactions = async (pageNum: number = 1, append: boolean = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const { data, error } = await transactionApi.list({
        page: pageNum,
        limit: 20,
      });

      if (error || !data) {
        console.error("Fetch error:", error);
        return;
      }

      if (append) {
        setTransactions((prev) => [...prev, ...data.transactions]);
      } else {
        setTransactions(data.transactions);
      }
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, false);
  }, [refreshTrigger]);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTransactions(page + 1, true);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;

    try {
      const { error } = await transactionApi.delete(id);
      if (!error) {
        setTransactions(transactions.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingId(transaction.id);
    setEditData(transaction);
  };

  const handleSave = async () => {
    if (!editingId) return;

    try {
      const { error } = await transactionApi.update(editingId, {
        amount: editData.amount,
        merchant: editData.merchant || undefined,
        category: editData.category,
        transactionDate: editData.transaction_date,
      });

      if (!error) {
        setTransactions(
          transactions.map((t) =>
            t.id === editingId ? ({ ...t, ...editData } as Transaction) : t
          )
        );
        setEditingId(null);
        setEditData({});
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading transactions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Recent Transactions
          </CardTitle>
          <Button size="sm" onClick={onAddNew} className="gap-1">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No transactions yet</p>
            <p className="text-sm">Scan a receipt or add one manually</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {transactions.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {editingId === t.id ? (
                    <>
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={editData.amount || ""}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              amount: parseFloat(e.target.value),
                            })
                          }
                          className="w-full h-8 pl-5 pr-2 rounded border bg-background font-mono text-sm"
                        />
                      </div>
                      <input
                        type="text"
                        value={editData.merchant || ""}
                        onChange={(e) =>
                          setEditData({ ...editData, merchant: e.target.value })
                        }
                        placeholder="Merchant"
                        className="flex-1 h-8 px-2 rounded border bg-background text-sm"
                      />
                      <select
                        value={editData.category || "wants"}
                        onChange={(e) =>
                          setEditData({ ...editData, category: e.target.value })
                        }
                        className="h-8 px-2 rounded border bg-background text-sm"
                      >
                        <option value="needs">Needs</option>
                        <option value="wants">Wants</option>
                        <option value="savings">Savings</option>
                      </select>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSave}
                        className="h-8 w-8 p-0"
                        aria-label="Save changes"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        className="h-8 w-8 p-0"
                        aria-label="Cancel editing"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">
                            {t.merchant || "Unknown"}
                          </span>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full border capitalize shrink-0",
                              CATEGORY_COLORS[
                                t.category as keyof typeof CATEGORY_COLORS
                              ] || CATEGORY_COLORS.wants
                            )}
                          >
                            {t.category}
                          </span>
                          {t.source === "receipt_scan" && (
                            <Receipt
                              className="h-3 w-3 text-muted-foreground shrink-0"
                              aria-label="Scanned receipt"
                            />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(t.transaction_date)}
                        </div>
                      </div>
                      <div className="font-mono font-bold shrink-0">
                        ${t.amount.toFixed(2)}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(t)}
                        className="h-8 w-8 p-0 shrink-0"
                        aria-label="Edit transaction"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(t.id)}
                        className="h-8 w-8 p-0 shrink-0"
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full mt-2"
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                Load More
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
