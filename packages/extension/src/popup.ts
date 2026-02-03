/**
 * Income Calculator Pro - Chrome Extension
 *
 * TypeScript implementation with WASM calculation engine
 * and fallback to JavaScript for older browsers.
 */

// WASM module (lazy loaded)
let wasmModule: typeof import("@autolytiq/calc-wasm") | null = null;
let wasmLoadAttempted = false;

// Storage keys
const STORAGE_KEY = "income-calc-state";
const PAYMENT_STORAGE_KEY = "payment-calc-state";

// State types
interface IncomeState {
  startDate: string;
  checkDate: string;
  ytdIncome: string;
}

interface PaymentState {
  vehiclePrice: string;
  downPayment: string;
  tradeIn: string;
  taxRate: string;
  fees: string;
  apr: string;
  term: number;
}

interface CalculatedResults {
  daysWorked: number;
  daily: number;
  weekly: number;
  monthly: number;
  annual: number;
  effectiveStartDate: Date;
}

// DOM Elements - Income Calculator
const startDateInput = document.getElementById("startDate") as HTMLInputElement;
const ytdIncomeInput = document.getElementById("ytdIncome") as HTMLInputElement;
const checkDateInput = document.getElementById("checkDate") as HTMLInputElement;
const resultsDiv = document.getElementById("results") as HTMLDivElement;
const emptyStateDiv = document.getElementById("emptyState") as HTMLDivElement;
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement;
const copyBtn = document.getElementById("copyBtn") as HTMLButtonElement;

// DOM Elements - Payment Calculator
const vehiclePriceInput = document.getElementById("vehiclePrice") as HTMLInputElement;
const downPaymentInput = document.getElementById("downPayment") as HTMLInputElement;
const tradeInInput = document.getElementById("tradeIn") as HTMLInputElement;
const taxRateInput = document.getElementById("taxRate") as HTMLInputElement;
const feesInput = document.getElementById("fees") as HTMLInputElement;
const aprInput = document.getElementById("apr") as HTMLInputElement;
const termBtns = document.querySelectorAll<HTMLButtonElement>(".term-btn");
const paymentResultsDiv = document.getElementById("paymentResults") as HTMLDivElement;
const paymentEmptyStateDiv = document.getElementById("paymentEmptyState") as HTMLDivElement;

// State
let selectedTerm = 60;
let calculatedResults: CalculatedResults | null = null;

/**
 * Try to load WASM module
 */
async function tryLoadWasm(): Promise<boolean> {
  if (wasmLoadAttempted) return wasmModule !== null;
  wasmLoadAttempted = true;

  try {
    wasmModule = await import("@autolytiq/calc-wasm");
    console.log("[Extension] WASM loaded, version:", wasmModule.getVersion());
    return true;
  } catch (error) {
    console.log("[Extension] WASM not available, using JS fallback:", error);
    return false;
  }
}

// Tab switching
document.querySelectorAll<HTMLButtonElement>(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

    tab.classList.add("active");
    const tabContent = document.getElementById(`${tab.dataset.tab}-tab`);
    if (tabContent) tabContent.classList.add("active");
  });
});

/**
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

/**
 * Parse money input
 */
function parseMoney(value: string): number {
  return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
}

/**
 * Format money input
 */
function formatMoneyInput(input: HTMLInputElement): void {
  let value = input.value.replace(/[^0-9.]/g, "");
  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("");
  }
  if (parts[1] && parts[1].length > 2) {
    value = parts[0] + "." + parts[1].slice(0, 2);
  }
  input.value = value;
}

/**
 * Calculate income - uses WASM when available
 */
async function calculateIncome(): Promise<void> {
  const startDate = startDateInput.value ? new Date(startDateInput.value + "T00:00:00") : null;
  const checkDate = checkDateInput.value ? new Date(checkDateInput.value + "T00:00:00") : null;
  const ytdIncome = parseMoney(ytdIncomeInput.value);

  if (!startDate || !checkDate || !ytdIncome) {
    resultsDiv.classList.add("hidden");
    emptyStateDiv.classList.remove("hidden");
    calculatedResults = null;
    return;
  }

  if (checkDate < startDate) {
    resultsDiv.classList.add("hidden");
    emptyStateDiv.classList.remove("hidden");
    calculatedResults = null;
    return;
  }

  // Try WASM first
  const hasWasm = await tryLoadWasm();

  let daysWorked: number;
  let daily: number;
  let weekly: number;
  let monthly: number;
  let annual: number;
  let effectiveStartDate: Date;

  if (hasWasm && wasmModule) {
    try {
      const result = wasmModule.calculateIncome(
        ytdIncome,
        startDateInput.value,
        checkDateInput.value
      );

      daysWorked = result.days_worked;
      daily = result.gross_daily;
      weekly = result.gross_weekly;
      monthly = result.gross_monthly;
      annual = result.gross_annual;

      // Calculate effective start date
      const checkYearStart = new Date(checkDate.getFullYear(), 0, 1);
      effectiveStartDate = startDate < checkYearStart ? checkYearStart : startDate;
    } catch (error) {
      console.error("[Extension] WASM calculation failed:", error);
      // Fall back to JS
      return calculateIncomeJS(startDate, checkDate, ytdIncome);
    }
  } else {
    // JavaScript fallback
    return calculateIncomeJS(startDate, checkDate, ytdIncome);
  }

  calculatedResults = { daysWorked, daily, weekly, monthly, annual, effectiveStartDate };

  updateIncomeUI();
  saveIncomeState();
  calculatePayment();
}

/**
 * JavaScript fallback for income calculation
 */
function calculateIncomeJS(startDate: Date, checkDate: Date, ytdIncome: number): void {
  const checkYearStart = new Date(checkDate.getFullYear(), 0, 1);
  const effectiveStartDate = startDate < checkYearStart ? checkYearStart : startDate;

  const diffTime = checkDate.getTime() - effectiveStartDate.getTime();
  const daysWorked = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (daysWorked <= 0) {
    resultsDiv.classList.add("hidden");
    emptyStateDiv.classList.remove("hidden");
    calculatedResults = null;
    return;
  }

  const daily = ytdIncome / daysWorked;
  const weekly = daily * 7;
  const monthly = (daily * 365) / 12;
  const annual = daily * 365;

  calculatedResults = { daysWorked, daily, weekly, monthly, annual, effectiveStartDate };

  updateIncomeUI();
  saveIncomeState();
  calculatePayment();
}

/**
 * Update income UI with results
 */
function updateIncomeUI(): void {
  if (!calculatedResults) return;

  const { daysWorked, daily, weekly, monthly, annual, effectiveStartDate } = calculatedResults;

  const daysEl = document.getElementById("daysWorked");
  const annualEl = document.getElementById("annualIncome");
  const monthlyEl = document.getElementById("monthlyIncome");
  const weeklyEl = document.getElementById("weeklyIncome");
  const dailyEl = document.getElementById("dailyIncome");
  const dateRangeEl = document.getElementById("dateRange");

  if (daysEl) daysEl.textContent = `${daysWorked} Days`;
  if (annualEl) annualEl.textContent = formatCurrency(annual);
  if (monthlyEl) monthlyEl.textContent = formatCurrency(monthly);
  if (weeklyEl) weeklyEl.textContent = formatCurrency(weekly);
  if (dailyEl) dailyEl.textContent = formatCurrency(daily);
  if (dateRangeEl) {
    dateRangeEl.textContent = `Based on ${daysWorked} days from ${formatDate(effectiveStartDate)}`;
  }

  resultsDiv.classList.remove("hidden");
  emptyStateDiv.classList.add("hidden");
}

/**
 * Calculate monthly payment - uses WASM when available
 */
async function calculatePayment(): Promise<void> {
  const price = parseMoney(vehiclePriceInput.value);
  const down = parseMoney(downPaymentInput.value);
  const trade = parseMoney(tradeInInput.value);
  const taxRate = parseFloat(taxRateInput.value) || 0;
  const dealerFees = parseMoney(feesInput.value);
  const apr = parseFloat(aprInput.value) || 7.99;

  if (price <= 0) {
    paymentResultsDiv.classList.add("hidden");
    paymentEmptyStateDiv.classList.remove("hidden");
    return;
  }

  const taxableAmount = Math.max(0, price - trade);
  const taxAmount = taxableAmount * (taxRate / 100);
  const loanAmount = Math.max(0, price + taxAmount + dealerFees - trade - down);

  if (loanAmount <= 0) {
    paymentResultsDiv.classList.add("hidden");
    paymentEmptyStateDiv.classList.remove("hidden");
    return;
  }

  let monthlyPayment: number;

  const hasWasm = await tryLoadWasm();
  if (hasWasm && wasmModule) {
    try {
      monthlyPayment = wasmModule.calculateMonthlyPayment(loanAmount, apr, selectedTerm);
    } catch {
      monthlyPayment = calculateMonthlyPaymentJS(loanAmount, apr, selectedTerm);
    }
  } else {
    monthlyPayment = calculateMonthlyPaymentJS(loanAmount, apr, selectedTerm);
  }

  const totalInterest = monthlyPayment * selectedTerm - loanAmount;
  const totalCost = monthlyPayment * selectedTerm + down + trade;

  // Check affordability (12% PTI)
  const maxAffordable = calculatedResults ? calculatedResults.monthly * 0.12 : null;
  const isAffordable = maxAffordable ? monthlyPayment <= maxAffordable : true;

  updatePaymentUI(monthlyPayment, loanAmount, taxAmount, totalInterest, totalCost, maxAffordable, isAffordable);
  savePaymentState();
}

/**
 * JavaScript fallback for monthly payment
 */
function calculateMonthlyPaymentJS(principal: number, annualRate: number, termMonths: number): number {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)
  );
}

/**
 * Update payment UI
 */
function updatePaymentUI(
  monthlyPayment: number,
  loanAmount: number,
  taxAmount: number,
  totalInterest: number,
  totalCost: number,
  maxAffordable: number | null,
  isAffordable: boolean
): void {
  const monthlyEl = document.getElementById("monthlyPayment");
  const loanEl = document.getElementById("loanAmount");
  const taxEl = document.getElementById("taxAmount");
  const interestEl = document.getElementById("totalInterest");
  const totalEl = document.getElementById("totalCost");
  const affordabilityEl = document.getElementById("affordability");

  if (monthlyEl) {
    monthlyEl.innerHTML = `${formatCurrency(monthlyPayment)}<span class="hero-suffix">/mo</span>`;
  }
  if (loanEl) loanEl.textContent = formatCurrency(loanAmount);
  if (taxEl) taxEl.textContent = formatCurrency(taxAmount);
  if (interestEl) interestEl.textContent = formatCurrency(totalInterest);
  if (totalEl) totalEl.textContent = formatCurrency(totalCost);

  if (affordabilityEl) {
    if (maxAffordable !== null) {
      if (isAffordable) {
        affordabilityEl.textContent = `Within budget (max ${formatCurrency(maxAffordable)}/mo)`;
        affordabilityEl.className = "affordability good";
      } else {
        affordabilityEl.textContent = `Exceeds budget by ${formatCurrency(monthlyPayment - maxAffordable)}/mo`;
        affordabilityEl.className = "affordability bad";
      }
    } else {
      affordabilityEl.textContent = "Calculate income first for budget check";
      affordabilityEl.className = "affordability";
    }
  }

  // Style hero based on affordability
  const heroStat = paymentResultsDiv.querySelector(".hero-stat") as HTMLElement | null;
  const heroValue = document.getElementById("monthlyPayment");

  if (heroStat && heroValue) {
    if (maxAffordable !== null && !isAffordable) {
      heroStat.style.borderColor = "rgba(239, 68, 68, 0.5)";
      heroValue.style.color = "#ef4444";
      heroValue.style.textShadow = "0 0 20px rgba(239, 68, 68, 0.4)";
    } else {
      heroStat.style.borderColor = "rgba(33, 255, 30, 0.3)";
      heroValue.style.color = "#21ff1e";
      heroValue.style.textShadow = "0 0 20px rgba(33, 255, 30, 0.4)";
    }
  }

  paymentResultsDiv.classList.remove("hidden");
  paymentEmptyStateDiv.classList.add("hidden");
}

/**
 * Save income state
 */
function saveIncomeState(): void {
  const state: IncomeState = {
    startDate: startDateInput.value,
    checkDate: checkDateInput.value,
    ytdIncome: ytdIncomeInput.value,
  };
  chrome.storage.local.set({ [STORAGE_KEY]: state });
}

/**
 * Save payment state
 */
function savePaymentState(): void {
  const state: PaymentState = {
    vehiclePrice: vehiclePriceInput.value,
    downPayment: downPaymentInput.value,
    tradeIn: tradeInInput.value,
    taxRate: taxRateInput.value,
    fees: feesInput.value,
    apr: aprInput.value,
    term: selectedTerm,
  };
  chrome.storage.local.set({ [PAYMENT_STORAGE_KEY]: state });
}

/**
 * Load state from storage
 */
function loadState(): void {
  chrome.storage.local.get([STORAGE_KEY, PAYMENT_STORAGE_KEY], (result) => {
    // Load income state
    if (result[STORAGE_KEY]) {
      const state = result[STORAGE_KEY] as IncomeState;
      if (state.startDate) startDateInput.value = state.startDate;
      if (state.checkDate) checkDateInput.value = state.checkDate;
      if (state.ytdIncome) ytdIncomeInput.value = state.ytdIncome;
      calculateIncome();
    } else {
      checkDateInput.value = new Date().toISOString().split("T")[0];
    }

    // Load payment state
    if (result[PAYMENT_STORAGE_KEY]) {
      const state = result[PAYMENT_STORAGE_KEY] as PaymentState;
      if (state.vehiclePrice) vehiclePriceInput.value = state.vehiclePrice;
      if (state.downPayment) downPaymentInput.value = state.downPayment;
      if (state.tradeIn) tradeInInput.value = state.tradeIn;
      if (state.taxRate) taxRateInput.value = state.taxRate;
      if (state.fees) feesInput.value = state.fees;
      if (state.apr) aprInput.value = state.apr;
      if (state.term) {
        selectedTerm = state.term;
        termBtns.forEach((btn) => {
          btn.classList.toggle("active", parseInt(btn.dataset.term || "0") === selectedTerm);
        });
      }
      calculatePayment();
    } else {
      taxRateInput.value = "6.0";
      aprInput.value = "7.99";
    }
  });
}

/**
 * Reset all inputs
 */
function reset(): void {
  startDateInput.value = "";
  ytdIncomeInput.value = "";
  checkDateInput.value = new Date().toISOString().split("T")[0];

  vehiclePriceInput.value = "";
  downPaymentInput.value = "";
  tradeInInput.value = "";
  taxRateInput.value = "6.0";
  feesInput.value = "";
  aprInput.value = "7.99";
  selectedTerm = 60;

  termBtns.forEach((btn) => {
    btn.classList.toggle("active", parseInt(btn.dataset.term || "0") === 60);
  });

  calculatedResults = null;
  resultsDiv.classList.add("hidden");
  emptyStateDiv.classList.remove("hidden");
  paymentResultsDiv.classList.add("hidden");
  paymentEmptyStateDiv.classList.remove("hidden");

  chrome.storage.local.remove([STORAGE_KEY, PAYMENT_STORAGE_KEY]);
}

/**
 * Copy results to clipboard
 */
function copyResults(): void {
  if (!calculatedResults) return;

  const text = `Income Calculator Results:

Days Worked: ${calculatedResults.daysWorked} (from ${formatDate(calculatedResults.effectiveStartDate)})
Daily: ${formatCurrency(calculatedResults.daily)}
Weekly: ${formatCurrency(calculatedResults.weekly)}
Monthly: ${formatCurrency(calculatedResults.monthly)}
Annual: ${formatCurrency(calculatedResults.annual)}

Calculated via Income Calculator Pro`;

  navigator.clipboard.writeText(text).then(() => {
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Copied!
    `;
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
    }, 2000);
  });
}

// Event Listeners - Income
startDateInput.addEventListener("change", () => calculateIncome());
checkDateInput.addEventListener("change", () => calculateIncome());
ytdIncomeInput.addEventListener("input", () => {
  formatMoneyInput(ytdIncomeInput);
  calculateIncome();
});

// Event Listeners - Payment
vehiclePriceInput.addEventListener("input", () => {
  formatMoneyInput(vehiclePriceInput);
  calculatePayment();
});
downPaymentInput.addEventListener("input", () => {
  formatMoneyInput(downPaymentInput);
  calculatePayment();
});
tradeInInput.addEventListener("input", () => {
  formatMoneyInput(tradeInInput);
  calculatePayment();
});
feesInput.addEventListener("input", () => {
  formatMoneyInput(feesInput);
  calculatePayment();
});
taxRateInput.addEventListener("input", () => calculatePayment());
aprInput.addEventListener("input", () => calculatePayment());

termBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    termBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTerm = parseInt(btn.dataset.term || "60");
    calculatePayment();
  });
});

// Button listeners
resetBtn.addEventListener("click", reset);
copyBtn.addEventListener("click", copyResults);

// Initialize
loadState();

// Pre-load WASM in background
tryLoadWasm();
