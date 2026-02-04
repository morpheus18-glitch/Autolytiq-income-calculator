/**
 * Prerender script for Resolution Layer pages.
 *
 * Runs after `vite build`. Generates static HTML for each
 * /resolve/auto-payment/{slug} route so crawlers see real content
 * instead of the generic SPA shell.
 *
 * Usage: npx tsx scripts/prerender-resolve.ts
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- Vehicle data (duplicated from client for server-side access) ----

interface Vehicle {
  year: number;
  make: string;
  model: string;
  bodyType: string;
  priceRangeLow: number;
  priceRangeHigh: number;
  slug: string;
}

interface CreditTier {
  id: string;
  label: string;
  scoreRange: string;
  typicalRate: number;
}

const CREDIT_TIERS: CreditTier[] = [
  { id: "excellent", label: "Excellent", scoreRange: "750+", typicalRate: 0.059 },
  { id: "good", label: "Good", scoreRange: "700-749", typicalRate: 0.079 },
  { id: "fair", label: "Fair", scoreRange: "650-699", typicalRate: 0.119 },
  { id: "poor", label: "Needs Work", scoreRange: "550-649", typicalRate: 0.169 },
  { id: "rebuilding", label: "Rebuilding", scoreRange: "Below 550", typicalRate: 0.219 },
];

const VEHICLES: Vehicle[] = [
  { year: 2024, make: "Ford", model: "F-150", bodyType: "truck", priceRangeLow: 35000, priceRangeHigh: 75000, slug: "2024-ford-f150" },
  { year: 2023, make: "Ford", model: "F-150", bodyType: "truck", priceRangeLow: 32000, priceRangeHigh: 65000, slug: "2023-ford-f150" },
  { year: 2022, make: "Ford", model: "F-150", bodyType: "truck", priceRangeLow: 28000, priceRangeHigh: 55000, slug: "2022-ford-f150" },
  { year: 2024, make: "Chevrolet", model: "Silverado 1500", bodyType: "truck", priceRangeLow: 36000, priceRangeHigh: 72000, slug: "2024-chevrolet-silverado-1500" },
  { year: 2023, make: "Chevrolet", model: "Silverado 1500", bodyType: "truck", priceRangeLow: 33000, priceRangeHigh: 62000, slug: "2023-chevrolet-silverado-1500" },
  { year: 2024, make: "RAM", model: "1500", bodyType: "truck", priceRangeLow: 38000, priceRangeHigh: 78000, slug: "2024-ram-1500" },
  { year: 2024, make: "Toyota", model: "Tacoma", bodyType: "truck", priceRangeLow: 31000, priceRangeHigh: 52000, slug: "2024-toyota-tacoma" },
  { year: 2024, make: "Toyota", model: "Camry", bodyType: "sedan", priceRangeLow: 28000, priceRangeHigh: 38000, slug: "2024-toyota-camry" },
  { year: 2023, make: "Toyota", model: "Camry", bodyType: "sedan", priceRangeLow: 24000, priceRangeHigh: 34000, slug: "2023-toyota-camry" },
  { year: 2024, make: "Honda", model: "Accord", bodyType: "sedan", priceRangeLow: 28000, priceRangeHigh: 40000, slug: "2024-honda-accord" },
  { year: 2023, make: "Honda", model: "Accord", bodyType: "sedan", priceRangeLow: 25000, priceRangeHigh: 36000, slug: "2023-honda-accord" },
  { year: 2024, make: "Honda", model: "Civic", bodyType: "sedan", priceRangeLow: 24000, priceRangeHigh: 32000, slug: "2024-honda-civic" },
  { year: 2024, make: "Toyota", model: "Corolla", bodyType: "sedan", priceRangeLow: 22000, priceRangeHigh: 28000, slug: "2024-toyota-corolla" },
  { year: 2024, make: "Hyundai", model: "Sonata", bodyType: "sedan", priceRangeLow: 27000, priceRangeHigh: 36000, slug: "2024-hyundai-sonata" },
  { year: 2024, make: "Toyota", model: "RAV4", bodyType: "suv", priceRangeLow: 30000, priceRangeHigh: 42000, slug: "2024-toyota-rav4" },
  { year: 2023, make: "Toyota", model: "RAV4", bodyType: "suv", priceRangeLow: 27000, priceRangeHigh: 38000, slug: "2023-toyota-rav4" },
  { year: 2024, make: "Honda", model: "CR-V", bodyType: "suv", priceRangeLow: 30000, priceRangeHigh: 42000, slug: "2024-honda-crv" },
  { year: 2024, make: "Toyota", model: "Highlander", bodyType: "suv", priceRangeLow: 40000, priceRangeHigh: 55000, slug: "2024-toyota-highlander" },
  { year: 2024, make: "Jeep", model: "Grand Cherokee", bodyType: "suv", priceRangeLow: 42000, priceRangeHigh: 72000, slug: "2024-jeep-grand-cherokee" },
  { year: 2024, make: "Chevrolet", model: "Equinox", bodyType: "suv", priceRangeLow: 28000, priceRangeHigh: 38000, slug: "2024-chevrolet-equinox" },
  { year: 2024, make: "Ford", model: "Explorer", bodyType: "suv", priceRangeLow: 38000, priceRangeHigh: 60000, slug: "2024-ford-explorer" },
  { year: 2024, make: "Mazda", model: "CX-5", bodyType: "suv", priceRangeLow: 29000, priceRangeHigh: 40000, slug: "2024-mazda-cx5" },
  { year: 2024, make: "Tesla", model: "Model 3", bodyType: "sedan", priceRangeLow: 40000, priceRangeHigh: 55000, slug: "2024-tesla-model-3" },
  { year: 2023, make: "Tesla", model: "Model 3", bodyType: "sedan", priceRangeLow: 35000, priceRangeHigh: 50000, slug: "2023-tesla-model-3" },
  { year: 2024, make: "Tesla", model: "Model Y", bodyType: "suv", priceRangeLow: 45000, priceRangeHigh: 60000, slug: "2024-tesla-model-y" },
  { year: 2023, make: "Tesla", model: "Model Y", bodyType: "suv", priceRangeLow: 40000, priceRangeHigh: 55000, slug: "2023-tesla-model-y" },
  { year: 2021, make: "Tesla", model: "Model Y", bodyType: "suv", priceRangeLow: 32000, priceRangeHigh: 45000, slug: "2021-tesla-model-y" },
  { year: 2024, make: "BMW", model: "3 Series", bodyType: "sedan", priceRangeLow: 45000, priceRangeHigh: 58000, slug: "2024-bmw-3-series" },
  { year: 2024, make: "Mercedes-Benz", model: "C-Class", bodyType: "sedan", priceRangeLow: 47000, priceRangeHigh: 60000, slug: "2024-mercedes-benz-c-class" },
  { year: 2024, make: "Lexus", model: "RX", bodyType: "suv", priceRangeLow: 50000, priceRangeHigh: 65000, slug: "2024-lexus-rx" },
];

// ---- Calculation logic (deterministic) ----

function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (annualRate <= 0) return principal / termMonths;
  const monthlyRate = annualRate / 12;
  return Math.round(
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

// ---- HTML generation ----

function generateResolveHTML(vehicle: Vehicle, baseHTML: string): string {
  const name = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const midPrice = Math.round((vehicle.priceRangeLow + vehicle.priceRangeHigh) / 2);
  const downPayment = Math.round(midPrice * 0.1);
  const loanAmount = midPrice - downPayment;
  const canonicalUrl = `https://autolytiqs.com/resolve/auto-payment/${vehicle.slug}`;

  // Calculate example payment at "Good" credit tier, 60 months
  const goodTier = CREDIT_TIERS[1];
  const monthlyPayment = calculateMonthlyPayment(loanAmount, goodTier.typicalRate, 60);
  const totalCost = monthlyPayment * 60 + downPayment;
  const totalInterest = totalCost - midPrice;

  // Verdict thresholds explanation
  const verdictExplanation =
    "Verdict is rule-based and deterministic. Payment under 8% of gross monthly income = Comfortable. " +
    "8-12% = Tight. Over 12% = Risky. Total debt-to-income is also factored: under 36% = Comfortable, " +
    "36-43% = Tight, over 43% = Risky.";

  const title = `${name} Payment Resolution | Can I Afford This?`;
  const description = `Resolve your ${name} payment decision. Price range ${formatCurrency(vehicle.priceRangeLow)}-${formatCurrency(vehicle.priceRangeHigh)}. Estimated payment from ${formatCurrency(monthlyPayment)}/mo at ${(goodTier.typicalRate * 100).toFixed(1)}% APR. Deterministic comfort verdict.`;

  // JSON-LD structured data
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": `${name} Payment Resolution`,
        "url": canonicalUrl,
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "Any",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `How is the ${name} monthly payment calculated?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Monthly payment uses standard amortization: P = L[c(1+c)^n]/[(1+c)^n-1]. For a ${formatCurrency(midPrice)} ${name} with ${formatCurrency(downPayment)} down at ${(goodTier.typicalRate * 100).toFixed(1)}% APR for 60 months, the payment is ${formatCurrency(monthlyPayment)}/month. Total interest: ${formatCurrency(totalInterest)}.`,
            },
          },
          {
            "@type": "Question",
            "name": "How is the comfort verdict determined?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": verdictExplanation,
            },
          },
          {
            "@type": "Question",
            "name": `How much income do I need for a ${name}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `For a comfortable payment of ${formatCurrency(monthlyPayment)}/month, you'd ideally earn at least ${formatCurrency(Math.round(monthlyPayment / 0.08))}/month gross (payment under 8% of income). At minimum, ${formatCurrency(Math.round(monthlyPayment / 0.12))}/month keeps you under the 12% threshold.`,
            },
          },
        ],
      },
    ],
  });

  // Static HTML content for crawlers (noscript + visible-to-crawlers content)
  const staticContent = `
    <div id="resolve-static" data-vehicle="${vehicle.slug}">
      <h1>${name} — Payment Resolution</h1>
      <p>Price range: ${formatCurrency(vehicle.priceRangeLow)} – ${formatCurrency(vehicle.priceRangeHigh)}</p>

      <h2>Example Calculation</h2>
      <table>
        <tr><td>Vehicle Price</td><td>${formatCurrency(midPrice)}</td></tr>
        <tr><td>Down Payment (10%)</td><td>${formatCurrency(downPayment)}</td></tr>
        <tr><td>Loan Amount</td><td>${formatCurrency(loanAmount)}</td></tr>
        <tr><td>APR (Good Credit)</td><td>${(goodTier.typicalRate * 100).toFixed(1)}%</td></tr>
        <tr><td>Term</td><td>60 months</td></tr>
        <tr><td>Monthly Payment</td><td>${formatCurrency(monthlyPayment)}</td></tr>
        <tr><td>Total Interest</td><td>${formatCurrency(totalInterest)}</td></tr>
        <tr><td>Total Cost</td><td>${formatCurrency(totalCost)}</td></tr>
      </table>

      <h2>Comfort Verdict Rules</h2>
      <p>${verdictExplanation}</p>

      <h2>Credit Tiers</h2>
      <ul>
${CREDIT_TIERS.map((t) => {
  const pmt = calculateMonthlyPayment(loanAmount, t.typicalRate, 60);
  return `        <li>${t.label} (${t.scoreRange}): ${(t.typicalRate * 100).toFixed(1)}% APR — ${formatCurrency(pmt)}/mo</li>`;
}).join("\n")}
      </ul>

      <p>Enter your income and existing debt to receive a deterministic comfort verdict: Comfortable, Tight, or Risky.</p>
    </div>`;

  // Build the modified HTML
  let html = baseHTML;

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(title)}</title>`
  );

  // Replace meta title
  html = html.replace(
    /<meta name="title" content="[^"]*" \/>/,
    `<meta name="title" content="${escapeAttr(title)}" />`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escapeAttr(description)}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escapeAttr(title)}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escapeAttr(description)}" />`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta name="twitter:url" content="[^"]*" \/>/,
    `<meta name="twitter:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`
  );

  // Replace all existing JSON-LD blocks with vehicle-specific one
  html = html.replace(
    /<!-- Structured Data - Organization -->[\s\S]*?<!-- Structured Data - BreadcrumbList -->[\s\S]*?<\/script>/,
    `<!-- Structured Data - Resolution Layer -->\n    <script type="application/ld+json">\n    ${structuredData}\n    </script>`
  );

  // Replace noscript with resolve-specific styling
  html = html.replace(
    /<noscript>[\s\S]*?<\/noscript>/,
    `<noscript>\n      <style>#resolve-static-content { font-family: sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; } #resolve-static-content table { border-collapse: collapse; width: 100%; margin: 16px 0; } #resolve-static-content td { padding: 8px; border-bottom: 1px solid #eee; } #resolve-static-content td:last-child { text-align: right; font-weight: 600; }</style>\n    </noscript>`
  );

  // Insert static content BEFORE <div id="root">
  // Crawlers (no JS) see this content. JS browsers remove it immediately.
  html = html.replace(
    '    <div id="root"></div>',
    `    <div id="resolve-static-content">${staticContent}</div>\n    <script>document.getElementById("resolve-static-content").remove();</script>\n    <div id="root"></div>`
  );

  return html;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---- Main ----

function main() {
  const distDir = path.resolve(__dirname, "../dist/public");
  const baseHTMLPath = path.join(distDir, "index.html");

  if (!fs.existsSync(baseHTMLPath)) {
    console.error("Error: dist/public/index.html not found. Run vite build first.");
    process.exit(1);
  }

  const baseHTML = fs.readFileSync(baseHTMLPath, "utf-8");
  let count = 0;

  for (const vehicle of VEHICLES) {
    const outDir = path.join(distDir, "resolve", "auto-payment", vehicle.slug);
    fs.mkdirSync(outDir, { recursive: true });

    const html = generateResolveHTML(vehicle, baseHTML);
    fs.writeFileSync(path.join(outDir, "index.html"), html);
    count++;
  }

  console.log(`Prerendered ${count} resolve pages.`);
}

main();
