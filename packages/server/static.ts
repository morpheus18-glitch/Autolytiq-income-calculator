import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Serve prerendered HTML for SEO routes, fallback to SPA for others
  app.use("*", (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.startsWith("/api")) {
      return next();
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
