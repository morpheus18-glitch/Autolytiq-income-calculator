import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  budgetDb,
  type BudgetSnapshot,
} from "./db-postgres";
import { requireAuth, type AuthRequest } from "./middleware/auth";

const router = Router();

// Apply auth to all routes
router.use(requireAuth);

// Save budget snapshot
router.post("/save", async (req: AuthRequest, res) => {
  try {
    const {
      name,
      fixedExpenses,
      frequencyData,
      selectedSubscriptions,
      customSubAmounts,
      monthlyIncome,
    } = req.body;

    if (!fixedExpenses || !frequencyData || !monthlyIncome) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = uuidv4();

    await budgetDb.create(
      id,
      req.user!.id,
      name || null,
      JSON.stringify(fixedExpenses),
      JSON.stringify(frequencyData),
      JSON.stringify(selectedSubscriptions || []),
      customSubAmounts ? JSON.stringify(customSubAmounts) : null,
      monthlyIncome
    );

    res.json({ success: true, id });
  } catch (error) {
    console.error("Save budget error:", error);
    res.status(500).json({ error: "Failed to save budget" });
  }
});

// Get latest budget (most recent)
router.get("/latest", async (req: AuthRequest, res) => {
  try {
    const snapshot = await budgetDb.findLatest(req.user!.id);

    if (!snapshot) {
      return res.json({ budget: null });
    }

    res.json({
      budget: {
        id: snapshot.id,
        name: snapshot.name,
        fixedExpenses: JSON.parse(snapshot.fixed_expenses),
        frequencyData: JSON.parse(snapshot.frequency_data),
        selectedSubscriptions: JSON.parse(snapshot.selected_subscriptions),
        customSubAmounts: snapshot.custom_sub_amounts
          ? JSON.parse(snapshot.custom_sub_amounts)
          : {},
        monthlyIncome: snapshot.monthly_income,
        createdAt: snapshot.created_at,
      },
    });
  } catch (error) {
    console.error("Get latest budget error:", error);
    res.status(500).json({ error: "Failed to fetch latest budget" });
  }
});

// Get budget history
router.get("/history", async (req: AuthRequest, res) => {
  try {
    const snapshots = await budgetDb.findByUser(req.user!.id);

    const parsed = snapshots.map((s) => ({
      id: s.id,
      name: s.name,
      fixedExpenses: JSON.parse(s.fixed_expenses),
      frequencyData: JSON.parse(s.frequency_data),
      selectedSubscriptions: JSON.parse(s.selected_subscriptions),
      customSubAmounts: s.custom_sub_amounts
        ? JSON.parse(s.custom_sub_amounts)
        : {},
      monthlyIncome: s.monthly_income,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));

    res.json({ snapshots: parsed });
  } catch (error) {
    console.error("Get budget history error:", error);
    res.status(500).json({ error: "Failed to fetch budget history" });
  }
});

// Load specific budget
router.get("/:id", async (req: AuthRequest, res) => {
  try {
    const snapshot = await budgetDb.findById(req.params.id, req.user!.id);

    if (!snapshot) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json({
      id: snapshot.id,
      name: snapshot.name,
      fixedExpenses: JSON.parse(snapshot.fixed_expenses),
      frequencyData: JSON.parse(snapshot.frequency_data),
      selectedSubscriptions: JSON.parse(snapshot.selected_subscriptions),
      customSubAmounts: snapshot.custom_sub_amounts
        ? JSON.parse(snapshot.custom_sub_amounts)
        : {},
      monthlyIncome: snapshot.monthly_income,
      createdAt: snapshot.created_at,
    });
  } catch (error) {
    console.error("Get budget error:", error);
    res.status(500).json({ error: "Failed to fetch budget" });
  }
});

// Update budget
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const {
      fixedExpenses,
      frequencyData,
      selectedSubscriptions,
      customSubAmounts,
      monthlyIncome,
    } = req.body;

    const existing = await budgetDb.findById(req.params.id, req.user!.id);

    if (!existing) {
      return res.status(404).json({ error: "Budget not found" });
    }

    await budgetDb.update(
      JSON.stringify(fixedExpenses),
      JSON.stringify(frequencyData),
      JSON.stringify(selectedSubscriptions || []),
      customSubAmounts ? JSON.stringify(customSubAmounts) : null,
      monthlyIncome,
      req.params.id,
      req.user!.id
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Update budget error:", error);
    res.status(500).json({ error: "Failed to update budget" });
  }
});

// Delete budget
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    await budgetDb.delete(req.params.id, req.user!.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete budget error:", error);
    res.status(500).json({ error: "Failed to delete budget" });
  }
});

export default router;
