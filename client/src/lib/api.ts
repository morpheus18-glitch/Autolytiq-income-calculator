/**
 * API helper that automatically includes authentication headers.
 */

const AUTH_STORAGE_KEY = "income-calc-user";

interface User {
  id: string;
  email: string;
  name?: string;
}

function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

/**
 * Fetch wrapper that automatically includes user authentication header.
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const user = getStoredUser();

  const headers: HeadersInit = {
    ...(options.headers || {}),
  };

  // Add auth header if user is logged in
  if (user?.id) {
    (headers as Record<string, string>)["x-user-id"] = user.id;
  }

  // Add JSON content-type for non-FormData bodies
  if (options.body && !(options.body instanceof FormData)) {
    (headers as Record<string, string>)["Content-Type"] = "application/json";
  }

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Typed API response helper.
 */
export async function apiJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await apiFetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      return { data: null, error: data.error || "Request failed" };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message || "Network error" };
  }
}

// Budget API helpers
export const budgetApi = {
  save: (data: {
    name?: string;
    fixedExpenses: Record<string, number>;
    frequencyData: Record<string, { frequency: number; amount: number }>;
    selectedSubscriptions: string[];
    customSubAmounts?: Record<string, number>;
    monthlyIncome: number;
  }) =>
    apiJson<{ success: boolean; id: string }>("/api/budget/save", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getHistory: () =>
    apiJson<{
      snapshots: Array<{
        id: string;
        name: string | null;
        monthlyIncome: number;
        createdAt: string;
      }>;
    }>("/api/budget/history"),

  load: (id: string) =>
    apiJson<{
      id: string;
      name: string | null;
      fixedExpenses: Record<string, number>;
      frequencyData: Record<string, { frequency: number; amount: number }>;
      selectedSubscriptions: string[];
      customSubAmounts: Record<string, number>;
      monthlyIncome: number;
    }>(`/api/budget/${id}`),

  delete: (id: string) =>
    apiJson<{ success: boolean }>(`/api/budget/${id}`, { method: "DELETE" }),
};

// Transaction API helpers
export interface Transaction {
  id: string;
  amount: number;
  merchant: string | null;
  description: string | null;
  category: string;
  subcategory: string | null;
  transaction_date: string;
  source: string;
  created_at: string;
}

export const transactionApi = {
  list: (options?: { page?: number; limit?: number; startDate?: string; endDate?: string }) => {
    const params = new URLSearchParams();
    if (options?.page) params.set("page", String(options.page));
    if (options?.limit) params.set("limit", String(options.limit));
    if (options?.startDate) params.set("startDate", options.startDate);
    if (options?.endDate) params.set("endDate", options.endDate);
    const query = params.toString();
    return apiJson<{ transactions: Transaction[]; page: number; total: number; hasMore: boolean }>(
      `/api/transactions${query ? `?${query}` : ""}`
    );
  },

  create: (data: {
    amount: number;
    merchant?: string;
    description?: string;
    category?: string;
    subcategory?: string;
    transactionDate: string;
  }) =>
    apiJson<{ success: boolean; id: string; category: string; subcategory: string | null }>(
      "/api/transactions",
      { method: "POST", body: JSON.stringify(data) }
    ),

  update: (
    id: string,
    data: {
      amount?: number;
      merchant?: string;
      category?: string;
      subcategory?: string;
      transactionDate?: string;
    }
  ) =>
    apiJson<{ success: boolean }>(`/api/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiJson<{ success: boolean }>(`/api/transactions/${id}`, { method: "DELETE" }),

  summary: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const query = params.toString();
    return apiJson<{
      summary: Record<string, { total: number; subcategories: Record<string, number> }>;
      startDate: string;
      endDate: string;
    }>(`/api/transactions/stats/summary${query ? `?${query}` : ""}`);
  },
};

// Gamification API helpers
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface GamificationStats {
  currentStreak: number;
  longestStreak: number;
  totalTransactions: number;
  totalDaysLogged: number;
  weeksUnderBudget: number;
  lastLogDate: string | null;
  badges: Badge[];
}

export const gamificationApi = {
  getStats: () =>
    apiJson<GamificationStats>("/api/transactions/stats/gamification"),
};

// Receipt API helpers
export interface ScanResult {
  success: boolean;
  transactionId: string | null;
  extracted: {
    total?: number;
    merchant?: string;
    date?: string;
    category: string;
    subcategory?: string;
  };
  confidence: number;
  rawText: string;
  receiptPath: string;
  needsReview: boolean;
}

export const receiptApi = {
  scan: async (file: File): Promise<{ data: ScanResult | null; error: string | null }> => {
    const formData = new FormData();
    formData.append("receipt", file);

    return apiJson<ScanResult>("/api/receipts/scan", {
      method: "POST",
      body: formData,
    });
  },

  confirm: (
    transactionId: string,
    data: {
      amount: number;
      merchant?: string;
      category: string;
      subcategory?: string;
      transactionDate: string;
    }
  ) =>
    apiJson<{ success: boolean }>(`/api/receipts/confirm/${transactionId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
