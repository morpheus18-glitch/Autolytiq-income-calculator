<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>Sitemap - Autolytiq</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
        <meta name="robots" content="noindex,follow"/>
        <style type="text/css">
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: #09090b;
            color: #fafafa;
            min-height: 100vh;
            padding: 2rem;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
          }
          header {
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #27272a;
          }
          h1 {
            font-size: 2rem;
            font-weight: 700;
            color: #10b981;
            margin-bottom: 0.5rem;
          }
          .subtitle {
            color: #a1a1aa;
            font-size: 0.95rem;
          }
          .stats {
            display: flex;
            gap: 2rem;
            margin-top: 1rem;
            flex-wrap: wrap;
          }
          .stat {
            background: #18181b;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border: 1px solid #27272a;
          }
          .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #10b981;
          }
          .stat-label {
            font-size: 0.8rem;
            color: #71717a;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1.5rem;
            background: #18181b;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #27272a;
          }
          th {
            background: #27272a;
            text-align: left;
            padding: 1rem;
            font-weight: 600;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #a1a1aa;
          }
          td {
            padding: 1rem;
            border-top: 1px solid #27272a;
            vertical-align: middle;
          }
          tr:hover td {
            background: #1f1f23;
          }
          a {
            color: #10b981;
            text-decoration: none;
            word-break: break-all;
          }
          a:hover {
            text-decoration: underline;
          }
          .priority {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
          }
          .priority-high { background: #10b981; color: #000; }
          .priority-medium { background: #3b82f6; color: #fff; }
          .priority-low { background: #71717a; color: #fff; }
          .changefreq {
            color: #a1a1aa;
            font-size: 0.85rem;
          }
          .date {
            color: #71717a;
            font-size: 0.85rem;
          }
          footer {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #27272a;
            text-align: center;
            color: #71717a;
            font-size: 0.85rem;
          }
          footer a { color: #10b981; }
          @media (max-width: 768px) {
            body { padding: 1rem; }
            th, td { padding: 0.75rem 0.5rem; font-size: 0.85rem; }
            .hide-mobile { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <header>
            <h1>Autolytiq Sitemap</h1>
            <p class="subtitle">This sitemap contains all indexable pages on autolytiqs.com</p>
            <div class="stats">
              <div class="stat">
                <div class="stat-value"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
                <div class="stat-label">Total URLs</div>
              </div>
              <div class="stat">
                <div class="stat-value"><xsl:value-of select="count(sitemap:urlset/sitemap:url[sitemap:priority >= 0.8])"/></div>
                <div class="stat-label">High Priority</div>
              </div>
            </div>
          </header>

          <table>
            <thead>
              <tr>
                <th>URL</th>
                <th class="hide-mobile">Priority</th>
                <th class="hide-mobile">Change Freq</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <xsl:sort select="sitemap:priority" order="descending"/>
                <tr>
                  <td>
                    <a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a>
                  </td>
                  <td class="hide-mobile">
                    <xsl:choose>
                      <xsl:when test="sitemap:priority >= 0.8">
                        <span class="priority priority-high"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:when>
                      <xsl:when test="sitemap:priority >= 0.5">
                        <span class="priority priority-medium"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:when>
                      <xsl:otherwise>
                        <span class="priority priority-low"><xsl:value-of select="sitemap:priority"/></span>
                      </xsl:otherwise>
                    </xsl:choose>
                  </td>
                  <td class="hide-mobile">
                    <span class="changefreq"><xsl:value-of select="sitemap:changefreq"/></span>
                  </td>
                  <td>
                    <span class="date"><xsl:value-of select="sitemap:lastmod"/></span>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>

          <footer>
            <p>Generated for <a href="https://autolytiqs.com">Autolytiq</a> - Free Income Calculator &amp; Budgeting Tools</p>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
