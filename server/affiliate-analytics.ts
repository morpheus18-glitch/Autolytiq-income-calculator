import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { affiliateDb, sessionDb } from "./db-postgres";
import UAParser from "ua-parser-js";

const router = Router();

// Helper to parse user agent
function parseUserAgent(ua: string | undefined) {
  if (!ua) return { device: "unknown", browser: "unknown" };
  const parser = new UAParser(ua);
  const result = parser.getResult();
  return {
    device: result.device.type || "desktop",
    browser: result.browser.name || "unknown",
  };
}

// Track affiliate click (public endpoint)
router.post("/track-click", async (req: Request, res: Response) => {
  try {
    const { affiliateName, affiliateUrl, category, pageSource, sessionId } = req.body;

    if (!affiliateName || !affiliateUrl || !category || !pageSource) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = uuidv4();
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    const referrer = req.headers.referer || null;
    const { device, browser } = parseUserAgent(userAgent);

    await affiliateDb.trackClick(
      id,
      affiliateName,
      affiliateUrl,
      category,
      pageSource,
      sessionId || null,
      userAgent || null,
      ipAddress || null,
      referrer || null,
      device,
      browser,
      null // country - could be added via IP lookup
    );

    // Increment session click count
    if (sessionId) {
      try {
        await sessionDb.incrementClicks(sessionId);
      } catch (e) {
        // Session might not exist yet, that's ok
      }
    }

    res.json({ success: true, id });
  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).json({ error: "Failed to track click" });
  }
});

// Track page view / session (public endpoint)
router.post("/track-session", async (req: Request, res: Response) => {
  try {
    const { sessionId, page } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    const id = uuidv4();
    await sessionDb.upsert(id, sessionId, page || null);

    res.json({ success: true });
  } catch (error) {
    console.error("Track session error:", error);
    res.status(500).json({ error: "Failed to track session" });
  }
});

// Admin: Get analytics overview
router.get("/analytics/overview", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start and end dates required" });
    }

    const [totalStats, sessionStats, byAffiliate, byPage, byDevice, byBrowser, dailyClicks, topReferrers] = await Promise.all([
      affiliateDb.getTotalStats(startDate as string, endDate as string),
      sessionDb.getSessionStats(startDate as string, endDate as string),
      affiliateDb.getClicksByAffiliate(startDate as string, endDate as string),
      affiliateDb.getClicksByPage(startDate as string, endDate as string),
      affiliateDb.getClicksByDevice(startDate as string, endDate as string),
      affiliateDb.getClicksByBrowser(startDate as string, endDate as string),
      affiliateDb.getDailyClicks(startDate as string, endDate as string),
      affiliateDb.getTopReferrers(startDate as string, endDate as string, 10),
    ]);

    // Calculate CTR (click-through rate)
    const totalSessions = sessionStats?.total_sessions || 0;
    const sessionsWithClicks = sessionStats?.sessions_with_clicks || 0;
    const ctr = totalSessions > 0 ? (sessionsWithClicks / totalSessions) * 100 : 0;

    // Calculate bounce rate
    const bouncedSessions = sessionStats?.bounced_sessions || 0;
    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

    res.json({
      summary: {
        totalClicks: totalStats?.total_clicks || 0,
        uniqueSessions: totalStats?.unique_sessions || 0,
        uniqueAffiliates: totalStats?.unique_affiliates || 0,
        totalSessions,
        sessionsWithClicks,
        clickThroughRate: ctr.toFixed(2),
        bounceRate: bounceRate.toFixed(2),
        avgPagesPerSession: (sessionStats?.avg_pages || 0).toFixed(1),
      },
      byAffiliate,
      byPage,
      byDevice,
      byBrowser,
      dailyClicks,
      topReferrers,
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Admin: Get detailed clicks (for export)
router.get("/analytics/clicks", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start and end dates required" });
    }

    const clicks = await affiliateDb.getClicks(startDate as string, endDate as string);

    res.json({ clicks });
  } catch (error) {
    console.error("Get clicks error:", error);
    res.status(500).json({ error: "Failed to fetch clicks" });
  }
});

// Admin: Get hourly breakdown
router.get("/analytics/hourly", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start and end dates required" });
    }

    const hourlyClicks = await affiliateDb.getHourlyClicks(startDate as string, endDate as string);

    res.json({ hourlyClicks });
  } catch (error) {
    console.error("Hourly analytics error:", error);
    res.status(500).json({ error: "Failed to fetch hourly data" });
  }
});

// Admin: Export data as JSON (can be converted to CSV/Excel on frontend)
router.get("/analytics/export", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, format } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start and end dates required" });
    }

    const [clicks, byAffiliate, dailyClicks, totalStats, sessionStats] = await Promise.all([
      affiliateDb.getClicks(startDate as string, endDate as string),
      affiliateDb.getClicksByAffiliate(startDate as string, endDate as string),
      affiliateDb.getDailyClicks(startDate as string, endDate as string),
      affiliateDb.getTotalStats(startDate as string, endDate as string),
      sessionDb.getSessionStats(startDate as string, endDate as string),
    ]);

    const totalSessions = sessionStats?.total_sessions || 0;
    const sessionsWithClicks = sessionStats?.sessions_with_clicks || 0;
    const ctr = totalSessions > 0 ? (sessionsWithClicks / totalSessions) * 100 : 0;
    const bouncedSessions = sessionStats?.bounced_sessions || 0;
    const bounceRate = totalSessions > 0 ? (bouncedSessions / totalSessions) * 100 : 0;

    const exportData = {
      reportPeriod: {
        startDate,
        endDate,
        generatedAt: new Date().toISOString(),
      },
      summary: {
        totalClicks: totalStats?.total_clicks || 0,
        uniqueSessions: totalStats?.unique_sessions || 0,
        uniqueAffiliates: totalStats?.unique_affiliates || 0,
        totalSessions,
        clickThroughRate: `${ctr.toFixed(2)}%`,
        bounceRate: `${bounceRate.toFixed(2)}%`,
      },
      affiliatePerformance: byAffiliate.map(a => ({
        affiliate: a.affiliate_name,
        category: a.category,
        totalClicks: a.clicks,
        uniqueUsers: a.unique_sessions,
        clickRate: totalSessions > 0 ? `${((a.clicks / totalSessions) * 100).toFixed(2)}%` : "0%",
      })),
      dailyBreakdown: dailyClicks.map(d => ({
        date: d.date,
        clicks: d.clicks,
        uniqueUsers: d.unique_sessions,
      })),
      rawClicks: clicks.map(c => ({
        timestamp: c.clicked_at,
        affiliate: c.affiliate_name,
        category: c.category,
        page: c.page_source,
        device: c.device_type,
        browser: c.browser,
        referrer: c.referrer,
      })),
    };

    if (format === "csv") {
      // Generate CSV for affiliate performance
      const csvRows = [
        ["Affiliate Performance Report"],
        [`Period: ${startDate} to ${endDate}`],
        [`Generated: ${new Date().toISOString()}`],
        [],
        ["Summary"],
        [`Total Clicks,${totalStats?.total_clicks || 0}`],
        [`Unique Sessions,${totalStats?.unique_sessions || 0}`],
        [`Click-Through Rate,${ctr.toFixed(2)}%`],
        [`Bounce Rate,${bounceRate.toFixed(2)}%`],
        [],
        ["Affiliate Performance"],
        ["Affiliate", "Category", "Total Clicks", "Unique Users", "Click Rate"],
        ...byAffiliate.map(a => [
          a.affiliate_name,
          a.category,
          a.clicks,
          a.unique_sessions,
          totalSessions > 0 ? `${((a.clicks / totalSessions) * 100).toFixed(2)}%` : "0%",
        ]),
        [],
        ["Daily Breakdown"],
        ["Date", "Clicks", "Unique Users"],
        ...dailyClicks.map(d => [d.date, d.clicks, d.unique_sessions]),
      ];

      const csv = csvRows.map(row => Array.isArray(row) ? row.join(",") : row).join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=affiliate-report-${startDate}-${endDate}.csv`);
      return res.send(csv);
    }

    res.json(exportData);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
});

// Admin: Get Credit Karma specific stats
router.get("/analytics/credit-karma", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start and end dates required" });
    }

    // Get Credit Karma specific data
    const [totalClicks, dailyClicks, byPage, byDevice] = await Promise.all([
      affiliateDb.getCreditKarmaStats(startDate as string, endDate as string),
      affiliateDb.getCreditKarmaDailyClicks(startDate as string, endDate as string),
      affiliateDb.getCreditKarmaByPage(startDate as string, endDate as string),
      affiliateDb.getCreditKarmaByDevice(startDate as string, endDate as string),
    ]);

    // Calculate estimated earnings based on Awin commission structure
    // $7 per new member, $4 per reactivated member
    // Assume 2-5% conversion rate as industry average
    const clicks = totalClicks?.total_clicks || 0;
    const estimatedConversions = Math.floor(clicks * 0.03); // 3% estimated conversion
    const estimatedEarnings = estimatedConversions * 7; // $7 per new member

    res.json({
      summary: {
        totalClicks: clicks,
        uniqueSessions: totalClicks?.unique_sessions || 0,
        estimatedConversions,
        estimatedEarnings,
        // Awin commission info
        commissionNewMember: 7,
        commissionReactivated: 4,
        cookieWindow: 30,
      },
      dailyClicks,
      byPage,
      byDevice,
      awinInfo: {
        merchantId: 66532,
        affiliateId: 2720202,
        dashboardUrl: "https://ui.awin.com/merchant/66532/reporting/performance",
        trackingLink: "https://www.awin1.com/cread.php?awinmid=66532&awinaffid=2720202",
      },
    });
  } catch (error) {
    console.error("Credit Karma analytics error:", error);
    res.status(500).json({ error: "Failed to fetch Credit Karma analytics" });
  }
});

// Export individual handlers for public routes (before CSRF)
export const trackClickHandler = async (req: Request, res: Response) => {
  try {
    const { affiliateName, affiliateUrl, category, pageSource, sessionId } = req.body;

    if (!affiliateName || !affiliateUrl || !category || !pageSource) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = uuidv4();
    const userAgent = req.headers["user-agent"];
    const ipAddress = req.ip || req.socket.remoteAddress || null;
    const referrer = req.headers.referer || null;
    const { device, browser } = parseUserAgent(userAgent);

    await affiliateDb.trackClick(
      id,
      affiliateName,
      affiliateUrl,
      category,
      pageSource,
      sessionId || null,
      userAgent || null,
      ipAddress || null,
      referrer || null,
      device,
      browser,
      null
    );

    if (sessionId) {
      try {
        await sessionDb.incrementClicks(sessionId);
      } catch (e) {
        // Session might not exist yet
      }
    }

    res.json({ success: true, id });
  } catch (error) {
    console.error("Track click error:", error);
    res.status(500).json({ error: "Failed to track click" });
  }
};

export const trackSessionHandler = async (req: Request, res: Response) => {
  try {
    const { sessionId, page } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Session ID required" });
    }

    const id = uuidv4();
    await sessionDb.upsert(id, sessionId, page || null);

    res.json({ success: true });
  } catch (error) {
    console.error("Track session error:", error);
    res.status(500).json({ error: "Failed to track session" });
  }
};

export default router;
