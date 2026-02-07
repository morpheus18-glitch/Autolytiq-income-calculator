import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";

/**
 * Inject CSP nonce into all inline <script> tags in HTML
 */
function injectNonce(html: string, nonce: string): string {
  // Add nonce to inline <script> tags (not ones with src, not JSON-LD)
  return html
    .replace(/<script(?![^>]*\btype\s*=\s*["']application\/ld\+json["'])(?![^>]*\bsrc\s*=)([^>]*)>/gi,
      `<script nonce="${nonce}"$1>`)
    .replace(/<link([^>]*)\bonload\s*=\s*"([^"]*)"([^>]*)>/gi,
      (match, before, handler, after) => {
        // Remove inline onload and add a nonce'd script after to replicate the behavior
        const id = `_fl${Math.random().toString(36).slice(2, 8)}`;
        return `<link${before} id="${id}"${after}><script nonce="${nonce}">document.getElementById('${id}').addEventListener('load',function(){${handler.replace(/this/g, 'document.getElementById("' + id + '")')}});</script>`;
      });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Cache HTML files in memory to avoid filesystem reads on every request
  const htmlCache = new Map<string, string>();

  function getHtml(filePath: string): string | null {
    if (htmlCache.has(filePath)) {
      return htmlCache.get(filePath)!;
    }
    if (fs.existsSync(filePath)) {
      const html = fs.readFileSync(filePath, "utf-8");
      htmlCache.set(filePath, html);
      return html;
    }
    return null;
  }

  app.use(express.static(distPath));

  // Serve prerendered HTML for SEO routes, fallback to SPA for others
  app.use("*", (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }

    const nonce = res.locals.nonce as string;

    // Normalize the path (remove trailing slashes, handle query strings)
    const urlPath = req.originalUrl.split("?")[0].replace(/\/$/, "") || "/";

    // Check for prerendered HTML in subdirectory (e.g., /blog/index.html)
    if (urlPath !== "/") {
      const prerenderPath = path.resolve(distPath, urlPath.slice(1), "index.html");
      const html = getHtml(prerenderPath);
      if (html) {
        res.setHeader("Content-Type", "text/html");
        return res.send(injectNonce(html, nonce));
      }
    }

    // Fallback to root index.html (SPA mode)
    const indexPath = path.resolve(distPath, "index.html");
    const html = getHtml(indexPath)!;
    res.setHeader("Content-Type", "text/html");
    res.send(injectNonce(html, nonce));
  });
}
