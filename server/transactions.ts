import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  transactionDb,
  merchantDb,
  type Transaction,
  type MerchantCategory,
} from "./db";
import { requireAuth, type AuthRequest } from "./middleware/auth";

const router = Router();
router.use(requireAuth);

// Common merchant patterns for auto-categorization
const MERCHANT_PATTERNS: Array<{
  pattern: RegExp;
  category: string;
  subcategory: string;
}> = [
  // Needs - Groceries
  {
    pattern: /walmart|target|costco|kroger|safeway|publix|trader joe|whole foods|aldi|grocery|food lion|wegmans|heb|meijer|sprouts/i,
    category: "needs",
    subcategory: "groceries",
  },
  // Needs - Gas
  {
    pattern: /shell|chevron|exxon|mobil|bp|76|gas|fuel|valero|speedway|marathon|circle k|wawa|sheetz|quiktrip/i,
    category: "needs",
    subcategory: "gas",
  },
  // Needs - Utilities
  {
    pattern: /electric|water|gas company|utility|power|energy|pge|con edison|duke energy/i,
    category: "needs",
    subcategory: "utilities",
  },
  // Needs - Phone/Internet
  {
    pattern: /verizon|at&t|t-mobile|sprint|comcast|xfinity|spectrum|cox|frontier/i,
    category: "needs",
    subcategory: "phone",
  },
  // Needs - Insurance
  {
    pattern: /geico|progressive|state farm|allstate|liberty mutual|farmers|usaa|nationwide/i,
    category: "needs",
    subcategory: "insurance",
  },
  // Needs - Healthcare
  {
    pattern: /pharmacy|cvs|walgreens|rite aid|hospital|medical|clinic|doctor|dentist|optometrist/i,
    category: "needs",
    subcategory: "healthcare",
  },
  // Wants - Dining
  {
    pattern: /mcdonald|starbucks|chipotle|pizza|restaurant|cafe|doordash|uber eats|grubhub|dunkin|chick-fil-a|wendy|burger|subway|taco bell|panera|olive garden|applebee/i,
    category: "wants",
    subcategory: "dining",
  },
  // Wants - Entertainment
  {
    pattern: /netflix|spotify|hulu|disney|amc|cinema|theater|gaming|playstation|xbox|nintendo|steam|twitch/i,
    category: "wants",
    subcategory: "entertainment",
  },
  // Wants - Shopping
  {
    pattern: /amazon|ebay|etsy|mall|clothing|shoes|apparel|nordstrom|macys|kohls|tj maxx|marshalls|ross|old navy|gap|h&m|zara/i,
    category: "wants",
    subcategory: "shopping",
  },
  // Wants - Travel
  {
    pattern: /uber|lyft|airline|delta|united|american|southwest|hotel|marriott|hilton|airbnb|expedia|booking/i,
    category: "wants",
    subcategory: "travel",
  },
];

/**
 * Detect category based on merchant name.
 * First checks user-specific mappings, then global patterns.
 */
function detectCategory(
  merchant: string | null,
  userId: string
): { category: string; subcategory: string | null } {
  if (!merchant) return { category: "wants", subcategory: null };

  // Check user-specific and global mappings in DB
  try {
    const mapping = merchantDb.findMatch.get(
      userId,
      merchant
    ) as MerchantCategory | undefined;
    if (mapping) {
      return { category: mapping.category, subcategory: mapping.subcategory };
    }
  } catch {
    // Ignore DB errors, fall through to pattern matching
  }

  // Fallback to built-in heuristics
  const merchantLower = merchant.toLowerCase();
  for (const { pattern, category, subcategory } of MERCHANT_PATTERNS) {
    if (pattern.test(merchantLower)) {
      return { category, subcategory };
    }
  }

  return { category: "wants", subcategory: null };
}

// List transactions with pagination and filters
router.get("/", (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = (page - 1) * limit;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    let transactions: Transaction[];

    if (startDate && endDate) {
      transactions = transactionDb.findByUserDateRange.all(
        req.user!.id,
        startDate,
        endDate
      ) as Transaction[];
    } else {
      transactions = transactionDb.findByUser.all(
        req.user!.id,
        limit,
        offset
      ) as Transaction[];
    }

    const countResult = transactionDb.countByUser.get(req.user!.id) as {
      count: number;
    };

    res.json({
      transactions,
      page,
      limit,
      total: countResult.count,
      hasMore: offset + transactions.length < countResult.count,
    });
  } catch (error) {
    console.error("List transactions error:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Add manual transaction
router.post("/", (req: AuthRequest, res) => {
  try {
    const { amount, merchant, description, category, subcategory, transactionDate } =
      req.body;

    if (!amount || !transactionDate) {
      return res.status(400).json({ error: "Amount and date are required" });
    }

    // Auto-detect category if not provided
    const detected = category
      ? { category, subcategory: subcategory || null }
      : detectCategory(merchant, req.user!.id);

    const id = uuidv4();

    transactionDb.create.run(
      id,
      req.user!.id,
      parseFloat(amount),
      merchant || null,
      description || null,
      detected.category,
      detected.subcategory,
      transactionDate,
      "manual",
      null,
      null,
      null
    );

    res.json({
      success: true,
      id,
      category: detected.category,
      subcategory: detected.subcategory,
    });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ error: "Failed to create transaction" });
  }
});

// Get single transaction
router.get("/:id", (req: AuthRequest, res) => {
  try {
    const transaction = transactionDb.findById.get(
      req.params.id,
      req.user!.id
    ) as Transaction | undefined;

    if (!transaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({ error: "Failed to fetch transaction" });
  }
});

// Update transaction
router.put("/:id", (req: AuthRequest, res) => {
  try {
    const { amount, merchant, description, category, subcategory, transactionDate } =
      req.body;

    const existing = transactionDb.findById.get(
      req.params.id,
      req.user!.id
    ) as Transaction | undefined;

    if (!existing) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    transactionDb.update.run(
      amount ?? existing.amount,
      merchant ?? existing.merchant,
      description ?? existing.description,
      category ?? existing.category,
      subcategory ?? existing.subcategory,
      transactionDate ?? existing.transaction_date,
      req.params.id,
      req.user!.id
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Update transaction error:", error);
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// Delete transaction
router.delete("/:id", (req: AuthRequest, res) => {
  try {
    const result = transactionDb.delete.run(req.params.id, req.user!.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Delete transaction error:", error);
    res.status(500).json({ error: "Failed to delete transaction" });
  }
});

// Get spending summary by category
router.get("/stats/summary", (req: AuthRequest, res) => {
  try {
    // Default to current month
    const now = new Date();
    const startDate =
      (req.query.startDate as string) ||
      new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
    const endDate =
      (req.query.endDate as string) || now.toISOString().split("T")[0];

    const summary = transactionDb.sumByCategory.all(
      req.user!.id,
      startDate,
      endDate
    ) as Array<{ category: string; subcategory: string | null; total: number }>;

    // Group by category
    const grouped = summary.reduce(
      (acc, row) => {
        if (!acc[row.category]) {
          acc[row.category] = { total: 0, subcategories: {} };
        }
        acc[row.category].total += row.total;
        if (row.subcategory) {
          acc[row.category].subcategories[row.subcategory] =
            (acc[row.category].subcategories[row.subcategory] || 0) + row.total;
        }
        return acc;
      },
      {} as Record<string, { total: number; subcategories: Record<string, number> }>
    );

    res.json({ summary: grouped, startDate, endDate });
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
});

// Learn a merchant category mapping
router.post("/learn-category", (req: AuthRequest, res) => {
  try {
    const { merchant, category, subcategory } = req.body;

    if (!merchant || !category) {
      return res.status(400).json({ error: "Merchant and category are required" });
    }

    const id = uuidv4();
    merchantDb.create.run(
      id,
      req.user!.id,
      merchant.toLowerCase().trim(),
      category,
      subcategory || null
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Learn category error:", error);
    res.status(500).json({ error: "Failed to save category mapping" });
  }
});

export default router;
