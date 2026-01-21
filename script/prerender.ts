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
  { path: "/", priority: "critical" },
  { path: "/calculator", priority: "critical" },
  { path: "/auto", priority: "critical" },
  { path: "/smart-money", priority: "critical" },
  { path: "/housing", priority: "critical" },
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
