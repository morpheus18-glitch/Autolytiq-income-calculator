import { Router } from "express";
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from "plaid";
import { v4 as uuidv4 } from "uuid";
import { requireAuth, type AuthRequest } from "./middleware/auth";
import { plaidItemDb, plaidAccountDb, transactionDb, type PlaidItem, type PlaidAccount } from "./db";

const router = Router();

// Initialize Plaid client
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || "sandbox";

if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  console.warn("Warning: PLAID_CLIENT_ID or PLAID_SECRET not set. Plaid features disabled.");
}

const configuration = new Configuration({
  basePath: PlaidEnvironments[PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": PLAID_CLIENT_ID || "",
      "PLAID-SECRET": PLAID_SECRET || "",
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// Middleware to check if Plaid is configured
function requirePlaidConfig(req: AuthRequest, res: any, next: any) {
  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    return res.status(503).json({ error: "Plaid is not configured" });
  }
  next();
}

// Apply auth to all routes
router.use(requireAuth);

// Create link token (first step - generates token for Plaid Link UI)
router.post("/create-link-token", requirePlaidConfig, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: userId },
      client_name: "Autolytiq",
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: "en",
      // Optional: webhook for real-time updates
      // webhook: "https://yourdomain.com/api/plaid/webhook",
    });

    res.json({ link_token: response.data.link_token });
  } catch (error: any) {
    console.error("Create link token error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create link token" });
  }
});

// Exchange public token for access token (after user connects bank)
router.post("/exchange-token", requirePlaidConfig, async (req: AuthRequest, res) => {
  try {
    const { public_token, institution } = req.body;
    const userId = req.user!.id;

    if (!public_token) {
      return res.status(400).json({ error: "public_token is required" });
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = exchangeResponse.data;

    // Store the item in database
    const id = uuidv4();
    plaidItemDb.create.run(
      id,
      userId,
      access_token,
      item_id,
      institution?.institution_id || null,
      institution?.name || null
    );

    // Fetch and store accounts
    const accountsResponse = await plaidClient.accountsGet({ access_token });

    for (const account of accountsResponse.data.accounts) {
      const accountId = uuidv4();
      plaidAccountDb.upsert.run(
        accountId,
        id,
        account.account_id,
        account.name,
        account.official_name,
        account.type,
        account.subtype,
        account.mask,
        account.balances.current,
        account.balances.available,
        account.balances.iso_currency_code || "USD"
      );
    }

    res.json({
      success: true,
      item_id: id,
      institution_name: institution?.name || "Bank Account",
      accounts_connected: accountsResponse.data.accounts.length,
    });
  } catch (error: any) {
    console.error("Exchange token error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to connect bank account" });
  }
});

// Get connected accounts
router.get("/accounts", requirePlaidConfig, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const items = plaidItemDb.findByUser.all(userId) as PlaidItem[];

    const result = [];
    for (const item of items) {
      const accounts = plaidAccountDb.findByItem.all(item.id) as PlaidAccount[];
      result.push({
        id: item.id,
        institution_name: item.institution_name,
        status: item.status,
        error_code: item.error_code,
        last_synced_at: item.last_synced_at,
        accounts: accounts.map((acc) => ({
          id: acc.id,
          name: acc.name,
          official_name: acc.official_name,
          type: acc.type,
          subtype: acc.subtype,
          mask: acc.mask,
          current_balance: acc.current_balance,
          available_balance: acc.available_balance,
        })),
      });
    }

    res.json({ items: result });
  } catch (error: any) {
    console.error("Get accounts error:", error.message);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

// Sync transactions for a specific item
router.post("/sync/:itemId", requirePlaidConfig, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    const item = plaidItemDb.findById.get(itemId, userId) as PlaidItem | undefined;
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    let cursor = item.cursor || undefined;
    let hasMore = true;
    let addedCount = 0;
    let modifiedCount = 0;
    let removedCount = 0;

    while (hasMore) {
      const response = await plaidClient.transactionsSync({
        access_token: item.access_token,
        cursor,
        count: 100,
      });

      const { added, modified, removed, next_cursor, has_more } = response.data;

      // Process added transactions
      for (const txn of added) {
        const category = mapPlaidCategory(txn.personal_finance_category?.primary || txn.category?.[0] || "");
        const id = uuidv4();

        transactionDb.create.run(
          id,
          userId,
          Math.abs(txn.amount), // Plaid uses negative for expenses
          txn.merchant_name || txn.name,
          txn.name,
          category,
          txn.personal_finance_category?.detailed || null,
          txn.date,
          "plaid",
          null, // receipt_path
          null, // ocr_raw_text
          null  // confidence_score
        );
        addedCount++;
      }

      // Process modified transactions (update existing)
      for (const txn of modified) {
        // For simplicity, we'll skip modified - could implement update logic
        modifiedCount++;
      }

      // Process removed transactions (delete)
      for (const txn of removed) {
        // For simplicity, we'll skip removed - could implement delete logic
        removedCount++;
      }

      cursor = next_cursor;
      hasMore = has_more;
    }

    // Update cursor
    plaidItemDb.updateCursor.run(cursor || "", item.item_id);
    plaidItemDb.clearError.run(item.item_id);

    // Update account balances
    const accountsResponse = await plaidClient.accountsGet({ access_token: item.access_token });
    for (const account of accountsResponse.data.accounts) {
      const accountId = uuidv4();
      plaidAccountDb.upsert.run(
        accountId,
        item.id,
        account.account_id,
        account.name,
        account.official_name,
        account.type,
        account.subtype,
        account.mask,
        account.balances.current,
        account.balances.available,
        account.balances.iso_currency_code || "USD"
      );
    }

    res.json({
      success: true,
      added: addedCount,
      modified: modifiedCount,
      removed: removedCount,
    });
  } catch (error: any) {
    console.error("Sync transactions error:", error.response?.data || error.message);

    // Handle Plaid-specific errors
    const plaidError = error.response?.data?.error_code;
    if (plaidError) {
      const { itemId } = req.params;
      const item = plaidItemDb.findById.get(itemId, req.user!.id) as PlaidItem | undefined;
      if (item) {
        plaidItemDb.updateError.run(plaidError, item.item_id);
      }
    }

    res.status(500).json({ error: "Failed to sync transactions" });
  }
});

// Sync all connected accounts
router.post("/sync-all", requirePlaidConfig, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const items = plaidItemDb.findByUser.all(userId) as PlaidItem[];

    const results = [];
    for (const item of items) {
      try {
        // Reuse sync logic (simplified version)
        let cursor = item.cursor || undefined;
        let hasMore = true;
        let addedCount = 0;

        while (hasMore) {
          const response = await plaidClient.transactionsSync({
            access_token: item.access_token,
            cursor,
            count: 100,
          });

          const { added, next_cursor, has_more } = response.data;

          for (const txn of added) {
            const category = mapPlaidCategory(txn.personal_finance_category?.primary || txn.category?.[0] || "");
            const id = uuidv4();

            transactionDb.create.run(
              id,
              userId,
              Math.abs(txn.amount),
              txn.merchant_name || txn.name,
              txn.name,
              category,
              txn.personal_finance_category?.detailed || null,
              txn.date,
              "plaid",
              null,
              null,
              null
            );
            addedCount++;
          }

          cursor = next_cursor;
          hasMore = has_more;
        }

        plaidItemDb.updateCursor.run(cursor || "", item.item_id);
        plaidItemDb.clearError.run(item.item_id);

        results.push({
          item_id: item.id,
          institution: item.institution_name,
          added: addedCount,
          status: "success",
        });
      } catch (err: any) {
        plaidItemDb.updateError.run(err.response?.data?.error_code || "SYNC_ERROR", item.item_id);
        results.push({
          item_id: item.id,
          institution: item.institution_name,
          status: "error",
          error: err.response?.data?.error_code || "SYNC_ERROR",
        });
      }
    }

    res.json({ results });
  } catch (error: any) {
    console.error("Sync all error:", error.message);
    res.status(500).json({ error: "Failed to sync accounts" });
  }
});

// Remove/unlink a bank connection
router.delete("/items/:itemId", requirePlaidConfig, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    const item = plaidItemDb.findById.get(itemId, userId) as PlaidItem | undefined;
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Remove from Plaid
    try {
      await plaidClient.itemRemove({ access_token: item.access_token });
    } catch (plaidError) {
      // Continue even if Plaid removal fails (token may already be invalid)
      console.warn("Plaid item remove warning:", plaidError);
    }

    // Delete accounts first (foreign key)
    plaidAccountDb.deleteByItem.run(item.id);

    // Delete item
    plaidItemDb.delete.run(itemId, userId);

    res.json({ success: true });
  } catch (error: any) {
    console.error("Remove item error:", error.message);
    res.status(500).json({ error: "Failed to remove bank connection" });
  }
});

// Map Plaid categories to our needs/wants/savings categories
function mapPlaidCategory(plaidCategory: string): string {
  const needsCategories = [
    "INCOME",
    "TRANSFER_IN",
    "LOAN_PAYMENTS",
    "RENT_AND_UTILITIES",
    "MEDICAL",
    "TRANSPORTATION",
    "GROCERIES",
    "GENERAL_MERCHANDISE",
    "HOME_IMPROVEMENT",
    "INSURANCE",
    "TAX",
    "GOVERNMENT_AND_NON_PROFIT",
  ];

  const savingsCategories = [
    "TRANSFER_OUT",
    "BANK_FEES", // Not really savings but track it
  ];

  const upperCategory = plaidCategory.toUpperCase().replace(/ /g, "_");

  if (needsCategories.some((c) => upperCategory.includes(c))) {
    return "needs";
  }

  if (savingsCategories.some((c) => upperCategory.includes(c))) {
    return "savings";
  }

  // Default to wants for entertainment, food & drink, shopping, etc.
  return "wants";
}

// Webhook handler (for production - receives real-time updates from Plaid)
router.post("/webhook", async (req, res) => {
  const { webhook_type, webhook_code, item_id } = req.body;

  console.log(`Plaid webhook: ${webhook_type} - ${webhook_code} for item ${item_id}`);

  // Handle different webhook types
  switch (webhook_type) {
    case "TRANSACTIONS":
      if (webhook_code === "SYNC_UPDATES_AVAILABLE") {
        // Could trigger automatic sync here
        console.log("New transactions available for item:", item_id);
      }
      break;
    case "ITEM":
      if (webhook_code === "ERROR") {
        // Mark item as having an error
        const item = plaidItemDb.findByItemId.get(item_id) as PlaidItem | undefined;
        if (item) {
          plaidItemDb.updateError.run("ITEM_ERROR", item_id);
        }
      }
      break;
  }

  res.json({ received: true });
});

export default router;
