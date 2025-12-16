<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9">

  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Sitemap</title>
        <meta name="robots" content="noindex, nofollow" />
        <style>
          body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:24px}
          h1{margin:0 0 8px;font-size:20px}
          p{margin:0 0 16px;font-size:13px}
          table{border-collapse:collapse;width:100%}
          th,td{border:1px solid #ccc;padding:8px;vertical-align:top;font-size:13px}
          th{text-align:left}
          a{text-decoration:none}
          a:hover{text-decoration:underline}
          .count{display:inline-block;margin-left:8px;font-weight:500}
        </style>
      </head>
      <body>
        <h1>XML Sitemap <span class="count">(<xsl:value-of select="count(s:urlset/s:url)"/> URLs)</span></h1>
        <p>This view is only for humans. Google reads the XML directly.</p>

        <table>
          <thead>
            <tr>
              <th>URL</th>
              <th>Last Modified</th>
              <th>Changefreq</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="s:urlset/s:url">
              <tr>
                <td>
                  <a>
                    <xsl:attribute name="href"><xsl:value-of select="s:loc"/></xsl:attribute>
                    <xsl:value-of select="s:loc"/>
                  </a>
                </td>
                <td><xsl:value-of select="s:lastmod"/></td>
                <td><xsl:value-of select="s:changefreq"/></td>
                <td><xsl:value-of select="s:priority"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>
