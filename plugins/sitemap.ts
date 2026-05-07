import { promises as fs } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { buildManifest } from "./docs-manifest.js";

export function sitemapPlugin(baseUrl: string): Plugin {
  let root = "";

  return {
    name: "vite-plugin-sitemap",

    configResolved(config) {
      root = config.root;
    },

    async buildStart() {
      const docsAbsDir = path.resolve(root, "public", "docs");
      const manifest = await buildManifest(docsAbsDir);
      const today = new Date().toISOString().split("T")[0];

      const docUrls = manifest.docs
        .map(
          (doc) =>
            `  <url>\n    <loc>${baseUrl}/?doc=${encodeURIComponent(doc.file)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`,
        )
        .join("\n");

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${docUrls}
</urlset>
`;

      const publicDir = path.resolve(root, "public");
      await fs.mkdir(publicDir, { recursive: true });
      await fs.writeFile(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");
    },
  };
}
