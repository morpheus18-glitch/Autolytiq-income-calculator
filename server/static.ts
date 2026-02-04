import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";

const CANONICAL_HOST = "autolytiqs.com";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve critical SEO files directly — never redirect these
  const SEO_FILES = ["/sitemap.xml", "/sitemap-index.xml", "/robots.txt"];
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (SEO_FILES.includes(req.path)) {
      const filePath = path.resolve(distPath, req.path.slice(1));
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    }
    next();
  });

  // Canonical URL enforcement middleware (301 permanent redirects)
  // Redirects: www → non-www, http → https
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip in development
    if (process.env.NODE_ENV !== "production") {
      return next();
    }

    const host = req.get("host") || "";
    const protocol = req.get("x-forwarded-proto") || req.protocol;

    // Check if we need to redirect
    const isWww = host.startsWith("www.");
    const isHttp = protocol === "http";

    if (isWww || isHttp) {
      const cleanHost = host.replace(/^www\./, "");
      const redirectUrl = `https://${cleanHost}${req.originalUrl}`;
      return res.redirect(301, redirectUrl);
    }

    next();
  });

  app.use(express.static(distPath));

  // Serve prerendered HTML for SEO routes, fallback to SPA for others
  app.use("*", (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }

    // Redirect trailing slashes to non-trailing (301 permanent)
    // This consolidates duplicate URLs and fixes analytics splitting
    const pathWithoutQuery = req.originalUrl.split("?")[0];
    if (pathWithoutQuery !== "/" && pathWithoutQuery.endsWith("/")) {
      const cleanPath = pathWithoutQuery.slice(0, -1);
      const queryString = req.originalUrl.includes("?")
        ? req.originalUrl.substring(req.originalUrl.indexOf("?"))
        : "";
      return res.redirect(301, cleanPath + queryString);
    }

    // Normalize the path (remove trailing slashes, handle query strings)
    const urlPath = req.originalUrl.split("?")[0].replace(/\/$/, "") || "/";

    // Check for prerendered HTML in subdirectory (e.g., /blog/index.html)
    if (urlPath !== "/") {
      const prerenderPath = path.resolve(distPath, urlPath.slice(1), "index.html");
      if (fs.existsSync(prerenderPath)) {
        return res.sendFile(prerenderPath);
      }
    }

    // Fallback to root index.html (SPA mode)
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
