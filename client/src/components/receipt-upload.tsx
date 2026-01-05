import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Upload,
  Image,
  Loader2,
  Check,
  X,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { receiptApi, type ScanResult } from "@/lib/api";

interface ExtractedData {
  total?: number;
  merchant?: string;
  date?: string;
  category: string;
  subcategory?: string;
}

interface ReceiptUploadProps {
  onTransactionCreated?: (transaction: {
    id: string;
    amount: number;
    merchant?: string;
    category: string;
    date: string;
  }) => void;
  className?: string;
}

export function ReceiptUpload({
  onTransactionCreated,
  className,
}: ReceiptUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<ExtractedData | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setError(null);

      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload and process
      setUploading(true);
      try {
        const { data, error: apiError } = await receiptApi.scan(file);

        if (apiError || !data) {
          throw new Error(apiError || "Failed to process receipt");
        }

        setExtracted(data.extracted);
        setTransactionId(data.transactionId);
        setConfidence(data.confidence);
        setEditData({
          ...data.extracted,
          date: data.extracted.date || new Date().toISOString().split("T")[0],
        });

        // Auto-confirm if high confidence and all data present
        if (!data.needsReview && data.transactionId && data.extracted.total) {
          onTransactionCreated?.({
            id: data.transactionId,
            amount: data.extracted.total,
            merchant: data.extracted.merchant,
            category: data.extracted.category,
            date: data.extracted.date || new Date().toISOString().split("T")[0],
          });
        }
      } catch (err) {
        console.error("Upload error:", err);
        setError((err as Error).message || "Failed to process receipt");
      } finally {
        setUploading(false);
      }
    },
    [onTransactionCreated]
  );

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirm = async () => {
    if (!transactionId || !editData) return;

    try {
      const { error: apiError } = await receiptApi.confirm(transactionId, {
        amount: editData.total!,
        merchant: editData.merchant,
        category: editData.category,
        subcategory: editData.subcategory,
        transactionDate: editData.date!,
      });

      if (apiError) throw new Error(apiError);

      onTransactionCreated?.({
        id: transactionId,
        amount: editData.total!,
        merchant: editData.merchant,
        category: editData.category,
        date: editData.date!,
      });

      handleReset();
    } catch (err) {
      console.error("Confirm error:", err);
      setError((err as Error).message || "Failed to save transaction");
    }
  };

  const handleReset = () => {
    setPreview(null);
    setExtracted(null);
    setTransactionId(null);
    setEditing(false);
    setEditData(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <Card
      className={cn(
        "border-dashed border-2 transition-colors",
        dragActive && "border-primary bg-primary/5",
        className
      )}
    >
      <CardContent className="p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {!preview ? (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className="text-center py-8"
          >
            <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
              <Image className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Scan Receipt</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Take a photo or upload an image to automatically extract
              transaction details
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview */}
            <div className="relative">
              <img
                src={preview}
                alt="Receipt"
                className="w-full max-h-64 object-contain rounded-lg bg-muted"
              />
              <button
                onClick={handleReset}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background shadow-sm"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {uploading ? (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Processing receipt...</span>
              </div>
            ) : (
              extracted && (
                <AnimatePresence mode="wait">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {/* Confidence indicator */}
                    <div
                      className={cn(
                        "text-sm px-3 py-1.5 rounded-full w-fit",
                        confidence >= 0.7
                          ? "bg-green-500/10 text-green-600"
                          : "bg-yellow-500/10 text-yellow-600"
                      )}
                    >
                      {confidence >= 0.7 ? "High confidence" : "Review needed"} (
                      {Math.round(confidence * 100)}%)
                    </div>

                    {/* Extracted data */}
                    {editing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm text-muted-foreground">
                            Amount
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              value={editData?.total || ""}
                              onChange={(e) =>
                                setEditData({
                                  ...editData!,
                                  total: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full h-10 pl-7 pr-3 rounded-lg border bg-background font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">
                            Merchant
                          </label>
                          <input
                            type="text"
                            value={editData?.merchant || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData!,
                                merchant: e.target.value,
                              })
                            }
                            className="w-full h-10 px-3 rounded-lg border bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">
                            Category
                          </label>
                          <select
                            value={editData?.category || "wants"}
                            onChange={(e) =>
                              setEditData({
                                ...editData!,
                                category: e.target.value,
                              })
                            }
                            className="w-full h-10 px-3 rounded-lg border bg-background"
                          >
                            <option value="needs">Needs</option>
                            <option value="wants">Wants</option>
                            <option value="savings">Savings</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm text-muted-foreground">
                            Date
                          </label>
                          <input
                            type="date"
                            value={editData?.date || ""}
                            onChange={(e) =>
                              setEditData({ ...editData!, date: e.target.value })
                            }
                            className="w-full h-10 px-3 rounded-lg border bg-background"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount</span>
                          <span className="font-bold">
                            {extracted.total
                              ? `$${extracted.total.toFixed(2)}`
                              : "Not detected"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Merchant</span>
                          <span>{extracted.merchant || "Unknown"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Category</span>
                          <span className="capitalize">{extracted.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date</span>
                          <span>
                            {extracted.date || new Date().toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {editing ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setEditing(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleConfirm}
                            className="flex-1 gap-2"
                            disabled={!editData?.total}
                          >
                            <Check className="h-4 w-4" />
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            onClick={() => setEditing(true)}
                            className="flex-1 gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            onClick={handleConfirm}
                            className="flex-1 gap-2"
                            disabled={!extracted.total}
                          >
                            <Check className="h-4 w-4" />
                            Confirm
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
