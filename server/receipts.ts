import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { transactionDb, merchantDb, type MerchantCategory } from "./db";
import { requireAuth, type AuthRequest } from "./middleware/auth";
import { receiptUpload, processReceiptImage, getRelativePath } from "./upload";
import { getOCRProvider } from "./services/ocr";

const router = Router();
router.use(requireAuth);

/**
 * Upload and process a receipt image.
 * Returns extracted data and creates a transaction if successful.
 */
router.post(
  "/scan",
  receiptUpload.single("receipt"),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      console.log(`[Receipt] Processing upload: ${req.file.filename}`);

      // Process image for better OCR
      const processedPath = await processReceiptImage(req.file.path);
      console.log(`[Receipt] Image processed: ${processedPath}`);

      // Run OCR
      const ocr = getOCRProvider();
      const result = await ocr.processImage(processedPath);

      // Auto-detect category based on merchant
      let category = "wants";
      let subcategory: string | null = null;

      if (result.extractedData.merchant) {
        try {
          const mapping = merchantDb.findMatch.get(
            req.user!.id,
            result.extractedData.merchant
          ) as MerchantCategory | undefined;
          if (mapping) {
            category = mapping.category;
            subcategory = mapping.subcategory;
          }
        } catch {
          // Ignore DB errors
        }
      }

      // Create transaction from OCR result
      const transactionId = uuidv4();
      const receiptRelativePath = getRelativePath(processedPath);

      // Only create if we extracted a total
      let created = false;
      if (result.extractedData.total && result.extractedData.total > 0) {
        transactionDb.create.run(
          transactionId,
          req.user!.id,
          result.extractedData.total,
          result.extractedData.merchant || null,
          null,
          category,
          subcategory,
          result.extractedData.date || new Date().toISOString().split("T")[0],
          "receipt_scan",
          receiptRelativePath,
          result.text,
          result.confidence
        );
        created = true;
      }

      res.json({
        success: true,
        transactionId: created ? transactionId : null,
        extracted: {
          total: result.extractedData.total,
          merchant: result.extractedData.merchant,
          date: result.extractedData.date,
          category,
          subcategory,
        },
        confidence: result.confidence,
        rawText: result.text,
        receiptPath: receiptRelativePath,
        needsReview: result.confidence < 0.7 || !result.extractedData.total,
      });
    } catch (error) {
      console.error("Receipt scan error:", error);
      res.status(500).json({ error: "Failed to process receipt" });
    }
  }
);

/**
 * Confirm or update a scanned transaction.
 * Also learns the merchant category for future auto-categorization.
 */
router.post("/confirm/:transactionId", (req: AuthRequest, res) => {
  try {
    const { amount, merchant, category, subcategory, transactionDate } = req.body;

    if (!amount || !category || !transactionDate) {
      return res.status(400).json({ error: "Amount, category, and date are required" });
    }

    // Update the transaction
    transactionDb.update.run(
      parseFloat(amount),
      merchant || null,
      null,
      category,
      subcategory || null,
      transactionDate,
      req.params.transactionId,
      req.user!.id
    );

    // Learn merchant category for future use
    if (merchant && category) {
      try {
        const id = uuidv4();
        merchantDb.create.run(
          id,
          req.user!.id,
          merchant.toLowerCase().trim(),
          category,
          subcategory || null
        );
      } catch {
        // Ignore if mapping already exists
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Confirm receipt error:", error);
    res.status(500).json({ error: "Failed to confirm transaction" });
  }
});

/**
 * Create a transaction from extracted data without a prior scan.
 * Useful when the client did manual OCR correction before submission.
 */
router.post("/create-from-scan", (req: AuthRequest, res) => {
  try {
    const {
      amount,
      merchant,
      category,
      subcategory,
      transactionDate,
      receiptPath,
      rawText,
      confidence,
    } = req.body;

    if (!amount || !category || !transactionDate) {
      return res.status(400).json({ error: "Amount, category, and date are required" });
    }

    const id = uuidv4();

    transactionDb.create.run(
      id,
      req.user!.id,
      parseFloat(amount),
      merchant || null,
      null,
      category,
      subcategory || null,
      transactionDate,
      "receipt_scan",
      receiptPath || null,
      rawText || null,
      confidence || null
    );

    // Learn merchant category
    if (merchant && category) {
      try {
        const mappingId = uuidv4();
        merchantDb.create.run(
          mappingId,
          req.user!.id,
          merchant.toLowerCase().trim(),
          category,
          subcategory || null
        );
      } catch {
        // Ignore
      }
    }

    res.json({ success: true, id });
  } catch (error) {
    console.error("Create from scan error:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

export default router;
