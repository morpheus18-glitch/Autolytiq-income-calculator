import puppeteer from "puppeteer";
import { createServer } from "http";
import express from "express";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SEO priority routes to prerender
const SEO_ROUTES = [
  // Critical pages
  { path: "/", priority: "critical" },
  { path: "/calculator", priority: "critical" },
  { path: "/auto", priority: "critical" },
  { path: "/smart-money", priority: "critical" },
  { path: "/housing", priority: "critical" },

  // Programmatic SEO - Affordability pages (high traffic potential)
  { path: "/afford", priority: "high" },
  { path: "/afford/30k", priority: "high" },
  { path: "/afford/35k", priority: "high" },
  { path: "/afford/40k", priority: "high" },
  { path: "/afford/45k", priority: "high" },
  { path: "/afford/50k", priority: "critical" },
  { path: "/afford/55k", priority: "high" },
  { path: "/afford/60k", priority: "high" },
  { path: "/afford/65k", priority: "high" },
  { path: "/afford/70k", priority: "high" },
  { path: "/afford/75k", priority: "critical" },
  { path: "/afford/80k", priority: "high" },
  { path: "/afford/85k", priority: "high" },
  { path: "/afford/90k", priority: "high" },
  { path: "/afford/95k", priority: "high" },
  { path: "/afford/100k", priority: "critical" },
  { path: "/afford/110k", priority: "high" },
  { path: "/afford/120k", priority: "high" },
  { path: "/afford/150k", priority: "high" },
  { path: "/afford/175k", priority: "medium" },
  { path: "/afford/200k", priority: "medium" },

  // Best-of comparison pages
  { path: "/best", priority: "high" },
  { path: "/best/budgeting-apps", priority: "high" },
  { path: "/best/credit-monitoring", priority: "high" },
  { path: "/best/high-yield-savings", priority: "high" },
  { path: "/best/auto-loans", priority: "high" },
  { path: "/best/personal-loans", priority: "high" },
  { path: "/best/investment-apps", priority: "high" },

  // VS comparison pages
  { path: "/compare", priority: "high" },
  { path: "/compare/ynab-vs-mint", priority: "high" },
  { path: "/compare/credit-karma-vs-experian", priority: "high" },
  { path: "/compare/sofi-vs-marcus", priority: "high" },
  { path: "/compare/robinhood-vs-acorns", priority: "high" },

  // Salary pages (top jobs)
  { path: "/salary", priority: "high" },
  { path: "/salary/software-engineer", priority: "critical" },
  { path: "/salary/registered-nurse", priority: "high" },
  { path: "/salary/teacher", priority: "high" },
  { path: "/salary/accountant", priority: "high" },
  { path: "/salary/marketing-manager", priority: "high" },
  { path: "/salary/data-scientist", priority: "high" },
  { path: "/salary/project-manager", priority: "high" },
  { path: "/salary/mechanical-engineer", priority: "high" },
  { path: "/salary/electrician", priority: "high" },
  { path: "/salary/pharmacist", priority: "high" },
  { path: "/salary/web-developer", priority: "high" },
  { path: "/salary/nurse-practitioner", priority: "high" },
  { path: "/salary/physical-therapist", priority: "medium" },
  { path: "/salary/graphic-designer", priority: "medium" },
  { path: "/salary/financial-analyst", priority: "medium" },
  { path: "/salary/human-resources-manager", priority: "medium" },
  { path: "/salary/plumber", priority: "medium" },
  { path: "/salary/paralegal", priority: "medium" },
  { path: "/salary/dental-hygienist", priority: "medium" },
  { path: "/salary/real-estate-agent", priority: "medium" },

  // Quiz and viral pages
  { path: "/quiz/financial-health", priority: "high" },

  // Calculator variant pages (programmatic SEO)
  { path: "/income-calculator", priority: "high" },
  { path: "/income-calculator/hourly", priority: "critical" },
  { path: "/income-calculator/salary-to-hourly", priority: "critical" },
  { path: "/income-calculator/1099", priority: "critical" },
  { path: "/income-calculator/overtime", priority: "high" },
  { path: "/income-calculator/quarterly", priority: "high" },
  { path: "/income-calculator/biweekly", priority: "high" },
  { path: "/income-calculator/take-home", priority: "critical" },
  { path: "/income-calculator/gross-to-net", priority: "high" },

  // State calculator pages (top states by search volume)
  { path: "/income-calculator/state", priority: "high" },
  { path: "/income-calculator/california", priority: "critical" },
  { path: "/income-calculator/texas", priority: "critical" },
  { path: "/income-calculator/florida", priority: "critical" },
  { path: "/income-calculator/new-york", priority: "critical" },
  { path: "/income-calculator/illinois", priority: "high" },
  { path: "/income-calculator/pennsylvania", priority: "high" },
  { path: "/income-calculator/ohio", priority: "high" },
  { path: "/income-calculator/georgia", priority: "high" },
  { path: "/income-calculator/north-carolina", priority: "high" },
  { path: "/income-calculator/michigan", priority: "high" },
  { path: "/income-calculator/new-jersey", priority: "high" },
  { path: "/income-calculator/virginia", priority: "high" },
  { path: "/income-calculator/washington", priority: "high" },
  { path: "/income-calculator/arizona", priority: "high" },
  { path: "/income-calculator/massachusetts", priority: "high" },
  { path: "/income-calculator/tennessee", priority: "high" },
  { path: "/income-calculator/colorado", priority: "high" },
  { path: "/income-calculator/maryland", priority: "high" },
  { path: "/income-calculator/minnesota", priority: "medium" },
  { path: "/income-calculator/nevada", priority: "medium" },

  // Blog pages
  { path: "/blog", priority: "high" },
  { path: "/blog/how-to-calculate-annual-income", priority: "high" },
  { path: "/blog/salary-negotiation-tips", priority: "high" },
  { path: "/blog/maximize-your-401k", priority: "high" },
  { path: "/blog/understanding-your-paystub", priority: "high" },
  { path: "/blog/side-hustle-income-ideas", priority: "high" },
  { path: "/blog/tax-deductions-you-might-be-missing", priority: "high" },
  { path: "/blog/how-much-car-can-i-afford", priority: "high" },
  { path: "/blog/first-paycheck-budget", priority: "high" },
  { path: "/blog/50-30-20-budget-rule", priority: "high" },

  // Legal pages
  { path: "/privacy", priority: "low" },
  { path: "/terms", priority: "low" },
];

const DIST_PATH = path.resolve(__dirname, "../dist/public");
const PORT = 4173;

async function startServer(): Promise<ReturnType<typeof createServer>> {
  const app = express();

  // Serve static files
  app.use(express.static(DIST_PATH));

  // SPA fallback
  app.use("*", (req, res) => {
    res.sendFile(path.join(DIST_PATH, "index.html"));
  });

  return new Promise((resolve) => {
    const server = createServer(app);
    server.listen(PORT, () => {
      console.log(`Prerender server started on port ${PORT}`);
      resolve(server);
    });
  });
}

async function prerenderRoute(
  browser: puppeteer.Browser,
  route: string
): Promise<string> {
  const page = await browser.newPage();

  // Set a realistic viewport
  await page.setViewport({ width: 1280, height: 800 });

  // Navigate and wait for network idle
  await page.goto(`http://localhost:${PORT}${route}`, {
    waitUntil: "networkidle0",
    timeout: 30000,
  });

  // Wait for React to fully render
  await page.waitForSelector("#root > *", { timeout: 10000 });

  // Additional wait for any async meta tag updates
  await new Promise((r) => setTimeout(r, 500));

  // Get the full HTML
  const html = await page.content();

  await page.close();

  return html;
}

function cleanHtml(html: string): string {
  // Remove the Vite dev script if present (shouldn't be in prod, but just in case)
  let cleaned = html.replace(/<script type="module" src="\/@vite\/client"><\/script>/g, "");

  // Add prerender marker for debugging
  cleaned = cleaned.replace(
    "</head>",
    '  <meta name="prerender-status" content="prerendered">\n  </head>'
  );

  return cleaned;
}

async function savePrerenderedHtml(route: string, html: string): Promise<void> {
  // Determine the file path
  let filePath: string;

  if (route === "/") {
    filePath = path.join(DIST_PATH, "index.html");
  } else {
    // Create directory structure if needed
    const dir = path.join(DIST_PATH, route);
    await fs.mkdir(dir, { recursive: true });
    filePath = path.join(dir, "index.html");
  }

  await fs.writeFile(filePath, cleanHtml(html), "utf-8");
  console.log(`  ✓ Saved: ${route}`);
}

async function prerender() {
  console.log("\n🚀 Starting prerender process...\n");

  // Check if dist exists
  try {
    await fs.access(DIST_PATH);
  } catch {
    console.error("❌ dist/public not found. Run vite build first.");
    process.exit(1);
  }

  // Start local server
  const server = await startServer();

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  console.log(`📄 Prerendering ${SEO_ROUTES.length} routes...\n`);

  try {
    for (const route of SEO_ROUTES) {
      console.log(`  Rendering: ${route.path} (${route.priority})`);
      const html = await prerenderRoute(browser, route.path);
      await savePrerenderedHtml(route.path, html);
    }

    console.log("\n✅ Prerendering complete!\n");
  } catch (error) {
    console.error("\n❌ Prerender error:", error);
    throw error;
  } finally {
    await browser.close();
    server.close();
  }
}

prerender().catch((err) => {
  console.error(err);
  process.exit(1);
});
