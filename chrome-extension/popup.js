// Storage keys
const STORAGE_KEY = 'income-calc-state';
const PAYMENT_STORAGE_KEY = 'payment-calc-state';

// DOM Elements - Income Calculator
const startDateInput = document.getElementById('startDate');
const ytdIncomeInput = document.getElementById('ytdIncome');
const checkDateInput = document.getElementById('checkDate');
const resultsDiv = document.getElementById('results');
const emptyStateDiv = document.getElementById('emptyState');
const resetBtn = document.getElementById('resetBtn');
const copyBtn = document.getElementById('copyBtn');

// DOM Elements - Payment Calculator
const vehiclePriceInput = document.getElementById('vehiclePrice');
const downPaymentInput = document.getElementById('downPayment');
const tradeInInput = document.getElementById('tradeIn');
const taxRateInput = document.getElementById('taxRate');
const feesInput = document.getElementById('fees');
const aprInput = document.getElementById('apr');
const termBtns = document.querySelectorAll('.term-btn');
const paymentResultsDiv = document.getElementById('paymentResults');
const paymentEmptyStateDiv = document.getElementById('paymentEmptyState');

// State
let selectedTerm = 60;
let calculatedResults = null;

// Tab switching
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
  });
});

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date for display (e.g., "Jan 15, 2025")
function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date);
}

// Parse MMDDYYYY string to Date object
function parseDateString(str) {
  if (!str) return null;

  // Remove any non-numeric characters
  const cleaned = str.replace(/\D/g, '');

  if (cleaned.length !== 8) return null;

  const month = parseInt(cleaned.substring(0, 2), 10);
  const day = parseInt(cleaned.substring(2, 4), 10);
  const year = parseInt(cleaned.substring(4, 8), 10);

  // Validate ranges
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > 2100) return null;

  // Create date (month is 0-indexed)
  const date = new Date(year, month - 1, day);

  // Verify the date is valid (handles invalid days like Feb 30)
  if (date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

// Format Date object to MMDDYYYY string
function dateToString(date) {
  if (!date) return '';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${month}${day}${year}`;
}

// Format date input as user types (just keep digits)
function formatDateInput(input) {
  const cursorPos = input.selectionStart;
  const oldLength = input.value.length;

  // Keep only digits
  let value = input.value.replace(/\D/g, '');

  // Limit to 8 digits
  if (value.length > 8) {
    value = value.substring(0, 8);
  }

  input.value = value;

  // Restore cursor position
  const newLength = input.value.length;
  const newPos = cursorPos - (oldLength - newLength);
  input.setSelectionRange(newPos, newPos);
}

// Parse money input
function parseMoney(value) {
  return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
}

// Format money input
function formatMoneyInput(input) {
  let value = input.value.replace(/[^0-9.]/g, '');
  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }
  if (parts[1] && parts[1].length > 2) {
    value = parts[0] + '.' + parts[1].slice(0, 2);
  }
  input.value = value;
}

// Calculate income
function calculateIncome() {
  const startDate = parseDateString(startDateInput.value);
  const checkDate = parseDateString(checkDateInput.value);
  const ytdIncome = parseMoney(ytdIncomeInput.value);

  if (!startDate || !checkDate || !ytdIncome) {
    resultsDiv.classList.add('hidden');
    emptyStateDiv.classList.remove('hidden');
    calculatedResults = null;
    return;
  }

  if (checkDate < startDate) {
    resultsDiv.classList.add('hidden');
    emptyStateDiv.classList.remove('hidden');
    calculatedResults = null;
    return;
  }

  // Get start of check date's year
  const checkYearStart = new Date(checkDate.getFullYear(), 0, 1);
  const effectiveStartDate = startDate < checkYearStart ? checkYearStart : startDate;

  // Calculate days worked
  const diffTime = checkDate.getTime() - effectiveStartDate.getTime();
  const daysWorked = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (daysWorked <= 0) {
    resultsDiv.classList.add('hidden');
    emptyStateDiv.classList.remove('hidden');
    calculatedResults = null;
    return;
  }

  // Calculate projections
  const daily = ytdIncome / daysWorked;
  const weekly = daily * 7;
  const monthly = (daily * 365) / 12;
  const annual = daily * 365;

  calculatedResults = { daysWorked, daily, weekly, monthly, annual, effectiveStartDate };

  // Update UI
  document.getElementById('daysWorked').textContent = `${daysWorked} Days`;
  document.getElementById('annualIncome').textContent = formatCurrency(annual);
  document.getElementById('monthlyIncome').textContent = formatCurrency(monthly);
  document.getElementById('weeklyIncome').textContent = formatCurrency(weekly);
  document.getElementById('dailyIncome').textContent = formatCurrency(daily);
  document.getElementById('dateRange').textContent =
    `Based on ${daysWorked} days from ${formatDate(effectiveStartDate)}`;

  resultsDiv.classList.remove('hidden');
  emptyStateDiv.classList.add('hidden');

  // Save state
  saveIncomeState();

  // Update payment calculator affordability
  calculatePayment();
}

// Calculate monthly payment
function calculateMonthlyPayment(principal, annualRate, termMonths) {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;

  const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  return payment;
}

// Calculate payment
function calculatePayment() {
  const price = parseMoney(vehiclePriceInput.value);
  const down = parseMoney(downPaymentInput.value);
  const trade = parseMoney(tradeInInput.value);
  const taxRate = parseFloat(taxRateInput.value) || 0;
  const dealerFees = parseMoney(feesInput.value);
  const apr = parseFloat(aprInput.value) || 7.99;

  if (price <= 0) {
    paymentResultsDiv.classList.add('hidden');
    paymentEmptyStateDiv.classList.remove('hidden');
    return;
  }

  // Calculate amounts
  const taxableAmount = Math.max(0, price - trade);
  const taxAmount = taxableAmount * (taxRate / 100);
  const loanAmount = Math.max(0, price + taxAmount + dealerFees - trade - down);

  if (loanAmount <= 0) {
    paymentResultsDiv.classList.add('hidden');
    paymentEmptyStateDiv.classList.remove('hidden');
    return;
  }

  const monthlyPayment = calculateMonthlyPayment(loanAmount, apr, selectedTerm);
  const totalInterest = monthlyPayment * selectedTerm - loanAmount;
  const totalCost = monthlyPayment * selectedTerm + down + trade;

  // Check affordability (12% PTI)
  const maxAffordable = calculatedResults ? calculatedResults.monthly * 0.12 : null;
  const isAffordable = maxAffordable ? monthlyPayment <= maxAffordable : true;

  // Update UI
  document.getElementById('monthlyPayment').innerHTML =
    `${formatCurrency(monthlyPayment)}<span class="hero-suffix">/mo</span>`;
  document.getElementById('loanAmount').textContent = formatCurrency(loanAmount);
  document.getElementById('taxAmount').textContent = formatCurrency(taxAmount);
  document.getElementById('totalInterest').textContent = formatCurrency(totalInterest);
  document.getElementById('totalCost').textContent = formatCurrency(totalCost);

  // Update affordability indicator
  const affordabilityEl = document.getElementById('affordability');
  if (maxAffordable) {
    if (isAffordable) {
      affordabilityEl.textContent = `Within budget (max ${formatCurrency(maxAffordable)}/mo)`;
      affordabilityEl.className = 'affordability good';
    } else {
      affordabilityEl.textContent = `Exceeds budget by ${formatCurrency(monthlyPayment - maxAffordable)}/mo`;
      affordabilityEl.className = 'affordability bad';
    }
  } else {
    affordabilityEl.textContent = 'Calculate income first for budget check';
    affordabilityEl.className = 'affordability';
  }

  // Style hero based on affordability
  const heroStat = paymentResultsDiv.querySelector('.hero-stat');
  const heroValue = document.getElementById('monthlyPayment');
  if (maxAffordable && !isAffordable) {
    heroStat.style.borderColor = 'rgba(239, 68, 68, 0.5)';
    heroValue.style.color = '#ef4444';
    heroValue.style.textShadow = '0 0 20px rgba(239, 68, 68, 0.4)';
  } else {
    heroStat.style.borderColor = 'rgba(33, 255, 30, 0.3)';
    heroValue.style.color = '#21ff1e';
    heroValue.style.textShadow = '0 0 20px rgba(33, 255, 30, 0.4)';
  }

  paymentResultsDiv.classList.remove('hidden');
  paymentEmptyStateDiv.classList.add('hidden');

  // Save state
  savePaymentState();
}

// Save income state
function saveIncomeState() {
  const state = {
    startDate: startDateInput.value,
    checkDate: checkDateInput.value,
    ytdIncome: ytdIncomeInput.value
  };
  chrome.storage.local.set({ [STORAGE_KEY]: state });
}

// Save payment state
function savePaymentState() {
  const state = {
    vehiclePrice: vehiclePriceInput.value,
    downPayment: downPaymentInput.value,
    tradeIn: tradeInInput.value,
    taxRate: taxRateInput.value,
    fees: feesInput.value,
    apr: aprInput.value,
    term: selectedTerm
  };
  chrome.storage.local.set({ [PAYMENT_STORAGE_KEY]: state });
}

// Load state
function loadState() {
  chrome.storage.local.get([STORAGE_KEY, PAYMENT_STORAGE_KEY], (result) => {
    // Load income state
    if (result[STORAGE_KEY]) {
      const state = result[STORAGE_KEY];
      if (state.startDate) startDateInput.value = state.startDate;
      if (state.checkDate) checkDateInput.value = state.checkDate;
      if (state.ytdIncome) ytdIncomeInput.value = state.ytdIncome;
      calculateIncome();
    } else {
      // Set default check date to today
      checkDateInput.value = dateToString(new Date());
    }

    // Load payment state
    if (result[PAYMENT_STORAGE_KEY]) {
      const state = result[PAYMENT_STORAGE_KEY];
      if (state.vehiclePrice) vehiclePriceInput.value = state.vehiclePrice;
      if (state.downPayment) downPaymentInput.value = state.downPayment;
      if (state.tradeIn) tradeInInput.value = state.tradeIn;
      if (state.taxRate) taxRateInput.value = state.taxRate;
      if (state.fees) feesInput.value = state.fees;
      if (state.apr) aprInput.value = state.apr;
      if (state.term) {
        selectedTerm = state.term;
        termBtns.forEach(btn => {
          btn.classList.toggle('active', parseInt(btn.dataset.term) === selectedTerm);
        });
      }
      calculatePayment();
    } else {
      // Set defaults
      taxRateInput.value = '6.0';
      aprInput.value = '7.99';
    }
  });
}

// Reset
function reset() {
  startDateInput.value = '';
  ytdIncomeInput.value = '';
  checkDateInput.value = dateToString(new Date());

  vehiclePriceInput.value = '';
  downPaymentInput.value = '';
  tradeInInput.value = '';
  taxRateInput.value = '6.0';
  feesInput.value = '';
  aprInput.value = '7.99';
  selectedTerm = 60;

  termBtns.forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.term) === 60);
  });

  calculatedResults = null;
  resultsDiv.classList.add('hidden');
  emptyStateDiv.classList.remove('hidden');
  paymentResultsDiv.classList.add('hidden');
  paymentEmptyStateDiv.classList.remove('hidden');

  chrome.storage.local.remove([STORAGE_KEY, PAYMENT_STORAGE_KEY]);
}

// Copy results
function copyResults() {
  if (!calculatedResults) return;

  const text = `Income Calculator Results:

Days Worked: ${calculatedResults.daysWorked} (from ${formatDate(calculatedResults.effectiveStartDate)})
Daily: ${formatCurrency(calculatedResults.daily)}
Weekly: ${formatCurrency(calculatedResults.weekly)}
Monthly: ${formatCurrency(calculatedResults.monthly)}
Annual: ${formatCurrency(calculatedResults.annual)}

Calculated via Autolytiq Income Calculator`;

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

// Event Listeners - Income (date inputs)
startDateInput.addEventListener('input', () => {
  formatDateInput(startDateInput);
  calculateIncome();
});

checkDateInput.addEventListener('input', () => {
  formatDateInput(checkDateInput);
  calculateIncome();
});

ytdIncomeInput.addEventListener('input', () => {
  formatMoneyInput(ytdIncomeInput);
  calculateIncome();
});

// Event Listeners - Payment
vehiclePriceInput.addEventListener('input', () => {
  formatMoneyInput(vehiclePriceInput);
  calculatePayment();
});
downPaymentInput.addEventListener('input', () => {
  formatMoneyInput(downPaymentInput);
  calculatePayment();
});
tradeInInput.addEventListener('input', () => {
  formatMoneyInput(tradeInInput);
  calculatePayment();
});
feesInput.addEventListener('input', () => {
  formatMoneyInput(feesInput);
  calculatePayment();
});
taxRateInput.addEventListener('input', calculatePayment);
aprInput.addEventListener('input', calculatePayment);

termBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    termBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedTerm = parseInt(btn.dataset.term);
    calculatePayment();
  });
});

// Button listeners
resetBtn.addEventListener('click', reset);
copyBtn.addEventListener('click', copyResults);

// Initialize
loadState();
