import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { docsManifest } from "./plugins/docs-manifest";
import { sitemapPlugin } from "./plugins/sitemap";

const APP_URL = (process.env.VITE_APP_URL ?? "https://your-domain.com").replace(/\/$/, "");

export default defineConfig({
  plugins: [
    react(),
    docsManifest(),
    sitemapPlugin(APP_URL),
    {
      name: "vite-plugin-inject-app-url",
      transformIndexHtml(html) {
        return html.replace(/__APP_URL__/g, APP_URL);
      },
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/robots.txt") {
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            const publicDir = path.resolve(__dirname, "public");
            import("node:fs")
              .then(({ readFileSync }) => {
                const content = readFileSync(path.join(publicDir, "robots.txt"), "utf8").replace(/__APP_URL__/g, APP_URL);
                res.end(content);
              })
              .catch(() => next());
            return;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  build: { sourcemap: true, target: "es2022" },
});
